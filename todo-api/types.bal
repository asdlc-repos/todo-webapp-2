type Todo record {|
    string id;
    string title;
    boolean done;
    string createdAt;
    string updatedAt;
|};

type TodoCreate record {|
    string title;
|};

type TodoUpdate record {|
    string title?;
    boolean done?;
|};

type TodoList record {|
    int count;
    string? next;
    string? previous;
    Todo[] data;
|};

type ErrorBody record {|
    int code;
    string message;
    string description?;
|};
