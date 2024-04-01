import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Divider, Typography } from "@mui/material";
import { IconMap } from "../utils/IconMap";
import { Habit } from "../habitsModel";

export default function HabitCard({ habit }: { habit: Habit }) {
  return (
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
  );
}
