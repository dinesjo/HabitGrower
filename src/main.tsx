import React from "react";
import ReactDOM from "react-dom/client";
import { createBrowserRouter, createRoutesFromElements, redirect, Route } from "react-router-dom";
import ErrorPage from "./components/ErrorPage";
import { signOut } from "./services/auth";
import IndexView from "./routes/Index/IndexView";
import SignInView from "./routes/Profile/SignInView";
import Root from "./routes/root";
import {
  deleteHabit,
  fetchHabitById,
  unregisterHabitByDate,
  updateHabit,
} from "./services/habitsPersistance";
import { checkedHabitIdsAtom, registrationAtom, store, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "./store";
import { requireAuth } from "./utils/requireAuth";
import { Box, Button, CircularProgress, Typography } from "@mui/material";
import Main from "./components/Main";
import { showSnackBar } from "./utils/helpers";
import { isLocalMode } from "./data/mode";
import { getBackend } from "./data/backend";
import { installModuleLoadRecovery } from "./utils/moduleLoadRecovery";
import { newHabitLoader, saveHabitAction } from "./routes/habitEditorActions";
import { habitLoader } from "./routes/habitLoader";

const loadHabitEditor = async () => ({ Component: (await import("./components/EditHabitForm")).default });

// Install before router loaders can start importing the backend.
const removeLoadRecovery = installModuleLoadRecovery();
import.meta.hot?.dispose(removeLoadRecovery);

export const router = createBrowserRouter(
  createRoutesFromElements(
    <Route element={<Root />} id="root" errorElement={<ErrorPage />} hydrateFallbackElement={
      <Box role="status" sx={{ py: 8, px: 3, textAlign: "center" }}>
        <CircularProgress size={28} aria-label="Loading HabitGrower" />
        <Typography sx={{ mt: 2 }} color="text.secondary">Loading HabitGrower…</Typography>
      </Box>
    }>
      <Route path="/">
        <Route index element={<IndexView />} loader={requireAuth(IndexView.loader)} action={IndexView.action} />
        <Route path=":id" lazy={async () => ({ Component: (await import("./routes/Index/SelectedHabit")).default })} loader={requireAuth(habitLoader)} />
        <Route
          path=":id/edit"
          lazy={loadHabitEditor}
          loader={requireAuth(habitLoader)}
          action={saveHabitAction}
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
                Undo
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
          lazy={loadHabitEditor}
          loader={requireAuth(newHabitLoader)}
          action={saveHabitAction}
        />
      </Route>
      <Route path="profile">
        <Route index lazy={async () => {
          const { default: Component } = await import("./routes/Profile/AccountView");
          return { Component, loader: Component.loader };
        }} />
        {isLocalMode && <Route path="reset-demo" action={async () => {
          await (await getBackend()).resetDemoData();
          store.set(checkedHabitIdsAtom, []);
          store.set(registrationAtom, null);
          await store.set(userDayStartsAtAtom, null);
          await store.set(userWeekStartsAtMondayAtom, false);
          showSnackBar("Sample habits and schedule restored.", "success");
          return redirect("/");
        }} />}
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
