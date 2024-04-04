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
import { createEmptyHabit, deleteHabit, updateHabit } from "./habitsModel";
import { requireAuth } from "./utils/requireAuth";
import { atom, useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />}>
      <Route path="/" element={<Outlet />} id="root" loader={Root.loader} errorElement={<ErrorPage />}>
        <Route index element={<IndexLayout />} loader={requireAuth(IndexLayout.loader)} action={IndexLayout.action} />
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
              const formData = await request.formData();
              await updateHabit(params.id as string, {
                name: formData.get("name") as string,
                description: (formData.get("description") as string) || null,
                icon: formData.get("icon") as string,
                color: (formData.get("color") as string) || null,
                frequency: Number(formData.get("frequency")) || null,
                frequencyUnit: (formData.get("frequencyUnit") as "day" | "week" | "month") || null,
                startDate: null,
                endDate: null,
              });
              return redirect(`/my-habits/`);
            }}
          />
          <Route
            path=":id/delete"
            action={async ({ params }) => {
              await deleteHabit(params.id as string);
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

export const themeAtom = atomWithStorage<PaletteMode>("theme", "dark");

const snackbarMessagePrimitiveAtom = atom<string>("");
export const snackbarMessageAtom = atom(
  (get) => get(snackbarMessagePrimitiveAtom),
  (_, set, message: string) => {
    set(snackbarMessagePrimitiveAtom, message);
  }
);
const snackbarSeverityPrimitiveAtom = atom<"success" | "error" | "warning" | "info">("info");
export const snackbarSeverityAtom = atom(
  (get) => get(snackbarSeverityPrimitiveAtom),
  (_, set, severity: "success" | "error" | "warning" | "info") => {
    set(snackbarSeverityPrimitiveAtom, severity);
  }
);
export const snackbarOpenAtom = atom<boolean>((get) => !!get(snackbarMessageAtom));

function Main() {
  const [darkMode] = useAtom<PaletteMode>(themeAtom);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: darkMode,
        },
      }),
    [darkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
