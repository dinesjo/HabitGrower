import {
  Avatar,
  Box,
  Divider,
  Fab,
  LinearProgress,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { User } from "firebase/auth";
import { DarkModeOutlined, Logout, TodayOutlined } from "@mui/icons-material";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { getUser } from "../../firebase";
import { useAtom } from "jotai";
import { themeAtom, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import { Suspense } from "react";

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
    <Box sx={{ position: "relative" }}>
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Typography variant="h5" mb={2} textAlign="center">
          Hi, {displayName || "there"}!
        </Typography>
        {photoURL && <Avatar alt={"Profile Picture"} src={photoURL} />}
      </Stack>
      <Typography variant="body2" textAlign="center" color="text.secondary">
        You are logged in as <b>{email || "Unknown Email"}</b>.
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Typography variant="h6" textAlign="center">
        Device settings
      </Typography>
      <DarkModeToggle />
      <Divider sx={{ my: 1 }} />
      <Typography variant="h6" textAlign="center">
        Acount settings
      </Typography>
      <Typography variant="subtitle2" textAlign="center" color="text.secondary">
        Settings will sync to all devices.
      </Typography>
      <Suspense fallback={<LinearProgress />}>
        <WeekStartPicker />
        <DayStartPicker />
      </Suspense>
      <Box
        component={Form}
        method="post"
        action="signout"
        sx={{
          position: "absolute",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          bottom: "-4rem",
        }}
      >
        {navigation.state === "submitting" ? (
          <Fab variant="extended" color="error" disabled>
            <Logout sx={{ mr: 1 }} />
            Logging out...
          </Fab>
        ) : (
          <Fab variant="extended" color="error" type="submit">
            <Logout sx={{ mr: 1 }} />
            Sign out
          </Fab>
        )}
      </Box>
    </Box>
  );
}

function DayStartPicker() {
  const [dayStartsAt, setDayStartsAt] = useAtom(userDayStartsAtAtom);

  return (
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
      slotProps={{ textField: { helperText: "Helps determine when progress bar starts" } }}
      sx={{ width: "100%" }}
    />
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
      <ListItemText primary="Dark Mode" />
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
