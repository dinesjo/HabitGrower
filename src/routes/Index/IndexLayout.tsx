import { LinearProgress, Typography } from "@mui/material";
import Cover from "../../components/Cover";
import { Suspense } from "react";
import HabitsCards from "./HabitsCards";
import { Await, defer, useLoaderData } from "react-router-dom";
import { Habit, fetchHabits } from "../../habitsModel";

async function loader() {
  const habitsPromise = fetchHabits();
  return defer({
    habits: habitsPromise,
  });
}

IndexLayout.loader = loader;

export default function IndexLayout() {
  const loaderData = useLoaderData();

  return (
    <Cover>
      <Typography variant="h4" color="primary" align="center">
        Good {new Date().getHours() < 10 ? "morning" : new Date().getHours() < 20 ? "day" : "evening"}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Have you kept up with your habits today?
      </Typography>
      <Suspense fallback={<LinearProgress />}>
        <Await resolve={(loaderData as { habits: Habit[] }).habits} errorElement={"Failed to load habits"}>
          {(habits: Habit[]) => <HabitsCards habits={habits} />}
        </Await>
      </Suspense>
    </Cover>
  );
}
