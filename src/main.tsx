import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React, { useMemo } from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, redirect, Route, RouterProvider } from "react-router-dom";
import Root from "./routes/root";
import ErrorPage from "./error-page";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, PaletteMode, createTheme } from "@mui/material";
import "./firebase";
import { signOut } from "./firebase";
import AccountView from "./routes/Profile/AccountView";
import SignInView from "./routes/Profile/SignInView";
import SelectedHabit from "./routes/Index/SelectedHabit";
import EditHabitForm from "./components/EditHabitForm";
import { createEmptyHabit, deleteHabit, Habit, unregisterHabitByDate, updateHabit } from "./habitsModel";
import { requireAuth } from "./utils/requireAuth";
import { useAtom } from "jotai";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { checkedHabitIdsAtom, store, themeAtom } from "./store";
import IndexPage from "./routes/Index/IndexView";
import { DevTools } from "jotai-devtools";
// Note that this may get included in your production builds. Please import it conditionally if you want to avoid that
import "jotai-devtools/styles.css";
import { showSnackBar } from "./utils/helpers";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />} id="root" errorElement={<ErrorPage />}>
      <Route path="/">
        <Route index element={<IndexPage />} loader={requireAuth(IndexPage.loader)} action={IndexPage.action} />
        <Route path=":id" element={<SelectedHabit />} loader={requireAuth(SelectedHabit.loader)} />
        <Route
          path=":id/edit"
          element={<EditHabitForm />}
          loader={requireAuth(EditHabitForm.loader)}
          action={async ({ params, request }) => {
            if (!params.id) {
              return redirect("/");
            }
            const formData = Object.fromEntries(await request.formData());
            await updateHabit(params.id, formData as unknown as Habit);
            // Show snackbar
            showSnackBar("Habit updated!", "success");
            return redirect("/");
          }}
        />
        <Route
          path=":id/delete"
          action={async ({ params }) => {
            if (!params.id) {
              return redirect("/");
            }
            await deleteHabit(params.id);
            // Remove from checkedHabitIds
            store.set(checkedHabitIdsAtom, (checkedHabitIds) => checkedHabitIds.filter((id) => id !== params.id));
            // Show snackbar
            showSnackBar("Habit deleted!", "success");
            return redirect("/");
          }}
        />
        <Route
          path=":id/unregister/:date"
          action={async ({ params }) => {
            if (!params.id || !params.date) {
              return redirect("/" + params.id);
            }
            await unregisterHabitByDate(params.id, params.date);
            // Show snackbar
            showSnackBar("Unregistered successfully!", "success");
            return redirect("/" + params.id);
          }}
        />
        <Route
          path="new-habit"
          action={async () => {
            const id = await createEmptyHabit();
            return redirect(`/${id}/edit`);
          }}
        />
      </Route>
      <Route path="profile">
        <Route index element={<AccountView />} loader={AccountView.loader} />
        <Route path="signout" action={signOut} />
        <Route path="signin" element={<SignInView />} />
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
        <DevTools />
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
