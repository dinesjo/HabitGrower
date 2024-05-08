import {
  CardHeader,
  Typography,
  Avatar,
  CardActions,
  Button,
  CardContent,
  Alert,
  AlertTitle,
  Divider,
  Card,
} from "@mui/material";
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel.tsx";
import { EditOutlined } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap.tsx";
import { toFriendlyFrequency } from "../../utils/helpers.tsx";
import SelectedHabitGraph from "./SelectedHabitGraph.tsx";
import SelectedHabitList from "./SelectedHabitList.tsx";
import BackButton from "../../components/BackButton.tsx";
import DeleteHabitWithConfirm from "../../components/DeleteHabitWithConfirm.tsx";

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

  const registerCount = habit.dates ? Object.keys(habit.dates).length : 0;

  return (
    <Card>
      <CardActions>
        <BackButton />
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
          <CardContent
            sx={{ maxHeight: "60vh", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#ccc #222" }}
          >
            {habit.frequency && habit.frequencyUnit && (
              <Typography variant="body2">
                You told yourself to {habit.name} {toFriendlyFrequency(habit)}.
              </Typography>
            )}
            <Typography variant="body2" color="text.secondary">
              You've registered this habit {registerCount} times.
            </Typography>
            <SelectedHabitGraph habit={habit} />
            <SelectedHabitList habit={habit} />
          </CardContent>
          <Divider />
          <CardActions>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<EditOutlined />}
              onClick={() => navigate(`/${id}/edit`)}
            >
              Edit
            </Button>
            <DeleteHabitWithConfirm habit={habit} id={id} />
          </CardActions>
        </>
      )}
    </Card>
  );
}
