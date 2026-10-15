import { createContext, useContext, useLayoutEffect, useState } from "react";

export type ActionSurface = "register" | "editor";
type UpdateActionHeight = (surface: ActionSurface, height: number) => void;

export const ActionHeightContext = createContext<UpdateActionHeight | undefined>(undefined);

export function useActionSurfaceRef(surface: ActionSurface, updateHeight?: UpdateActionHeight) {
  const contextUpdate = useContext(ActionHeightContext);
  const update = updateHeight || contextUpdate;
  const [element, setElement] = useState<HTMLElement | null>(null);

  useLayoutEffect(() => {
    if (!element || !update) return;
    const measure = () => update(surface, element.getBoundingClientRect().height);
    measure();
    if (typeof ResizeObserver === "undefined") {
      window.addEventListener("resize", measure);
      return () => window.removeEventListener("resize", measure);
    }
    const observer = new ResizeObserver(measure);
    observer.observe(element);
    return () => observer.disconnect();
  }, [element, surface, update]);

  return setElement;
}
