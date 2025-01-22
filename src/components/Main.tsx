import { useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { ThemeProvider } from "@emotion/react";
import { CssBaseline, PaletteMode, createTheme } from "@mui/material";
import { useAtom } from "jotai";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { themeAtom } from "../store";
import { DevTools } from "jotai-devtools";
import { router } from "../main";

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
