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
  Button,
} from "@mui/material";
import Cover from "../../components/Cover";
import { Form, redirect, useLoaderData, useNavigation, Link as RouterLink } from "react-router-dom";
import { Habit, fetchHabits, registerHabitsNow } from "../../habitsModel";
import { Check, DoneAll } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";
import { toFriendlyFrequency, getProgress, getProgressBuffer } from "../../utils/helpers.tsx";
import { useEffect, useState } from "react";
import { getDefaultStore } from "jotai";
import { snackbarMessageAtom, snackbarSeverityAtom } from "../../main.tsx";

async function loader() {
  return {
    habits: await fetchHabits(),
  };
}

async function action({ request }: { request: Request }) {
  // Get IDs from formData and register
  const formData = await request.formData();
  const habitIds = formData.getAll("habitIds") as string[];
  await registerHabitsNow(habitIds);

  // Show confirmation snackbar
  const store = getDefaultStore();
  store.set(snackbarMessageAtom, "Habit(s) registered successfully!");
  store.set(snackbarSeverityAtom, "success");

  return redirect("/");
}

IndexLayout.loader = loader;
IndexLayout.action = action;

export default function IndexLayout() {
  const { habits } = useLoaderData() as { habits: Record<string, Habit> };
  const navigation = useNavigation();
  const [checked, setChecked] = useState<string[]>([]);

  useEffect(() => setChecked([]), [habits]);

  let greeting = "Good ";
  if (new Date().getHours() < 10) greeting += "morning! ☀️";
  else if (new Date().getHours() < 19) greeting += "day! 👋";
  else greeting += "evening! 🌃";

  return (
    <Cover sx={{ p: 1, minWidth: 300 }}>
      <Box component={Form} method="post" sx={{ position: "relative" }}>
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
                const isChecked = checked.includes(key);
                return (
                  <Box key={key}>
                    <ListItem disablePadding>
                      <ListItemButton
                        sx={{ p: 1 }}
                        onClick={() =>
                          setChecked((prev) => (isChecked ? prev.filter((id) => id !== key) : [...prev, key]))
                        }
                      >
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
                        {isChecked && <input type="hidden" name="habitIds" value={key} />}
                        {<Checkbox checked={isChecked} />}
                      </ListItemButton>
                    </ListItem>
                    <LinearProgress
                      variant="buffer"
                      valueBuffer={getProgressBuffer(habit)}
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
                bottom: "-4rem",
              }}
            >
              {navigation.state === "submitting" ? (
                <Fab variant="extended" color="primary" type="submit" disabled>
                  {checked.length === 1 ? <Check sx={{ mr: 1 }} /> : <DoneAll sx={{ mr: 1 }} />}
                  Registering...
                </Fab>
              ) : (
                <Grow in={checked.length > 0}>
                  <Fab variant="extended" color="primary" type="submit" disabled={!checked.length}>
                    {checked.length === 1 ? <Check sx={{ mr: 1 }} /> : <DoneAll sx={{ mr: 1 }} />}
                    Register
                  </Fab>
                </Grow>
              )}
            </Box>
          </>
        ) : (
          <>
            <Typography variant="body2" align="center" color="text.secondary">
              No habits found.
              <br />
              <Button component={RouterLink} to="/my-habits">
                Go create one!
              </Button>
            </Typography>
          </>
        )}
      </Box>
    </Cover>
  );
}
