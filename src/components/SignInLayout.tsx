import { Box, Theme, Typography } from "@mui/material";
import { ReactNode } from "react";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../styles/designLanguage";

export default function SignInLayout({ children }: { children: ReactNode }) {
  return (
    <Box sx={{ ...ambientPageSx, minHeight: ["100vh", "100dvh"], display: "flex", flexDirection: "column", alignItems: "center", px: 2, py: 4 }}>
      <Box sx={{ ...contentLayerSx, width: "100%", maxWidth: 420, my: "auto" }}>
        <Box sx={{ textAlign: "center", mb: 4 }}>
          <Typography component="h1" variant="h3" sx={{ fontSize: { xs: "clamp(2rem, 16vw, 2.75rem)", sm: "3rem" }, lineHeight: 1.1, mb: 1.5 }}>
            Habit<wbr /><Box component="span" sx={{ color: "primary.main" }}>Grower</Box>
          </Typography>
          <Typography color="text.secondary" sx={{ maxWidth: 300, mx: "auto", lineHeight: 1.6 }}>
            Build better habits, one day at a time
          </Typography>
        </Box>

        <Box sx={{ ...glassPanelSx, overflow: "hidden" }}>
          <Box sx={{ height: 3, bgcolor: "primary.main" }} />
          <Box sx={{ p: { xs: 2.5, sm: 3 }, ...authControlsSx }}>
            {children}
          </Box>
        </Box>
      </Box>
    </Box>
  );
}

const authControlsSx = {
  "& .firebaseui-container": { bgcolor: "transparent", color: "text.primary", fontFamily: "inherit", boxShadow: "none", maxWidth: "none", minHeight: 0 },
  "& .firebaseui-card-content, & .firebaseui-card-footer": { px: 0 },
  "& .firebaseui-card-header": { px: 0, pt: 0, borderColor: "divider" },
  "& .firebaseui-title, & .firebaseui-subtitle, & .firebaseui-text, & .firebaseui-input, & .firebaseui-input-invalid": { color: "text.primary", fontFamily: "inherit" },
  "& .firebaseui-input-floating-button": {
    width: 44,
    height: 44,
    top: 10,
    right: -8,
    borderRadius: "var(--hg-control-radius)",
    opacity: 0.7,
    filter: (theme: Theme) => theme.palette.mode === "dark" ? "brightness(0) invert(1)" : "none",
    "&:focus-visible": { outline: "2px solid currentColor" },
  },
  "& .firebaseui-input[type='password'], & .firebaseui-id-new-password": { pr: 5 },
  "& .firebaseui-label": { color: "text.secondary", fontFamily: "inherit" },
  "& .firebaseui-link": { color: "primary.main", fontFamily: "inherit" },
  "& .firebaseui-text-input-error": { color: "error.main" },
  "& .firebaseui-textfield:not(.firebaseui-textfield-invalid) .firebaseui-input": { borderColor: "divider" },
  "& .firebaseui-textfield:not(.firebaseui-textfield-invalid) .firebaseui-label::after": { bgcolor: "primary.main" },
  "& .mdl-button": { height: 48, minHeight: 48, borderRadius: "var(--hg-control-radius)", fontFamily: "inherit", textTransform: "none", fontWeight: 600, boxShadow: "none" },
  "& .mdl-button:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 3 },
  "& .firebaseui-button:not(.mdl-button--raised)": { color: "primary.main" },
  "& .mdl-button--raised:not(:disabled), & .firebaseui-idp-password": { bgcolor: "#326522", color: "#fff", boxShadow: "none" },
  "& .firebaseui-idp-button": { width: "100%", maxWidth: "none", height: "auto", py: 1.5 },
  "& .firebaseui-idp-google:not(:disabled)": { bgcolor: "#fff", color: "#353f35", border: "1px solid", borderColor: "#d9dfd6" },
  "& .firebaseui-idp-google .firebaseui-idp-text": { color: "#353f35" },
  "& .firebaseui-idp-text": { fontFamily: "inherit", fontWeight: 600 },
} as const;
