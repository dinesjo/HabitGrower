import { useTheme } from "@emotion/react";
import { CircularProgress, Theme, Typography } from "@mui/material";
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { useEffect } from "react";
import { getUser } from "../../firebase";
import { redirect } from "react-router-dom";
import { snackbarMessageAtom, snackbarSeverityAtom, store } from "../../store";
import { router } from "../../main";

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
        store.set(snackbarMessageAtom, "Sign in successful, welcome!");
        store.set(snackbarSeverityAtom, "success");
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
    <>
      <Typography variant="h5" textAlign="center">
        Welcome to <span style={{ color: (theme as Theme).palette.primary.main }}>HabitGrower</span>!
      </Typography>
      <Typography variant="body2" textAlign="center">
        Please sign in to continue
      </Typography>
      <div id="firebaseui-auth-container"></div>
      <div id="loader">
        <CircularProgress />
      </div>
    </>
  );
}
