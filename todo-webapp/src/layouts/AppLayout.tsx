import {
  AppShell, ColorSchemeToggle, Divider, Footer, Header, Sidebar, UserMenu,
} from "@wso2/oxygen-ui";
import { ListChecks, LogOut, User as UserIcon } from "@wso2/oxygen-ui-icons-react";
import { Link, Outlet, useLocation, useNavigate } from "react-router";
import type { JSX } from "react";

// No sign-in: the user is a fixed label, as the prototype's shell draws it.
const user = { name: "Todo user", email: "No sign-in required" };

export default function AppLayout(): JSX.Element {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const active = pathname.startsWith("/account") ? "account" : "todos";

  return (
    <AppShell initialCollapsed={false} collapseOnSelectOnMobile={true}>
      <AppShell.Navbar>
        <Header>
          <Header.Toggle />
          <Header.Brand>
            <Header.BrandTitle>Todo</Header.BrandTitle>
          </Header.Brand>
          <Header.Spacer />
          <Header.Actions>
            <ColorSchemeToggle />
            <Divider orientation="vertical" flexItem sx={{ mx: 2 }} />
            <UserMenu>
              <UserMenu.Trigger name={user.name} />
              <UserMenu.Header name={user.name} email={user.email} />
              <UserMenu.Item icon={<UserIcon />} label="Account" onClick={() => navigate("/account")} />
              <UserMenu.Divider />
              <UserMenu.Logout icon={<LogOut />} label="Sign out" onClick={() => navigate("/signed-out")} />
            </UserMenu>
          </Header.Actions>
        </Header>
      </AppShell.Navbar>

      <AppShell.Sidebar>
        <Sidebar activeItem={active}>
          <Sidebar.Nav>
            <Sidebar.Category>
              <Sidebar.Item id="todos" link={<Link to="/todos" />}>
                <Sidebar.ItemIcon><ListChecks /></Sidebar.ItemIcon>
                <Sidebar.ItemLabel>Todos</Sidebar.ItemLabel>
              </Sidebar.Item>
            </Sidebar.Category>
          </Sidebar.Nav>
        </Sidebar>
      </AppShell.Sidebar>

      <AppShell.Main>
        <Outlet />
      </AppShell.Main>

      <AppShell.Footer>
        <Footer><Footer.Copyright>© WSO2 LLC</Footer.Copyright></Footer>
      </AppShell.Footer>
    </AppShell>
  );
}
