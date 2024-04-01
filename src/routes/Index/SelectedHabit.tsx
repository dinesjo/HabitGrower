import { Card, CardHeader, Typography, Avatar, CardActions, Button, CardContent, Divider } from "@mui/material";
import { LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel";
import Cover from "../../components/Cover";
import { ChevronLeft } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  return {
    habit: await fetchHabitById(id),
  };
}

SelectedHabit.loader = loader;

export default function SelectedHabit() {
  const { habit } = useLoaderData() as { habit: Habit };

  const navigate = useNavigate();

  if (!habit) {
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
      <Card sx={{ p: 0 }}>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: habit.color || "text.primary",
              }}
            >
              {IconMap[habit.icon || "default"]}
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
        <CardActions>
          <Button color="primary">Edit</Button>
        </CardActions>
      </Card>
    </Cover>
  );
}
