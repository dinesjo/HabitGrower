import { useTheme } from "@emotion/react";
import { Box, CircularProgress, Grow, Theme, Typography } from "@mui/material";
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

export default function SignInView() {
  const theme = useTheme();

  const ui = firebaseui.auth.AuthUI.getInstance() || new firebaseui.auth.AuthUI(firebase.auth());
  const uiConfig = {
    callbacks: {
      signInSuccessWithAuthResult: function () {
        // User successfully signed in.
        // Return type determines whether we continue the redirect automatically
        // or whether we leave that to developer to handle.
        showSnackBar("Sign in successful, welcome!", "success");
        router.navigate("/");
        return false;
      },
      uiShown: function () {
        // The widget is rendered, hide the loader.
        const loader = document.getElementById("loader");
        if (loader) loader.style.display = "none";
      },
    },
    // Will use popup for IDP Providers sign-in flow instead of the default, redirect.
    signInFlow: "popup",
    // signInSuccessUrl: "/",
    signInOptions: [
      // Leave the lines as is for the providers you want to offer your users.
      firebase.auth.GoogleAuthProvider.PROVIDER_ID,
      firebase.auth.EmailAuthProvider.PROVIDER_ID,
    ],
    // Terms of service url.
    // tosUrl: "<your-tos-url>",
    // Privacy policy url.
    // privacyPolicyUrl: "<your-privacy-policy-url>",
  };
  useEffect(() => {
    ui.start("#firebaseui-auth-container", uiConfig);
  });

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "calc(100vh - 72px)", // Account for bottom navigation
        bgcolor: "background.default",
        justifyContent: "center",
        alignItems: "center",
        px: 2,
      }}
    >
      <Grow in={true} timeout={600}>
        <Box
          sx={{
            maxWidth: 400,
            width: "100%",
            p: 3,
            bgcolor: "background.paper",
            borderRadius: 2,
            boxShadow: 3,
          }}
        >
          <Typography variant="h5" textAlign="center" sx={{ mb: 1 }}>
            Welcome to <span style={{ color: (theme as Theme).palette.primary.main }}>HabitGrower</span>!
          </Typography>
          <Typography variant="body2" textAlign="center" sx={{ mb: 3 }}>
            Please sign in to continue
          </Typography>
          <div id="firebaseui-auth-container"></div>
          <div id="loader">
            <CircularProgress />
          </div>
        </Box>
      </Grow>
    </Box>
  );
}
