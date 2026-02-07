import { CalendarMonth, EventAvailableOutlined, EventBusy, KeyboardArrowDownOutlined, KeyboardArrowUpOutlined, RemoveOutlined } from "@mui/icons-material";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Divider,
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

  const hasData = habit.dates && Object.keys(habit.dates).length > 0;

  function handleOpen(date: string) {
    setDateToDelete(date);
    setOpen(true);
  }

  if (!hasData) {
    return (
      <Box
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          border: 1,
          borderColor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
          bgcolor: "background.paper",
          boxShadow: (t) => (t.palette.mode === "dark" ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 8px rgba(0,0,0,0.04)"),
        }}
      >
        <SectionTitle>Registration History</SectionTitle>
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <EventAvailableOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No registrations yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Start tracking by registering this habit from the home screen
          </Typography>
        </Box>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: 1,
        borderColor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
        bgcolor: "background.paper",
        boxShadow: (t) => (t.palette.mode === "dark" ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 8px rgba(0,0,0,0.04)"),
      }}
    >
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <SectionTitle>Registration History</SectionTitle>
        <SortDirectionButton />
      </Box>
      <Dialog
        open={open}
        onClose={() => setOpen(false)}
        TransitionComponent={Transition}
        keepMounted
        fullWidth
        maxWidth={false}
        PaperProps={{
          sx: {
            position: "fixed",
            bottom: 0,
            left: 0,
            right: 0,
            m: 0,
            maxWidth: "100%",
            width: "100%",
            borderRadius: "24px 24px 0 0",
            maxHeight: "90vh",
          },
        }}
        sx={{
          "& .MuiDialog-container": {
            alignItems: "flex-end",
          },
          "& .MuiBackdrop-root": {
            backgroundColor: "rgba(0, 0, 0, 0.6)",
          },
        }}
      >
        <Form action={"unregister/" + dateToDelete} method="delete" onSubmit={() => setOpen(false)}>
          {/* Handle for pulling down */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              pt: 1.5,
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: 40,
                height: 4,
                borderRadius: 2,
                bgcolor: "divider",
              }}
            />
          </Box>

          {/* Icon and Title */}
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              pt: 2,
              pb: 1,
            }}
          >
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: "50%",
                bgcolor: "warning.light",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                mb: 2,
                opacity: 0.9,
              }}
            >
              <EventBusy sx={{ fontSize: 32, color: "warning.contrastText" }} />
            </Box>
            <DialogTitle sx={{ textAlign: "center", pb: 1, pt: 0 }}>
              <Typography variant="h6" sx={{ fontWeight: 700 }}>
                Unregister Entry?
              </Typography>
            </DialogTitle>
          </Box>

          <DialogContent sx={{ px: 3, pb: 2 }}>
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 1 }}>
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1,
                  p: 2,
                  borderRadius: 2,
                  bgcolor: "action.hover",
                  width: "100%",
                  justifyContent: "center",
                }}
              >
                <CalendarMonth sx={{ color: "primary.main" }} />
                <Box>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    {dayjs(dateToDelete).format("dddd, MMM D")}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(dateToDelete).format("HH:mm")}
                  </Typography>
                </Box>
              </Box>
              <DialogContentText sx={{ textAlign: "center", fontSize: "0.95rem", mt: 1 }}>
                Are you sure you want to remove this registration? This action cannot be undone.
              </DialogContentText>
            </Box>
          </DialogContent>

          <Divider />

          <DialogActions sx={{ flexDirection: "column", gap: 1, p: 2 }}>
            <Button
              color="error"
              variant="contained"
              type="submit"
              loading={navigation.state === "submitting"}
              loadingPosition="start"
              fullWidth
              size="large"
              startIcon={<RemoveOutlined />}
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Unregister
            </Button>
            <Button
              color="inherit"
              variant="outlined"
              onClick={() => setOpen(false)}
              fullWidth
              size="large"
              sx={{
                borderRadius: 3,
                py: 1.5,
                fontWeight: 600,
                fontSize: "1rem",
              }}
            >
              Cancel
            </Button>
          </DialogActions>
        </Form>
      </Dialog>
      <List
        disablePadding
        dense
        sx={{
          width: "100%",
          "& .MuiListItem-root": {
            borderRadius: 2,
            mb: 0.5,
            transition: "all 0.2s ease-in-out",
            "@media (hover: hover) and (pointer: fine)": {
              "&:hover": {
                bgcolor: "action.hover",
                transform: "translateX(4px)",
              },
            },
          },
        }}
      >
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
                  sx={{
                    transition: "all 0.2s ease-in-out",
                    "@media (hover: hover) and (pointer: fine)": {
                      "&:hover": {
                        transform: "scale(1.1)",
                      },
                    },
                  }}
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
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
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
