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
import { forwardRef, ReactElement, Ref, useId, useMemo, useState } from "react";
import { Form, useNavigation } from "react-router-dom";
import { Habit } from "../../types/Habit";
import { confirmationActionsSx, confirmationPaperSx, glassPanelSx, sectionLabelSx } from "../../styles/designLanguage";

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
  const titleId = useId();
  const descriptionId = useId();
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

  const hasData = habit.dates && Object.keys(habit.dates).length > 0;

  function handleOpen(date: string) {
    setDateToDelete(date);
    setOpen(true);
  }

  if (!hasData) {
    return (
      <Box sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2 }}>
        <SectionTitle>History</SectionTitle>
        <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
          Your registrations will appear here.
        </Typography>
      </Box>
    );
  }

  return (
    <Box sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", gap: 1, alignItems: "center", mb: 2 }}>
        <Typography component="h2" variant="h6">History</Typography>
        <SortDirectionButton />
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        TransitionComponent={Transition}
        keepMounted
        fullWidth
        maxWidth="sm"
        PaperProps={{ sx: confirmationPaperSx }}
        sx={{ "& .MuiDialog-container": { alignItems: { xs: "flex-end", sm: "center" } } }}
      >
        <Form action={"unregister/" + dateToDelete} method="delete" preventScrollReset onSubmit={() => setOpen(false)}>
          <DialogTitle id={titleId} sx={{ px: 3, pt: 3, pb: 1, fontSize: "1.5rem", lineHeight: 1.3 }}>
            Remove registration?
          </DialogTitle>
          <DialogContent sx={{ px: 3, pb: 3 }}>
            <DialogContentText id={descriptionId} sx={{ lineHeight: 1.6 }}>
              Remove the entry from{" "}
              <Typography component="span" sx={{ fontWeight: 600, color: "text.primary" }}>
                {dayjs(dateToDelete).format("MMM D, YYYY [at] HH:mm")}
              </Typography>
              ? This cannot be undone.
            </DialogContentText>
          </DialogContent>
          <DialogActions sx={confirmationActionsSx}>
            <Button variant="outlined" onClick={() => setOpen(false)} sx={{ minHeight: 48 }}>
              Cancel
            </Button>
            <Button color="error" variant="contained" type="submit" loading={navigation.state === "submitting"} sx={{ minHeight: 48 }}>
              Remove
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
      <List disablePadding sx={{
        "& .MuiListItem-root": {
          minHeight: 68,
          px: 0,
          pr: 6,
          borderBottom: 1,
          borderColor: "divider",
          "&:last-of-type": { borderBottom: 0 },
        },
        "& .MuiListItemSecondaryAction-root": { right: 0 },
      }}>
        {sortedEntries.map(([date]) => {
          const daysAgo = dayjs().startOf("day").diff(dayjs(date).startOf("day"), "days");
          const daysAgoFriendly = daysAgo === 0 ? "Today" : daysAgo === 1 ? "Yesterday" : `${daysAgo} days ago`;
          const isToday = daysAgo === 0;

          return (
            <ListItem
              key={date}
              secondaryAction={
                <IconButton
                  aria-label={`Remove registration from ${dayjs(date).format("MMM D, YYYY [at] HH:mm")}`}
                  type="button"
                  color="error"
                  disabled={navigation.state === "submitting"}
                  onClick={() => handleOpen(date)}

                >
                  <RemoveOutlined />
                </IconButton>
              }
            >
              <ListItemText
                primary={`${dayjs(date).format(dayjs(date).year() === dayjs().year() ? "ddd, MMM D" : "ddd, MMM D, YYYY")}, ${dayjs(date).format("HH:mm")}`}
                secondary={daysAgoFriendly}
                primaryTypographyProps={{ fontSize: "0.9375rem", fontWeight: 600, lineHeight: 1.5 }}
                secondaryTypographyProps={{ fontSize: "0.8125rem", color: isToday ? "primary.main" : "text.secondary" }}
              />
            </ListItem>
          );
        })}
      </List>
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ ...sectionLabelSx }}>
      <Typography component="h2" variant="h6" sx={{ color: "text.primary" }}>
        {children}
      </Typography>
    </Box>
  );
}

function SortDirectionButton() {
  const [sortDirection, setSortDirection] = useAtom(sortDirectionAtom);
  const isDesc = sortDirection === "desc";

  return (
    <Button
      startIcon={isDesc ? <KeyboardArrowUpOutlined /> : <KeyboardArrowDownOutlined />}
      onClick={() => setSortDirection(sortDirection === "asc" ? "desc" : "asc")}
      variant="outlined"
      size="small"
      sx={{ px: 1, flexShrink: 0, whiteSpace: "nowrap", fontSize: "0.75rem" }}
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
