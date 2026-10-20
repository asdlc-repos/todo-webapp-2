import createClient from "openapi-fetch";
import type { paths } from "./generated/todo-api";

// Same-origin: nginx strips /api and proxies to todo-api.
export const todoApi = createClient<paths>({ baseUrl: "/api" });
