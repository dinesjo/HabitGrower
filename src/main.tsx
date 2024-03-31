import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, Outlet, Route, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import Contact, { loader as contactLoader } from "./routes/contact";
import EditContact, { action as editAction, action as contactAction } from "./routes/edit";
import Index from "./routes/Index/IndexController";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, useTheme } from "@mui/material";
import "./firebase";
import { Provider } from "jotai";
import { signOut } from "./firebase";
import SignedInView from "./routes/SignIn/SignedInView";
import SignInView from "./routes/SignIn/SignInView";
import { store } from "./store";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route path="/" element={<Outlet />} errorElement={<ErrorPage />} id="root" loader={Root.loader}>
        <Route index element={<Index />} />
        <Route path="profile" element={<SignedInView />} loader={SignedInView.loader} />
        <Route path="profile/signin" element={<SignInView />} loader={SignInView.loader} />
        <Route path="profile/signout" action={signOut} />
        <Route path="contacts/:contactId" element={<Contact />} loader={contactLoader} action={contactAction} />
        <Route path="contacts/:contactId/edit" element={<EditContact />} loader={contactLoader} action={editAction} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Provider store={store}>
      <ThemeProvider theme={useTheme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </Provider>
  </React.StrictMode>
);
