import { ChevronLeft, Notifications } from "@mui/icons-material";
import {
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
import { alphaOrFallback } from "../utils/color";
import DeleteHabitWithConfirm from "./DeleteHabitWithConfirm";
import { useActionSurfaceRef } from "../hooks/useActionSurfaceRef";

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
  const [draftAppearance, setDraftAppearance] = useState<Pick<Habit, "name" | "icon" | "color" | "frequency" | "frequencyUnit">>(() => ({
    name: habit.name,
    icon: habit.icon,
    color: habit.color,
    frequency: habit.frequency,
    frequencyUnit: habit.frequencyUnit,
  }));
  const previewHabit = { ...habit, ...draftAppearance, name: draftAppearance.name || "Your habit" };
  const { id } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const isSaving = navigation.state === "submitting";
  const editorRef = useActionSurfaceRef("editor");
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
      <Form autoComplete="off" method="post" aria-busy={isSaving}>
        <Box sx={{ ...contentLayerSx, px: 2, pt: 2, pb: 3, maxWidth: 600, mx: "auto" }}>
          <Button startIcon={<ChevronLeft />} disabled={isSaving} onClick={handleBack} sx={{ ml: -1, mb: 1, minHeight: 44 }}>
            Back to habit
          </Button>
          <Typography component="h1" variant="h4" sx={{ fontSize: "2rem", mb: 0.5 }}>Edit habit</Typography>
          <Typography color="text.secondary" sx={{ overflowWrap: "anywhere" }}>{habit.name}</Typography>
        </Box>

        <Box sx={{ ...contentLayerSx, px: 2, maxWidth: 600, mx: "auto", pb: 3 }}>
          <Box component="section" aria-labelledby="habit-details-heading" sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
            <Typography id="habit-details-heading" component="h2" variant="h6" sx={{ mb: 2.5 }}>Your habit</Typography>
            <Box sx={{ display: "grid", gap: 2.5 }}>
              <TextField required disabled={isSaving} name="name" label="Habit name" defaultValue={habit.name} onChange={(e) => setDraftAppearance((draft) => ({ ...draft, name: e.target.value }))} fullWidth />
              <TextField disabled={isSaving} name="description" label="Description" defaultValue={habit.description || ""} multiline minRows={2} fullWidth />
              <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
                <FormControl required disabled={isSaving} sx={{ flex: "0 0 6rem", maxWidth: "100%" }}>
                  <InputLabel id="habit-icon-label">Icon</InputLabel>
                  <Select
                    labelId="habit-icon-label" name="icon" label="Icon" defaultValue={habit.icon}
                    onChange={(e) => setDraftAppearance((draft) => ({ ...draft, icon: e.target.value }))}
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
                <FormControl disabled={isSaving} sx={{ flex: "1 1 9rem", minWidth: 0 }}>
                  <InputLabel id="habit-color-label">Color</InputLabel>
                  <Select labelId="habit-color-label" name="color" label="Color" defaultValue={habit.color || ""}
                    onChange={(e) => setDraftAppearance((draft) => ({ ...draft, color: e.target.value }))}
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
            <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1.5 }}>
              <TextField disabled={isSaving} name="frequency" label="Times" placeholder="3" type="number" inputProps={{ inputMode: "numeric" }} defaultValue={habit.frequency || ""} onChange={(e) => setDraftAppearance((draft) => ({ ...draft, frequency: e.target.value ? Number(e.target.value) : undefined }))} sx={{ flex: "1 1 7rem", minWidth: 0 }} />
              <FormControl disabled={isSaving} sx={{ flex: "1 1 7rem", minWidth: 0 }}>
                <InputLabel id="frequencyUnit">Per</InputLabel>
                <Select name="frequencyUnit" label="Per" labelId="frequencyUnit" defaultValue={habit.frequencyUnit || ""} onChange={(e) => setDraftAppearance((draft) => ({ ...draft, frequencyUnit: (e.target.value || undefined) as Habit["frequencyUnit"] }))} fullWidth>
                  <MenuItem value="">None</MenuItem>
                  {frequencyUnits.map((unit) => <MenuItem key={unit} value={unit}>{toFriendlyString(unit)}</MenuItem>)}
                </Select>
              </FormControl>
            </Box>
          </Box>

          <Box component="section" aria-labelledby="habit-reminders-heading" sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2.5 }}>
            <Typography id="habit-reminders-heading" component="h2" variant="h6" sx={{ mb: 2 }}>Reminders</Typography>
            <Grid2 container spacing={2.5}>
              <NotificationsPermissionAlert disabled={isSaving} />
              <Grid2 size={12}>
                <Box component="label" sx={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 2, cursor: notificationPermission === "granted" ? "pointer" : "default" }}>
                  <Box>
                    <Typography sx={{ fontWeight: 600 }}>Daily reminder</Typography>
                    <Typography variant="body2" color="text.secondary">A nudge when your habit is still waiting.</Typography>
                  </Box>
                  <Switch inputProps={{ "aria-label": "Daily reminder" }} disabled={isSaving || notificationPermission !== "granted"} name="notificationEnabled" defaultChecked={habit.notificationEnabled} onChange={(e) => setNotificationsEnabled(e.target.checked)} />
                </Box>
              </Grid2>
              <Grid2 size={12}>
                <TimePicker
                  desktopModeMediaQuery="@media (min-width: 600px) and (pointer: fine)"
                  orientation="portrait"
                  value={notificationTime ? (() => {
                    const [hours, minutes] = notificationTime.split(":");
                    return dayjs.utc().set("hour", parseInt(hours)).set("minute", parseInt(minutes)).local();
                  })() : null}
                  onChange={(newTime: dayjs.Dayjs | null) => {
                    if (newTime) setNotificationTime(newTime.utc().format("HH:mm"));
                    else setNotificationTime(undefined);
                  }}
                  ampm={false} label="Reminder time" disabled={isSaving || notificationPermission !== "granted" || !notificationsEnabled}
                  slotProps={{ textField: { fullWidth: true }, dialog: { sx: mobileTimePickerDialogSx } }}
                />
                <input type="hidden" name="notificationTime" value={notificationTime || ""} />
              </Grid2>
              {notificationsEnabled && notificationTime && (
                <Grid2 size={12}><NotificationPreview habit={previewHabit} /></Grid2>
              )}
              {notificationsEnabled && notificationTime && (
                <Grid2 size={12}>
                  <Button disabled={isSaving} variant="outlined" startIcon={<Notifications />} fullWidth onClick={() => sendTestNotification(previewHabit)} sx={{ minHeight: 48 }}>Send test notification</Button>
                </Grid2>
              )}
            </Grid2>
          </Box>
          <Box sx={{ pt: 0.5, "& .MuiButton-root": { minHeight: 44, borderRadius: "var(--hg-control-radius)" } }}>
            <DeleteHabitWithConfirm habit={habit} id={id!} />
          </Box>
        </Box>

        <Box ref={editorRef} sx={{ position: "fixed", bottom: 0, left: 0, right: 0, zIndex: 1100, bgcolor: "background.paper", borderTop: "1px solid", borderColor: "divider", px: 2, pt: 1.5, pb: "calc(12px + env(safe-area-inset-bottom, 0px))" }}>
          <Box sx={{ display: "flex", gap: 1.5, maxWidth: 568, mx: "auto", minHeight: isSaving ? "max(48px, calc(var(--hg-editor-height, 73px) - 25px - env(safe-area-inset-bottom, 0px)))" : undefined }}>
            <Button disabled={isSaving} variant="outlined" onClick={handleBack} sx={{ minHeight: 48, minWidth: 100 }}>Cancel</Button>
            <Button loading={isSaving} loadingPosition="start" variant="contained" type="submit" sx={{
              minHeight: 48, flex: 1, containerType: "inline-size",
              "&.MuiButton-loading": { color: "text.primary" },
              "@container (max-width: 10rem)": {
                "& .MuiButton-startIcon": { display: "none" },
                "& .MuiButton-loadingIndicator": { top: 12, left: "calc(50% - 8px)" },
                "& .saving-label": { pt: 3 },
              },
            }}>
              {isSaving ? <Box component="span" className="saving-label">Saving…</Box> : "Save changes"}
            </Button>
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
    <Box>
      <Typography variant="caption" color="text.secondary" sx={{ mb: 1, display: "block", fontWeight: 600 }}>
        Notification preview
      </Typography>
      <Box sx={{ bgcolor: "action.hover", borderRadius: "var(--hg-control-radius)", p: 1.5, display: "flex", gap: 1.5, alignItems: "start" }}>
        <Box sx={{
          width: 40, height: 40, borderRadius: "var(--hg-control-radius)",
          bgcolor: habit.color || "primary.main",
          color: (theme) => theme.palette.getContrastText(alphaOrFallback(habit.color, theme.palette.primary.main, 1)),
          display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
        }}>
          {iconMap[habit.icon]}
        </Box>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5, overflowWrap: "anywhere", lineHeight: 1.5 }}>
            {habit.name}
          </Typography>
          <Typography variant="caption" color="text.secondary" sx={{ display: "block", lineHeight: 1.5 }}>
            {sampleProgress}% complete{habit.frequencyUnit ? ` ${getFrequencyUnitFriendly(habit.frequencyUnit)}` : ""}
          </Typography>
          <Typography component="span" sx={{ display: "block", mt: 1, fontSize: "0.8125rem", color: "primary.main", fontWeight: 700 }}>
            Register now
          </Typography>
        </Box>
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

function NotificationsPermissionAlert({ disabled }: { disabled: boolean }) {
  const [permission, setPermission] = useAtom(notificationPermissionAtom);

  if (isLocalMode) {
    return <Grid2 size={12}><Typography variant="body2" color="text.secondary">Notifications stay off in the local demo.</Typography></Grid2>;
  }

  if (permission === "granted") return null;

  if (permission === "denied") {
    return (
      <Grid2 size={12}>
        <Typography variant="body2" color="text.secondary">
          Notifications are blocked. Enable them in your browser settings to use reminders.
        </Typography>
      </Grid2>
    );
  }

  return (
    <Grid2 size={12}>
      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
        Enable notifications to use reminders.
      </Typography>
      <Button disabled={disabled} variant="outlined" fullWidth onClick={async () => {
        const result = await Notification.requestPermission();
        setPermission(result);
      }}>
        Enable notifications
      </Button>
    </Grid2>
  );
}
