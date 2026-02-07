import { AccountCircle, Add, Home } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  CircularProgress,
  Fab,
  LinearProgress,
  Slide,
  Snackbar,
  Typography,
  Zoom,
} from "@mui/material";
import { getAuth } from "firebase/auth";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { useAuthState } from "react-firebase-hooks/auth";
import { Form, Link, Outlet, useLocation, useNavigation } from "react-router-dom";
import { snackbarActionAtom, snackbarMessageAtom, snackbarOpenAtom, snackbarSeverityAtom, userWeekStartsAtMondayAtom } from "../store";
import { fetchAllHabits } from "../services/habitsPersistance";
import { getProgress } from "../utils/helpers";
import { Habit } from "../types/Habit";

export default function Root() {
  // Router
  const navigation = useNavigation();
  const location = useLocation();
  const loading = navigation.state === "loading";
  const [showLoading, setShowLoading] = useState(false);

  // User signed in using hook
  const [user, userLoading] = useAuthState(getAuth());

  // Snackbar
  const [snackbarOpen] = useAtom(snackbarOpenAtom);
  const [snackbarMessage, setSnackbarMessage] = useAtom(snackbarMessageAtom);
  const [snackbarSeverity] = useAtom(snackbarSeverityAtom);
  const [snackbarAction] = useAtom(snackbarActionAtom);

  // Incomplete habits count for badge
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);

  // Hide nav on sign-in page for immersive experience
  const isSignInPage = location.pathname === "/profile/signin";

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => setShowLoading(true), 200); // delay
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timeoutId); // clear timeout on unmount or when loading changes
  }, [loading]);

  // Fetch incomplete habits count
  useEffect(() => {
    if (!user) return;

    const fetchIncompleteCount = async () => {
      const habits = await fetchAllHabits();
      const incomplete = habits.filter((habit: Habit) => {
        const progress = getProgress(habit, false, userWeekStartsAtMonday);
        return progress < 100;
      }).length;
      setIncompleteCount(incomplete);
    };

    fetchIncompleteCount();
    // Refresh on location change (when user navigates)
  }, [user, location, userWeekStartsAtMonday]);

  const pages = [
    {
      text: "Home",
      path: "/",
      icon: (
        <Badge
          badgeContent={incompleteCount > 0 ? incompleteCount : null}
          color="warning"
          max={99}
          sx={{
            "& .MuiBadge-badge": {
              fontSize: "0.6rem",
              height: 16,
              minWidth: 16,
              padding: "0 3px",
              fontWeight: 700,
            },
          }}
        >
          <Home />
        </Badge>
      ),
    },
    {
      text: "Profile",
      path: "/profile",
      icon: userLoading ? (
        <CircularProgress />
      ) : user?.photoURL ? (
        <Avatar src={user.photoURL} alt={user.displayName || "Profile"} />
      ) : (
        <AccountCircle />
      ),
    },
  ];

  return (
    <>
      {showLoading && (
        <LinearProgress
          sx={{
            position: "fixed",
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

      <Box sx={{ pb: isSignInPage ? 0 : "72px" }}>
        <Outlet />
      </Box>

      {/* Floating Action Button */}
      {user && !isSignInPage && (
        <Zoom in={true} timeout={300}>
          <Form action="/new-habit" method="post">
            <Fab
              type="submit"
              color="primary"
              size="large"
              sx={{
                position: "fixed",
                bottom: 16,
                right: 16,
                zIndex: 1000,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 2px 12px rgba(0,0,0,0.4)"
                    : "0 2px 8px rgba(0,0,0,0.12)",
                "&:active": {
                  transform: "scale(0.92)",
                },
                transition: "transform 0.15s ease",
              }}
              aria-label="Add new habit"
            >
              <Add />
            </Fab>
          </Form>
        </Zoom>
      )}

      {/* Snackbar */}
      <Slide direction="up" in={snackbarOpen}>
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={snackbarAction ? null : 4000}
          onClose={() => setSnackbarMessage("")}
          sx={{
            bottom: isSignInPage ? "16px" : "88px",
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

      {/* ── Floating Pill Navigation ── */}
      {!isSignInPage && (
        <Box
          sx={{
            position: "fixed",
            bottom: 10,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            p: 0.75,
            borderRadius: "999px",
            backdropFilter: "blur(24px)",
            bgcolor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(18, 18, 22, 0.88)" : "rgba(255, 255, 255, 0.9)",
            border: 1,
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(144, 198, 91, 0.1)" : "rgba(46, 125, 50, 0.08)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 24px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.03), 0 0 48px rgba(144, 198, 91, 0.04)"
                : "0 4px 24px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.03)",
          }}
        >
          {pages.map((page) => {
            const active =
              page.path === "/"
                ? !location.pathname.startsWith("/profile")
                : location.pathname.startsWith(page.path);

            return (
              <Box
                key={page.path}
                component={Link}
                to={page.path}
                sx={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  px: 3,
                  py: 0.75,
                  borderRadius: "999px",
                  bgcolor: active
                    ? (theme) =>
                        theme.palette.mode === "dark"
                          ? "rgba(144, 198, 91, 0.13)"
                          : "rgba(46, 125, 50, 0.09)"
                    : "transparent",
                  color: active ? "primary.main" : "text.secondary",
                  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
                  cursor: "pointer",
                  minWidth: 72,
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  "&:active": {
                    transform: "scale(0.92)",
                  },
                  "@media (hover: hover) and (pointer: fine)": {
                    "&:hover": {
                      bgcolor: active
                        ? undefined
                        : (theme) =>
                            theme.palette.mode === "dark"
                              ? "rgba(255,255,255,0.05)"
                              : "rgba(0,0,0,0.03)",
                    },
                  },
                  "& .MuiSvgIcon-root": {
                    fontSize: "1.4rem",
                    color: "inherit",
                    transition: "transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1)",
                    ...(active && { transform: "scale(1.1)" }),
                  },
                  "& .MuiAvatar-root": {
                    width: 26,
                    height: 26,
                    transition: "all 0.25s ease",
                    ...(active && {
                      outline: "2px solid",
                      outlineColor: "primary.main",
                      outlineOffset: 2,
                    }),
                  },
                  "& .MuiCircularProgress-root": {
                    width: "22px !important",
                    height: "22px !important",
                    color: "inherit",
                  },
                }}
              >
                {page.icon}
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.6rem",
                    fontWeight: active ? 700 : 500,
                    mt: 0.25,
                    color: "inherit",
                    letterSpacing: "0.03em",
                    lineHeight: 1,
                  }}
                >
                  {page.text}
                </Typography>
              </Box>
            );
          })}
        </Box>
      )}
    </>
  );
}
