import { Card, CardContent, CardHeader, Grid, PageContent, PageTitle, Typography } from "@wso2/oxygen-ui";
import type { JSX } from "react";

export default function AccountPage(): JSX.Element {
  const fields = [
    { label: "Name", value: "Todo user" },
    { label: "Sign-in", value: "Not required" },
  ];
  return (
    <PageContent>
      <PageTitle>
        <PageTitle.Header>Account</PageTitle.Header>
      </PageTitle>
      <Card variant="outlined">
        <CardHeader title="Account" />
        <CardContent>
          <Grid container spacing={2}>
            {fields.map((f) => (
              <Grid key={f.label} size={{ xs: 12, md: 6 }}>
                <Typography variant="overline" color="text.secondary">{f.label}</Typography>
                <Typography variant="body2">{f.value}</Typography>
              </Grid>
            ))}
          </Grid>
        </CardContent>
      </Card>
    </PageContent>
  );
}
