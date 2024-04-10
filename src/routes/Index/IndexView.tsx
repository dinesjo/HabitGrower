import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  Checkbox,
  LinearProgress,
  Box,
  Fab,
  Grow,
  Divider,
  Container,
} from "@mui/material";
import { Form, redirect, useLoaderData, useNavigation, useNavigate } from "react-router-dom";
import { Habit, fetchAllHabits, registerHabitsToday } from "../../habitsModel";
import { Check, DoneAll } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";
import { toFriendlyFrequency, getProgress, getProgressBuffer } from "../../utils/helpers.tsx";
import { useAtom } from "jotai";
import {
  checkedHabitIdsAtom,
  snackbarMessageAtom,
  snackbarSeverityAtom,
  store,
  userDayStartsAtAtom,
} from "../../store";
import dayjs from "dayjs";

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
  store.set(snackbarMessageAtom, "Habit(s) registered successfully!");
  store.set(snackbarSeverityAtom, "success");

  return redirect("/");
}

IndexPage.loader = loader;
IndexPage.action = action;

export default function IndexPage() {
  const { habits } = useLoaderData() as { habits: Record<string, Habit> };
  const navigation = useNavigation();
  const navigate = useNavigate();
  const [checkedHabitIds, setCheckedHabitIds] = useAtom(checkedHabitIdsAtom);

  const [dayStartsAt] = useAtom(userDayStartsAtAtom);

  let greeting = "Good ";
  if (dayjs().hour() < 10) greeting += "morning! ☀️";
  else if (dayjs().hour() < 19) greeting += "day! 👋";
  else greeting += "evening! 🌃";

  return (
    <Container component={Form} method="post" sx={{ position: "relative", p: 1 }}>
      <Typography variant="h4" align="center">
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
              maxHeight: "calc(100vh - 200px)",
              overflow: "auto",
            }}
          >
            {Object.keys(habits).map((key) => {
              const habit = habits[key];
              const isChecked = checkedHabitIds.includes(key);
              return (
                <Box key={key}>
                  <ListItem disablePadding>
                    <ListItemButton sx={{ p: 1 }} onClick={() => navigate(`/${key}`)}>
                      <ListItemAvatar sx={{ color: habit.color }}>
                        <Avatar
                          sx={{
                            bgcolor: habit.color || "text.primary",
                          }}
                        >
                          {IconMap[habit.icon || "default"]}
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={<Typography sx={{ color: habit.color }}>{habit.name}</Typography>}
                        secondary={toFriendlyFrequency(habit)}
                      />
                    </ListItemButton>
                    {isChecked && <input type="hidden" name="habitIds" value={key} />}
                    <Checkbox
                      checked={isChecked}
                      onClick={() =>
                        setCheckedHabitIds((prev) => (isChecked ? prev.filter((id) => id !== key) : [...prev, key]))
                      }
                    />
                  </ListItem>
                  <LinearProgress
                    variant="buffer"
                    valueBuffer={getProgressBuffer(habit, dayStartsAt)}
                    value={getProgress(habit, isChecked)}
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
            {navigation.state === "submitting" ? (
              <Fab variant="extended" color="primary" type="submit" disabled>
                {checkedHabitIds.length === 1 ? <Check sx={{ mr: 1 }} /> : <DoneAll sx={{ mr: 1 }} />}
                Registering...
              </Fab>
            ) : (
              <Grow in={checkedHabitIds.length > 0}>
                <Fab variant="extended" color="primary" type="submit" disabled={!checkedHabitIds.length}>
                  {checkedHabitIds.length === 1 ? <Check sx={{ mr: 1 }} /> : <DoneAll sx={{ mr: 1 }} />}
                  Register
                </Fab>
              </Grow>
            )}
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
