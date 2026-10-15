import { Close } from "@mui/icons-material";
import {
  Alert,
  Box,
  GlobalStyles,
  IconButton,
  LinearProgress,
  Slide,
  Snackbar,
  Typography,
} from "@mui/material";
import { isLocalMode } from "../data/mode";
import { useAtom } from "jotai";
import { useCallback, useEffect, useState } from "react";
import { Outlet, ScrollRestoration, useLocation, useNavigation } from "react-router-dom";
import { checkedHabitIdsAtom, registrationAtom, snackbarActionAtom, snackbarMessageAtom, snackbarOpenAtom, snackbarSeverityAtom } from "../store";
import { ActionHeightContext, ActionSurface } from "../hooks/useActionSurfaceRef";
import { useRegistrationLifecycle } from "../hooks/useRegistrationLifecycle";

export default function Root() {
  useRegistrationLifecycle();
  const [actionHeights, setActionHeights] = useState({ register: 58, editor: 73 });
  const updateActionHeight = useCallback((surface: ActionSurface, height: number) => {
    const roundedHeight = Math.ceil(height);
    if (roundedHeight <= 0) return;
    setActionHeights((current) => current[surface] === roundedHeight ? current : { ...current, [surface]: roundedHeight });
  }, []);
  // Router
  const navigation = useNavigation();
  const location = useLocation();
  const loading = navigation.state === "loading";
  const [showLoading, setShowLoading] = useState(false);

  // Snackbar
  const [snackbarOpen] = useAtom(snackbarOpenAtom);
  const [snackbarMessage, setSnackbarMessage] = useAtom(snackbarMessageAtom);
  const [snackbarSeverity] = useAtom(snackbarSeverityAtom);
  const [snackbarAction] = useAtom(snackbarActionAtom);
  const [checkedHabitIds] = useAtom(checkedHabitIdsAtom);
  const [registration] = useAtom(registrationAtom);

  const isSignInPage = location.pathname === "/profile/signin";
  const isEditingHabit = location.pathname.endsWith("/edit");
  const hasPendingRegistration = location.pathname === "/" && (checkedHabitIds.length > 0 || registration?.phase === "saving" || registration?.phase === "saved");
  const safeBottom = "env(safe-area-inset-bottom, 0px)";
  const outletBottomPadding = isSignInPage ? 0 : isEditingHabit
    ? "calc(var(--hg-editor-height, 73px) + 24px)"
    : hasPendingRegistration
      ? `calc(var(--hg-register-height, 58px) + 40px + ${safeBottom})`
      : `calc(24px + ${safeBottom})`;
  const snackbarBottom = isSignInPage ? `calc(16px + ${safeBottom})` : isEditingHabit
    ? "calc(var(--hg-editor-height, 73px) + 16px)"
    : hasPendingRegistration
      ? `calc(var(--hg-register-height, 58px) + 32px + ${safeBottom})`
      : `calc(16px + ${safeBottom})`;
  const focusBottomPadding = isSignInPage ? `calc(16px + ${safeBottom})` : isEditingHabit
    ? `${actionHeights.editor + 24}px`
    : `calc(${hasPendingRegistration ? actionHeights.register + 40 : 24}px + ${safeBottom})`;

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => setShowLoading(true), 200); // delay
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timeoutId); // clear timeout on unmount or when loading changes
  }, [loading]);

  return (
    <ActionHeightContext.Provider value={updateActionHeight}>
      <GlobalStyles styles={{ html: {
        scrollPaddingBottom: focusBottomPadding,
        "--hg-register-height": `${actionHeights.register}px`,
        "--hg-editor-height": `${actionHeights.editor}px`,
      } }} />
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

      <Box
        sx={{
          minHeight: ["100vh", "100dvh"],
          display: "flex",
          flexDirection: "column",
          "& > main > *": {
            flex: 1,
            paddingBottom: outletBottomPadding,
            transition: location.pathname === "/" ? "padding-bottom 280ms ease" : undefined,
            boxSizing: "border-box",
          },
        }}
      >
        {isLocalMode && (
          <Box sx={{ px: 2, py: 1, bgcolor: (theme) => theme.palette.mode === "dark" ? "#102b1a" : "#e3f2df" }}>
            <Typography sx={{ fontSize: "0.8125rem", lineHeight: 1.5, color: "text.secondary" }}>
              Local demo · Saved in this browser
            </Typography>
          </Box>
        )}
        <Box component="main" sx={{ display: "flex", flexDirection: "column", flex: 1 }}>
          <Outlet />
        </Box>
      </Box>
      <ScrollRestoration />

      {/* Snackbar */}
      <Snackbar
        key={snackbarMessage}
        open={snackbarOpen}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
        slots={{ transition: Slide }}
        slotProps={{ transition: { direction: "up" } }}
        autoHideDuration={snackbarAction ? null : 4000}
        onClose={() => setSnackbarMessage("")}
        sx={{
          bottom: { xs: snackbarBottom, sm: snackbarBottom },
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
            flexWrap: "wrap",
            boxShadow: "0 4px 16px rgba(0,0,0,0.12)",
            "& .MuiAlert-message": { flex: "1 1 5rem", minWidth: 0, overflowWrap: "anywhere", lineHeight: 1.5 },
            "& .MuiAlert-action": { flexShrink: 0 },
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
    </ActionHeightContext.Provider>
  );
}
