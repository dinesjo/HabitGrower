import { Box, CircularProgress } from "@mui/material";
import firebase from "firebase/compat/app";
import * as firebaseui from "firebaseui";
import "firebaseui/dist/firebaseui.css";
import { useEffect, useMemo } from "react";
import { redirect } from "react-router-dom";
import { getUser } from "../../firebase";
import { router } from "../../main";
import SignInLayout from "../../components/SignInLayout";
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
    <SignInLayout>
      <div id="firebaseui-auth-container"></div>
      <Box id="loader" sx={{ display: "flex", justifyContent: "center", py: 2 }}>
        <CircularProgress size={28} />
      </Box>
    </SignInLayout>
  );
}
