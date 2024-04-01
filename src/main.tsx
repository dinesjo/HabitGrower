import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import IndexLayout from "./routes/Index/IndexLayout";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline } from "@mui/material";
import "./firebase";
import { Provider } from "jotai";
import { signOut } from "./firebase";
import AccountView from "./routes/Profile/AccountView";
import SignInView from "./routes/Profile/SignInView";
import { store } from "./store";
import ProfileLayout from "./routes/Profile/ProfileLayout";
import theme from "./theme";
import SelectedHabit from "./routes/Index/SelectedHabit";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route path="/" element={<Outlet />} id="root" loader={Root.loader}>
        <Route path="overview">
          <Route index element={<IndexLayout />} />
          <Route path=":id" element={<SelectedHabit />} loader={SelectedHabit.loader} />
        </Route>
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<AccountView />} loader={AccountView.loader} />
          <Route path="signout" action={signOut} />
          <Route path="signin" element={<SignInView />} />
        </Route>
        {/* <Route path="contacts/:contactId" element={<Contact />} loader={contactLoader} action={contactAction} />
        <Route path="contacts/:contactId/edit" element={<EditContact />} loader={contactLoader} action={editAction} /> */}
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
