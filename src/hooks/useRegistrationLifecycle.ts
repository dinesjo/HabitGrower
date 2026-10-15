import { useEffect } from "react";
import { useFetcher, useLocation } from "react-router-dom";
import { useAtomValue } from "jotai";
import { checkedHabitIdsAtom, registrationAtom, store } from "../store";
import { REGISTRATION_FEEDBACK_MS, REGISTRATION_FETCHER_KEY, registrationGraceRemaining } from "../utils/habitRegistration";

// Root owns this fetcher so an in-flight save survives child-route navigation.
export function useRegistrationLifecycle() {
  const fetcher = useFetcher({ key: REGISTRATION_FETCHER_KEY });
  const registration = useAtomValue(registrationAtom);
  const selected = useAtomValue(checkedHabitIdsAtom);
  const location = useLocation();

  useEffect(() => {
    if (location.pathname === "/profile/signin") {
      store.set(registrationAtom, null);
      store.set(checkedHabitIdsAtom, []);
    }
  }, [location.pathname]);

  useEffect(() => {
    if (registration?.phase !== "saving" || !registration.acknowledged || fetcher.state !== "idle") return;
    const timeout = window.setTimeout(() => {
      const current = store.get(registrationAtom);
      if (current?.batch.id === registration.batch.id && current.phase === "saving") {
        store.set(registrationAtom, { ...current, phase: "saved" });
      }
    }, registrationGraceRemaining(registration.batch));
    return () => window.clearTimeout(timeout);
  }, [registration, fetcher.state]);

  useEffect(() => {
    if (registration?.phase !== "saved") return;
    const timeout = window.setTimeout(() => {
      if (store.get(registrationAtom)?.batch.id === registration.batch.id) store.set(registrationAtom, null);
    }, REGISTRATION_FEEDBACK_MS);
    return () => window.clearTimeout(timeout);
  }, [registration]);

  useEffect(() => {
    if (registration?.phase === "error" && !selected.length) store.set(registrationAtom, null);
  }, [registration, selected.length]);
}
