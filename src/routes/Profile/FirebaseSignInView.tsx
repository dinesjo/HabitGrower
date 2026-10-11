import { AutoAwesomeOutlined, BarChartOutlined, NotificationsActiveOutlined, TrackChangesOutlined } from "@mui/icons-material";
import { Box, CircularProgress, Fade, Stack, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { useEffect, useMemo } from "react";
import { redirect } from "react-router-dom";
import { getUser } from "../../firebase";
import { router } from "../../main";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../../styles/designLanguage";
import { showSnackBar } from "../../utils/helpers";

async function loader() {
  const user = await getUser();
  if (user) {
    throw redirect("/profile");
  } else {
    return null;
  }
}
SignInView.loader = loader;

const features = [
  { icon: <TrackChangesOutlined sx={{ fontSize: 18 }} />, label: "Track daily habits" },
  { icon: <BarChartOutlined sx={{ fontSize: 18 }} />, label: "Visualize progress" },
  { icon: <NotificationsActiveOutlined sx={{ fontSize: 18 }} />, label: "Smart reminders" },
  { icon: <AutoAwesomeOutlined sx={{ fontSize: 18 }} />, label: "100% free" },
];

export default function SignInView() {
  const ui = useMemo(
    () => firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth()),
    []
  );
  const uiConfig = useMemo(
    () => ({
      callbacks: {
        signInSuccessWithAuthResult: function () {
          showSnackBar("Sign in successful, welcome!", "success");
          router.navigate("/");
          return false;
        },
        uiShown: function () {
          const loader = document.getElementById("loader");
          if (loader) loader.style.display = "none";
        },
      },
      signInFlow: "popup",
      signInOptions: [
        firebase.auth.GoogleAuthProvider.PROVIDER_ID,
        firebase.auth.EmailAuthProvider.PROVIDER_ID,
      ],
    }),
    []
  );
  useEffect(() => {
    ui.start("#firebaseui-auth-container", uiConfig);
  }, [ui, uiConfig]);

  return (
    <Box
      sx={{
        ...ambientPageSx,
        display: "flex",
        flexDirection: "column",
        height: ["100vh", "100dvh"],
        justifyContent: "center",
        alignItems: "center",
        px: 2,
        py: 4,
      }}
    >
      {/* ── Hero section ── */}
      <Fade in timeout={400}>
        <Box sx={{ ...contentLayerSx, textAlign: "center", mb: 4 }}>
          <Typography
            variant="h3"
            sx={{
              fontWeight: 800,
              letterSpacing: "-0.03em",
              mb: 1,
              lineHeight: 1.1,
            }}
          >
            Habit
            <Box component="span" sx={{ color: "primary.main" }}>
              Grower
            </Box>
          </Typography>
          <Typography
            variant="body1"
            sx={{
              color: "text.secondary",
              fontWeight: 500,
              maxWidth: 300,
              mx: "auto",
              lineHeight: 1.5,
            }}
          >
            Build better habits, one day at a time
          </Typography>
        </Box>
      </Fade>

      {/* ── Sign-in card ── */}
      <Fade in timeout={650}>
        <Box sx={{ ...contentLayerSx, ...glassPanelSx, maxWidth: 420, width: "100%", borderRadius: 4, overflow: "hidden" }}>
          {/* Green gradient accent bar */}
          <Box
            sx={{
              height: 4,
              background: (theme) =>
                `linear-gradient(90deg, ${theme.palette.primary.dark}, ${theme.palette.primary.main}, ${theme.palette.primary.light})`,
            }}
          />

          <Box sx={{ px: 3.5, pt: 3, pb: 2.5 }}>
            <Typography
              variant="body2"
              textAlign="center"
              sx={{
                color: "text.secondary",
                mb: 2.5,
                fontWeight: 500,
              }}
            >
              Choose how to sign in
            </Typography>

            <div id="firebaseui-auth-container"></div>
            <Box id="loader" sx={{ display: "flex", justifyContent: "center", py: 2 }}>
              <CircularProgress size={28} />
            </Box>
          </Box>
        </Box>
      </Fade>

      {/* ── Feature highlights ── */}
      <Fade in timeout={900}>
        <Stack
          direction="row"
          flexWrap="wrap"
          justifyContent="center"
          sx={{ ...contentLayerSx, mt: 4, gap: 1, maxWidth: 420 }}
        >
          {features.map((f) => (
            <Stack
              key={f.label}
              direction="row"
              alignItems="center"
              spacing={0.75}
              sx={{
                px: 1.5,
                py: 0.75,
                borderRadius: 2,
                bgcolor: (theme) =>
                  theme.palette.mode === "dark" ? "rgba(144, 198, 91, 0.08)" : "rgba(46, 125, 50, 0.06)",
                border: 1,
                borderColor: (theme) =>
                  theme.palette.mode === "dark"
                    ? alpha(theme.palette.primary.main, 0.24)
                    : alpha(theme.palette.primary.main, 0.14),
              }}
            >
              <Box sx={{ color: "primary.main", display: "flex", alignItems: "center" }}>{f.icon}</Box>
              <Typography
                variant="caption"
                sx={{
                  fontWeight: 600,
                  color: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(232, 245, 233, 0.8)" : "rgba(27, 94, 32, 0.8)",
                  letterSpacing: "0.01em",
                }}
              >
                {f.label}
              </Typography>
            </Stack>
          ))}
        </Stack>
      </Fade>
    </Box>
  );
}
