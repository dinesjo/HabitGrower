import List from "@mui/material/List";
import { LazyMotion } from "motion/react";
import type { ReactNode } from "react";

// If loading fails, leave LazyMotion in its initial static state; check-ins still work.
const staticMotion = new Promise<never>(() => {});
const loadFeatures = () => import("./habitMotionFeatures")
  .then((module) => module.default)
  .catch(() => staticMotion);

export default function HabitMotionList({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={loadFeatures} strict>
      <List disablePadding sx={{ px: 1, pt: 1 }}>{children}</List>
    </LazyMotion>
  );
}
