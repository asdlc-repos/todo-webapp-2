import ballerina/sql;

const int MAX_TITLE_LENGTH = 200;
const int MAX_PAGE_SIZE = 500;
final string:RegExp UUID_PATTERN = re `[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}`;

function isUuid(string value) returns boolean {
    return UUID_PATTERN.isFullMatch(value);
}

// Returns the trimmed title, or () when it is blank or too long.
function validTitle(string raw) returns string? {
    string trimmed = raw.trim();
    int size = trimmed.length();
    if size < 1 || size > MAX_TITLE_LENGTH {
        return ();
    }
    return trimmed;
}

function countTodos() returns int|error {
    return dbClient->queryRow(`SELECT COUNT(*) FROM todos`);
}

function listTodoRows(int pageSize, int pageOffset) returns Todo[]|error {
    sql:ParameterizedQuery query = `SELECT id::text AS id, title, done,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
            to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "updatedAt"
        FROM todos ORDER BY created_at ASC, id ASC LIMIT ${pageSize} OFFSET ${pageOffset}`;
    stream<Todo, sql:Error?> rows = dbClient->query(query);
    return from Todo row in rows
        select row;
}

function insertTodo(string title) returns Todo|error {
    sql:ParameterizedQuery query = `INSERT INTO todos (title) VALUES (${title}) RETURNING id::text AS id, title, done,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
            to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "updatedAt"`;
    return dbClient->queryRow(query);
}

// Returns sql:NoRowsError when no todo has this id.
function updateTodoRow(string todoId, string? title, boolean? done) returns Todo|error {
    sql:ParameterizedQuery query = `UPDATE todos SET title = COALESCE(${title}::varchar, title),
            done = COALESCE(${done}::boolean, done), updated_at = now()
         WHERE id = ${todoId}::uuid RETURNING id::text AS id, title, done,
            to_char(created_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "createdAt",
            to_char(updated_at AT TIME ZONE 'UTC', 'YYYY-MM-DD"T"HH24:MI:SS.US"Z"') AS "updatedAt"`;
    return dbClient->queryRow(query);
}

function deleteTodoRow(string todoId) returns boolean|error {
    sql:ExecutionResult result = check dbClient->execute(`DELETE FROM todos WHERE id = ${todoId}::uuid`);
    int? affected = result.affectedRowCount;
    return affected is int && affected > 0;
}
