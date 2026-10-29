import { CssBaseline, PaletteMode, ThemeProvider } from "@mui/material";
import { createAppTheme } from "../styles/theme";
import { useAtom } from "jotai";
import { lazy, Suspense, useMemo } from "react";
import { RouterProvider } from "react-router-dom";
import { router } from "../main";
import { themeAtom } from "../store";
import "@fontsource-variable/manrope";
import "@fontsource-variable/fraunces/opsz.css";

const DevTools = import.meta.env.DEV && import.meta.env.VITE_SHOW_DEVTOOLS === "true"
  ? lazy(async () => {
      const { DevTools } = await import("jotai-devtools");
      await import("jotai-devtools/styles.css");
      return { default: DevTools };
    })
  : null;

export default function Main() {
  const [themeAtomValue] = useAtom<PaletteMode>(themeAtom);

  const theme = useMemo(
    () =>
      createAppTheme(themeAtomValue),
    [themeAtomValue]
  );

  return (
    <ThemeProvider theme={theme}>
      {DevTools && (
        <Suspense fallback={null}>
          <DevTools />
        </Suspense>
      )}
      <CssBaseline />
      <RouterProvider router={router} />
    </ThemeProvider>
  );
}
