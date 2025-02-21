import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  Checkbox,
  Box,
  Fab,
  Grow,
  Divider,
  Badge,
  AvatarGroup,
  Card,
  CardContent,
  Chip,
  Paper,
} from "@mui/material";
import { Form, redirect, useLoaderData, useNavigation, useNavigate } from "react-router-dom";
import { Habit, fetchAllHabits, registerHabitsToday } from "../../habitsModel";
import { IconMap } from "../../utils/IconMap";
import { toFriendlyFrequency, getProgress, getProgressBuffer, showSnackBar } from "../../utils/helpers.tsx";
import { useAtom } from "jotai";
import { checkedHabitIdsAtom, store, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import dayjs from "dayjs";
import LinearProgressWithLabel from "../../components/LinearProgressWithLabel.tsx";
import { Check, Checklist } from "@mui/icons-material";

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
  await registerHabitsToday(habitIds);

  // Clear checked habits
  store.set(checkedHabitIdsAtom, []);

  // Show confirmation snackbar
  showSnackBar("Habit(s) registered successfully!", "success");

  return redirect("/");
}

IndexPage.loader = loader;
IndexPage.action = action;

export default function IndexPage() {
  const { habits } = useLoaderData() as { habits: Record<string, Habit> };
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [checkedHabitIds, setCheckedHabitIds] = useAtom(checkedHabitIdsAtom);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);

  const [dayStartsAt] = useAtom(userDayStartsAtAtom);

  function sortHabitsRecordCB(a: [string, Habit], b: [string, Habit]) {
    // If progress is not 100, go first
    const progressA = getProgress(a[1], false, userWeekStartsAtMonday);
    const progressB = getProgress(b[1], false, userWeekStartsAtMonday);
    if (progressA < 100 && progressB === 100) return -1;
    if (progressA === 100 && progressB < 100) return 1;

    // If no frequency, go by name
    if (!a[1].frequency || !b[1].frequency || !a[1].frequencyUnit || !b[1].frequencyUnit) {
      return a[1].name.localeCompare(b[1].name);
    }

    function getFrequencyUnitValue(frequencyUnit: string) {
      switch (frequencyUnit) {
        case "day":
          return 1;
        case "week":
          return 2;
        case "month":
          return 3;
        case "year":
          return 4;
        default:
          return 0;
      }
    }

    // Go by frequency unit
    if (getFrequencyUnitValue(a[1].frequencyUnit) < getFrequencyUnitValue(b[1].frequencyUnit)) return -1;
    if (getFrequencyUnitValue(a[1].frequencyUnit) > getFrequencyUnitValue(b[1].frequencyUnit)) return 1;

    // If same frequency unit, go by frequency
    if (b[1].frequency < a[1].frequency) return -1;
    if (b[1].frequency > a[1].frequency) return 1;

    // If same frequency and unit, go by name
    return a[1].name.localeCompare(b[1].name);
  }

  const sortedHabits = habits ? Object.entries(habits).sort(sortHabitsRecordCB) : [];

  let greeting = "Good ";
  if (dayjs().hour() < 10) greeting += "morning! 🌅";
  else if (dayjs().hour() < 19) greeting += "day! ☀️";
  else greeting += "evening! 🌙";

  const firstCompletedHabitKey = sortedHabits.find(([, habit]) => {
    const progress = getProgress(habit, false, userWeekStartsAtMonday);
    return progress === 100;
  })?.[0];

  const allHabitsCompleted = sortedHabits.every(([, habit]) => {
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
            {allHabitsCompleted ? (
              <Typography variant="subtitle2" color="primary.main" align="center" sx={{ my: 1 }}>
                Well done! You completed all habits for now 🎉
              </Typography>
            ) : (
              <Typography variant="subtitle2" color="text.secondary">
                Register your habits below:
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
              {sortedHabits.map(([key, habit]) => {
                const isChecked = checkedHabitIds.includes(key);
                const progress = getProgress(habit, isChecked, userWeekStartsAtMonday);
                const registeredProgress = getProgress(habit, false, userWeekStartsAtMonday);
                const progressBuffer = getProgressBuffer(habit, dayStartsAt, userWeekStartsAtMonday);
                const isFirstCompletedHabit = key === firstCompletedHabitKey;
                return (
                  <Box key={key} sx={{ mb: 1 }}>
                    {isFirstCompletedHabit && (
                      <Divider sx={{ my: 1 }}>
                        <Chip label="Completed Habits" size="small" icon={<Checklist />} />
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
                            {isChecked && <input type="hidden" name="habitIds" value={key} />}
                            <Checkbox
                              checked={isChecked}
                              onClick={() =>
                                setCheckedHabitIds((prev) =>
                                  isChecked ? prev.filter((id) => id !== key) : [...prev, key]
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
                          onClick={() => navigate(`/${key}`)}
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
                                  {IconMap[habit.icon || "default"]}
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={<Typography sx={{ color: habit.color }}>{habit.name}</Typography>}
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
                    {checkedHabitIds.map((key) => {
                      const habit = habits[key];
                      return (
                        <Grow in key={key} style={{ transformOrigin: "left center 0" }} timeout={500}>
                          <Avatar key={key} sx={{ bgcolor: habit.color }}>
                            {IconMap[habit.icon || "default"]}
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
