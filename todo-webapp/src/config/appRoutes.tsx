import { type RouteProps, Navigate } from "react-router";
import AppLayout from "../layouts/AppLayout";
import DefaultLayout from "../layouts/DefaultLayout";
import TodosPage from "../pages/TodosPage";
import AccountPage from "../pages/AccountPage";
import SignedOutPage from "../pages/SignedOutPage";

export interface AppRoute extends Omit<RouteProps, "children"> {
  children?: AppRoute[];
  label?: string;
}

const appRoutes: AppRoute[] = [
  { path: "/", element: <Navigate to="/todos" replace /> },
  {
    element: <AppLayout />,
    children: [
      { path: "/todos", element: <TodosPage />, label: "Todos" },
      { path: "/account", element: <AccountPage />, label: "Account" },
    ],
  },
  {
    element: <DefaultLayout />,
    children: [{ path: "/signed-out", element: <SignedOutPage />, label: "Signed out" }],
  },
  { path: "*", element: <Navigate to="/todos" replace /> },
];

export default appRoutes;
