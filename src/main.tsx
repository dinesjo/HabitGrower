import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import {
  createBrowserRouter,
  createRoutesFromElements,
  Outlet,
  redirect,
  Route,
  RouterProvider,
} from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import IndexLayout from "./routes/Index/IndexLayout";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, PaletteMode, createTheme } from "@mui/material";
import "./firebase";
import { signOut } from "./firebase";
import AccountView from "./routes/Profile/AccountView";
import SignInView from "./routes/Profile/SignInView";
import ProfileLayout from "./routes/Profile/ProfileLayout";
import SelectedHabit from "./routes/MyHabits/SelectedHabit";
import MyHabitsIndex from "./routes/MyHabits/MyHabitsIndex";
import EditHabitForm from "./components/EditHabitForm";
import { createEmptyHabit, deleteHabit, Habit, updateHabit } from "./habitsModel";
import { requireAuth } from "./utils/requireAuth";
import { useAtom } from "jotai";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { themeAtom } from "./store";
import SelectedHabitGraph from "./routes/Index/SelectedHabitGraph";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route path="/" element={<Outlet />} id="root" loader={Root.loader} errorElement={<ErrorPage />}>
        <Route path="/">
          <Route
            index
            element={<IndexLayout />}
            id="index"
            loader={requireAuth(IndexLayout.loader)}
            action={IndexLayout.action}
          />
          <Route path=":id" element={<SelectedHabitGraph />} loader={requireAuth(SelectedHabitGraph.loader)} />
        </Route>
        <Route path="profile" element={<ProfileLayout />}>
          <Route index element={<AccountView />} loader={AccountView.loader} />
          <Route path="signout" action={signOut} />
          <Route path="signin" element={<SignInView />} />
        </Route>

        <Route path="my-habits">
          <Route index element={<MyHabitsIndex />} loader={requireAuth(MyHabitsIndex.loader)} />
          <Route path=":id" element={<SelectedHabit />} loader={requireAuth(SelectedHabit.loader)} />
          <Route
            path=":id/edit"
            element={<EditHabitForm />}
            loader={requireAuth(EditHabitForm.loader)}
            action={async ({ params, request }) => {
              if (!params.id) {
                return redirect("/my-habits");
              }
              const formData = Object.fromEntries(await request.formData());
              await updateHabit(params.id, formData as unknown as Habit);
              return redirect(`/my-habits/`);
            }}
          />
          <Route
            path=":id/delete"
            action={async ({ params }) => {
              if (!params.id) {
                return redirect("/my-habits");
              }
              await deleteHabit(params.id);
              return redirect("/my-habits");
            }}
          />
          <Route
            path="new-habit"
            action={async () => {
              const id = await createEmptyHabit();
              return redirect(`/my-habits/${id}/edit`);
            }}
          />
        </Route>
        <Route path="*" element={<ErrorPage />} />
      </Route>
    </Route>
  )
);

function Main() {
  const [themeAtomValue] = useAtom<PaletteMode>(themeAtom);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeAtomValue,
          primary: {
            main: themeAtomValue === "dark" ? "#90c65b" : "#478523",
          },
          secondary: {
            main: "#7d3dbc",
          },
        },
      }),
    [themeAtomValue]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </LocalizationProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
