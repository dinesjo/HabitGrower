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
import {
  createEmptyHabit,
  deleteHabit,
  Habit,
  unregisterHabitByDate,
  updateHabit,
  getHabitsForNotification,
  fetchHabitById,
} from "./habitsModel";
import IndexPage from "./routes/Index/IndexView";
import SelectedHabit from "./routes/Index/SelectedHabit";
import AccountView from "./routes/Profile/AccountView";
import SignInView from "./routes/Profile/SignInView";
import Root from "./routes/root";
import { checkedHabitIdsAtom, store } from "./store";
import { requireAuth } from "./utils/requireAuth";
// Note that this may get included in your production builds. Please import it conditionally if you want to avoid that
import "jotai-devtools/styles.css";
import Main from "./components/Main";
import { showSnackBar } from "./utils/helpers";
import { updateHabitNotifications } from "./services/notifications";

if ("serviceWorker" in navigator) {
  // Use environment-aware path
  const swPath = "/custom-sw.js";
  navigator.serviceWorker
    .register(swPath)
    .then((registration) => {
      console.log("Service Worker registered with scope:", registration.scope);
    })
    .catch((error) => {
      console.error("Service Worker registration failed:", error);
    });
}

// Add this function
async function initializeNotifications() {
  if ("serviceWorker" in navigator) {
    await navigator.serviceWorker.ready;
    // Set up notifications for the next 24 hours
    const habits = await getHabitsForNotification();
    await updateHabitNotifications(habits);
    console.log("Notifications initialized");
  }
}

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
            // Update notification
            if (habitData.notificationEnabled) {
              const habit = await fetchHabitById(params.id);
              await updateHabitNotifications([habit!]);
            }
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

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <Main />
  </React.StrictMode>
);

// Initialize notifications
initializeNotifications();
