import { Typography } from "@mui/material";
import Cover from "../../components/Cover";
import HabitsCards from "./HabitsCards";
import { useLoaderData } from "react-router-dom";
import { Habit, fetchHabits } from "../../habitsModel";

async function loader() {
  return {
    habits: await fetchHabits(),
  };
}

IndexLayout.loader = loader;

export default function IndexLayout() {
  const { habits } = useLoaderData() as { habits: Habit[] };
  if (!habits) {
    return (
      <Cover>
        <Typography variant="h3">No habits found</Typography>
      </Cover>
    );
  }

  return (
    <Cover>
      <Typography variant="h4" color="primary" align="center">
        Good {new Date().getHours() < 10 ? "morning" : new Date().getHours() < 20 ? "day" : "evening"}!
      </Typography>
      <Typography variant="subtitle1" color="text.secondary">
        Have you kept up with your habits today?
      </Typography>
      <HabitsCards habits={habits} />
    </Cover>
  );
}
