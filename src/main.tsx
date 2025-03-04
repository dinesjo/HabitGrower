import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, redirect, Route } from "react-router-dom";
import EditHabitForm from "./components/EditHabitForm";
import ErrorPage from "./components/ErrorPage";
import "./firebase";
import { signOut } from "./firebase";
import IndexPage from "./routes/Index/IndexView";
import SelectedHabit from "./routes/Index/SelectedHabit";
import AccountView from "./routes/Profile/AccountView";
import SignInView from "./routes/Profile/SignInView";
import Root from "./routes/root";
import {
  createEmptyHabit,
  deleteHabit,
  fetchHabitById,
  unregisterHabitByDate,
  updateHabit,
} from "./services/habitsPersistance";
import { checkedHabitIdsAtom, store } from "./store";
import { Habit } from "./types/Habit";
import { requireAuth } from "./utils/requireAuth";
// Note that this may get included in your production builds. Please import it conditionally if you want to avoid that
import { Button } from "@mui/material";
import "jotai-devtools/styles.css";
import Main from "./components/Main";
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
            const habitData = formData as unknown as Habit;
            habitData.notificationEnabled = formData.notificationEnabled === "on";
            await updateHabit(params.id, habitData);
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

            // Store habit for undo action
            const habit = await fetchHabitById(params.id);
            if (!habit) {
              return redirect("/");
            }
            const restoreHabit = async () => {
              if (!habit || !params.id) {
                showSnackBar("Failed to restore habit.", "error");
                return;
              }
              await updateHabit(params.id, habit);
              showSnackBar("Habit restored!", "success");
              router.navigate("/");
            };

            await deleteHabit(params.id);
            store.set(checkedHabitIdsAtom, (checkedHabitIds) => checkedHabitIds.filter((id) => id !== params.id));
            showSnackBar(
              "Habit deleted!",
              "success",
              <Button color="inherit" size="small" onClick={restoreHabit}>
                UNDO
              </Button>
            );
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);
