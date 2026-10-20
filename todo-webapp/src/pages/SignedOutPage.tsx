import { Button, PageContent, PageTitle } from "@wso2/oxygen-ui";
import { Link } from "react-router";
import type { JSX } from "react";

export default function SignedOutPage(): JSX.Element {
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>You have left the app</PageTitle.Header>
        <PageTitle.Actions>
          <Button variant="contained" component={Link} to="/todos">Back to todos</Button>
        </PageTitle.Actions>
      </PageTitle>
    </PageContent>
  );
}
