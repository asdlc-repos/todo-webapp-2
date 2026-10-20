import ballerina/os;

// Each setting reads its platform-injected variable and falls back to a local default.
configurable string dbHost = os:getEnv("TODO_DB_HOST") == "" ? "localhost" : os:getEnv("TODO_DB_HOST");
configurable int dbPort = os:getEnv("TODO_DB_PORT") == "" ? 5432 : checkpanic int:fromString(os:getEnv("TODO_DB_PORT"));
configurable string dbUser = os:getEnv("TODO_DB_USER") == "" ? "postgres" : os:getEnv("TODO_DB_USER");
configurable string dbPassword = os:getEnv("TODO_DB_PASSWORD") == "" ? "postgres" : os:getEnv("TODO_DB_PASSWORD");
configurable string dbName = os:getEnv("TODO_DB_DBNAME") == "" ? "appdb" : os:getEnv("TODO_DB_DBNAME");
