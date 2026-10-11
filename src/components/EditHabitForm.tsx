import { ChevronLeft, Notifications } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  FormControl,
  Grid2,
  InputLabel,
  MenuItem,
  Select,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { useAtom } from "jotai";
import { useState } from "react";
import { Form, LoaderFunctionArgs, useLoaderData, useNavigate, useNavigation, useParams } from "react-router-dom";
import { frequencyUnits } from "../constants/frequencyUnits";
import { iconMap } from "../constants/iconMap";
import { fetchHabitById } from "../services/habitsPersistance";
import { notificationPermissionAtom } from "../store";
import { Habit } from "../types/Habit";
import { toFriendlyString } from "../utils/helpers";
import { ambientPageSx, contentLayerSx, glassPanelSx, mobileTimePickerDialogSx } from "../styles/designLanguage";
import { isLocalMode } from "../data/mode";
import DeleteHabitWithConfirm from "./DeleteHabitWithConfirm";

dayjs.extend(utc);

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  const habit = await fetchHabitById(id);
  if (!habit) throw new Response("Habit not found", { status: 404, statusText: "Habit not found" });
  return { habit };
}

EditHabitForm.loader = loader;

export default function EditHabitForm() {
  const [notificationPermission] = useAtom(notificationPermissionAtom);
  const { habit } = useLoaderData() as { habit: Habit };
  const [notificationTime, setNotificationTime] = useState(habit.notificationTime);
  const [notificationsEnabled, setNotificationsEnabled] = useState(habit.notificationEnabled);
  const { id } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const colorChoices = [
    "SlateGray",
    "SteelBlue",
    "SkyBlue",
    "SlateBlue",
    "MediumSeaGreen",
    "LightGreen",
    "ForestGreen",
    "Tomato",
    "Salmon",
    "Orange",
    "PaleVioletRed",
    "SandyBrown",
  ] as const;

  const handleBack = () => {
    navigate(`/${id}`);
  };

  return (
    <Box sx={{ ...ambientPageSx, minHeight: ["100vh", "100dvh"] }}>
      <Form autoComplete="off" method="post">
        <Box sx={{ ...contentLayerSx, px: 2, pt: 2, pb: 3, maxWidth: 600, mx: "auto" }}>
          <Button startIcon={<ChevronLeft />} onClick={handleBack} sx={{ ml: -1, mb: 1, minHeight: 44 }}>
            Back to habit
          </Button>
          <Typography component="h1" variant="h4" sx={{ fontSize: "2rem", mb: 0.5 }}>Edit habit</Typography>
          <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{habit.name}</Typography>
        </Box>

        <Box sx={{ ...contentLayerSx, px: 2, maxWidth: 600, mx: "auto", pb: 3 }}>
          <Box component="section" aria-labelledby="habit-details-heading" sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
            <Typography id="habit-details-heading" component="h2" variant="h6" sx={{ mb: 2.5 }}>Your habit</Typography>
            <Box sx={{ display: "grid", gap: 2.5 }}>
              <TextField required name="name" label="Habit name" defaultValue={habit.name} fullWidth />
              <TextField name="description" label="Description" defaultValue={habit.description || ""} multiline minRows={2} fullWidth />
              <Box sx={{ display: "grid", gridTemplateColumns: "96px minmax(0, 1fr)", gap: 1.5 }}>
                <FormControl required fullWidth>
                  <InputLabel id="habit-icon-label">Icon</InputLabel>
                  <Select
                    labelId="habit-icon-label" name="icon" label="Icon" defaultValue={habit.icon}
                    renderValue={(icon) => <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center" }}>{iconMap[icon]}</Box>}
                    MenuProps={{
                      PaperProps: { sx: { maxHeight: "min(400px, 65dvh)", width: 280, maxWidth: "calc(100vw - 32px)" } },
                      MenuListProps: { sx: { display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 0.5, p: 1 } },
                    }}
                  >
                    {Object.keys(iconMap).map((icon) => (
                      <MenuItem key={icon} value={icon} aria-label={toFriendlyString(icon)} sx={{ minHeight: 52, display: "flex", justifyContent: "center", borderRadius: "var(--hg-control-radius)", m: 0 }}>
                        {iconMap[icon]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl fullWidth>
                  <InputLabel id="habit-color-label">Color</InputLabel>
                  <Select labelId="habit-color-label" name="color" label="Color" defaultValue={habit.color || ""}
                    renderValue={(value) => (
                      <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
                        <Box aria-hidden="true" sx={{ width: 18, height: 18, borderRadius: "50%", bgcolor: value || "transparent", border: "1px solid", borderColor: "divider", flexShrink: 0 }} />
                        <Typography noWrap>{value ? toFriendlyString(value) : "None"}</Typography>
                      </Box>
                    )}
                    MenuProps={{ PaperProps: { sx: { maxHeight: "min(400px, 65dvh)" } } }}
                  >
                    <MenuItem value="" sx={{ minHeight: 48 }}>None</MenuItem>
                    {colorChoices.map((color) => (
                      <MenuItem key={color} value={color} sx={{ minHeight: 48, gap: 1.5 }}>
                        <Box aria-hidden="true" sx={{ width: 20, height: 20, borderRadius: "50%", bgcolor: color, flexShrink: 0 }} />
                        {toFriendlyString(color)}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            </Box>
          </Box>

          <Box component="section" aria-labelledby="habit-goal-heading" sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
            <Typography id="habit-goal-heading" component="h2" variant="h6" sx={{ mb: 2.5 }}>Your goal</Typography>
            <Box sx={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) minmax(0, 1fr)", gap: 1.5 }}>
              <TextField name="frequency" label="Times" placeholder="3" type="number" defaultValue={habit.frequency || ""} fullWidth />
              <FormControl fullWidth>
                <InputLabel id="frequencyUnit">Per</InputLabel>
                <Select name="frequencyUnit" label="Per" labelId="frequencyUnit" defaultValue={habit.frequencyUnit || ""} fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {frequencyUnits.map((unit) => <MenuItem key={unit} value={unit}>{toFriendlyString(unit)}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box component="section" aria-labelledby="habit-reminders-heading" sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
            <Typography id="habit-reminders-heading" component="h2" variant="h6" sx={{ mb: 2 }}>Reminders</Typography>
            <Grid2 container spacing={2.5}>
              <NotificationsPermissionAlert />
              <Grid2 size={12}>
                <Box sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2 }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Daily reminder</Typography>
                    <Typography variant="body2" color="text.secondary">A nudge when your habit is still waiting.</Typography>
                  </Box>
                  <Switch inputProps={{ "aria-label": "Daily notifications" }} disabled={notificationPermission !== "granted"} name="notificationEnabled" defaultChecked={habit.notificationEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
                </Box>
              </Grid2>
              <Grid2 size={12}>
                <TimePicker
                  desktopModeMediaQuery="@media (min-width: 600px) and (pointer: fine)"
                  value={notificationTime ? (() => {
                    const [hours, minutes] = notificationTime.split(":");
                    return dayjs.utc().set("hour", parseInt(hours)).set("minute", parseInt(minutes)).local();
                  })() : null}
                  onChange={(newTime: dayjs.Dayjs | null) => {
                    if (newTime) setNotificationTime(newTime.utc().format("HH:mm"));
                    else setNotificationTime(undefined);
                  }}
                  ampm={false} label="Reminder time" disabled={notificationPermission !== "granted" || !notificationsEnabled}
                  slotProps={{ textField: { fullWidth: true }, dialog: { sx: mobileTimePickerDialogSx } }}
                />
                <input type="hidden" name="notificationTime" value={notificationTime || ""} />
              </Grid2>
              {notificationsEnabled && notificationTime && (
                <Grid2 size={12}><NotificationPreview habit={habit} /></Grid2>
              )}
              {notificationsEnabled && notificationTime && (
                <Grid2 size={12}>
                  <Button variant="outlined" startIcon={<Notifications />} fullWidth onClick={() => sendTestNotification(habit)} sx={{ minHeight: 48 }}>Send test notification</Button>
                </Grid2>
              )}
            </Grid2>
          </Box>
          <Box sx={{ pt: 0.5, "& .MuiButton-root": { minHeight: 44, borderRadius: "var(--hg-control-radius)" } }}>
            <DeleteHabitWithConfirm habit={habit} id={id!} />
          </Box>
        </Box>

        <Box sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1100, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", px: 2, pt: 1.5, pb: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
          <Box sx={{ display: "flex", gap: 1.5, maxWidth: 568, mx: "auto" }}>
            <Button variant="outlined" onClick={handleBack} sx={{ minHeight: 48, minWidth: 100 }}>Cancel</Button>
            <Button loading={navigation.state === "submitting"} variant="contained" type="submit" sx={{ minHeight: 48, flex: 1 }}>Save changes</Button>
          </Box>
        </Box>
      </Form>
    </Box>
  );
}

function NotificationPreview({ habit }: { habit: Habit }) {
  const getFrequencyUnitFriendly = (unit?: string) => {
    switch (unit) {
      case "day":
        return "today";
      case "week":
        return "this week";
      case "month":
        return "this month";
      default:
        return "";
    }
  };

  // Calculate a sample progress percentage (use current progress or 50% as example)
  const sampleProgress = habit.frequency && habit.frequencyUnit ? "50" : "0";

  return (
    <Box sx={{ ...glassPanelSx, borderRadius: 2.5, p: 2 }}>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
        Notification Preview
      </Typography>
      <Box
        sx={{
          bgcolor: (theme) => alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.66 : 0.9),
          borderRadius: 1.5,
          p: 2,
          border: "1px solid",
          borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.1),
          boxShadow: "0 8px 16px rgba(0,0,0,0.16)",
          display: "flex",
          gap: 2,
          alignItems: "start",
        }}
      >
        {/* Notification Icon */}
        <Box
          sx={{
            width: 48,
            height: 48,
            borderRadius: 1,
            bgcolor: habit.color || "primary.main",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            flexShrink: 0,
            fontSize: "1.5rem",
          }}
        >
          {iconMap[habit.icon]}
        </Box>

        {/* Notification Content */}
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, color: "text.primary" }}>
            {habit.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 1 }}>
            {sampleProgress}% complete{habit.frequencyUnit ? ` ${getFrequencyUnitFriendly(habit.frequencyUnit)}` : ""}
          </Typography>
          <Button
            size="small"
            variant="text"
            sx={{
              textTransform: "none",
              fontSize: "0.75rem",
              minWidth: "auto",
              px: 1,
              py: 0.5,
              color: "primary.main",
            }}
          >
            Register now
          </Button>
        </Box>

        {/* Time badge */}
        <Typography variant="caption" color="text.disabled" sx={{ fontSize: "0.7rem" }}>
          now
        </Typography>
      </Box>
    </Box>
  );
}

async function sendTestNotification(habit: Habit) {
  if (isLocalMode) return;
  if (!("Notification" in window)) {
    alert("This browser does not support notifications");
    return;
  }

  if (Notification.permission !== "granted") {
    alert("Please grant notification permissions first");
    return;
  }

  const getFrequencyUnitFriendly = (unit?: string) => {
    switch (unit) {
      case "day":
        return "today";
      case "week":
        return "this week";
      case "month":
        return "this month";
      default:
        return "";
    }
  };

  const sampleProgress = "50";
  const body = `${sampleProgress}% complete${habit.frequencyUnit ? ` ${getFrequencyUnitFriendly(habit.frequencyUnit)}` : ""}`;

  try {
    const notification = new Notification(habit.name, {
      body,
      icon: `/${habit.icon}.svg`,
      badge: "/pwa-192x192.png",
      tag: habit.id,
    });

    // Auto-close after 5 seconds
    setTimeout(() => notification.close(), 5000);
  } catch (error) {
    console.error("Failed to send test notification:", error);
    alert("Failed to send test notification. Please check browser permissions.");
  }
}

function NotificationsPermissionAlert() {
  const [permission, setPermission] = useAtom(notificationPermissionAtom);

  if (isLocalMode) {
    return <Grid2 size={12}><Alert severity="info">Push notifications are disabled in local mode.</Alert></Grid2>;
  }

  if (permission === "granted") {
    return null;
  }

  if (permission === "denied") {
    return (
      <Grid2 size={12}>
        <Alert severity="warning">
          Notifications are blocked. Please enable them in your browser settings to receive notifications.
        </Alert>
      </Grid2>
    );
  }

  return (
    <Grid2 size={12}>
      <Alert
        severity="info"
        action={
          <Button
            color="primary"
            onClick={async () => {
              const result = await Notification.requestPermission();
              setPermission(result);
            }}
          >
            Enable
          </Button>
        }
      >
        Enable notifications to get reminders about your habits.
      </Alert>
    </Grid2>
  );
}
