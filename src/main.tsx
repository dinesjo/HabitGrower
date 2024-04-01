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
import { signOut } from "./firebase";
import AccountView from "./routes/Profile/AccountView";
import SignInView from "./routes/Profile/SignInView";
import ProfileLayout from "./routes/Profile/ProfileLayout";
import theme from "./theme";
import SelectedHabit from "./routes/Index/SelectedHabit";
import MyHabitsIndex from "./routes/MyHabits/MyHabitsIndex";
import EditHabitForm from "./components/EditHabitForm";

const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route path="/" element={<Outlet />} id="root" loader={Root.loader}>
        <Route path="overview">
          <Route index element={<IndexLayout />} loader={IndexLayout.loader} />
          <Route path=":id" element={<SelectedHabit />} loader={SelectedHabit.loader} />
        </Route>
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<AccountView />} loader={AccountView.loader} />
          <Route path="signout" action={signOut} />
          <Route path="signin" element={<SignInView />} />
        </Route>
        <Route path="my-habits">
          <Route index element={<MyHabitsIndex />} loader={MyHabitsIndex.loader} />
          <Route path="edit/:id" element={<EditHabitForm />} loader={EditHabitForm.loader} />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Route>
  )
);

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  </React.StrictMode>
);
