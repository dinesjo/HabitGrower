import { Outlet, useNavigation, NavLink, useLoaderData, Form } from "react-router-dom";
import { useEffect, useState } from "react";
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
} from "@mui/material";
import { AccountCircle, Home, PlaylistAdd } from "@mui/icons-material";
import { getUser } from "../firebase";
import { User } from "firebase/auth";
import { useAtom } from "jotai";
import { snackbarMessageAtom, snackbarOpenAtom, snackbarSeverityAtom } from "../store";

async function loader() {
  const user = await getUser();
  return user;
}

Root.loader = loader;

export default function Root() {
  // Router
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const [showLoading, setShowLoading] = useState(false);

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
  const user = useLoaderData() as User | null;

  const pages = [
    {
      text: "Profile",
      path: "/profile",
      icon:
        loading && !user ? (
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
          backgroundImage: "url('/cover.jpg')",
          backgroundSize: "cover",
        }}
      >
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
          <Form action="/new-habit" method="post">
            <Fab type="submit" color="secondary" sx={{ position: "absolute", bottom: 16, right: 16 }}>
              <PlaylistAdd />
            </Fab>
          </Form>
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
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
        }}
      >
        {showLoading && <LinearProgress />}
        <BottomNavigation>
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
                "&.pending": {
                  color: "primary.light",
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}
