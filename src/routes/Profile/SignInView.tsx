import { AutoAwesomeOutlined, BarChartOutlined, NotificationsActiveOutlined, TrackChangesOutlined } from "@mui/icons-material";
import { Box, CircularProgress, Fade, Stack, Typography } from "@mui/material";
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { useEffect } from "react";
import { redirect } from "react-router-dom";
import { getUser } from "../../firebase";
import { router } from "../../main";
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
  const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
  const uiConfig = {
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
  };
  useEffect(() => {
    ui.start("#firebaseui-auth-container", uiConfig);
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: ["100vh", "100dvh"],
        bgcolor: "background.default",
        justifyContent: "center",
        alignItems: "center",
        position: "relative",
        overflow: "hidden",
        px: 2,
        py: 4,
      }}
    >
      {/* ── Background atmosphere ── */}

      {/* Dot-grid texture */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          backgroundImage: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(rgba(144, 198, 91, 0.05) 1px, transparent 1px)"
              : "radial-gradient(rgba(27, 94, 32, 0.03) 1px, transparent 1px)",
          backgroundSize: "28px 28px",
          pointerEvents: "none",
        }}
      />

      {/* Large top-right glow */}
      <Box
        sx={{
          position: "absolute",
          top: "-15%",
          right: "-12%",
          width: 480,
          height: 480,
          borderRadius: "50%",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(144, 198, 91, 0.13) 0%, rgba(144, 198, 91, 0.04) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(46, 125, 50, 0.09) 0%, rgba(46, 125, 50, 0.03) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Bottom-left glow */}
      <Box
        sx={{
          position: "absolute",
          bottom: "-10%",
          left: "-15%",
          width: 400,
          height: 400,
          borderRadius: "50%",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(144, 198, 91, 0.1) 0%, rgba(144, 198, 91, 0.03) 40%, transparent 70%)"
              : "radial-gradient(circle, rgba(46, 125, 50, 0.07) 0%, rgba(46, 125, 50, 0.02) 40%, transparent 70%)",
          pointerEvents: "none",
        }}
      />

      {/* Small accent glow */}
      <Box
        sx={{
          position: "absolute",
          top: "55%",
          left: "65%",
          width: 180,
          height: 180,
          borderRadius: "50%",
          background: (theme) =>
            theme.palette.mode === "dark"
              ? "radial-gradient(circle, rgba(144, 198, 91, 0.07) 0%, transparent 65%)"
              : "radial-gradient(circle, rgba(46, 125, 50, 0.04) 0%, transparent 65%)",
          pointerEvents: "none",
        }}
      />

      {/* ── Hero section ── */}
      <Fade in timeout={400}>
        <Box sx={{ textAlign: "center", mb: 4, position: "relative", zIndex: 1 }}>
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
        <Box
          sx={{
            position: "relative",
            maxWidth: 420,
            width: "100%",
            bgcolor: "background.paper",
            borderRadius: 4,
            overflow: "hidden",
            border: 1,
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
            boxShadow: (theme) =>
              theme.palette.mode === "dark"
                ? "0 12px 48px rgba(0,0,0,0.5), 0 0 0 1px rgba(255,255,255,0.04)"
                : "0 12px 48px rgba(0,0,0,0.1), 0 0 0 1px rgba(0,0,0,0.02)",
          }}
        >
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
          sx={{
            mt: 4,
            gap: 1,
            maxWidth: 420,
            position: "relative",
            zIndex: 1,
          }}
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
                  theme.palette.mode === "dark" ? "rgba(144, 198, 91, 0.12)" : "rgba(46, 125, 50, 0.1)",
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
