import {
  Check,
  DarkModeOutlined,
  DoNotDisturbOutlined,
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
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Switch,
  Typography,
} from "@mui/material";
import { TimePicker } from "@mui/x-date-pickers";
import { Dayjs } from "dayjs";
import type { AppUser } from "../../data/types";
import { isLocalMode } from "../../data/mode";
import { useAtom } from "jotai";
import { ReactNode, Suspense } from "react";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import { getUser } from "../../services/auth";
import { notificationPermissionAtom, themeAtom, userDayStartsAtAtom, userWeekStartsAtMondayAtom } from "../../store";
import { ambientPageSx, contentLayerSx, glassPanelSx, mobileTimePickerDialogSx, sectionLabelSx } from "../../styles/designLanguage";

async function loader() {
  const user = await getUser();
  if (!user) {
    throw redirect("/profile/signin");
  }
  return { user };
}

AccountView.loader = loader;

export default function AccountView() {
  const { user } = useLoaderData() as { user: AppUser };
  const navigation = useNavigation();
  const { displayName, email, photoURL } = user!;

  return (
    <Box
      sx={{ ...ambientPageSx, display: "flex", flexDirection: "column", minHeight: ["100vh", "100dvh"] }}
    >
      <Box sx={{ ...contentLayerSx, px: 2, pt: 3, pb: 1, mx: "auto", maxWidth: 600, width: "100%" }}>
        <Typography component="h1" variant="h4" sx={{ fontSize: "2rem", mb: 2.5 }}>
          Profile
        </Typography>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Avatar
            alt={displayName || "Profile picture"}
            src={photoURL || undefined}
            sx={{ width: 56, height: 56, fontWeight: 700, bgcolor: "primary.dark", color: (theme) => theme.palette.getContrastText(theme.palette.primary.dark) }}
          >
            {displayName?.charAt(0)?.toUpperCase() || "?"}
          </Avatar>
          <Box sx={{ minWidth: 0 }}>
            <Typography component="p" variant="subtitle1" sx={{ fontSize: "1.125rem", fontWeight: 700, overflowWrap: "anywhere" }}>
              {displayName || "Welcome!"}
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mt: 0.25, lineHeight: 1.5, overflowWrap: "anywhere" }}>
              {isLocalMode ? "Sample habits saved in this browser" : email || ""}
            </Typography>
          </Box>
        </Stack>
      </Box>

      {/* ── Settings ── */}
      <Box sx={{ ...contentLayerSx, flex: 1, px: 2, pt: 0.5, pb: 2, mx: "auto", maxWidth: 600, width: "100%" }}>
        {/* Preferences */}
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

        {/* Schedule */}
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
      </Box>

      {/* ── Sign Out ── */}
        <Box sx={{ px: 2, py: 3, mt: "auto" }}>
          {isLocalMode && <Typography variant="body2" textAlign="center" color="text.secondary" sx={{ mb: 1.5 }}>Restores sample habits and the default schedule.</Typography>}
          <Form method="post" action={isLocalMode ? "reset-demo" : "signout"} style={{ display: "flex", justifyContent: "center" }}>
            <Button
              startIcon={isLocalMode ? undefined : <LogoutOutlined />}
              variant="outlined"
              color={isLocalMode ? "primary" : "error"}
              type="submit"
              loading={navigation.state === "submitting"}
              loadingPosition="start"
              fullWidth
              sx={{
                maxWidth: 320,
                py: 1.5,
                borderRadius: "var(--hg-control-radius)",
                fontWeight: 600,
                borderWidth: 1.5,
                "&:hover": { borderWidth: 1.5 },
              }}
            >
              {isLocalMode ? "Reset demo data" : "Sign out"}
            </Button>
          </Form>
        </Box>
    </Box>
  );
}

/* ─────────────────── Layout helpers ─────────────────── */

function SectionLabel({ children }: { children: ReactNode }) {
  return (
    <Stack direction="row" alignItems="center" spacing={1} sx={{ ...sectionLabelSx, mt: 3, px: 0.5 }}>
      <Typography component="h2" variant="h6" sx={{ color: "text.primary" }}>
        {children}
      </Typography>
    </Stack>
  );
}

function SettingsCard({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ ...glassPanelSx, overflow: "hidden" }}>
      {children}
    </Box>
  );
}

/* ─────────────────── Setting rows ─────────────────── */

function DarkModeToggle() {
  const [theme, setTheme] = useAtom(themeAtom);

  return (
    <ListItem component="label" sx={{ cursor: "pointer", minHeight: 72 }}>
      <ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}>
        <DarkModeOutlined />
      </ListItemIcon>
      <ListItemText primary="Dark mode" />
      <Switch inputProps={{ "aria-label": "Dark mode" }} checked={theme === "dark"} onChange={() => setTheme(theme === "light" ? "dark" : "light")} />
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
      <ListItemText primary="Notifications" secondary={isLocalMode ? "Disabled in the local demo" : permission === "denied" ? "Blocked by your browser. Enable them in browser settings." : undefined} />
      {!isLocalMode && (permission === "granted" ? (
        <Chip label="Enabled" size="small" color="success" variant="outlined" icon={<Check />} />
      ) : permission === "denied" ? (
        <Chip label="Blocked" size="small" color="warning" variant="outlined" icon={<DoNotDisturbOutlined />} />
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
      ))}
    </ListItem>
  );
}

function WeekStartPicker() {
  const [weekStartsAtMonday, setWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);

  return (
    <ListItem component="label" sx={{ cursor: "pointer", minHeight: 72 }}>
      <ListItemIcon sx={{ color: "primary.main", minWidth: 36 }}>
        <TodayOutlined />
      </ListItemIcon>
      <ListItemText primary="Weeks start Monday" />
      <Switch inputProps={{ "aria-label": "Weeks start Monday" }} checked={weekStartsAtMonday || false} onChange={() => setWeekStartsAtMonday(!weekStartsAtMonday)} />
    </ListItem>
  );
}

function DayStartPicker() {
  const [dayStartsAt, setDayStartsAt] = useAtom(userDayStartsAtAtom);

  return (
    <ListItem sx={{ py: 2.5 }}>
      <TimePicker
        desktopModeMediaQuery="@media (min-width: 600px) and (pointer: fine)"
        value={dayStartsAt}
        onChange={(newDayStartsAt: Dayjs | null) => {
          if (newDayStartsAt) {
            setDayStartsAt(newDayStartsAt);
          }
        }}
        name="dayStartsAt"
        ampm={false}
        label="Wake-up time"
        slotProps={{ textField: { helperText: "Used to calculate your daily habit progress." }, dialog: { sx: mobileTimePickerDialogSx } }}
        sx={{ width: "100%" }}
      />
    </ListItem>
  );
}
