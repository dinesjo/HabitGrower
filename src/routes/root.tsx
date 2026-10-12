import { AccountCircle, Add, Close, Home } from "@mui/icons-material";
import {
  Alert,
  Avatar,
  Badge,
  Box,
  Button,
  CircularProgress,
  IconButton,
  LinearProgress,
  Slide,
  Snackbar,
  Typography,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useUser } from "../hooks/useUser";
import { isLocalMode } from "../data/mode";
import { useAtom } from "jotai";
import { useEffect, useState } from "react";
import { Form, Link, Outlet, ScrollRestoration, useLocation, useNavigation } from "react-router-dom";
import { checkedHabitIdsAtom, snackbarActionAtom, snackbarMessageAtom, snackbarOpenAtom, snackbarSeverityAtom, userWeekStartsAtMondayAtom } from "../store";
import { fetchAllHabits } from "../services/habitsPersistance";
import { getProgress } from "../utils/helpers";
import { Habit } from "../types/Habit";

export default function Root() {
  // Router
  const navigation = useNavigation();
  const location = useLocation();
  const loading = navigation.state === "loading";
  const isSubmitting = navigation.state === "submitting";
  const [showLoading, setShowLoading] = useState(false);

  // User signed in using hook
  const [user, userLoading] = useUser();

  // Snackbar
  const [snackbarOpen] = useAtom(snackbarOpenAtom);
  const [snackbarMessage, setSnackbarMessage] = useAtom(snackbarMessageAtom);
  const [snackbarSeverity] = useAtom(snackbarSeverityAtom);
  const [snackbarAction] = useAtom(snackbarActionAtom);
  const [checkedHabitIds] = useAtom(checkedHabitIdsAtom);

  // Incomplete habits count for badge
  const [incompleteCount, setIncompleteCount] = useState(0);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);

  // Hide nav on sign-in page for immersive experience
  const isSignInPage = location.pathname === "/profile/signin";
  const isEditingHabit = location.pathname.endsWith("/edit");
  const hasPendingRegistration = location.pathname === "/" && checkedHabitIds.length > 0;
  const safeBottom = "env(safe-area-inset-bottom, 0px)";
  const navBottom = `calc(12px + ${safeBottom})`;
  const outletBottomPadding = isSignInPage ? 0 : `calc(96px + ${safeBottom})`;

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

      {isLocalMode && (
        <Box sx={{ px: 2, py: 1, bgcolor: "background.paper", borderBottom: 1, borderColor: "divider" }}>
          <Typography sx={{ fontSize: "0.8125rem", lineHeight: 1.5, color: "text.secondary" }}>
            Local demo · Saved in this browser
          </Typography>
        </Box>
      )}

      <Box
        sx={{
          minHeight: ["100vh", "100dvh"],
          "& > *": {
            paddingBottom: outletBottomPadding,
            boxSizing: "border-box",
          },
        }}
      >
        <Outlet />
      </Box>
      <ScrollRestoration />

      {/* Snackbar */}
      <Snackbar
        open={snackbarOpen}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: "up" } }}
        autoHideDuration={snackbarAction ? null : 4000}
        onClose={() => setSnackbarMessage("")}
        sx={{
          bottom: `calc(${isSignInPage ? 16 : hasPendingRegistration ? 176 : 92}px + ${safeBottom})`,
          left: "50%",
          right: "auto",
          transform: "translateX(-50%)",
          width: "calc(100% - 32px)",
          maxWidth: 480,
        }}
      >
        <Alert
          onClose={() => setSnackbarMessage("")}
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            borderRadius: "var(--hg-control-radius)",
            bgcolor: "background.paper",
            color: "text.primary",
            border: "1px solid",
            borderColor: "divider",
            alignItems: "center",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            "& .MuiAlert-message": { minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.5 },
            "& .MuiAlert-icon": {
              fontSize: "1.2rem",
            },
          }}
          action={snackbarAction ? (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5 }}>
              {snackbarAction}
              <IconButton size="small" color="inherit" aria-label="Dismiss message" onClick={() => setSnackbarMessage("")}>
                <Close sx={{ fontSize: 18 }} />
              </IconButton>
            </Box>
          ) : undefined}
          elevation={0}
          variant="standard"
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>

      {/* Primary actions share one thumb-reachable surface. */}
      {!isSignInPage && !isEditingHabit && (
        <Box
          component="nav"
          aria-label="Main navigation"
          sx={{
            position: "fixed",
            bottom: navBottom,
            left: "50%",
            transform: "translateX(-50%)",
            zIndex: 1001,
            display: "grid",
            gridTemplateColumns: user ? "repeat(3, minmax(0, 1fr))" : "repeat(2, minmax(0, 1fr))",
            alignItems: "center",
            gap: 0.75,
            p: 0.75,
            width: "calc(100% - 32px)",
            maxWidth: 360,
            borderRadius: "var(--hg-radius)",
            bgcolor: "background.paper",
            border: 1,
            borderColor: "divider",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 4px 16px rgba(0,0,0,0.2)"
                : "0 4px 16px rgba(23,45,22,0.08)",
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
                aria-label={page.text}
                aria-current={active ? "page" : undefined}
                aria-disabled={isSubmitting || undefined}
                tabIndex={isSubmitting ? -1 : undefined}
                onClick={(event: React.MouseEvent<HTMLAnchorElement>) => { if (isSubmitting) event.preventDefault(); }}
                sx={{
                  textDecoration: "none",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  minWidth: 0,
                  minHeight: 52,
                  pointerEvents: isSubmitting ? "none" : undefined,
                  opacity: isSubmitting ? 0.5 : 1,
                  px: 1,
                  py: 0.75,
                  borderRadius: "var(--hg-control-radius)",
                  bgcolor: active
                    ? (theme) =>
                        theme.palette.mode === "dark"
                          ? alpha(theme.palette.primary.main, 0.2)
                          : alpha(theme.palette.primary.main, 0.13)
                    : "transparent",
                  color: active ? "primary.main" : "text.secondary",
                  transition: "background-color 150ms ease, color 150ms ease",
                  cursor: "pointer",
                  userSelect: "none",
                  WebkitTapHighlightColor: "transparent",
                  "&:focus-visible": {
                    outline: "2px solid",
                    outlineColor: "primary.main",
                    outlineOffset: 2,
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
                  },
                  "& .MuiAvatar-root": {
                    width: 26,
                    height: 26,
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
                    fontSize: "0.75rem",
                    fontWeight: active ? 700 : 600,
                    mt: 0.25,
                    color: "inherit",
                    lineHeight: 1.3,
                  }}
                >
                  {page.text}
                </Typography>
              </Box>
            );
          })}
          {user && (
            <Form action="/new-habit" method="post" style={{ minWidth: 0 }}>
              <Button
                type="submit"
                variant="contained"
                aria-label="Add new habit"
                disabled={isSubmitting}
                loading={isSubmitting && navigation.formAction?.endsWith("/new-habit")}
                sx={{ width: "100%", minWidth: 0, minHeight: 52, px: 0.5, py: 0.75, flexDirection: "column", gap: 0.25 }}
              >
                <Add sx={{ fontSize: "1.4rem" }} />
                <Typography component="span" sx={{ fontSize: "0.75rem", fontWeight: 700, lineHeight: 1.3 }}>
                  New habit
                </Typography>
              </Button>
            </Form>
          )}
        </Box>
      )}
    </>
  );
}
