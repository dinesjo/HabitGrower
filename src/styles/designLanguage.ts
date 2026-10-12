import { Theme } from "@mui/material";

export const ambientPageSx = {
  position: "relative",
  minHeight: "100%",
  overflowX: "clip",
  background: (theme: Theme) => theme.palette.mode === "dark"
    ? "linear-gradient(180deg, #122019 0%, #0d1511 420px)"
    : "linear-gradient(180deg, #edf4e9 0%, #f6faf5 420px)",
} as const;

export const contentLayerSx = {
  position: "relative",
  zIndex: 1,
} as const;

export const glassPanelSx = {
  borderRadius: "var(--hg-radius)",
  border: "1px solid",
  borderColor: "divider",
  bgcolor: "background.paper",
  boxShadow: (theme: Theme) => theme.palette.mode === "dark" ? "none" : "0 2px 8px rgba(20,44,26,0.04)",
} as const;

export const sectionLabelSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 1.5,
} as const;

export const confirmationPaperSx = {
  position: { xs: "fixed", sm: "relative" },
  bottom: { xs: 0, sm: "auto" },
  m: { xs: 0, sm: 3 },
  width: { xs: "100%", sm: "calc(100% - 48px)" },
  maxWidth: 480,
  maxHeight: "calc(100dvh - 24px)",
  borderRadius: { xs: "24px 24px 0 0", sm: "var(--hg-radius-lg)" },
  borderColor: "divider",
} as const;

export const confirmationFormStyle = {
  display: "flex",
  flexDirection: "column",
  minHeight: 0,
} as const;

export const confirmationActionsSx = {
  display: "grid",
  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
  gap: 1.5,
  px: 3,
  pt: 2,
  pb: "calc(20px + env(safe-area-inset-bottom, 0px))",
  borderTop: 1,
  borderColor: "divider",
  "& > :not(style) ~ :not(style)": { ml: 0 },
} as const;

export const mobileTimePickerDialogSx = {
  "& .MuiDialog-paper": {
    m: 1,
    minWidth: 0,
    width: "calc(100% - 16px)",
    maxWidth: 360,
    maxHeight: "calc(100dvh - 16px)",
  },
  "& .MuiTimeClock-root": { width: "100%", pt: 5, maxHeight: "none" },
  "& .MuiTimeClock-arrowSwitcher": { top: 0 },
  "& .MuiClock-clock": { bgcolor: "action.hover" },
  "& .MuiTimePickerToolbar-root": { p: 2 },
  "& .MuiTimePickerToolbar-hourMinuteLabel .MuiTypography-root": {
    fontFamily: "inherit",
    fontSize: "2.5rem",
    fontWeight: 600,
    fontVariantNumeric: "tabular-nums",
    letterSpacing: "-0.02em",
  },
  "& .MuiDialogActions-root": { px: 2, py: 1.5 },
} as const;
