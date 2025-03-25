import { Check, Checklist } from "@mui/icons-material";
import {
  Avatar,
  AvatarGroup,
  Badge,
  Box,
  Card,
  CardContent,
  Checkbox,
  Chip,
  Divider,
  Fab,
  Grow,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Paper,
  Typography,
} from "@mui/material";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { Form, redirect, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";
import LinearProgressWithLabel from "../../components/LinearProgressWithLabel";
import { iconMap } from "../../constants/iconMap";
import { fetchAllHabits, registerHabitsNow } from "../../services/habitsPersistance";
import { checkedHabitIdsAtom, store, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import { FrequencyUnit } from "../../types/FrequencyUnit";
import { Habit } from "../../types/Habit";
import { getProgress, getProgressBuffer, showSnackBar, toFriendlyFrequency } from "../../utils/helpers";

async function loader() {
  return {
    habits: await fetchAllHabits(),
  };
}

// Register habits
async function action({ request }: { request: Request }) {
  // Get IDs from formData and register
  const formData = await request.formData();
  const habitIds = formData.getAll("habitIds") as string[];
  await registerHabitsNow(habitIds);

  // Clear checked habits
  store.set(checkedHabitIdsAtom, []);

  // Show confirmation snackbar
  showSnackBar(`Habit${habitIds.length > 1 ? "s" : ""} registered successfully!`, "success");

  return redirect("/");
}

IndexView.loader = loader;
IndexView.action = action;

export default function IndexView() {
  const { habits } = useLoaderData() as { habits: Habit[] };
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [checkedHabitIds, setCheckedHabitIds] = useAtom(checkedHabitIdsAtom);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);
  const [dayStartsAt] = useAtom(userDayStartsAtAtom);

  function sortHabitsCB(a: Habit, b: Habit) {
    // If progress is not 100, go first
    const progressA = getProgress(a, false, userWeekStartsAtMonday);
    const progressB = getProgress(b, false, userWeekStartsAtMonday);
    if (progressA < 100 && progressB === 100) return -1;
    if (progressA === 100 && progressB < 100) return 1;

    // If no frequency, go by name
    if (!a.frequency || !b.frequency || !a.frequencyUnit || !b.frequencyUnit) {
      return a.name.localeCompare(b.name);
    }

    // Hierarchical sorting. Day -> Week -> Month
    const frequencyUnitMap: Record<FrequencyUnit, number> = {
      day: 1,
      week: 2,
      month: 3,
    };

    // Go by frequency unit
    if (frequencyUnitMap[a.frequencyUnit] < frequencyUnitMap[b.frequencyUnit]) return -1;
    if (frequencyUnitMap[a.frequencyUnit] > frequencyUnitMap[b.frequencyUnit]) return 1;

    // If same frequency unit, go by frequency
    if (b.frequency < a.frequency) return -1;
    if (b.frequency > a.frequency) return 1;

    // If same frequency and unit, go by name
    return a.name.localeCompare(b.name);
  }

  const sortedHabits = habits ? habits.sort(sortHabitsCB) : [];

  let greeting = "Good ";
  if (dayjs().hour() < 10) greeting += "morning! 🌅";
  else if (dayjs().hour() < 19) greeting += "day! ☀️";
  else greeting += "evening! 🌙";

  const firstCompletedHabitId = sortedHabits.find((habit) => {
    const progress = getProgress(habit, false, userWeekStartsAtMonday);
    return progress === 100;
  })?.id;

  const allHabitsCompleted = sortedHabits.every((habit) => {
    const progress = getProgress(habit, false, userWeekStartsAtMonday);
    return progress === 100;
  });

  return (
    <Card sx={{ overflow: "visible", mb: 4 }}>
      <CardContent>
        <Typography variant="h4" color="primary.main" align="center">
          {greeting}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" align="center">
          Have you kept up with your habits lately?
        </Typography>
      </CardContent>
      <Divider />
      <CardContent sx={{ position: "relative" }}>
        {habits ? (
          <Form method="post">
            {allHabitsCompleted && (
              <Typography variant="subtitle2" color="primary.main" align="center" sx={{ my: 1 }}>
                Well done! You completed all habits for now 🎉
              </Typography>
            )}
            <List
              disablePadding
              sx={{
                maxHeight: "calc(100vh - 16.5rem)", // IMPORTANT for height
                overflow: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#ccc transparent",
              }}
            >
              {sortedHabits.map((habit) => {
                const isChecked = checkedHabitIds.includes(habit.id);
                const progress = getProgress(habit, isChecked, userWeekStartsAtMonday);
                const registeredProgress = getProgress(habit, false, userWeekStartsAtMonday);
                const progressBuffer = getProgressBuffer(habit, dayStartsAt, userWeekStartsAtMonday);
                const isFirstCompletedHabit = habit.id === firstCompletedHabitId;
                return (
                  <Box key={habit.id} sx={{ mb: 1 }}>
                    {isFirstCompletedHabit && (
                      <Divider sx={{ my: 1 }}>
                        <Chip label="Completed" size="small" icon={<Checklist />} />
                      </Divider>
                    )}
                    <Paper
                      elevation={0}
                      sx={
                        registeredProgress === 100
                          ? {
                              "div:not(.MuiSvgIcon-root) div": {
                                filter: "grayscale(100%)",
                              },
                              width: "inherit",
                              bgcolor: "transparent",
                            }
                          : {
                              width: "inherit",
                              bgcolor: "transparent",
                            }
                      }
                    >
                      <ListItem
                        disablePadding
                        secondaryAction={
                          <>
                            {isChecked && <input type="hidden" name="habitIds" value={habit.id} />}
                            <Checkbox
                              checked={isChecked}
                              onClick={() =>
                                setCheckedHabitIds((prev) =>
                                  isChecked ? prev.filter((id) => id !== habit.id) : [...prev, habit.id]
                                )
                              }
                              sx={{ "& .MuiSvgIcon-root": { fontSize: 32 } }}
                            />
                          </>
                        }
                        sx={{ borderRadius: "inherit", ".MuiListItemButton-root": { borderRadius: "inherit" } }}
                      >
                        <ListItemButton
                          sx={{ py: 0.25, px: 1, display: "flex", flexDirection: "column", alignItems: "start" }}
                          onClick={() => navigate(`/${habit.id}`)}
                        >
                          <Box sx={{ display: "flex", alignItems: "center" }}>
                            <ListItemAvatar sx={{ color: habit.color }}>
                              <Badge
                                invisible={progress !== 100}
                                badgeContent={"Done!"}
                                color="success"
                                anchorOrigin={{ vertical: "top", horizontal: "right" }}
                              >
                                <Avatar
                                  sx={{
                                    bgcolor: habit.color || "text.primary",
                                  }}
                                >
                                  {iconMap[habit.icon]}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Box
                                  sx={{
                                    display: "flex",
                                    alignItems: "center",
                                    pr: 2,
                                    color: habit.color,
                                  }}
                                >
                                  <Typography lineHeight={1.25}>{habit.name}</Typography>
                                  <HabitNotificationIndicator sx={{ ml: 1 }} habit={habit} />
                                </Box>
                              }
                              secondary={toFriendlyFrequency(habit)}
                            />
                          </Box>
                          <Box sx={{ width: "100%", pr: 1 }}>
                            {habit.frequency && habit.frequencyUnit && (
                              <LinearProgressWithLabel
                                variant="buffer"
                                valueBuffer={progressBuffer}
                                value={progress}
                                sx={{
                                  ".MuiLinearProgress-bar1Buffer": {
                                    backgroundColor: habit.color,
                                  },
                                  ".MuiLinearProgress-bar2Buffer": {
                                    backgroundColor: habit.color,
                                    opacity: 0.3,
                                  },
                                  ".MuiLinearProgress-dashed": {
                                    display: "none",
                                  },
                                }}
                              />
                            )}
                          </Box>
                        </ListItemButton>
                      </ListItem>
                    </Paper>
                  </Box>
                );
              })}
            </List>
            <Box
              sx={{
                position: "absolute",
                width: "100%",
                display: "flex",
                justifyContent: "center",
                bottom: "-2rem",
              }}
            >
              <Grow in={checkedHabitIds.length > 0}>
                <Fab
                  variant="extended"
                  color="primary"
                  type="submit"
                  disabled={!checkedHabitIds.length || navigation.state === "submitting"}
                >
                  <Check sx={{ mr: 1 }} />
                  Register
                  <AvatarGroup
                    sx={{
                      ml: 1,
                      ".MuiAvatar-root": {
                        width: 24,
                        height: 24,
                        fontSize: "0.75rem",
                      },
                      ".MuiSvgIcon-root": {
                        fontSize: "1rem",
                      },
                    }}
                    max={5}
                  >
                    {checkedHabitIds.map((id) => {
                      const habit = habits.find((h) => h.id === id)!;
                      return (
                        <Grow in key={id} style={{ transformOrigin: "left center 0" }} timeout={500}>
                          <Avatar key={id} sx={{ bgcolor: habit.color }}>
                            {iconMap[habit.icon]}
                          </Avatar>
                        </Grow>
                      );
                    })}
                  </AvatarGroup>
                </Fab>
              </Grow>
            </Box>
          </Form>
        ) : (
          <Typography variant="body2" align="center" color="text.secondary">
            No habits found.
          </Typography>
        )}
      </CardContent>
    </Card>
  );
}
