import { alpha } from "@mui/material/styles";

const MUI_ALPHA_SAFE_PATTERN = /^(#([0-9a-f]{3,8})|rgba?\(|hsla?\(|color\()/i;

const LEGACY_NAMED_COLORS: Record<string, string> = {
  slategray: "#708090",
  steelblue: "#4682B4",
  skyblue: "#87CEEB",
  slateblue: "#6A5ACD",
  mediumseagreen: "#3CB371",
  lightgreen: "#90EE90",
  forestgreen: "#228B22",
  tomato: "#FF6347",
  salmon: "#FA8072",
  orange: "#FFA500",
  palevioletred: "#DB7093",
  sandybrown: "#F4A460",
};

function normalizeColor(color: string) {
  return LEGACY_NAMED_COLORS[color.toLowerCase()] || color;
}

export function alphaOrFallback(color: string | undefined, fallback: string, opacity: number): string {
  if (!color) {
    return alpha(fallback, opacity);
  }

  const normalized = normalizeColor(color.trim());
  if (MUI_ALPHA_SAFE_PATTERN.test(normalized)) {
    return alpha(normalized, opacity);
  }

  return alpha(fallback, opacity);
}
