import { EditOutlined } from "@mui/icons-material";
import {
  Alert,
  AlertTitle,
  Avatar,
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Divider,
  Typography,
} from "@mui/material";
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import DeleteHabitWithConfirm from "../../components/DeleteHabitWithConfirm";
import { fetchHabitById } from "../../services/habitsPersistance";
import { Habit } from "../../types/Habit";
import { iconMap } from "../../constants/iconMap";
import { toFriendlyFrequency } from "../../utils/helpers";
import SelectedHabitGraph from "./SelectedHabitGraph";
import SelectedHabitList from "./SelectedHabitList";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";

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
                {iconMap[habit.icon]}
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
            subheader={
              <Box>
                <HabitNotificationIndicator sx={{ color: habit.color }} habit={habit} />
                {habit.description}
              </Box>
            }
          />
          <CardContent
            sx={{ maxHeight: "60vh", overflowY: "auto", scrollbarWidth: "thin", scrollbarColor: "#ccc #222" }}
          >
            {habit.frequency && habit.frequencyUnit && (
              <Typography variant="body2">
                You told yourself to{" "}
                <Typography variant="body2" display="inline" sx={{ color: habit.color }}>
                  {habit.name}
                </Typography>{" "}
                {toFriendlyFrequency(habit)}.
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
