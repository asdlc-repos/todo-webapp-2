import { http, HttpResponse } from "msw";
import type { components } from "../src/generated/todo-api";

type Todo = components["schemas"]["Todo"];

// State lives in the page: setupWorker resolves requests in the page's own JS
// context, so any full page load re-runs this module and restores the seed
// data. Only in-app navigation carries a change forward. That makes a run
// repeatable, and it is why a row created a moment ago vanishes on reload.
// Seed rows are the records of prototype.tsx mapped onto the schema.
let todos: Todo[] = [
  { id: "7a1f3c10-0001-4000-8000-000000000001", title: "Buy oat milk", done: true, createdAt: "2026-01-12T08:15:00Z", updatedAt: "2026-01-12T08:15:00Z" },
  { id: "7a1f3c10-0002-4000-8000-000000000002", title: "Book dentist appointment", done: false, createdAt: "2026-01-13T09:40:00Z", updatedAt: "2026-01-13T09:40:00Z" },
  { id: "7a1f3c10-0003-4000-8000-000000000003", title: "Renew library card", done: false, createdAt: "2026-01-14T17:05:00Z", updatedAt: "2026-01-14T17:05:00Z" },
  { id: "7a1f3c10-0004-4000-8000-000000000004", title: "Water the balcony plants", done: false, createdAt: "2026-01-15T07:30:00Z", updatedAt: "2026-01-15T07:30:00Z" },
];

const err = (code: number, message: string) => HttpResponse.json({ code, message }, { status: code });

const validTitle = (raw: unknown): string | null => {
  if (typeof raw !== "string") return null;
  const t = raw.trim();
  return t.length >= 1 && t.length <= 200 ? t : null;
};

export const handlers = [
  http.get("/api/todos", ({ request }) => {
    const url = new URL(request.url);
    const limit = Number(url.searchParams.get("limit") ?? 500);
    const offset = Number(url.searchParams.get("offset") ?? 0);
    if (!Number.isInteger(limit) || limit < 1 || limit > 500 || !Number.isInteger(offset) || offset < 0) {
      return err(400, "Invalid paging parameters");
    }
    const sorted = [...todos].sort((a, b) => a.createdAt.localeCompare(b.createdAt));
    return HttpResponse.json({
      count: sorted.length,
      next: offset + limit < sorted.length ? `/todos?limit=${limit}&offset=${offset + limit}` : null,
      previous: offset > 0 ? `/todos?limit=${limit}&offset=${Math.max(0, offset - limit)}` : null,
      data: sorted.slice(offset, offset + limit),
    });
  }),

  http.post("/api/todos", async ({ request }) => {
    const body = (await request.json().catch(() => ({}))) as { title?: unknown };
    const title = validTitle(body.title);
    if (title === null) return err(400, "Title blank or longer than 200 characters");
    const now = new Date().toISOString();
    const created: Todo = { id: crypto.randomUUID(), title, done: false, createdAt: now, updatedAt: now };
    todos = [...todos, created];
    return HttpResponse.json(created, { status: 201 });
  }),

  http.patch("/api/todos/:todoId", async ({ params, request }) => {
    const current = todos.find((t) => t.id === params.todoId);
    if (!current) return err(404, "No such todo");
    const body = (await request.json().catch(() => ({}))) as { title?: unknown; done?: unknown };
    let title = current.title;
    if (body.title !== undefined) {
      const t = validTitle(body.title);
      if (t === null) return err(400, "Title blank or longer than 200 characters");
      title = t;
    }
    const done = typeof body.done === "boolean" ? body.done : current.done;
    const updated: Todo = { ...current, title, done, updatedAt: new Date().toISOString() };
    todos = todos.map((t) => (t.id === current.id ? updated : t));
    return HttpResponse.json(updated);
  }),

  http.delete("/api/todos/:todoId", ({ params }) => {
    if (!todos.some((t) => t.id === params.todoId)) return err(404, "No such todo");
    todos = todos.filter((t) => t.id !== params.todoId);
    return new HttpResponse(null, { status: 204 });
  }),
];
