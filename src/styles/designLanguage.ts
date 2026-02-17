import { Theme } from "@mui/material";
import { alpha } from "@mui/material/styles";

export const ambientPageSx = {
  position: "relative",
  minHeight: "100%",
  overflow: "hidden",
  background: (theme: Theme) =>
    theme.palette.mode === "dark"
      ? "linear-gradient(162deg, #070d0a 0%, #0f1f17 40%, #121f1a 68%, #0c1411 100%)"
      : "linear-gradient(162deg, #f5faf5 0%, #ebf5ea 42%, #f0f7ef 68%, #f7fbf7 100%)",
  "&::before": {
    content: '""',
    position: "absolute",
    inset: 0,
    backgroundImage: (theme: Theme) =>
      theme.palette.mode === "dark"
        ? `radial-gradient(${alpha("#9ccf6b", 0.14)} 1px, transparent 1px)`
        : `radial-gradient(${alpha("#2e7d32", 0.08)} 1px, transparent 1px)`,
    backgroundSize: "26px 26px",
    pointerEvents: "none",
  },
  "&::after": {
    content: '""',
    position: "absolute",
    inset: 0,
    background: (theme: Theme) =>
      theme.palette.mode === "dark"
        ? "radial-gradient(circle at 80% -5%, rgba(156, 207, 107, 0.24) 0%, rgba(156, 207, 107, 0.02) 35%, transparent 58%), radial-gradient(circle at 8% 84%, rgba(217, 142, 47, 0.16) 0%, rgba(217, 142, 47, 0.01) 38%, transparent 63%)"
        : "radial-gradient(circle at 80% -5%, rgba(76, 175, 80, 0.18) 0%, rgba(76, 175, 80, 0.03) 35%, transparent 62%), radial-gradient(circle at 8% 84%, rgba(217, 142, 47, 0.12) 0%, rgba(217, 142, 47, 0.02) 34%, transparent 61%)",
    pointerEvents: "none",
  },
} as const;

export const contentLayerSx = {
  position: "relative",
  zIndex: 1,
} as const;

export const glassPanelSx = {
  borderRadius: 4,
  border: "1px solid",
  borderColor: (theme: Theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.25 : 0.14),
  bgcolor: (theme: Theme) => alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.78 : 0.85),
  boxShadow: (theme: Theme) =>
    theme.palette.mode === "dark"
      ? "0 10px 30px rgba(0,0,0,0.34), inset 0 1px 0 rgba(255,255,255,0.04)"
      : "0 10px 30px rgba(20, 44, 26, 0.1), inset 0 1px 0 rgba(255,255,255,0.65)",
  backdropFilter: "blur(14px)",
} as const;

export const sectionLabelSx = {
  display: "flex",
  alignItems: "center",
  gap: 1,
  mb: 1.5,
  "&::before": {
    content: '""',
    width: 10,
    height: 10,
    borderRadius: "50%",
    bgcolor: "secondary.main",
    boxShadow: (theme: Theme) => `0 0 0 3px ${alpha(theme.palette.secondary.main, 0.2)}`,
  },
} as const;
