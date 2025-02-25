import { AccountCircle, Home, PlaylistAdd } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
  Container,
  Fab,
  LinearProgress,
  Paper,
  Snackbar,
  Tooltip,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Form, NavLink, Outlet, useNavigation } from "react-router-dom";
import { snackbarMessageAtom, snackbarOpenAtom, snackbarSeverityAtom } from "../store";

export default function Root() {
  // Router
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const [showLoading, setShowLoading] = useState(false);

  // User signed in using hook
  const [user, userLoading] = useAuthState(getAuth());

  // Snackbar
  const [snackbarOpen] = useAtom(snackbarOpenAtom);
  const [snackbarMessage, setSnackbarMessage] = useAtom(snackbarMessageAtom);
  const [snackbarSeverity] = useAtom(snackbarSeverityAtom);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => setShowLoading(true), 200); // delay
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timeoutId); // clear timeout on unmount or when loading changes
  }, [loading]);

  const pages = [
    {
      text: "Profile",
      path: "/profile",
      icon: userLoading ? (
        <CircularProgress sx={{ color: "primary.contrastText" }} />
      ) : user?.photoURL ? (
        <Avatar src={user.photoURL} alt={user.displayName || "Profile Picture"} />
      ) : (
        <AccountCircle />
      ),
    },
    { text: "Home", path: "/", icon: <Home /> },
  ];

  return (
    <>
      <Box
        sx={{
          height: "calc(100vh - 56px)",
          width: "100%",
          position: "relative",
        }}
      >
        {showLoading && <LinearProgress sx={{ position: "absolute", top: 0, left: 0, right: 0 }} />}
        <Container
          maxWidth="xs"
          sx={{
            position: "relative",
            height: "100%",
            maxWidth: "max-content",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
          }}
        >
          <Outlet />
          {user && (
            <Form action="/new-habit" method="post">
              <Tooltip title="New Habit" placement="left">
                <Fab type="submit" color="secondary" sx={{ position: "absolute", bottom: 6, right: 6 }}>
                  <PlaylistAdd />
                </Fab>
              </Tooltip>
            </Form>
          )}
          <Snackbar
            open={snackbarOpen}
            autoHideDuration={3000}
            onClose={() => setSnackbarMessage("")}
            sx={{
              bottom: "calc(56px + 0.5rem)",
            }}
          >
            <Alert
              onClose={() => setSnackbarMessage("")}
              severity={snackbarSeverity}
              variant="filled"
              sx={{ width: "100%" }}
            >
              {snackbarMessage}
            </Alert>
          </Snackbar>
        </Container>
      </Box>
      <BottomNavigation
        component={Paper}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          borderRadius: 0,
        }}
      >
        {pages.map((page, index) => (
          <BottomNavigationAction
            key={index}
            component={NavLink}
            to={page.path}
            label={page.text}
            showLabel={location.pathname === page.path}
            icon={page.icon}
            sx={{
              "&.active": {
                color: "primary.main",
              },
              "&.active .MuiAvatar-root": {
                outline: "1px solid",
                outlineColor: "primary.main",
                outlineOffset: "1px",
                mb: 0.5,
              },
              "&.pending": {
                color: "primary.light",
              },
            }}
          />
        ))}
      </BottomNavigation>
    </>
  );
}
