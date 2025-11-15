import { AccountCircle, Add, Home } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
  Fab,
  LinearProgress,
  Paper,
  Slide,
  Snackbar,
  Zoom,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Form, NavLink, Outlet, useNavigation } from "react-router-dom";
import { snackbarActionAtom, snackbarMessageAtom, snackbarOpenAtom, snackbarSeverityAtom } from "../store";

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
  const [snackbarAction] = useAtom(snackbarActionAtom);

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
          height: ["100vh", "100dvh"], // Fallback to 100vh for older browsers, use 100dvh for iOS Safari
          width: "100%",
          position: "relative",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {showLoading && (
          <LinearProgress
            sx={{
              position: "absolute",
              top: 0,
              left: 0,
              right: 0,
              zIndex: 1002,
              height: 3,
              "& .MuiLinearProgress-bar": {
                backgroundColor: "primary.main",
              },
            }}
          />
        )}
        <Box
          sx={{
            flex: 1,
            overflow: "auto",
            pb: "72px", // Space for bottom navigation
            position: "relative",
          }}
        >
          <Outlet />

          {/* Enhanced Floating Action Button */}
          {user && (
            <Zoom in={true} timeout={300}>
              <Form action="/new-habit" method="post">
                <Fab
                  type="submit"
                  color="primary"
                  size="large"
                  sx={{
                    position: "fixed",
                    bottom: 88, // Above bottom navigation
                    right: 16,
                    zIndex: 1000,
                    boxShadow: 6,
                    background: "linear-gradient(45deg, #478523 30%, #90c65b 90%)",
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      top: 0,
                      left: 0,
                      right: 0,
                      bottom: 0,
                      borderRadius: "inherit",
                      background: "linear-gradient(45deg, #5a9342 30%, #a8d675 90%)",
                      opacity: 0,
                      transition: "opacity 0.2s ease-in-out",
                      zIndex: -1,
                    },
                    "&:hover": {
                      boxShadow: 12,
                      transform: "scale(1.1) rotate(90deg)",
                      "&::before": {
                        opacity: 1,
                      },
                    },
                    "&:active": {
                      transform: "scale(0.95) rotate(90deg)",
                    },
                    transition: "all 0.3s cubic-bezier(0.34, 1.56, 0.64, 1)",
                  }}
                  aria-label="Add new habit"
                >
                  <Add />
                </Fab>
              </Form>
            </Zoom>
          )}

          {/* Enhanced Snackbar */}
          <Slide direction="up" in={snackbarOpen}>
            <Snackbar
              open={snackbarOpen}
              autoHideDuration={snackbarAction ? null : 4000}
              onClose={() => setSnackbarMessage("")}
              sx={{
                bottom: "88px", // Above bottom navigation
                "& .MuiSnackbarContent-root": {
                  borderRadius: 2,
                  minWidth: "280px",
                },
              }}
            >
              <Alert
                onClose={() => setSnackbarMessage("")}
                severity={snackbarSeverity}
                sx={{
                  width: "100%",
                  borderRadius: 2,
                  "& .MuiAlert-icon": {
                    fontSize: "1.2rem",
                  },
                }}
                action={snackbarAction}
                elevation={6}
                variant="filled"
              >
                {snackbarMessage}
              </Alert>
            </Snackbar>
          </Slide>
        </Box>
      </Box>

      {/* Enhanced Bottom Navigation */}
      <Paper
        component={BottomNavigation}
        elevation={8}
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
          borderRadius: 0,
          height: 72,
          borderTop: "1px solid",
          borderTopColor: "divider",
          backdropFilter: "blur(10px)",
          backgroundColor: (theme) =>
            theme.palette.mode === "dark" ? "rgba(31, 30, 35, 0.95)" : "rgba(255, 255, 255, 0.95)",
          "&:before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: "1px",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
                : "linear-gradient(90deg, transparent, rgba(0,0,0,0.1), transparent)",
          },
          "& .MuiBottomNavigationAction-root": {
            color: "text.secondary",
            borderRadius: 2,
            margin: "4px 2px",
            transition: "all 0.2s ease-in-out",
            "&.active": {
              color: "primary.main",
              // Remove background color - only highlight text
              "& .MuiBottomNavigationAction-label": {
                fontSize: "0.75rem",
                fontWeight: 600,
                color: "primary.main",
              },
              "& .MuiSvgIcon-root": {
                color: "primary.main",
              },
            },
            "&.pending": {
              color: "primary.light",
              "& .MuiSvgIcon-root": {
                animation: "pulse 1.5s ease-in-out infinite",
              },
              "@keyframes pulse": {
                "0%": { opacity: 1 },
                "50%": { opacity: 0.5 },
                "100%": { opacity: 1 },
              },
            },
            "&:hover": {
              backgroundColor: "action.hover",
              transform: "scale(1.02)",
            },
            minWidth: 64,
            maxWidth: 168,
            padding: "8px 12px",
            "& .MuiSvgIcon-root": {
              fontSize: "1.5rem",
              transition: "all 0.2s ease-in-out",
            },
            "& .MuiBottomNavigationAction-label": {
              fontSize: "0.7rem",
              fontWeight: 500,
              marginTop: "4px",
            },
          },
        }}
      >
        {pages.map((page, index) => (
          <BottomNavigationAction
            key={index}
            component={NavLink}
            to={page.path}
            label={page.text}
            showLabel={true}
            icon={page.icon}
            sx={{
              "&.active .MuiAvatar-root": {
                outline: "2px solid",
                outlineColor: "primary.main",
                outlineOffset: "2px",
                transform: "scale(0.9)",
              },
            }}
          />
        ))}
      </Paper>
    </>
  );
}
