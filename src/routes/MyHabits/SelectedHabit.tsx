import { CardHeader, Typography, Avatar, CardActions, Button, CardContent, Divider, Box } from "@mui/material";
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel";
import Cover from "../../components/Cover";
import { ChevronLeft, Edit } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";
import { toFriendlyFrequency } from "../../utils/helpers.tsx";
import DeleteWithConfirm from "../../components/DeleteWithConfirm.tsx";

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
  const { id } = useParams();
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
        <Button startIcon={<ChevronLeft />} aria-label="back" onClick={() => navigate("/my-habits")}>
          Back
        </Button>
      </CardActions>
      <Box>
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
          {habit.frequency && habit.frequencyUnit && (
            <Typography variant="body2" color="text.secondary">
              You told yourself to {habit.name} {toFriendlyFrequency(habit)}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button color="primary" startIcon={<Edit />} onClick={() => navigate(`/my-habits/${id}/edit`)}>
            Edit
          </Button>
          <DeleteWithConfirm habit={habit} id={id!} />
        </CardActions>
      </Box>
    </Cover>
  );
}
