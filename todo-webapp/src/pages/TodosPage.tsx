import { PageContent, PageTitle } from "@wso2/oxygen-ui";
import type { JSX } from "react";

// Placeholder: the todo screens (list, add, toggle, edit, delete, empty state)
// are built by the next item.
export default function TodosPage(): JSX.Element {
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Todos</PageTitle.Header>
      </PageTitle>
    </PageContent>
  );
}
