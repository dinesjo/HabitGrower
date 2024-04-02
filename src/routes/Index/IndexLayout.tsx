import {
  Avatar,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
  Button,
  Checkbox,
  Tooltip,
  LinearProgress,
} from "@mui/material";
import Cover from "../../components/Cover";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { Habit, fetchHabits, registerHabitsToday } from "../../habitsModel";
import { Check, CheckBox, CheckBoxOutlineBlank } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";
import { toFriendlyFrequency, getProgress, getProgressBuffer } from "../../utils/helpers.tsx";
import { useEffect, useState } from "react";

async function loader() {
  return {
    habits: await fetchHabits(),
  };
}

async function action({ request }: { request: Request }) {
  const formData = await request.formData();
  const habitIds = formData.getAll("habitIds") as string[];
  await registerHabitsToday(habitIds);
  return redirect("/");
}

IndexLayout.loader = loader;
IndexLayout.action = action;

export default function IndexLayout() {
  const { habits } = useLoaderData() as { habits: Record<string, Habit> };
  const navigation = useNavigation();
  const [checked, setChecked] = useState<string[]>([]);
  const permanentChecked = Object.keys(habits)
    .map((key) => {
      const habit = habits[key];
      if (!habit.dates) return "";
      const habitDoneToday = Object.keys(habit.dates).includes(new Date().toISOString().slice(0, 10));
      return habitDoneToday ? key : "";
    })
    .filter((id) => id !== "");

  useEffect(() => setChecked([]), [habits]);

  return (
    <Cover>
      <Typography variant="h4" color="primary" align="center">
        Good {new Date().getHours() < 10 ? "morning" : new Date().getHours() < 20 ? "day" : "evening"}!
      </Typography>
      <Typography variant="subtitle1" color="primary">
        Have you kept up with your habits lately?
      </Typography>
      <Typography variant="subtitle2" color="text.secondary">
        Register today's habits below:
      </Typography>
      <List
        component={Form}
        method="post"
        sx={{
          minWidth: 260,
          maxHeight: "calc(100vh - 200px)",
          overflow: "auto",
        }}
      >
        {Object.keys(habits).map((key) => {
          const habit = habits[key];
          const isChecked = checked.includes(key);
          return (
            <Tooltip key={key} title={permanentChecked.includes(key) ? "Already done today!" : ""} placement="right">
              <>
                <ListItem disablePadding key={key}>
                  <ListItemButton
                    sx={{ p: 1 }}
                    onClick={() => setChecked((prev) => (isChecked ? prev.filter((id) => id !== key) : [...prev, key]))}
                    disabled={permanentChecked.includes(key)}
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
                    {
                      <Checkbox
                        icon={<CheckBoxOutlineBlank />}
                        checkedIcon={<CheckBox />}
                        checked={permanentChecked.includes(key) || isChecked}
                        disabled={permanentChecked.includes(key)}
                      />
                    }
                  </ListItemButton>
                </ListItem>
                <LinearProgress variant="buffer" valueBuffer={getProgressBuffer(habit)} value={getProgress(habit)} />
              </>
            </Tooltip>
          );
        })}
        {navigation.state === "submitting" ? (
          <Button variant="contained" color="primary" startIcon={<Check />} disabled sx={{ mt: 2 }} type="submit">
            Registering...
          </Button>
        ) : (
          <Button
            variant="contained"
            color="primary"
            startIcon={<Check />}
            disabled={!checked.length}
            sx={{ mt: 2 }}
            type="submit"
          >
            Register
          </Button>
        )}
      </List>
    </Cover>
  );
}
