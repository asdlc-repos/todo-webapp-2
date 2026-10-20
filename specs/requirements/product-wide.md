# Product-wide

Rules that apply to more than one feature.

## Requirements

- P1 Todos persist across page reloads and return visits. Applies to: all.

## Decisions

- The app has no sign-in; it is open to anyone who reaches it. The organization's default SSO sign-in is not used, because the brief rules out login.
- There is a single shared list of todos, not one per person. *assumed*