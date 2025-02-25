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
          },
          secondary: {
            main: "#7d3dbc",
          },
          background: {
            default: themeAtomValue === "dark" ? "#1f1e23" : "#f0f0f0",
            paper: themeAtomValue === "dark" ? "#080809" : "#fff",
          },
        },
        shape: {
          borderRadius: 16,
        },
        components: {
          MuiButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiToggleButton: {
            styleOverrides: {
              root: {
                borderRadius: 8,
              },
            },
          },
          MuiButtonGroup: {
            styleOverrides: {
              root: {
                borderRadius: 8,
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
