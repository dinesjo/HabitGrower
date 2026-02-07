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
  Divider,
  Fade,
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
import { ReactNode, Suspense } from "react";
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
        minHeight: ["calc(100vh - 72px)", "calc(100dvh - 72px)"],
        bgcolor: "background.default",
      }}
    >
      {/* ── Profile Header ── */}
      <Fade in timeout={500}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(160deg, #071a0e 0%, #0f2b18 40%, #163d22 70%, #0d2415 100%)"
                : "linear-gradient(160deg, #e8f5e9 0%, #c8e6c9 40%, #a5d6a7 70%, #e0f2e1 100%)",
            pt: 5,
            pb: 5,
            px: 2,
          }}
        >
          {/* Dot-grid texture overlay */}
          <Box
            sx={{
              position: "absolute",
              inset: 0,
              backgroundImage: (theme) =>
                theme.palette.mode === "dark"
                  ? "radial-gradient(rgba(144, 198, 91, 0.07) 1px, transparent 1px)"
                  : "radial-gradient(rgba(27, 94, 32, 0.045) 1px, transparent 1px)",
              backgroundSize: "24px 24px",
              pointerEvents: "none",
            }}
          />

          {/* Decorative radial shapes */}
          <Box
            sx={{
              position: "absolute",
              top: -60,
              right: -40,
              width: 200,
              height: 200,
              borderRadius: "50%",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle, rgba(144, 198, 91, 0.12) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(46, 125, 50, 0.08) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              bottom: -30,
              left: -20,
              width: 120,
              height: 120,
              borderRadius: "50%",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle, rgba(144, 198, 91, 0.08) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(46, 125, 50, 0.06) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />
          <Box
            sx={{
              position: "absolute",
              top: 20,
              left: "30%",
              width: 80,
              height: 80,
              borderRadius: "50%",
              background: (theme) =>
                theme.palette.mode === "dark"
                  ? "radial-gradient(circle, rgba(144, 198, 91, 0.06) 0%, transparent 70%)"
                  : "radial-gradient(circle, rgba(46, 125, 50, 0.04) 0%, transparent 70%)",
              pointerEvents: "none",
            }}
          />

          {/* Avatar & identity */}
          <Stack alignItems="center" spacing={1.5} sx={{ position: "relative", zIndex: 1 }}>
            <Box
              sx={{
                p: "3px",
                borderRadius: "50%",
                background: (theme) =>
                  `linear-gradient(135deg, ${theme.palette.primary.light}, ${theme.palette.primary.dark})`,
                boxShadow: (theme) =>
                  theme.palette.mode === "dark"
                    ? "0 4px 28px rgba(144, 198, 91, 0.25)"
                    : "0 4px 28px rgba(46, 125, 50, 0.18)",
              }}
            >
              <Avatar
                alt="Profile Picture"
                src={photoURL || undefined}
                sx={{
                  width: 88,
                  height: 88,
                  border: "3px solid",
                  borderColor: "background.default",
                  fontSize: "2.2rem",
                  fontWeight: 700,
                  bgcolor: "primary.dark",
                  color: "#fff",
                }}
              >
                {displayName?.charAt(0)?.toUpperCase() || "?"}
              </Avatar>
            </Box>

            <Box textAlign="center">
              <Typography
                variant="h5"
                sx={{
                  color: (theme) => (theme.palette.mode === "dark" ? "#e8f5e9" : "#1b5e20"),
                  fontWeight: 700,
                  letterSpacing: "-0.02em",
                }}
              >
                {displayName || "Welcome!"}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(232, 245, 233, 0.55)" : "rgba(27, 94, 32, 0.6)",
                  mt: 0.5,
                  fontWeight: 500,
                }}
              >
                {email || "Unknown Email"}
              </Typography>
            </Box>
          </Stack>
        </Box>
      </Fade>

      {/* ── Settings ── */}
      <Box sx={{ flex: 1, px: 2, pt: 0.5, pb: 2, mx: "auto", maxWidth: 560, width: "100%" }}>
        {/* Preferences */}
        <Fade in timeout={700}>
          <Box>
            <SectionLabel>Preferences</SectionLabel>
            <SettingsCard>
              <List disablePadding>
                <DarkModeToggle />
                <Divider variant="middle" sx={{ opacity: 0.4 }} />
                <Suspense fallback={<LinearProgress sx={{ mx: 2, my: 1.5 }} />}>
                  <NotificationsStatus />
                  <Divider variant="middle" sx={{ opacity: 0.4 }} />
                  <WeekStartPicker />
                </Suspense>
              </List>
            </SettingsCard>
          </Box>
        </Fade>

        {/* Schedule */}
        <Fade in timeout={900}>
          <Box>
            <SectionLabel>Schedule</SectionLabel>
            <SettingsCard>
              <List disablePadding>
                <Suspense fallback={<LinearProgress sx={{ mx: 2, my: 1.5 }} />}>
                  <DayStartPicker />
                </Suspense>
              </List>
            </SettingsCard>
          </Box>
        </Fade>
      </Box>

      {/* ── Sign Out ── */}
      <Fade in timeout={1100}>
        <Box sx={{ px: 2, py: 3, mt: "auto" }}>
          <Form method="post" action="signout" style={{ display: "flex", justifyContent: "center" }}>
            <Button
              startIcon={<LogoutOutlined />}
              variant="outlined"
              color="error"
              type="submit"
              loading={navigation.state === "submitting"}
              loadingPosition="start"
              fullWidth
              sx={{
                maxWidth: 320,
                py: 1.5,
                borderRadius: 3,
                fontWeight: 600,
                borderWidth: 1.5,
                "&:hover": { borderWidth: 1.5 },
              }}
            >
              Sign out
            </Button>
          </Form>
        </Box>
      </Fade>
    </Box>
  );
}

