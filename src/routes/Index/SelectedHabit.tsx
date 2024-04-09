import {
  CardHeader,
  Typography,
  Avatar,
  CardActions,
  Button,
  CardContent,
  Card,
  Alert,
  AlertTitle,
} from "@mui/material";
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel.tsx";
import { ChevronLeft, Edit } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap.tsx";
import { toFriendlyFrequency } from "../../utils/helpers.tsx";
import DeleteWithConfirm from "../../components/DeleteWithConfirm.tsx";
import SelectedHabitGraph from "./SelectedHabitGraph.tsx";

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

  return (
    <Card>
      <CardActions>
        <Button startIcon={<ChevronLeft />} aria-label="back" onClick={() => navigate("/")}>
          Back
        </Button>
      </CardActions>
      {!habit || !id ? (
        <Alert severity="error">
          <AlertTitle>Habit not found! Please check the ID in the URL is correct.</AlertTitle>
        </Alert>
      ) : (
        <>
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
          <CardContent>
            {habit.frequency && habit.frequencyUnit && (
              <Typography variant="body2">
                You told yourself to {habit.name} {toFriendlyFrequency(habit)}.
              </Typography>
            )}
            <SelectedHabitGraph habit={habit} />
          </CardContent>
          <CardActions>
            <Button color="primary" startIcon={<Edit />} onClick={() => navigate(`/${id}/edit`)}>
              Edit
            </Button>
            <DeleteWithConfirm habit={habit} id={id} />
          </CardActions>
        </>
      )}
    </Card>
  );
}
