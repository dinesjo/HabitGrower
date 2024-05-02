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
  Container,
  Badge,
  AvatarGroup,
} from "@mui/material";
import { Form, redirect, useLoaderData, useNavigation, useNavigate } from "react-router-dom";
import { Habit, fetchAllHabits, registerHabitsToday } from "../../habitsModel";
import { IconMap } from "../../utils/IconMap";
import { toFriendlyFrequency, getProgress, getProgressBuffer, showSnackBar } from "../../utils/helpers.tsx";
import { useAtom } from "jotai";
import { checkedHabitIdsAtom, store, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import dayjs from "dayjs";
import LinearProgressWithLabel from "../../components/LinearProgressWithLabel.tsx";

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

  let greeting = "Good ";
  if (dayjs().hour() < 10) greeting += "morning! ☀️";
  else if (dayjs().hour() < 19) greeting += "day! 👋";
  else greeting += "evening! 🌃";

  return (
    <Container component={Form} method="post" sx={{ position: "relative", p: 1, mb: "auto" }}>
      <Typography variant="h4" align="center" color="primary.main">
        {greeting}
      </Typography>
      <Typography variant="subtitle1">Have you kept up with your habits lately?</Typography>
      <Divider sx={{ my: 1 }} />
      {habits ? (
        <>
          <Typography variant="subtitle2" color="text.secondary">
            Register your habits below:
          </Typography>
          <List
            sx={{
              maxHeight: "calc(100vh - 300px)",
              overflow: "auto",
              scrollbarWidth: "thin",
              scrollbarColor: "#ccc transparent",
            }}
          >
            {Object.keys(habits).map((key) => {
              const habit = habits[key];
              const isChecked = checkedHabitIds.includes(key);
              const progress = getProgress(habit, isChecked, userWeekStartsAtMonday);
              const registeredProgress = getProgress(habit, false, userWeekStartsAtMonday);
              const progressBuffer = getProgressBuffer(habit, dayStartsAt, userWeekStartsAtMonday);

              return (
                <Box
                  key={key}
                  sx={
                    registeredProgress === 100
                      ? {
                          "div:not(.MuiSvgIcon-root) div": {
                            filter: "grayscale(100%)",
                          },
                          width: "inherit",
                        }
                      : {
                          width: "inherit",
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
                            setCheckedHabitIds((prev) => (isChecked ? prev.filter((id) => id !== key) : [...prev, key]))
                          }
                          sx={{ "& .MuiSvgIcon-root": { fontSize: 28 } }}
                        />
                      </>
                    }
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
        </>
      ) : (
        <Typography variant="body2" align="center" color="text.secondary">
          No habits found.
        </Typography>
      )}
    </Container>
  );
}
