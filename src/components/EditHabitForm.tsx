import { ColorLens, EditNotificationsOutlined, EventRepeat, NotificationsOutlined, Save } from "@mui/icons-material";
import {
  Alert,
  Box,
  Button,
  Chip,
  FormControl,
  Grid2,
  Grow,
  InputLabel,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
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
import BackButton from "./BackButton";
import DeleteHabitWithConfirm from "./DeleteHabitWithConfirm";

dayjs.extend(utc);

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  return {
    habit: await fetchHabitById(id),
  };
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 72px)", // Account for bottom navigation
        bgcolor: "background.default",
      }}
    >
      <Form autoComplete="off" method="post" style={{ display: "flex", flexDirection: "column", height: "100%" }}>
        {/* Header */}
        <Grow in={true} timeout={400}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              p: 2,
              gap: 2,
              borderBottom: 1,
              borderColor: "divider",
            }}
          >
            <BackButton />
            <Typography variant="h6" sx={{ fontWeight: 600, flexGrow: 1 }}>
              Edit Habit:{" "}
              <Box component="span" sx={{ color: "primary.main", fontWeight: 700 }}>
                {habit.name}
              </Box>
            </Typography>
          </Box>
        </Grow>

        {/* Content */}
        <Grow in={true} timeout={600}>
          <Box
            sx={{
              flexGrow: 1,
              pt: 1.5,
              px: 2,
              mx: "auto",
              maxWidth: 800,
              overflowY: "auto",
            }}
          >
            <Grid2 container spacing={2}>
              {/* Section tile */}
              <Grid2 size={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    "&::before, &::after": {
                      content: '""',
                      flexGrow: 1,
                      height: 1,
                      bgcolor: "divider",
                    },
                  }}
                >
                  <Chip icon={<ColorLens />} label="Appearance" size="small" variant="outlined" />
                </Box>
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField required name="name" label="Habit Name" defaultValue={habit.name} fullWidth />
              </Grid2>
              <Grid2 size={{ xs: 12, sm: 6 }}>
                <TextField
                  name="description"
                  label="Description"
                  defaultValue={habit.description || ""}
                  multiline
                  fullWidth
                />
              </Grid2>
              <Grid2 container size={12} spacing={2} display="flex" alignItems="start" sx={{ height: "100%" }}>
                <Grid2 size={"auto"} sx={{ height: "inherit" }}>
                  <FormControl required fullWidth>
                    <InputLabel>Icon</InputLabel>
                    <Select
                      autoWidth
                      name="icon"
                      label="Icon"
                      defaultValue={habit.icon}
                      renderValue={(icon) => {
                        return <Box sx={{ height: "1em" }}>{iconMap[icon]}</Box>;
                      }}
                    >
                      {Object.keys(iconMap).map((icon) => (
                        <MenuItem key={icon} value={icon}>
                          {iconMap[icon]}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
                <Grid2 size="grow">
                  <FormControl fullWidth>
                    <InputLabel>Color</InputLabel>
                    <Select
                      name="color"
                      label="Color"
                      defaultValue={habit.color || ""}
                      renderValue={(value) => {
                        return <Typography sx={{ color: value }}>{toFriendlyString(value)}</Typography>;
                      }}
                      fullWidth
                    >
                      <MenuItem value="">None</MenuItem>
                      {colorChoices.map((color) => (
                        <MenuItem key={color} value={color} sx={{ color: color }}>
                          {toFriendlyString(color)}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid2>
              </Grid2>
              {/* Section tile */}
              <Grid2 size={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    "&::before, &::after": {
                      content: '""',
                      flexGrow: 1,
                      height: 1,
                      bgcolor: "divider",
                    },
                  }}
                >
                  <Chip icon={<EventRepeat />} label="How often?" size="small" variant="outlined" />
                </Box>
              </Grid2>
              <Grid2 size={5}>
                <TextField
                  name="frequency"
                  label="Frequency"
                  placeholder="3"
                  type="number"
                  defaultValue={habit.frequency || ""}
                  fullWidth
                />
              </Grid2>
              <Grid2 size={7}>
                <FormControl fullWidth>
                  <InputLabel id="frequencyUnit">Every</InputLabel>
                  <Select
                    name="frequencyUnit"
                    label="Every"
                    labelId="frequencyUnit"
                    defaultValue={habit.frequencyUnit || ""}
                    fullWidth
                  >
                    <MenuItem value="">None</MenuItem>
                    {
                      // Loop through the FrequencyUnit type to create a list of options
                      frequencyUnits.map((unit) => (
                        <MenuItem key={unit} value={unit}>
                          {toFriendlyString(unit)}
                        </MenuItem>
                      ))
                    }
                  </Select>
                </FormControl>
              </Grid2>
              {/* Notifications section */}
              <Grid2 size={12}>
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    mb: 2,
                    "&::before, &::after": {
                      content: '""',
                      flexGrow: 1,
                      height: 1,
                      bgcolor: "divider",
                    },
                  }}
                >
                  <Chip icon={<EditNotificationsOutlined />} label="Notifications" size="small" variant="outlined" />
                </Box>
              </Grid2>
              <NotificationsPermissionAlert />
              <Grid2 size={12}>
                <List disablePadding>
                  <ListItem sx={{ py: 0 }}>
                    <ListItemIcon>
                      <NotificationsOutlined />
                    </ListItemIcon>
                    <ListItemText
                      primary="Daily notifications"
                      secondary="Get notified so you never miss this habit again!"
                    />
                    <Switch
                      disabled={notificationPermission !== "granted"}
                      name="notificationEnabled"
                      defaultChecked={habit.notificationEnabled}
                      onChange={(e) => setNotificationsEnabled(e.target.checked)}
                    />
                  </ListItem>
                </List>
              </Grid2>
              <Grid2 size={12}>
                <TimePicker
                  value={
                    notificationTime
                      ? (() => {
                          const [hours, minutes] = notificationTime.split(":");
                          return dayjs.utc().set("hour", parseInt(hours)).set("minute", parseInt(minutes)).local();
                        })()
                      : null
                  }
                  onChange={(newTime: dayjs.Dayjs | null) => {
                    /* Save the time as UTC instead of local time.
                    The notificationTime is what is saved into Firebase. */
                    if (newTime) {
                      // Convert the selected local time to UTC
                      const utcTime = newTime.utc().format("HH:mm");
                      setNotificationTime(utcTime);
                    } else {
                      setNotificationTime(undefined);
                    }
                  }}
                  ampm={false}
                  label="Notification time"
                  disabled={notificationPermission !== "granted" || !notificationsEnabled}
                  slotProps={{
                    textField: {
                      helperText: `Get notified at this time every day if "${habit.name}" not completed by then`,
                      fullWidth: true,
                    },
                  }}
                />
                <input type="hidden" name="notificationTime" value={notificationTime || ""} />
              </Grid2>
            </Grid2>
          </Box>
        </Grow>

        {/* Footer */}
        <Grow in={true} timeout={800}>
          <Box
            sx={{
              p: 2,
              borderTop: 1,
              borderColor: "divider",
              display: "flex",
              gap: 1,
            }}
          >
            <Button
              loading={navigation.state === "submitting"}
              loadingPosition="start"
              startIcon={<Save />}
              variant="contained"
              type="submit"
              sx={{
                borderRadius: 2,
                textTransform: "none",
                fontWeight: 500,
              }}
            >
              Save
            </Button>
            <Button
              onClick={handleBack}
              sx={{
                borderRadius: 2,
                textTransform: "none",
              }}
            >
              Cancel
            </Button>
            <DeleteHabitWithConfirm habit={habit} id={id!} />
          </Box>
        </Grow>
      </Form>
    </Box>
  );
}

function NotificationsPermissionAlert() {
  const [permission, setPermission] = useAtom(notificationPermissionAtom);

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
