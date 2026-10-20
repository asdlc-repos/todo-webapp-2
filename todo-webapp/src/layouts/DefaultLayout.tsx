import { Outlet } from "react-router";
import { Box, Layout } from "@wso2/oxygen-ui";
import type { JSX } from "react";

export default function DefaultLayout(): JSX.Element {
  return (
    <Layout.Content>
      <Box sx={{ height: "100%" }}>
        <Outlet />
      </Box>
    </Layout.Content>
  );
}
