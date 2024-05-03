import {
  IconButton,
  List,
  ListItem,
  ListItemText,
  Typography,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Box,
} from "@mui/material";
import dayjs from "dayjs";
import { Habit } from "../../habitsModel";
import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined, RemoveOutlined } from "@mui/icons-material";
import { Form, useNavigation } from "react-router-dom";
import { useState } from "react";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";

const sortDirectionAtom = atomWithStorage<"asc" | "desc">("sortHabitListDirection", "desc");

export default function SelectedHabitList({ habit }: { habit: Habit }) {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const sortDirection = useAtomValue(sortDirectionAtom);

  function handleOpen(date: string) {
    setDateToDelete(date);
    setOpen(true);
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <SortDirectionButton />
      </Box>
      <Dialog open={open} onClose={() => setOpen(false)}>
        <Form action={"unregister/" + dateToDelete} method="delete" onSubmit={() => setOpen(false)}>
          <DialogTitle>Unregister?</DialogTitle>
          <DialogContent>
            <DialogContentText>Unregister at {dayjs(dateToDelete).format("ddd, MMM D HH:mm")}?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button color="error" variant="contained" type="submit" disabled={navigation.state === "submitting"}>
              Unregister
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
      <List disablePadding dense sx={{ width: "100%" }}>
        {habit.dates &&
          Object.entries(habit.dates)
            .sort((a, b) => (sortDirection === "asc" ? ascending(a[0], b[0]) : descending(a[0], b[0])))
            .map(([date]) => {
              const daysAgo = dayjs().startOf("day").diff(dayjs(date).startOf("day"), "days");
              const daysAgoFriendly = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
              const isToday = daysAgo === 0;

              return (
                <ListItem
                  key={date}
                  secondaryAction={
                    <IconButton
                      edge="end"
                      aria-label="delete"
                      type="submit"
                      color="error"
                      disabled={navigation.state === "submitting"}
                      onClick={() => handleOpen(date)}
                    >
                      <RemoveOutlined />
                    </IconButton>
                  }
                >
                  <ListItemText
                    primary={`${dayjs(date).format("ddd, MMM D")}, ${dayjs(date).format("HH:mm")}`}
                    secondary={
                      <Typography variant="body2" color={isToday ? "primary" : "text.secondary"}>
                        {daysAgoFriendly}
                      </Typography>
                    }
                  />
                </ListItem>
              );
            })}
      </List>
    </>
  );
}

function SortDirectionButton() {
  const [sortDirection, setSortDirection] = useAtom(sortDirectionAtom);
  const isDesc = sortDirection === "desc";

  return (
    <Button
      startIcon={isDesc ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
      onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
    >
      {sortDirection === "desc" ? "Newest first" : "Oldest first"}
    </Button>
  );
}

function ascending(a: string, b: string) {
  return dayjs(a).isBefore(dayjs(b)) ? -1 : 1;
}

function descending(a: string, b: string) {
  return dayjs(b).isBefore(dayjs(a)) ? -1 : 1;
}
