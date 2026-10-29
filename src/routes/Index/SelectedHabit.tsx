import { EditOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Button, Fade, LinearProgress, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useLoaderData, useNavigate, useParams } from "react-router-dom";
import { useAtomValue } from "jotai";
import BackButton from "../../components/BackButton";
import DeleteHabitWithConfirm from "../../components/DeleteHabitWithConfirm";
import HabitHeatmap from "../../components/HabitHeatmap";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";
import { iconMap } from "../../constants/iconMap";
import { Habit } from "../../types/Habit";
import { alphaOrFallback, readableHabitColor } from "../../utils/color";
import { getProgress, toFriendlyFrequency } from "../../utils/helpers";
import { userWeekStartsAtMondayAtom } from "../../store";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../../styles/designLanguage";
import SelectedHabitGraph from "./SelectedHabitGraph";
import SelectedHabitList from "./SelectedHabitList";

export default function SelectedHabit() {
  const { habit } = useLoaderData() as { habit: Habit };
  const { id } = useParams();
  const navigate = useNavigate();

  const userWeekStartsAtMonday = useAtomValue(userWeekStartsAtMondayAtom);
  const progress = getProgress(habit, false, userWeekStartsAtMonday);
  const periodLabel = habit.frequencyUnit === "day" ? "Today" : habit.frequencyUnit === "week" ? "This week" : "This month";
  const hasHistory = Boolean(habit.dates && Object.keys(habit.dates).length);
  return (
    <Box sx={ambientPageSx}>
      {/* ── Header ── */}
      <Fade in timeout={160}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(15, 35, 22, 0.72) 0%, rgba(15, 35, 22, 0.2) 100%)"
                : "linear-gradient(180deg, rgba(226, 241, 222, 0.78) 0%, rgba(226, 241, 222, 0.25) 100%)",
            borderBottom: 1,
            borderColor: (theme) => alpha(theme.palette.primary.main, theme.palette.mode === "dark" ? 0.24 : 0.12),
          }}
        >
          {/* Back button row */}
          <Box sx={{ ...contentLayerSx, px: 1, pt: 1 }}>
            <BackButton />
          </Box>

          {/* Habit identity + actions */}
          {habit && id && (
            <Box sx={{ ...contentLayerSx, display: "flex", flexDirection: "column", alignItems: "center", px: 3, pt: 0.5, pb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: habit.color || "primary.main",
                  color: (theme) => theme.palette.getContrastText(alphaOrFallback(habit.color, theme.palette.primary.main, 1)),
                  width: 56,
                  height: 56,
                  fontSize: "1.75rem",
                  mb: 1.5,
                }}
              >
                {iconMap[habit.icon]}
              </Avatar>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <Typography
                  variant="h5"
                  component="h1"
                  sx={{
                    color: (theme) => readableHabitColor(habit.color, theme.palette.background.paper, theme.palette.text.primary),
                    fontWeight: 700,
                    lineHeight: 1.3,
                    overflowWrap: "anywhere",
                    textAlign: "center",
                  }}
                >
                  {habit.name}
                </Typography>
              </Box>
              {habit.description && (
                <Typography
                  variant="body2"
                  color="text.secondary"
                  sx={{
                    lineHeight: 1.4,
                    wordBreak: "break-word",
                    textAlign: "center",
                    maxWidth: 320,
                    mb: 0.5,
                  }}
                >
                  {habit.description}
                </Typography>
              )}

              <HabitNotificationIndicator sx={{ mt: 1 }} habit={habit} />

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(`/${id}/edit`)}
                  sx={{
                    borderRadius: "var(--hg-control-radius)",
                    fontWeight: 700,
                    px: 2,
                  }}
                >
                  Edit
                </Button>
                <DeleteHabitWithConfirm habit={habit} id={id} />
              </Box>
            </Box>
          )}
        </Box>
      </Fade>

      {!habit || !id ? (
        <Fade in timeout={160}>
          <Box sx={{ pt: 1.5, px: 2 }}>
            <Alert severity="error">
              <AlertTitle>Habit not found! Please check the ID in the URL is correct.</AlertTitle>
            </Alert>
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={160}>
          <Box sx={{ ...contentLayerSx, pt: 2, px: 2, pb: 2, mx: "auto", maxWidth: 600 }}>
            {/* Summary */}
            {habit.frequency && habit.frequencyUnit && (
              <Box
                sx={{
                  ...glassPanelSx,
                  mb: 2,
                  p: 2,
                  display: "grid",
                  gridTemplateColumns: "repeat(2, minmax(0, 1fr))",
                  gap: 2,
                  rowGap: 1.5,
                  borderLeft: 3,
                  borderLeftColor: habit.color || "primary.main",

                }}
              >
                <Box textAlign="center">
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.75rem" }}
                  >
                    Goal
                  </Typography>
                  <Typography variant="body1" sx={{ color: "text.primary", fontWeight: 600 }}>
                    {toFriendlyFrequency(habit)}
                  </Typography>
                </Box>
                <Box textAlign="center">
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.75rem" }}
                  >
                    {periodLabel}
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700, fontVariantNumeric: "tabular-nums" }}>
                    {Math.round(progress)}%
                  </Typography>
                </Box>
                <LinearProgress
                  variant="determinate"
                  value={progress}
                  aria-label={`Registered progress ${periodLabel.toLowerCase()}`}
                  sx={{ gridColumn: "1 / -1", height: 6, bgcolor: "action.hover", "& .MuiLinearProgress-bar": { bgcolor: (theme) => readableHabitColor(habit.color, theme.palette.background.paper, theme.palette.primary.main, 3) } }}
                />
              </Box>
            )}

            <SelectedHabitGraph habit={habit} />
            {hasHistory && <HabitHeatmap habit={habit} />}
            {hasHistory && <SelectedHabitList habit={habit} />}
          </Box>
        </Fade>
      )}
    </Box>
  );
}
