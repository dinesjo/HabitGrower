import { KeyboardArrowDownOutlined, KeyboardArrowUpOutlined, RemoveOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Slide,
  Typography,
} from "@mui/material";
import { TransitionProps } from "@mui/material/transitions";
import dayjs from "dayjs";
import { useAtom, useAtomValue } from "jotai";
import { atomWithStorage } from "jotai/utils";
import { forwardRef, ReactElement, Ref, useMemo, useState } from "react";
import { Form, useNavigation } from "react-router-dom";
import { Habit } from "../../types/Habit";

const sortDirectionAtom = atomWithStorage<"asc" | "desc">("sortHabitListDirection", "desc");

const Transition = forwardRef(function Transition(
  props: TransitionProps & {
    children: ReactElement;
  },
  ref: Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function SelectedHabitList({ habit }: { habit: Habit }) {
  const navigation = useNavigation();
  const [open, setOpen] = useState(false);
  const [dateToDelete, setDateToDelete] = useState<string | null>(null);
  const sortDirection = useAtomValue(sortDirectionAtom);

  // Memoize sorted entries to avoid sorting on every render
  const sortedEntries = useMemo(() => {
    if (!habit.dates) {
      return [];
    }
    
    return Object.entries(habit.dates)
      .sort((a, b) => (sortDirection === "asc" ? ascending(a[0], b[0]) : descending(a[0], b[0])));
  }, [habit.dates, sortDirection]);

  if (!habit.dates) {
    return null;
  }

  function handleOpen(date: string) {
    setDateToDelete(date);
    setOpen(true);
  }

  return (
    <>
      <Box sx={{ display: "flex", justifyContent: "end" }}>
        <SortDirectionButton />
      </Box>
      <Dialog 
        open={open} 
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        keepMounted
        maxWidth="xs"
        fullWidth
      >
        <Form action={"unregister/" + dateToDelete} method="delete" onSubmit={() => setOpen(false)}>
          <DialogTitle>Unregister?</DialogTitle>
          <DialogContent>
            <DialogContentText>Unregister at {dayjs(dateToDelete).format("ddd, MMM D HH:mm")}?</DialogContentText>
          </DialogContent>
          <DialogActions>
            <Button color="inherit" onClick={() => setOpen(false)}>
              Cancel
            </Button>
            <Button
              color="error"
              variant="contained"
              type="submit"
              loading={navigation.state === "submitting"}
              loadingPosition="start"
            >
              Unregister
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
      <List disablePadding dense sx={{ width: "100%" }}>
        {sortedEntries.map(([date]) => {
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
      {isDesc ? "Newest first" : "Oldest first"}
    </Button>
  );
}

function ascending(a: string, b: string) {
  return dayjs(a).isBefore(dayjs(b)) ? -1 : 1;
}

function descending(a: string, b: string) {
  return dayjs(b).isBefore(dayjs(a)) ? -1 : 1;
}
