import { createTheme, CssBaseline, PaletteMode, ThemeProvider } from "@mui/material";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { useAtom } from "jotai";
import { DevTools } from "jotai-devtools";
import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../main";
import { themeAtom } from "../store";

export default function Main() {
  const [themeAtomValue] = useAtom<PaletteMode>(themeAtom);

  const theme = useMemo(
    () =>
      createTheme({
        palette: {
          mode: themeAtomValue,
          primary: {
            main: themeAtomValue === "dark" ? "#90c65b" : "#478523",
            light: themeAtomValue === "dark" ? "#b8e085" : "#6ba83f",
            dark: themeAtomValue === "dark" ? "#6b9342" : "#2d5a16",
          },
          secondary: {
            main: "#7d3dbc",
            light: themeAtomValue === "dark" ? "#a569d9" : "#9c5ad4",
            dark: themeAtomValue === "dark" ? "#5a2a87" : "#562a83",
          },
          success: {
            main: themeAtomValue === "dark" ? "#4caf50" : "#2e7d32",
            light: themeAtomValue === "dark" ? "#81c784" : "#66bb6a",
          },
          background: {
            default: themeAtomValue === "dark" ? "#1f1e23" : "#f8f9fa",
            paper: themeAtomValue === "dark" ? "#2a2a2f" : "#ffffff",
          },
        },
        shape: {
          borderRadius: 12,
        },
        typography: {
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
          h5: {
            fontWeight: 600,
            letterSpacing: "-0.02em",
          },
          body1: {
            lineHeight: 1.6,
          },
          body2: {
            lineHeight: 1.5,
          },
        },
        components: {
          MuiCssBaseline: {
            styleOverrides: {
              body: {
                scrollbarWidth: "thin",
                scrollbarColor: themeAtomValue === "dark" ? "#555 #1f1e23" : "#ccc #f8f9fa",
                "&::-webkit-scrollbar": {
                  width: "8px",
                },
                "&::-webkit-scrollbar-track": {
                  background: themeAtomValue === "dark" ? "#1f1e23" : "#f8f9fa",
                },
                "&::-webkit-scrollbar-thumb": {
                  background: themeAtomValue === "dark" ? "#555" : "#ccc",
                  borderRadius: "4px",
                },
              },
            },
          },
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
                boxShadow: "none",
                "&:hover": {
                  boxShadow: "0 2px 8px rgba(0,0,0,0.12)",
                },
              },
            },
          },
          MuiFab: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&:hover": {
                  boxShadow: "0 6px 16px rgba(0,0,0,0.2)",
                },
              },
            },
          },
          MuiPaper: {
            styleOverrides: {
              root: {
                backgroundImage: "none",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              },
              elevation1: {
                boxShadow:
                  themeAtomValue === "dark"
                    ? "0 2px 8px rgba(0,0,0,0.3), 0 0 0 1px rgba(255,255,255,0.05)"
                    : "0 2px 8px rgba(0,0,0,0.08), 0 0 0 1px rgba(0,0,0,0.02)",
              },
              elevation2: {
                boxShadow:
                  themeAtomValue === "dark"
                    ? "0 4px 16px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.08)"
                    : "0 4px 16px rgba(0,0,0,0.12), 0 0 0 1px rgba(0,0,0,0.04)",
              },
            },
          },
          MuiCard: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                boxShadow: themeAtomValue === "dark" ? "0 2px 8px rgba(0,0,0,0.3)" : "0 2px 8px rgba(0,0,0,0.08)",
              },
            },
          },
          MuiListItemButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                margin: "2px 0",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                  transform: "translateX(4px)",
                },
                "&.Mui-selected": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(144,198,91,0.12)" : "rgba(71,133,35,0.08)",
                  "&:hover": {
                    backgroundColor: themeAtomValue === "dark" ? "rgba(144,198,91,0.16)" : "rgba(71,133,35,0.12)",
                  },
                },
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                textTransform: "none",
                fontWeight: 500,
                border: "1.5px solid",
                borderColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.2)" : "rgba(0,0,0,0.2)",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  borderColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.4)" : "rgba(0,0,0,0.4)",
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  transform: "translateY(-1px)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                },
                "&.Mui-selected": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(144,198,91,0.15)" : "rgba(71,133,35,0.15)",
                  borderColor: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                  color: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: themeAtomValue === "dark" ? "rgba(144,198,91,0.2)" : "rgba(71,133,35,0.2)",
                  },
                },
                "&:active": {
                  transform: "translateY(0)",
                },
              },
            },
          },
          MuiMenu: {
            styleOverrides: {
              paper: {
                borderRadius: 16,
                marginTop: 8,
                minWidth: 180,
                boxShadow: themeAtomValue === "dark" ? "0 8px 32px rgba(0,0,0,0.4)" : "0 8px 32px rgba(0,0,0,0.12)",
                border: `1px solid ${themeAtomValue === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                backgroundImage: "none",
                "&:before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background:
                    themeAtomValue === "dark"
                      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(0,0,0,0.05), transparent)",
                },
              },
              list: {
                padding: "8px",
              },
            },
          },
          MuiMenuItem: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                margin: "2px 0",
                padding: "10px 16px",
                fontSize: "0.95rem",
                fontWeight: 500,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                  transform: "translateX(4px)",
                },
                "&.Mui-selected": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(144,198,91,0.12)" : "rgba(71,133,35,0.08)",
                  color: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                  fontWeight: 600,
                  "&:hover": {
                    backgroundColor: themeAtomValue === "dark" ? "rgba(144,198,91,0.16)" : "rgba(71,133,35,0.12)",
                  },
                },
                "&:active": {
                  transform: "translateX(2px)",
                },
              },
            },
          },
          MuiSelect: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-notchedOutline": {
                  borderRadius: 12,
                  transition: "all 0.2s ease-in-out",
                },
                "&:hover .MuiOutlinedInput-notchedOutline": {
                  borderColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                  borderWidth: 2,
                },
                "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                  borderWidth: 2,
                  borderColor: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                  boxShadow: `0 0 0 1px ${themeAtomValue === "dark" ? "#90c65b" : "#478523"}20`,
                },
              },
              icon: {
                transition: "transform 0.2s ease-in-out",
                ".Mui-focused &": {
                  transform: "rotate(180deg)",
                },
              },
            },
          },
          MuiIconButton: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.04)",
                  transform: "scale(1.1)",
                  boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                },
                "&:active": {
                  transform: "scale(0.95)",
                },
                "& .MuiSvgIcon-root": {
                  transition: "all 0.2s ease-in-out",
                },
                "&:hover .MuiSvgIcon-root": {
                  filter: "brightness(1.1)",
                },
              },
            },
          },
          MuiTooltip: {
            styleOverrides: {
              tooltip: {
                borderRadius: 8,
                fontSize: "0.8rem",
                fontWeight: 500,
                padding: "8px 12px",
                backgroundColor: themeAtomValue === "dark" ? "rgba(55, 55, 55, 0.95)" : "rgba(0, 0, 0, 0.9)",
                backdropFilter: "blur(8px)",
                boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                "&::before": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  height: "1px",
                  background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent)",
                },
              },
              arrow: {
                color: themeAtomValue === "dark" ? "rgba(55, 55, 55, 0.95)" : "rgba(0, 0, 0, 0.9)",
              },
            },
          },
          MuiSkeleton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
                "&::after": {
                  background:
                    themeAtomValue === "dark"
                      ? "linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)"
                      : "linear-gradient(90deg, transparent, rgba(0,0,0,0.04), transparent)",
                },
              },
              rectangular: {
                borderRadius: 12,
              },
              rounded: {
                borderRadius: 16,
              },
              circular: {
                borderRadius: "50%",
              },
            },
          },
          MuiBackdrop: {
            styleOverrides: {
              root: {
                backdropFilter: "blur(8px)",
                backgroundColor: themeAtomValue === "dark" ? "rgba(0,0,0,0.7)" : "rgba(0,0,0,0.5)",
              },
            },
          },
          MuiTabs: {
            styleOverrides: {
              root: {
                "& .MuiTabs-indicator": {
                  height: 3,
                  borderRadius: "3px 3px 0 0",
                  backgroundColor: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                },
              },
            },
          },
          MuiTab: {
            styleOverrides: {
              root: {
                textTransform: "none",
                fontWeight: 500,
                fontSize: "0.95rem",
                borderRadius: "12px 12px 0 0",
                margin: "0 4px",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
                  transform: "translateY(-2px)",
                },
                "&.Mui-selected": {
                  color: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                  fontWeight: 600,
                },
              },
            },
          },
          MuiCircularProgress: {
            styleOverrides: {
              root: {
                "& .MuiCircularProgress-circle": {
                  strokeLinecap: "round",
                },
              },
            },
          },
          MuiSnackbar: {
            styleOverrides: {
              root: {
                "& .MuiSnackbarContent-root": {
                  borderRadius: 12,
                  fontSize: "0.95rem",
                  fontWeight: 500,
                  padding: "12px 16px",
                },
              },
            },
          },
          MuiChip: {
            styleOverrides: {
              root: {
                padding: "4px 12px",
                borderRadius: 16,
                height: 32,
                fontSize: "0.875rem",
                fontWeight: 500,
                boxShadow: "none",
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
                  transform: "translateY(-1px)",
                },
                "&:active": {
                  transform: "translateY(0px)",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.1)",
                },
                "& .MuiChip-icon": {
                  fontSize: "1.1rem",
                  transition: "transform 0.2s ease-in-out",
                },
                "&:hover .MuiChip-icon": {
                  transform: "scale(1.1)",
                },
              },
              outlined: {
                borderWidth: 1.5,
                "&:hover": {
                  borderWidth: 1.5,
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.02)",
                },
              },
              filled: {
                "&:hover": {
                  filter: "brightness(1.1)",
                },
              },
            },
          },
          MuiTextField: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    "& > fieldset": {
                      borderColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                      borderWidth: 2,
                    },
                  },
                  "&.Mui-focused": {
                    "& > fieldset": {
                      borderWidth: 2,
                      boxShadow: `0 0 0 1px ${themeAtomValue === "dark" ? "#90c65b" : "#478523"}20`,
                    },
                  },
                },
                "& .MuiInputLabel-root": {
                  fontWeight: 500,
                  "&.Mui-focused": {
                    fontWeight: 600,
                  },
                },
              },
            },
          },
          MuiFormControl: {
            styleOverrides: {
              root: {
                "& .MuiOutlinedInput-root": {
                  borderRadius: 12,
                  transition: "all 0.2s ease-in-out",
                  "&:hover": {
                    "& > fieldset": {
                      borderColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.3)" : "rgba(0,0,0,0.3)",
                      borderWidth: 2,
                    },
                  },
                  "&.Mui-focused": {
                    "& > fieldset": {
                      borderWidth: 2,
                      boxShadow: `0 0 0 1px ${themeAtomValue === "dark" ? "#90c65b" : "#478523"}20`,
                    },
                  },
                },
                "& .MuiInputLabel-root": {
                  fontWeight: 500,
                  "&.Mui-focused": {
                    fontWeight: 600,
                  },
                },
              },
            },
          },
          MuiSwitch: {
            styleOverrides: {
              root: {
                width: 52,
                height: 32,
                padding: 0,
                margin: 8,
                "& .MuiSwitch-switchBase": {
                  margin: 4,
                  padding: 0,
                  transform: "translateX(6px)",
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&.Mui-checked": {
                    color: "#fff",
                    transform: "translateX(22px)",
                    "& .MuiSwitch-thumb": {
                      backgroundColor: "#fff",
                      width: 24,
                      height: 24,
                      boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                      transition: "all 0.2s ease-in-out",
                      "&:before": {
                        content: "''",
                        position: "absolute",
                        width: "100%",
                        height: "100%",
                        left: 0,
                        top: 0,
                        backgroundRepeat: "no-repeat",
                        backgroundPosition: "center",
                      },
                    },
                    "& + .MuiSwitch-track": {
                      backgroundColor: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                      opacity: 1,
                      border: "none",
                    },
                  },
                  "&.Mui-focusVisible .MuiSwitch-thumb": {
                    color: themeAtomValue === "dark" ? "#90c65b" : "#478523",
                    border: "6px solid #fff",
                  },
                  "&.Mui-disabled .MuiSwitch-thumb": {
                    color: themeAtomValue === "dark" ? "#424242" : "#f5f5f5",
                  },
                  "&.Mui-disabled + .MuiSwitch-track": {
                    opacity: 0.3,
                  },
                },
                "& .MuiSwitch-thumb": {
                  backgroundColor: themeAtomValue === "dark" ? "#fafafa" : "#fff",
                  width: 24,
                  height: 24,
                  boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
                  transition: "all 0.2s ease-in-out",
                  "&:before": {
                    content: "''",
                    position: "absolute",
                    width: "100%",
                    height: "100%",
                    left: 0,
                    top: 0,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "center",
                  },
                },
                "& .MuiSwitch-track": {
                  borderRadius: 16,
                  border: `1px solid ${themeAtomValue === "dark" ? "#424242" : "#e0e0e0"}`,
                  backgroundColor: themeAtomValue === "dark" ? "#424242" : "#e0e0e0",
                  opacity: 1,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                },
              },
            },
          },
          MuiBadge: {
            styleOverrides: {
              badge: {
                borderRadius: 12,
                height: 20,
                minWidth: 20,
                fontSize: "0.75rem",
                fontWeight: 600,
                padding: "0 6px",
                transform: "scale(1) translate(50%, -50%)",
                transformOrigin: "100% 0%",
                transition: "transform 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
              },
            },
          },
          MuiDialog: {
            styleOverrides: {
              paper: {
                borderRadius: 20,
                padding: "4px",
                backgroundImage: "none",
                boxShadow:
                  themeAtomValue === "dark"
                    ? "0 24px 48px rgba(0,0,0,0.4), 0 0 0 1px rgba(255,255,255,0.1)"
                    : "0 24px 48px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.05)",
                backdropFilter: "blur(20px)",
                backgroundColor: themeAtomValue === "dark" ? "rgba(42, 42, 47, 0.95)" : "rgba(255, 255, 255, 0.95)",
              },
            },
          },
          MuiDialogTitle: {
            styleOverrides: {
              root: {
                fontSize: "1.25rem",
                fontWeight: 600,
                padding: "20px 24px 16px",
                color: themeAtomValue === "dark" ? "#90c65b" : "#478523",
              },
            },
          },
          MuiDialogContent: {
            styleOverrides: {
              root: {
                padding: "0 24px 16px",
                fontSize: "0.95rem",
                lineHeight: 1.6,
              },
            },
          },
          MuiDialogActions: {
            styleOverrides: {
              root: {
                padding: "16px 24px 20px",
                gap: 12,
                "& .MuiButton-root": {
                  borderRadius: 12,
                  textTransform: "none",
                  fontWeight: 500,
                  minWidth: 80,
                },
              },
            },
          },
          MuiLinearProgress: {
            styleOverrides: {
              root: {
                height: 8,
                borderRadius: 8,
                backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)",
                overflow: "hidden",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 8,
                  transition: "transform 0.4s ease-in-out",
                },
                "& .MuiLinearProgress-bar1Buffer": {
                  transition: "transform 0.4s ease-in-out",
                },
                "& .MuiLinearProgress-bar2Buffer": {
                  transition: "transform 0.4s ease-in-out",
                },
              },
              buffer: {
                backgroundColor: "transparent",
              },
              determinate: {
                transition: "transform 0.4s ease-in-out",
              },
            },
          },
          MuiAvatar: {
            styleOverrides: {
              root: {
                fontWeight: 600,
                fontSize: "1rem",
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                border: `2px solid ${themeAtomValue === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.1)"}`,
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
                },
              },
            },
          },
          MuiList: {
            styleOverrides: {
              root: {
                padding: "8px 0",
                "& .MuiListItem-root": {
                  borderRadius: 12,
                  margin: "2px 8px",
                  transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                },
              },
            },
          },
          MuiListItem: {
            styleOverrides: {
              root: {
                borderRadius: 12,
                "&:hover": {
                  backgroundColor: themeAtomValue === "dark" ? "rgba(255,255,255,0.05)" : "rgba(0,0,0,0.03)",
                },
              },
            },
          },
          MuiListItemText: {
            styleOverrides: {
              primary: {
                fontWeight: 500,
                fontSize: "0.95rem",
              },
              secondary: {
                fontSize: "0.85rem",
                opacity: 0.8,
              },
            },
          },
          MuiCheckbox: {
            styleOverrides: {
              root: {
                borderRadius: 6,
                padding: 8,
                transition: "all 0.2s cubic-bezier(0.4, 0, 0.2, 1)",
                "& .MuiSvgIcon-root": {
                  fontSize: "1.5rem",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                },
              },
            },
          },
          MuiAlert: {
            styleOverrides: {
              root: {
                borderRadius: 16,
                fontSize: "0.95rem",
                fontWeight: 500,
                border: "1px solid",
                borderColor: "currentColor",
                "& .MuiAlert-icon": {
                  fontSize: "1.3rem",
                  filter: "drop-shadow(0 1px 2px rgba(0,0,0,0.1))",
                },
                "& .MuiAlert-action": {
                  alignItems: "center",
                  paddingTop: 0,
                  "& .MuiButton-root": {
                    borderRadius: 8,
                    textTransform: "none",
                    fontWeight: 600,
                  },
                },
              },
              standardSuccess: {
                backgroundColor: themeAtomValue === "dark" ? "rgba(76, 175, 80, 0.1)" : "rgba(76, 175, 80, 0.05)",
                borderColor: themeAtomValue === "dark" ? "rgba(76, 175, 80, 0.3)" : "rgba(76, 175, 80, 0.2)",
              },
              standardInfo: {
                backgroundColor: themeAtomValue === "dark" ? "rgba(33, 150, 243, 0.1)" : "rgba(33, 150, 243, 0.05)",
                borderColor: themeAtomValue === "dark" ? "rgba(33, 150, 243, 0.3)" : "rgba(33, 150, 243, 0.2)",
              },
              standardWarning: {
                backgroundColor: themeAtomValue === "dark" ? "rgba(255, 152, 0, 0.1)" : "rgba(255, 152, 0, 0.05)",
                borderColor: themeAtomValue === "dark" ? "rgba(255, 152, 0, 0.3)" : "rgba(255, 152, 0, 0.2)",
              },
              standardError: {
                backgroundColor: themeAtomValue === "dark" ? "rgba(244, 67, 54, 0.1)" : "rgba(244, 67, 54, 0.05)",
                borderColor: themeAtomValue === "dark" ? "rgba(244, 67, 54, 0.3)" : "rgba(244, 67, 54, 0.2)",
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