/* ─────────────────── Layout helpers ─────────────────── */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ mb: 1.5, mt: 3, px: 0.5 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
      <Typography
        variant="overline"
        sx={{ fontWeight: 700, letterSpacing: "0.1em", color: "primary.main", fontSize: "0.7rem" }}
      >
        {children}
      </Typography>
    </Stack>
  );
}

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <Box
      sx={{
        bgcolor: "background.paper",
        borderRadius: 3,
        overflow: "hidden",
        border: 1,
        borderColor: (theme) =>
          theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        boxShadow: (theme) =>
          theme.palette.mode === "dark" ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 8px rgba(0,0,0,0.04)",
      }}
    >
      {children}
    </Box>
  );
}

/* ─────────────────── Setting rows ─────────────────── */

function DarkModeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <ListItem>
      <ListItemIcon sx={{ color: "primary.main", minWidth: 44 }}>
        <DarkModeOutlined />
      </ListItemIcon>
      <ListItemText primary="Dark mode" secondary="Easier on the eyes" />
      <Switch checked={theme === "dark"} onChange={() => setTheme(theme === "light" ? "dark" : "light")} />
    </ListItem>
  );
}

function NotificationsStatus() {
  const [permission, setPermission] = useAtom(notificationPermissionAtom);

  return (
    <ListItem>
      <ListItemIcon sx={{ color: "primary.main", minWidth: 44 }}>
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

function WeekStartPicker() {
  const [weekStartsAtMonday, setWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);

  return (
    <ListItem>
      <ListItemIcon sx={{ color: "primary.main", minWidth: 44 }}>
        <TodayOutlined />
      </ListItemIcon>
      <ListItemText primary="Start week on Monday" />
      <Switch checked={weekStartsAtMonday || false} onChange={() => setWeekStartsAtMonday(!weekStartsAtMonday)} />
    </ListItem>
  );
}

function DayStartPicker() {
  const [dayStartsAt, setDayStartsAt] = useAtom(userDayStartsAtAtom);

  return (
    <ListItem>
      <ListItemIcon sx={{ color: "primary.main", minWidth: 44 }}>
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
