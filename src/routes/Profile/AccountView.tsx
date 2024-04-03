import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Fab,
  FormControlLabel,
  FormGroup,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { User } from "firebase/auth";
import { Logout } from "@mui/icons-material";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { getUser } from "../../firebase";
import { useAtom } from "jotai";
import { themeAtom } from "../../main";

async function loader() {
  const user = await getUser();
  if (user) {
    return user;
  } else {
    throw redirect("/profile/signin");
  }
}

AccountView.loader = loader;

export default function AccountView() {
  const user = useLoaderData() as User;
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const { displayName, email, photoURL } = user!;

  return loading ? (
    <CircularProgress />
  ) : (
    <Box
      sx={{
        position: "relative",
        pb: 2,
      }}
    >
      <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
        <Typography variant="h6" mb={2} textAlign="center">
          Hi, {displayName || "there"}!
        </Typography>
        {photoURL && <Avatar alt={"Profile Picture"} src={photoURL} />}
      </Stack>
      <DarkModeToggle />
      <Divider sx={{ my: 1 }} />
      <Typography variant="body2" mb={1} textAlign="center">
        You are logged in as <b>{email || "Unknown Email"}</b>.
      </Typography>
      <Box
        component={Form}
        method="post"
        action="signout"
        sx={{
          position: "absolute",
          width: "100%",
          display: "flex",
          justifyContent: "center",
          bottom: "-2rem",
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
