import {
  Check,
  DarkModeOutlined,
  DoNotDisturbOutlined,
  HotelOutlined,
  LogoutOutlined,
  NotificationsActiveOutlined,
  NotificationsOffOutlined,
  TodayOutlined,
} from "@mui/icons-material";
import {
  Avatar,
  Box,
  Button,
  Chip,
  Grow,
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
import { Suspense } from "react";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { getUser } from "../../firebase";
import { notificationPermissionAtom, themeAtom, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";

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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100%",
        overflow: "hidden",
      }}
    >
      {/* Header Section */}
      <Grow in={true} timeout={400}>
        <Box
          sx={{
            px: 2,
            py: 2,
            bgcolor: "background.paper",
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Typography variant="h5" textAlign="center" color="primary.main" sx={{ fontWeight: 500 }}>
              Hi, {displayName || "there"}!
            </Typography>
            {photoURL && <Avatar alt={"Profile Picture"} src={photoURL} />}
          </Stack>
          <Typography variant="body2" textAlign="center" color="text.secondary">
            You are logged in as <b>{email || "Unknown Email"}</b>.
          </Typography>
        </Box>
      </Grow>

      {/* Content Section */}
      <Grow in={true} timeout={600}>
        <Box
          sx={{
            flex: 1,
            position: "relative",
            overflow: "auto",
            pt: 1.5,
            px: 2,
          }}
        >
          <List disablePadding>
            <DarkModeToggle />
            <Suspense fallback={<LinearProgress />}>
              <NotificationsStatus />
              <WeekStartPicker />
              <DayStartPicker />
            </Suspense>
          </List>
        </Box>
      </Grow>

      {/* Footer Section */}
      <Grow in={true} timeout={800}>
        <Box
          sx={{
            px: 2,
            py: 2,
            bgcolor: "background.paper",
            borderTop: 1,
            borderColor: "divider",
          }}
        >
          <Form method="post" action="signout">
            <Button
              startIcon={<LogoutOutlined />}
              variant="outlined"
              color="error"
              type="submit"
              loading={navigation.state === "submitting"}
              loadingPosition="start"
              fullWidth
              sx={{
                py: 1.5,
                borderRadius: 2,
                fontWeight: 500,
              }}
            >
              Sign out
            </Button>
          </Form>
        </Box>
      </Grow>
    </Box>
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
  const [permission, setPermission] = useAtom(notificationPermissionAtom);

  return (
    <ListItem>
      <ListItemIcon>
        {permission === "granted" ? <NotificationsActiveOutlined /> : <NotificationsOffOutlined />}
      </ListItemIcon>
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
