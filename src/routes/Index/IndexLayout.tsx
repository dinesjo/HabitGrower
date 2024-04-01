import { LinearProgress, Typography } from "@mui/material";
import Cover from "../../components/Cover";
import { Suspense } from "react";
import HabitsCards from "./HabitsCards";

export default function IndexLayout() {
  return (
    <Cover>
      <Typography variant="h4" color="primary" align="center">
        Good {new Date().getHours() < 10 ? "morning" : new Date().getHours() < 20 ? "day" : "evening"}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Have you kept up with your habits today?
      </Typography>
      <Suspense fallback={<LinearProgress />}>
        <HabitsCards />
      </Suspense>
    </Cover>
  );
}
