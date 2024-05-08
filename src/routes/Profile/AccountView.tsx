import {
  Avatar,
  Button,
  Card,
  CardActions,
  CardContent,
  Divider,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { User } from "firebase/auth";
import { DarkModeOutlined, HotelOutlined, LogoutOutlined, TodayOutlined } from "@mui/icons-material";
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
        <Divider sx={{ my: 1 }} />
        <List disablePadding>
          <DarkModeToggle />
          <Suspense fallback={<LinearProgress />}>
            <WeekStartPicker />
            <DayStartPicker />
          </Suspense>
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
