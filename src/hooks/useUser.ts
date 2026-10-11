import { useEffect, useState } from "react";
import { getBackend } from "../data/backend";
import type { AppUser } from "../data/types";

export function useUser() {
  const [state, setState] = useState<{ user: AppUser | null; loading: boolean; error?: Error }>({ user: null, loading: true });
  useEffect(() => {
    let disposed = false;
    let unsubscribe: (() => void) | undefined;
    getBackend().then((backend) => {
      if (disposed) return;
      unsubscribe = backend.subscribeUser(
        (user) => setState({ user, loading: false }),
        (error) => setState({ user: null, loading: false, error })
      );
    }).catch((error: Error) => {
      if (!disposed) setState({ user: null, loading: false, error });
    });
    return () => { disposed = true; unsubscribe?.(); };
  }, []);
  if (state.error) throw state.error;
  return [state.user, state.loading] as const;
}
