import { useState, type ReactNode } from "react";
import {
  Alert, AppShell, Button, Detail, Dialog, EmptyState, Field, Form, Heading, Screen, Section, Stat,
  StatGroup, Table, ValidationSummary, defineApp, useCollection, useDisplayState,
} from "@wso2/prototype-kit";

interface Todo { id: string; title: string; done: boolean; createdAt: string }

const todos: Todo[] = [
  { id: "todo-1", title: "Buy oat milk", done: true, createdAt: "2026-01-12T08:15:00Z" },
  { id: "todo-2", title: "Book dentist appointment", done: false, createdAt: "2026-01-13T09:40:00Z" },
  { id: "todo-3", title: "Renew library card", done: false, createdAt: "2026-01-14T17:05:00Z" },
  { id: "todo-4", title: "Water the balcony plants", done: false, createdAt: "2026-01-15T07:30:00Z" },
];

const user = { name: "Todo user" };

function Shell({ children }: { children: ReactNode }) {
  return (
    <AppShell
      id="shell"
      user={user}
      nav={[{ id: "nav.todos", label: "Todos", to: "screen.todos" }]}
      account="screen.account"
      signOut="screen.signed-out"
    >
      {children}
    </AppShell>
  );
}

function Todos() {
  const state = useDisplayState();
  const all = useCollection<Todo>("todos");
  const [editingId, setEditingId] = useState<string | null>(null);
  const items = state === "state.empty" ? [] : all.items;
  const open = items.filter((t) => !t.done).length;
  const done = items.length - open;
  const editing = editingId ? all.get(editingId) : undefined;
  const blank = state === "state.validation-error" ? "Enter a title" : undefined;

  const add = (values: Record<string, string>) => {
    const title = (values.title ?? "").trim();
    if (title.length === 0 || title.length > 200) return;
    all.create({ title, done: false, createdAt: "2026-01-15T10:00:00Z" });
  };
  const rename = (values: Record<string, string>) => {
    const title = (values.title ?? "").trim();
    if (!editing || title.length === 0 || title.length > 200) return;
    all.update(editing.id, { title });
    setEditingId(null);
  };

  return (
    <Shell>
      <Heading id="heading.todos" text="Todos" />
      {state === "state.failed" && (
        <Alert id="alert.load-failed" tone="error" title="Todos could not be loaded" text="Your list may be out of date. Reload the page to try again." />
      )}
      <StatGroup>
        <Stat id="stat.open" label="To do" value={String(open)} hint="still open" icon="ListChecks" tone="warning" />
        <Stat id="stat.done" label="Done" value={String(done)} hint="completed" icon="CircleCheck" tone="success" />
      </StatGroup>
      <Section id="section.add" title="Add a todo" subtitle="Titles can be up to 200 characters.">
        <Form
          id="form.add"
          onSubmit={add}
          actions={<Button id="btn.add" label="Add todo" emphasis="primary" submit />}
        >
          {state === "state.validation-error" && (
            <ValidationSummary id="summary.add" issues={["A todo needs a title"]} />
          )}
          <Field id="field.new-title" name="title" label="Title" required placeholder="What needs doing?" error={blank} />
        </Form>
      </Section>
      <Section id="section.list" title="Your todos" count={items.length} subtitle="Oldest first.">
        <Table
          id="table.todos"
          columns={["Title", { label: "Status", kind: "status" }]}
          rows={items.map((t) => ({
            id: `todo.${t.id}`,
            cells: [t.title],
            status: t.done ? { text: "Done", tone: "success" } : { text: "Open", tone: "warning" },
            actions: [
              { id: `todo.${t.id}.toggle`, label: t.done ? "Mark undone" : "Mark done", onPress: () => all.update(t.id, { done: !t.done }) },
              { id: `todo.${t.id}.edit`, label: "Edit", onPress: () => setEditingId(t.id) },
              { id: `todo.${t.id}.delete`, label: "Delete", emphasis: "danger", onPress: () => all.remove(t.id) },
            ],
          }))}
          empty={<EmptyState id="empty.todos" title="No todos yet" text="Add your first todo above." />}
        />
      </Section>
      <Dialog id="dialog.edit" title="Edit todo" open={editing !== undefined} onClose={() => setEditingId(null)}>
        <Form
          id="form.edit"
          onSubmit={rename}
          actions={<Button id="btn.edit.save" label="Save" emphasis="primary" submit />}
        >
          <Field id="field.edit-title" name="title" label="Title" required defaultValue={editing?.title ?? ""} error={blank} />
        </Form>
      </Dialog>
    </Shell>
  );
}

function Account() {
  return (
    <Shell>
      <Heading id="heading.account" text="Account" />
      <Detail id="detail.account" fields={[{ label: "Name", value: user.name }, { label: "Sign-in", value: "Not required" }]} />
    </Shell>
  );
}

function SignedOut() {
  return (
    <Screen>
      <Heading id="heading.signed-out" text="You have left the app" />
      <Button id="btn.return" label="Back to todos" emphasis="primary" to="screen.todos" />
    </Screen>
  );
}

export default defineApp({
  screens: {
    "screen.todos": Todos,
    "screen.account": Account,
    "screen.signed-out": SignedOut,
  },
  data: { todos },
});
