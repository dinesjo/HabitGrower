import { Check, Close } from "@mui/icons-material";
import { Avatar, Box, Button, CircularProgress, Fade, IconButton, Tooltip, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { visuallyHidden } from "@mui/utils";
import { useEffect, useMemo, useState } from "react";
import type { Habit } from "../types/Habit";
import type { RegistrationState } from "../utils/habitRegistration";
import { registrationLoadingDelayRemaining } from "../utils/habitRegistration";
import { useActionSurfaceRef } from "../hooks/useActionSurfaceRef";
import { iconMap } from "../constants/iconMap";
import { alphaOrFallback } from "../utils/color";

interface Props {
  habits: Habit[];
  selected: string[];
  registration: RegistrationState | null;
  disabled: boolean;
  onDismissError: () => void;
}

export default function RegisterAction({ habits, selected, registration, disabled, onDismissError }: Props) {
  const registerRef = useActionSurfaceRef("register");
  const saving = registration?.phase === "saving";
  const savingBatch = saving ? registration.batch : null;
  const saved = registration?.phase === "saved" && !selected.length;
  const failed = registration?.phase === "error" && selected.length > 0;
  const ids = saving || saved ? registration.batch.habitIds : selected;
  const visible = !!ids.length;
  const [slowSave, setSlowSave] = useState(false);

  useEffect(() => {
    setSlowSave(false);
    if (!savingBatch) return;
    const timeout = window.setTimeout(() => setSlowSave(true), registrationLoadingDelayRemaining(savingBatch));
    return () => window.clearTimeout(timeout);
  }, [savingBatch]);

  const currentHabits = useMemo(() => ids.map((id) => habits.find((habit) => habit.id === id)).filter((habit): habit is Habit => !!habit), [habits, ids]);
  // Preserve the icons and confirmation until the exit fade has finished.
  const [lastContent, setLastContent] = useState({ habits: currentHabits, saved });
  useEffect(() => {
    if (visible) setLastContent({ habits: currentHabits, saved });
  }, [visible, currentHabits, saved]);
  const selectedHabits = visible ? currentHabits : lastContent.habits;
  const confirmation = visible ? saved : lastContent.saved;
  const names = selectedHabits.map((habit) => habit.name).join(", ");
  const feedback = saved ? `Check-in added: ${names}` : saving ? slowSave ? `Still saving: ${names}` : `Adding: ${names}` : `Selected: ${names}`;

  return (
    <Box sx={{ position: "fixed", bottom: "calc(16px + env(safe-area-inset-bottom, 0px))", left: 0, width: "100%", display: "flex", justifyContent: "center", pointerEvents: "none", zIndex: 1000 }}>
      <Fade in={visible} timeout={{ enter: 120, exit: 160 }}>
        <Box
          ref={registerRef}
          aria-hidden={!visible}
          sx={{
            maxWidth: "calc(100% - 32px)",
            pointerEvents: visible ? "auto" : "none",
            border: "1px solid",
            borderColor: failed ? "error.main" : (theme) => alpha(theme.palette.primary.main, 0.28),
            borderRadius: "var(--hg-radius)",
            bgcolor: "background.paper",
            boxShadow: (theme) => theme.palette.mode === "dark"
              ? "0 8px 28px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)"
              : "0 8px 28px rgba(23,45,22,0.14), 0 2px 6px rgba(23,45,22,0.05)",
          }}
        >
          <Button
            type="submit"
            disableRipple
            disabled={disabled || saving || saved || !selected.length}
            aria-label={saved ? `Check-in added: ${names}` : saving ? `Saving check-ins: ${names}` : `${failed ? "Retry check-in" : "Check in"}: ${names}`}
            aria-busy={saving}
            sx={{
              p: 0.75,
              width: "100%",
              minWidth: 0,
              color: "text.primary",
              borderRadius: "inherit",
              gap: 1,
              "&.Mui-disabled": { color: "text.primary" },
              "&:hover": { bgcolor: "transparent" },
              "&:focus-visible": { outline: "2px solid", outlineColor: "primary.main", outlineOffset: 4 },
              "&:hover .hg-check-in-label": { bgcolor: "primary.dark" },
              "&:active .hg-check-in-label": { transform: "scale(0.97)" },
            }}
          >
            <Box component="span" aria-hidden="true" sx={{ display: "flex", minWidth: 0, maxWidth: 208, overflowX: "auto", scrollbarWidth: "none", "&::-webkit-scrollbar": { display: "none" }, p: 0.5 }}>
              {selectedHabits.map((habit) => (
                <Tooltip key={habit.id} title={habit.name} placement="top" arrow>
                  <Avatar
                    component="span"
                    sx={{
                      width: 34,
                      height: 34,
                      flexShrink: 0,
                      bgcolor: habit.color || "primary.main",
                      color: (theme) => theme.palette.getContrastText(alphaOrFallback(habit.color, theme.palette.primary.main, 1)),
                      border: "2px solid",
                      borderColor: "background.paper",
                      ml: -0.75,
                      "&:first-of-type": { ml: 0 },
                      "& .MuiSvgIcon-root": { fontSize: 20 },
                      animation: "habit-arrive 180ms cubic-bezier(0.2, 0.8, 0.2, 1) both",
                      "@keyframes habit-arrive": { from: { opacity: 0, transform: "translateY(5px) scale(0.85)" }, to: { opacity: 1, transform: "translateY(0) scale(1)" } },
                    }}
                  >
                    {iconMap[habit.icon] || iconMap.Default}
                  </Avatar>
                </Tooltip>
              ))}
            </Box>
            <Box
              component="span"
              className="hg-check-in-label"
              sx={{
                display: "flex", alignItems: "center", justifyContent: "center", gap: 0.75,
                flexShrink: 0, minWidth: 112, minHeight: 44, px: 1.5,
                borderRadius: "var(--hg-control-radius)",
                bgcolor: confirmation ? "transparent" : "primary.main",
                color: confirmation ? "primary.main" : "primary.contrastText",
                transition: "background-color 180ms ease, color 180ms ease, transform 120ms ease",
              }}
            >
              {saving && slowSave ? <CircularProgress size={17} color="inherit" /> : <Check sx={{ fontSize: 20 }} />}
              <Box component="span" sx={{ fontSize: "0.875rem", whiteSpace: "nowrap" }}>{confirmation ? "Added" : saving && slowSave ? "Saving…" : failed ? "Try again" : "Check in"}</Box>
            </Box>
          </Button>
          <Box component="span" role={visible ? "status" : undefined} aria-live={visible ? "polite" : undefined} aria-atomic="true" sx={visuallyHidden}>{visible ? feedback : ""}</Box>
          {failed && (
            <Box sx={{ display: "flex", alignItems: "center", gap: 0.5, pl: 1.5, pr: 0.5, pb: 0.75, maxWidth: 320 }}>
              <Typography role="alert" sx={{ fontSize: "0.8125rem", color: "error.main", flex: 1, lineHeight: 1.5 }}>
                Couldn't save. Your check-ins are still selected.
              </Typography>
              <IconButton size="small" aria-label="Dismiss registration error" onClick={onDismissError}><Close sx={{ fontSize: 18 }} /></IconButton>
            </Box>
          )}
        </Box>
      </Fade>
    </Box>
  );
}
