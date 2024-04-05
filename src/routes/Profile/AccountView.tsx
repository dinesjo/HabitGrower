import { Avatar, Box, Divider, Fab, FormControlLabel, FormGroup, Stack, Switch, Typography } from "@mui/material";
import { User } from "firebase/auth";
import { Logout } from "@mui/icons-material";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { getUser } from "../../firebase";
import { useAtom } from "jotai";
import { themeAtom, userDayStartsAtAtom } from "../../main";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";

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
        <Typography variant="h6" mb={2} textAlign="center">
          Hi, {displayName || "there"}!
        </Typography>
        {photoURL && <Avatar alt={"Profile Picture"} src={photoURL} />}
      </Stack>
      <Typography variant="body2" textAlign="center">
        You are logged in as <b>{email || "Unknown Email"}</b>.
      </Typography>
      <Divider sx={{ my: 1 }} />
      <Stack direction={"column"} spacing={1}>
        <DarkModeToggle />
        <DayStartPicker />
      </Stack>
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

function DarkModeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);

  const toggleTheme = () => {
    setTheme(theme === "light" ? "dark" : "light");
  };

  return (
    <FormGroup>
      <FormControlLabel control={<Switch checked={theme === "dark"} onChange={toggleTheme} />} label="Dark Mode" />
    </FormGroup>
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
      label="Day starts at"
      slotProps={{ textField: { helperText: "Helps determine when progress bar starts" } }}
    />
  );
}
