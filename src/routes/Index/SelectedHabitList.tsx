import { IconButton, List, ListItem, ListItemText } from "@mui/material";
import dayjs from "dayjs";
import { Habit } from "../../habitsModel";
import { DeleteForever } from "@mui/icons-material";
import { Form, useNavigation } from "react-router-dom";

export default function SelectedHabitList({ habit }: { habit: Habit }) {
  const navigation = useNavigation();

  return (
    <List sx={{ width: "100%" }}>
      {habit.dates &&
        Object.entries(habit.dates)
          .sort((a, b) => descending(a[0], b[0]))
          .map(([date]) => (
            <Form key={date} action={"unregister/" + date} method="delete">
              <ListItem
                secondaryAction={
                  <IconButton
                    edge="end"
                    aria-label="delete"
                    type="submit"
                    color="error"
                    disabled={navigation.state === "submitting"}
                  >
                    <DeleteForever />
                  </IconButton>
                }
              >
                <ListItemText
                  primary={`${dayjs(date).format("ddd, MMM D")}, ${dayjs(date).format("HH:mm")}`}
                  secondary={`${dayjs().diff(dayjs(date), "days")} days ago`}
                />
              </ListItem>
            </Form>
          ))}
    </List>
  );
}

// function ascending(a: string, b: string) {
//   return dayjs(a).isBefore(dayjs(b)) ? -1 : 1;
// }

function descending(a: string, b: string) {
  return dayjs(b).isBefore(dayjs(a)) ? -1 : 1;
}
