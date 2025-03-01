import {
  Check,
  DarkModeOutlined,
  DeveloperModeOutlined,
  DoNotDisturbOutlined,
  HotelOutlined,
  LogoutOutlined,
  NotificationsActive,
  NotificationsOffOutlined,
  TodayOutlined
} from "@mui/icons-material";
import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Tooltip,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { User } from "firebase/auth";
import { useAtom } from "jotai";
import { Suspense, useState } from "react";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { getUser } from "../../firebase";
import { themeAtom, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";

async function loader() {
  const user = await getUser();
  if (!user) {
    throw redirect("/profile/signin");
  }
  return { user };
}

AccountView.loader = loader;

export default function AccountView() {
  const { user } = useLoaderData() as { user: User };
  const navigation = useNavigation();
  const { displayName, email, photoURL } = user!;

  return (
    <Card>
      <CardContent>
        <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
          <Typography variant="h5" textAlign="center" color="primary.main">
            Hi, {displayName || "there"}!
          </Typography>
          {photoURL && <Avatar alt={"Profile Picture"} src={photoURL} />}
        </Stack>
        <Typography variant="body2" textAlign="center" color="text.secondary">
          You are logged in as <b>{email || "Unknown Email"}</b>.
        </Typography>
      </CardContent>
      <Divider />
      <CardContent>
        <List disablePadding>
          <DarkModeToggle />
          <Suspense fallback={<LinearProgress />}>
            <NotificationsStatus />
            <WeekStartPicker />
            <DayStartPicker />
          </Suspense>
          <Divider sx={{ my: 1 }} />
          <ClearServiceWorkers />
        </List>
      </CardContent>
      <Divider />
      <CardActions>
        <Form method="post" action="signout">
          <Button
            startIcon={<LogoutOutlined />}
            variant="outlined"
            color="error"
            type="submit"
            disabled={navigation.state === "submitting"}
          >
            Sign out
          </Button>
        </Form>
      </CardActions>
    </Card>
  );
}

function DayStartPicker() {
  const [dayStartsAt, setDayStartsAt] = useAtom(userDayStartsAtAtom);

  return (
    <ListItem>
      <ListItemIcon>
        <HotelOutlined />
      </ListItemIcon>
      <TimePicker
        value={dayStartsAt}
        onChange={(newDayStartsAt: Dayjs | null) => {
          if (newDayStartsAt) {
            setDayStartsAt(newDayStartsAt);
          }
        }}
        name="dayStartsAt"
        ampm={false}
        label="I wake up around..."
        slotProps={{ textField: { helperText: "Helps determine progress for daily habits" } }}
        sx={{ width: "100%" }}
      />
    </ListItem>
  );
}

function DarkModeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <ListItem>
      <ListItemIcon>
        <DarkModeOutlined />
      </ListItemIcon>
      <ListItemText primary="Dark mode" secondary="(Recommended)" />
      <Switch checked={theme === "dark"} onChange={toggleTheme} />
    </ListItem>
  );
}

function WeekStartPicker() {
  const [weekStartsAtMonday, setWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);

  return (
    <ListItem>
      <ListItemIcon>
        <TodayOutlined />
      </ListItemIcon>
      <ListItemText primary="Start week on Monday" />
      <Switch checked={weekStartsAtMonday || false} onChange={() => setWeekStartsAtMonday(!weekStartsAtMonday)} />
    </ListItem>
  );
}

function NotificationsStatus() {
  const [permission, setPermission] = useState(Notification.permission);

  return (
    <ListItem>
      <ListItemIcon>{permission === "granted" ? <NotificationsActive /> : <NotificationsOffOutlined />}</ListItemIcon>
      <ListItemText primary="Notifications" />
      {permission === "granted" ? (
        <Chip label="Enabled" color="success" icon={<Check />} sx={{ fontWeight: "bold" }} />
      ) : permission === "denied" ? (
        <Tooltip title="Enable notifications in your browser settings">
          <Chip label="Denied" color="warning" icon={<DoNotDisturbOutlined />} sx={{ fontWeight: "bold" }} />
        </Tooltip>
      ) : (
        <Button
          color="primary"
          onClick={async () => {
            const result = await Notification.requestPermission();
            setPermission(result);
          }}
        >
          Enable
        </Button>
      )}
    </ListItem>
  );
}

function ClearServiceWorkers() {
  return (
    <ListItem>
      <ListItemIcon>
        <DeveloperModeOutlined />
      </ListItemIcon>
      <ListItemText primary="Clear Service Workers" />
      <Button
        color="error"
        onClick={async () => {
          const registrations = await navigator.serviceWorker.getRegistrations();
          registrations.forEach((registration) => registration.unregister());
          window.location.reload();
        }}
      >
        Clear
      </Button>
    </ListItem>
  );
}
