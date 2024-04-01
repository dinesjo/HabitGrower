import {
  Card,
  CardHeader,
  Typography,
  Avatar,
  CardActions,
  Button,
  CardContent,
  Divider,
  LinearProgress,
} from "@mui/material";
import { Await, LoaderFunctionArgs, defer, useLoaderData, useNavigate } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel";
import Cover from "../../components/Cover";
import { ChevronLeft } from "@mui/icons-material";
import { Suspense } from "react";

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  const habitPromise = fetchHabitById(id);
  return defer({
    habit: habitPromise,
  });
}

SelectedHabit.loader = loader;

export default function SelectedHabit() {
  const loaderData = useLoaderData();

  const navigate = useNavigate();

  if (!loaderData) {
    return (
      <Cover>
        <Typography variant="h3">Habit not found</Typography>
      </Cover>
    );
  }

  return (
    <Cover>
      <CardActions>
        <Button startIcon={<ChevronLeft />} aria-label="back" onClick={() => navigate("/overview")}>
          Back
        </Button>
      </CardActions>
      <Card sx={{ p: 0, minWidth: 280 }}>
        <Suspense fallback={<LinearProgress />}>
          <Await resolve={(loaderData as { habit: Habit }).habit} errorElement={"Invalid habit ID"}>
            {(habit) => (
              <>
                <CardHeader
                  avatar={
                    <Avatar
                      sx={{
                        bgcolor: habit.color || "text.primary",
                      }}
                    >
                      {habit.icon}
                    </Avatar>
                  }
                  title={
                    <Typography
                      variant="h5"
                      sx={{
                        color: habit.color || "text.primary",
                      }}
                    >
                      {habit.name}
                    </Typography>
                  }
                  subheader={habit.description}
                />
                <Divider />
                <CardContent>
                  <Typography variant="subtitle1">
                    {habit.startDate &&
                      `${habit.startDate.toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`}
                    {habit.endDate &&
                      ` - ${habit.endDate.toLocaleDateString(undefined, {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}`}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    You told yourself to <b>{habit.name}</b>{" "}
                    {habit.frequency && `${habit.frequency} times a ${habit.frequencyUnit}`}{" "}
                  </Typography>
                </CardContent>
              </>
            )}
          </Await>
        </Suspense>
      </Card>
    </Cover>
  );
}
