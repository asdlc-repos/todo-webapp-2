import ballerina/http;

// Foundation only: the /todos handlers arrive with the next item.
service / on new http:Listener(9090) {
    resource function get health() returns http:Ok {
        return {body: {status: "UP"}};
    }
}
