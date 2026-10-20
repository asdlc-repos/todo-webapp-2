import ballerina/http;
import ballerina/log;
import ballerina/sql;

function errorBody(int code, string message, string description) returns ErrorBody {
    return {code, message, description};
}

function badRequest(string description) returns http:BadRequest {
    return {body: errorBody(400, "Bad Request", description)};
}

function notFound() returns http:NotFound {
    return {body: errorBody(404, "Not Found", "No such todo")};
}

function serverError() returns http:InternalServerError {
    return {body: errorBody(500, "Internal Server Error", "The request could not be processed")};
}

const string TITLE_RULE = "title must be 1 to 200 characters after trimming";

// Parses an optional integer query value; returns an error message when it is not valid.
function parseParam(string? raw, string name, int fallback, int minimum, int maximum) returns int|string {
    if raw is () {
        return fallback;
    }
    int|error parsed = int:fromString(raw);
    if parsed is error || parsed < minimum || parsed > maximum {
        return string `${name} must be an integer between ${minimum} and ${maximum}`;
    }
    return parsed;
}

// Answers malformed requests (bad JSON, wrong field types, missing title) with the Error schema.
service class RequestErrorHandler {
    *http:RequestErrorInterceptor;

    resource function 'default [string... path](error err) returns http:BadRequest {
        log:printDebug("request rejected", 'error = err);
        return badRequest("The request is malformed or a field has the wrong type");
    }
}

service http:InterceptableService / on new http:Listener(9090) {

    public function createInterceptors() returns RequestErrorHandler => new;

    resource function get health() returns http:Ok {
        return {body: {status: "UP"}};
    }

    resource function get todos(string? 'limit, string? offset)
            returns http:Ok|http:BadRequest|http:InternalServerError {
        int|string pageSize = parseParam('limit, "limit", MAX_PAGE_SIZE, 1, MAX_PAGE_SIZE);
        if pageSize is string {
            return badRequest(pageSize);
        }
        int|string pageOffset = parseParam(offset, "offset", 0, 0, int:MAX_VALUE);
        if pageOffset is string {
            return badRequest(pageOffset);
        }
        int|error total = countTodos();
        if total is error {
            log:printError("countTodos failed", 'error = total);
            return serverError();
        }
        Todo[]|error rows = listTodoRows(pageSize, pageOffset);
        if rows is error {
            log:printError("listTodoRows failed", 'error = rows);
            return serverError();
        }
        string? nextPage = ();
        if pageOffset + pageSize < total {
            nextPage = string `/todos?limit=${pageSize}&offset=${pageOffset + pageSize}`;
        }
        string? previousPage = ();
        if pageOffset > 0 {
            int previousOffset = pageOffset > pageSize ? pageOffset - pageSize : 0;
            previousPage = string `/todos?limit=${pageSize}&offset=${previousOffset}`;
        }
        TodoList body = {count: total, next: nextPage, previous: previousPage, data: rows};
        return <http:Ok>{body};
    }

    resource function post todos(TodoCreate payload)
            returns http:Created|http:BadRequest|http:InternalServerError {
        string? title = validTitle(payload.title);
        if title is () {
            return badRequest(TITLE_RULE);
        }
        Todo|error created = insertTodo(title);
        if created is error {
            log:printError("insertTodo failed", 'error = created);
            return serverError();
        }
        return <http:Created>{body: created};
    }

    resource function patch todos/[string todoId](TodoUpdate payload)
            returns http:Ok|http:BadRequest|http:NotFound|http:InternalServerError {
        string? rawTitle = payload?.title;
        string? title = ();
        if rawTitle is string {
            title = validTitle(rawTitle);
            if title is () {
                return badRequest(TITLE_RULE);
            }
        }
        if !isUuid(todoId) {
            return notFound();
        }
        Todo|error updated = updateTodoRow(todoId, title, payload?.done);
        if updated is sql:NoRowsError {
            return notFound();
        }
        if updated is error {
            log:printError("updateTodoRow failed", 'error = updated);
            return serverError();
        }
        return <http:Ok>{body: updated};
    }

    resource function delete todos/[string todoId]()
            returns http:NoContent|http:NotFound|http:InternalServerError {
        if !isUuid(todoId) {
            return notFound();
        }
        boolean|error deleted = deleteTodoRow(todoId);
        if deleted is error {
            log:printError("deleteTodoRow failed", 'error = deleted);
            return serverError();
        }
        if !deleted {
            return notFound();
        }
        return http:NO_CONTENT;
    }
}
