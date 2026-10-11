import { lazy, Suspense } from "react";
import { CircularProgress } from "@mui/material";
import { Navigate } from "react-router-dom";
import { isLocalMode } from "../../data/mode";

const FirebaseSignInView = lazy(() => import("./FirebaseSignInView"));

export default function SignInView() {
  if (isLocalMode) return <Navigate to="/" replace />;
  return <Suspense fallback={<CircularProgress />}><FirebaseSignInView /></Suspense>;
}
