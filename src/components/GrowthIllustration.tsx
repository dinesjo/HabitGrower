import { Box, useTheme } from "@mui/material";
import { useId } from "react";

interface Props {
  variant: "seedling" | "flourish";
  width?: number;
}

/** Decorative botanical marks, shaped after the app icon's upward-pointing leaf. */
export default function GrowthIllustration({ variant, width = variant === "seedling" ? 144 : 72 }: Props) {
  const theme = useTheme();
  const dark = theme.palette.mode === "dark";
  const gradientId = `growth-leaf-${useId().replace(/:/g, "")}`;
  const stem = dark ? "#89b965" : "#527d3b";
  const vein = dark ? "#3b6532" : "#315b25";
  const ground = dark ? "#83ad6b" : "#668d51";
  const grown = variant === "flourish";

  return (
    <Box component="svg" viewBox="0 0 160 128" width={width} height={width * 0.8}
      aria-hidden="true" focusable="false" sx={{ display: "block", flexShrink: 0, overflow: "visible" }}>
      <defs>
        <linearGradient id={gradientId} x1="48" y1="24" x2="108" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor={dark ? "#c0e894" : "#9bc971"} />
          <stop offset="1" stopColor={dark ? "#7faf54" : "#4f8536"} />
        </linearGradient>
      </defs>

      <ellipse cx="80" cy="112" rx="37" ry="5" fill={ground} opacity={dark ? 0.09 : 0.1} />
      <path d="M46 110C62 105 99 105 114 110" fill="none" stroke={ground} strokeWidth="1.5" strokeLinecap="round" opacity="0.5" />

      {grown ? (
        <>
          <path d="M79 110C77 92 82 69 84 53" fill="none" stroke={stem} strokeWidth="3.5" strokeLinecap="round" />
          <g fill={`url(#${gradientId})`}>
            <path d="M79 88C58 92 40 79 36 53C59 53 78 66 79 88Z" opacity="0.85" />
            <path d="M82 63C76 42 91 22 120 14C121 39 108 59 82 63Z" />
            <path d="M81 102C82 81 99 71 120 73C116 92 101 105 81 102Z" />
          </g>
          <g fill="none" stroke={vein} strokeWidth="1.25" strokeLinecap="round" opacity="0.35">
            <path d="M77 85C64 76 52 66 43 59" />
            <path d="M85 59C95 43 106 29 115 20" />
            <path d="M84 99C94 89 104 81 114 77" />
          </g>
          <g stroke={theme.palette.secondary.main} strokeWidth="1.5" strokeLinecap="round" opacity="0.8">
            <path d="M130 43V51M126 47H134" />
            <path d="M37 31V36M34.5 33.5H39.5" />
          </g>
          <circle cx="125" cy="90" r="1.5" fill={ground} opacity="0.65" />
        </>
      ) : (
        <>
          <path d="M79 110C79 97 77 88 81 76" fill="none" stroke={stem} strokeWidth="3.5" strokeLinecap="round" />
          <g fill={`url(#${gradientId})`}>
            <path d="M79 94C63 96 48 85 45 67C63 66 78 78 79 94Z" opacity="0.85" />
            <path d="M79 84C76 64 91 46 116 40C116 62 104 81 79 84Z" />
          </g>
          <g fill="none" stroke={vein} strokeWidth="1.25" strokeLinecap="round" opacity="0.35">
            <path d="M76 91C64 83 57 77 51 72" />
            <path d="M82 81C92 69 100 60 109 50" />
          </g>
          <path d="M66 112H59M101 112H96" stroke={ground} strokeWidth="1.5" strokeLinecap="round" opacity="0.45" />
        </>
      )}
    </Box>
  );
}
