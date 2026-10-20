# Domain model

The app holds one kind of record: a todo in a single shared list. There are no users, so nothing is owned by anyone.

```mermaid
erDiagram
    TODO {
        uuid id PK
        string title "1-200 chars, trimmed"
        boolean done "false when created"
        timestamp createdAt "orders the list, oldest first"
        timestamp updatedAt
    }
```

The list is ordered by `createdAt` ascending, with `id` as the tiebreaker.