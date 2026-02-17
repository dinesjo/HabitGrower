import { CssBaseline, PaletteMode, ThemeProvider } from "@mui/material";
import { alpha, createTheme } from "@mui/material/styles";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAtom } from "jotai";
import { DevTools } from "jotai-devtools";
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../main";
import { themeAtom } from "../store";

const bodyFont = '"Manrope", "Avenir Next", "Segoe UI", sans-serif';
const displayFont = '"Fraunces", "Iowan Old Style", "Georgia", serif';

export default function Main() {
  const [themeAtomValue] = useAtom<PaletteMode>(themeAtom);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeAtomValue,
          primary: {
            main: themeAtomValue === "dark" ? "#9ccf6b" : "#3f7f2d",
            light: themeAtomValue === "dark" ? "#c0e894" : "#5fa746",
            dark: themeAtomValue === "dark" ? "#78aa4f" : "#2b591f",
            contrastText: "#f7fbf7",
          },
          secondary: {
            main: themeAtomValue === "dark" ? "#f0af4e" : "#d98e2f",
            light: themeAtomValue === "dark" ? "#f6c67c" : "#e8aa5a",
            dark: themeAtomValue === "dark" ? "#c3811f" : "#9d6317",
          },
          success: {
            main: themeAtomValue === "dark" ? "#6ccf7c" : "#2f9f4b",
          },
          warning: {
            main: themeAtomValue === "dark" ? "#ffb347" : "#dd8f2d",
          },
          background: {
            default: themeAtomValue === "dark" ? "#0d1511" : "#f6faf5",
            paper: themeAtomValue === "dark" ? "#142019" : "#ffffff",
          },
          divider: themeAtomValue === "dark" ? alpha("#9ccf6b", 0.14) : alpha("#2f6c2a", 0.12),
        },
        shape: {
          borderRadius: 5,
        },
        typography: {
          fontFamily: bodyFont,
          h1: { fontFamily: displayFont, fontWeight: 700, letterSpacing: "-0.03em" },
          h2: { fontFamily: displayFont, fontWeight: 700, letterSpacing: "-0.03em" },
          h3: { fontFamily: displayFont, fontWeight: 700, letterSpacing: "-0.03em" },
          h4: { fontFamily: displayFont, fontWeight: 700, letterSpacing: "-0.02em" },
          h5: { fontFamily: displayFont, fontWeight: 700, letterSpacing: "-0.02em" },
          h6: { fontFamily: displayFont, fontWeight: 650, letterSpacing: "-0.015em" },
          subtitle1: { fontWeight: 600 },
          subtitle2: { fontWeight: 600 },
          button: {
            fontFamily: bodyFont,
            textTransform: "none",
            fontWeight: 700,
            letterSpacing: "0.01em",
          },
          overline: {
            fontSize: "0.67rem",
            letterSpacing: "0.14em",
            fontWeight: 800,
            textTransform: "uppercase",
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              ":root": {
                "--hg-radius": "18px",
                "--hg-radius-lg": "24px",
              },
              body: {
                minHeight: "100vh",
                fontFamily: bodyFont,
                backgroundColor: themeAtomValue === "dark" ? "#0d1511" : "#f6faf5",
                color: themeAtomValue === "dark" ? "#eaf4e7" : "#17331e",
                scrollbarWidth: "thin",
                scrollbarColor: themeAtomValue === "dark" ? "#46643a #0d1511" : "#c2d2bf #f6faf5",
                "&::-webkit-scrollbar": {
                  width: "8px",
                  height: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: themeAtomValue === "dark" ? "#0d1511" : "#f6faf5",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: themeAtomValue === "dark" ? "#46643a" : "#c2d2bf",
                  borderRadius: "99px",
                },
              },
              "#root": {
                minHeight: "100vh",
              },
              "::selection": {
                backgroundColor: themeAtomValue === "dark" ? alpha("#9ccf6b", 0.35) : alpha("#5fa746", 0.28),
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: ({ theme }) => ({
                backgroundImage: "none",
                border: `1px solid ${alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.22 : 0.12)}`,
              }),
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 22,
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 14,
                paddingInline: 16,
                boxShadow: "none",
                "&:hover": {
                  boxShadow:
                    theme.palette.mode === "dark"
                      ? "0 10px 24px rgba(0,0,0,0.28)"
                      : "0 10px 20px rgba(35, 70, 33, 0.16)",
                },
              }),
              containedPrimary: {
                background: "linear-gradient(125deg, #3f7f2d 0%, #5ca942 55%, #80c25c 100%)",
              },
            },
          },
          MuiFab: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 16,
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 12px 24px rgba(0,0,0,0.34)"
                    : "0 12px 24px rgba(32, 72, 28, 0.2)",
              }),
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 12,
                transition: "all 0.2s ease",
                "@media (hover: hover) and (pointer: fine)": {
                  "&:hover": {
                    backgroundColor: alpha(theme.palette.primary.main, 0.12),
                    transform: "translateY(-1px)",
                  },
                },
              }),
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 14,
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 12,
                borderColor: alpha(theme.palette.primary.main, 0.26),
                "&.Mui-selected": {
                  backgroundColor: alpha(theme.palette.primary.main, 0.18),
                  color: theme.palette.primary.main,
                  borderColor: alpha(theme.palette.primary.main, 0.42),
                },
              }),
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: ({ theme }) => ({
                borderRadius: 24,
                backdropFilter: "blur(12px)",
                backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.94 : 0.97),
                boxShadow:
                  theme.palette.mode === "dark"
                    ? "0 28px 44px rgba(0,0,0,0.45)"
                    : "0 28px 44px rgba(13, 33, 15, 0.2)",
              }),
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: ({ theme }) => ({
                "& .MuiOutlinedInput-root": {
                  borderRadius: 14,
                  backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.48 : 0.72),
                },
              }),
            },
          },
          MuiFormControl: {
            styleOverrides: {
              root: ({ theme }) => ({
                "& .MuiOutlinedInput-root": {
                  borderRadius: 14,
                  backgroundColor: alpha(theme.palette.background.paper, theme.palette.mode === "dark" ? 0.48 : 0.72),
                },
              }),
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: ({ theme }) => ({
                borderRadius: 99,
                height: 8,
                backgroundColor: alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.12),
              }),
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                borderRadius: 999,
                fontWeight: 700,
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: ({ theme }) => ({
                borderRadius: 10,
                padding: "8px 12px",
                backgroundColor: alpha(theme.palette.background.paper, 0.96),
                color: theme.palette.text.primary,
                border: `1px solid ${alpha(theme.palette.primary.main, 0.18)}`,
              }),
              arrow: ({ theme }) => ({
                color: alpha(theme.palette.background.paper, 0.96),
              }),
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 14,
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: ({ theme }) => ({
                border: `2px solid ${alpha(theme.palette.common.white, theme.palette.mode === "dark" ? 0.16 : 0.6)}`,
              }),
            },
          },
          MuiBadge: {
            styleOverrides: {
              badge: {
                fontWeight: 700,
              },
            },
          },
        },
      }),
    [themeAtomValue]
  );

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <ThemeProvider theme={theme}>
        <DevTools />
        <CssBaseline />
        <RouterProvider router={router} />
      </ThemeProvider>
    </LocalizationProvider>
  );
}
