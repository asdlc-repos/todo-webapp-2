# Todos

## Purpose

Add, list, complete, rename and delete todos, which persist between visits, for the User.

## User Stories

- F1.1 As a User, I add a todo by entering a title.
- F1.2 As a User, I see all my todos in one list, oldest first.
- F1.3 As a User, I mark a todo done or undone, and the list shows which state it is in.
- F1.4 As a User, I edit a todo's title.
- F1.5 As a User, I delete a todo.
- F1.6 As a User, I find my todos, with their done state, as I left them when I come back.
- F1.7 As a User, I see a short message when there are no todos yet.

## Decisions

- New todos are appended at the bottom; the list stays in creation order, and marking a todo done does not move it.
- Deleting is immediate, with no confirmation.
- A title cannot be blank: adding or saving an edit with an empty title is rejected.
- Leading and trailing spaces in a title are trimmed.
- A title is at most 200 characters; a longer one is rejected like a blank one. *assumed*

## Out of Scope

- Undoing a delete.
- Reordering todos by hand.