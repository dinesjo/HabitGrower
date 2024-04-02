import {
  Card,
  CardHeader,
  Typography,
  Avatar,
  CardActions,
  Button,
  CardContent,
  Divider,
  Dialog,
  DialogTitle,
  DialogActions,
  Alert,
  AlertTitle,
} from "@mui/material";
import { Form, LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel";
import Cover from "../../components/Cover";
import { ChevronLeft, DeleteForever, Edit } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";
import { useState } from "react";

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

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

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
      <Card sx={{ p: 0 }} elevation={0}>
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
              You told yourself to <b>{habit.name}</b>{" "}
              {`${habit.frequency === 1 ? "once" : `${habit.frequency} times`} a ${habit.frequencyUnit}`}{" "}
            </Typography>
          )}
        </CardContent>
        <CardActions>
          <Button color="primary" startIcon={<Edit />} onClick={() => navigate(`/my-habits/${id}/edit`)}>
            Edit
          </Button>
          <Button color="error" startIcon={<DeleteForever />} onClick={() => setDeleteDialogOpen(true)}>
            Delete
          </Button>
          <Dialog
            open={deleteDialogOpen}
            onClose={() => setDeleteDialogOpen(false)}
            aria-labelledby={"delete-confirm-title"}
          >
            <DialogTitle id={"delete-confirm-title"}>Delete habit?</DialogTitle>
            <Alert severity="warning">
              <AlertTitle>"{habit.name}" will be deleted</AlertTitle>
              This action cannot be undone.
            </Alert>
            <DialogActions>
              <Button onClick={() => setDeleteDialogOpen(false)}>Cancel</Button>
              <Form action={`/my-habits/${id}/delete`} method="post">
                <Button type="submit" color="error">
                  Confirm
                </Button>
              </Form>
            </DialogActions>
          </Dialog>
        </CardActions>
      </Card>
    </Cover>
  );
}
