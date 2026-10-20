import {
  Alert, AlertTitle, Box, Button, Card, CardContent, Chip, CircularProgress, Dialog, DialogActions,
  DialogContent, DialogTitle, Grid, ListingTable, PageContent, PageTitle, Stack, TextField, Typography,
} from "@wso2/oxygen-ui";
import { CircleCheck, ListChecks } from "@wso2/oxygen-ui-icons-react";
import { useCallback, useEffect, useState, type FormEvent, type JSX } from "react";
import { todoApi } from "../api";
import type { components } from "../generated/todo-api";

type Todo = components["schemas"]["Todo"];

const MAX_TITLE = 200;

// Client-side check; returns the message to show, or null when the title is fine.
function titleError(raw: string): string | null {
  const t = raw.trim();
  if (t.length === 0) return "Enter a title";
  if (t.length > MAX_TITLE) return `A title can be at most ${MAX_TITLE} characters`;
  return null;
}

function apiMessage(error: { message?: string; description?: string } | undefined, fallback: string): string {
  return error?.description || error?.message || fallback;
}

export default function TodosPage(): JSX.Element {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadFailed, setLoadFailed] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [addError, setAddError] = useState<string | null>(null);
  const [adding, setAdding] = useState(false);

  const [editing, setEditing] = useState<Todo | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const reload = useCallback(async () => {
    try {
      const { data, error } = await todoApi.GET("/todos", { params: { query: { limit: 500 } } });
      if (error || !data) throw new Error("load failed");
      // The API answers oldest first; sort again so the order never depends on it.
      setTodos([...data.data].sort((a, b) => a.createdAt.localeCompare(b.createdAt)));
      setLoadFailed(false);
    } catch {
      setLoadFailed(true);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const open = todos.filter((t) => !t.done).length;
  const done = todos.length - open;

  const add = async (e: FormEvent) => {
    e.preventDefault();
    const problem = titleError(newTitle);
    if (problem) {
      setAddError(problem);
      return;
    }
    setAdding(true);
    setAddError(null);
    try {
      const { error } = await todoApi.POST("/todos", { body: { title: newTitle.trim() } });
      if (error) {
        setAddError(apiMessage(error, "The todo could not be added"));
        return;
      }
      setNewTitle("");
      await reload();
    } catch {
      setAddError("The todo could not be added. Try again.");
    } finally {
      setAdding(false);
    }
  };

  const toggle = async (t: Todo) => {
    setActionError(null);
    try {
      const { error } = await todoApi.PATCH("/todos/{todoId}", {
        params: { path: { todoId: t.id } },
        body: { done: !t.done },
      });
      if (error) setActionError(apiMessage(error, "The todo could not be updated"));
    } catch {
      setActionError("The todo could not be updated. Try again.");
    }
    await reload();
  };

  const remove = async (t: Todo) => {
    setActionError(null);
    try {
      const { error } = await todoApi.DELETE("/todos/{todoId}", { params: { path: { todoId: t.id } } });
      if (error) setActionError(apiMessage(error, "The todo could not be deleted"));
    } catch {
      setActionError("The todo could not be deleted. Try again.");
    }
    await reload();
  };

  const startEdit = (t: Todo) => {
    setEditing(t);
    setEditTitle(t.title);
    setEditError(null);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    if (!editing) return;
    const problem = titleError(editTitle);
    if (problem) {
      setEditError(problem);
      return;
    }
    setSaving(true);
    setEditError(null);
    try {
      const { error } = await todoApi.PATCH("/todos/{todoId}", {
        params: { path: { todoId: editing.id } },
        body: { title: editTitle.trim() },
      });
      if (error) {
        setEditError(apiMessage(error, "The todo could not be saved"));
        return;
      }
      setEditing(null);
      await reload();
    } catch {
      setEditError("The todo could not be saved. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const stats = [
    { label: "To do", value: open, hint: "still open", icon: <ListChecks size={18} />, color: "warning.main" },
    { label: "Done", value: done, hint: "completed", icon: <CircleCheck size={18} />, color: "success.main" },
  ];

  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Todos</PageTitle.Header>
      </PageTitle>

      <Stack spacing={3}>
        {loadFailed && (
          <Alert severity="error">
            <AlertTitle>Todos could not be loaded</AlertTitle>
            Your list may be out of date. Reload the page to try again.
          </Alert>
        )}
        {actionError && (
          <Alert severity="error" onClose={() => setActionError(null)}>
            {actionError}
          </Alert>
        )}

        <Grid container spacing={2}>
          {stats.map((s) => (
            <Grid key={s.label} size={{ xs: 12, sm: 6 }}>
              <Card variant="outlined">
                <CardContent>
                  <Stack direction="row" spacing={1} alignItems="center" sx={{ color: s.color }}>
                    {s.icon}
                    <Typography variant="overline">{s.label}</Typography>
                  </Stack>
                  <Typography variant="h4">{s.value}</Typography>
                  <Typography variant="caption" color="text.secondary">{s.hint}</Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>

        <Stack spacing={1}>
          <Typography variant="h6">Add a todo</Typography>
          <Typography variant="body2" color="text.secondary">Titles can be up to 200 characters.</Typography>
          <Card variant="outlined">
            <CardContent>
              <Box component="form" onSubmit={add} noValidate>
                <Stack spacing={2}>
                  {addError && (
                    <Alert severity="error">
                      <AlertTitle>The todo was not added</AlertTitle>
                      {addError}
                    </Alert>
                  )}
                  <TextField
                    label="Title"
                    required
                    placeholder="What needs doing?"
                    value={newTitle}
                    onChange={(ev) => setNewTitle(ev.target.value)}
                    error={addError !== null}
                    helperText={addError ?? undefined}
                    fullWidth
                  />
                  <Stack direction="row" justifyContent="flex-end">
                    <Button type="submit" variant="contained" disabled={adding}>Add todo</Button>
                  </Stack>
                </Stack>
              </Box>
            </CardContent>
          </Card>
        </Stack>

        <Stack spacing={1}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="h6">Your todos</Typography>
            <Chip label={todos.length} size="small" />
          </Stack>
          <Typography variant="body2" color="text.secondary">Oldest first.</Typography>
          <ListingTable.Container>
            <ListingTable>
              <ListingTable.Head>
                <ListingTable.Row>
                  <ListingTable.Cell>Title</ListingTable.Cell>
                  <ListingTable.Cell>Status</ListingTable.Cell>
                  <ListingTable.Cell />
                </ListingTable.Row>
              </ListingTable.Head>
              <ListingTable.Body>
                {loading ? (
                  <ListingTable.Row>
                    <ListingTable.Cell colSpan={3} align="center"><CircularProgress size={24} /></ListingTable.Cell>
                  </ListingTable.Row>
                ) : todos.length === 0 ? (
                  <ListingTable.Row>
                    <ListingTable.Cell colSpan={3}>
                      <ListingTable.EmptyState title="No todos yet" description="Add your first todo above." />
                    </ListingTable.Cell>
                  </ListingTable.Row>
                ) : (
                  todos.map((t) => (
                    <ListingTable.Row key={t.id}>
                      <ListingTable.Cell>{t.title}</ListingTable.Cell>
                      <ListingTable.Cell>
                        <Chip
                          label={t.done ? "Done" : "Open"}
                          size="small"
                          color={t.done ? "success" : "warning"}
                        />
                      </ListingTable.Cell>
                      <ListingTable.Cell align="right">
                        <ListingTable.RowActions visibility="always" align="right">
                          <Button size="small" variant="text" onClick={() => void toggle(t)}>
                            {t.done ? "Mark undone" : "Mark done"}
                          </Button>
                          <Button size="small" variant="text" onClick={() => startEdit(t)}>Edit</Button>
                          <Button size="small" variant="text" color="error" onClick={() => void remove(t)}>
                            Delete
                          </Button>
                        </ListingTable.RowActions>
                      </ListingTable.Cell>
                    </ListingTable.Row>
                  ))
                )}
              </ListingTable.Body>
            </ListingTable>
          </ListingTable.Container>
        </Stack>
      </Stack>

      <Dialog open={editing !== null} onClose={() => setEditing(null)} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={save} noValidate>
          <DialogTitle>Edit todo</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {editError && <Alert severity="error">{editError}</Alert>}
              <TextField
                label="Title"
                required
                autoFocus
                value={editTitle}
                onChange={(ev) => setEditTitle(ev.target.value)}
                error={editError !== null}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button variant="outlined" onClick={() => setEditing(null)}>Cancel</Button>
            <Button type="submit" variant="contained" disabled={saving}>Save</Button>
          </DialogActions>
        </Box>
      </Dialog>
    </PageContent>
  );
}
