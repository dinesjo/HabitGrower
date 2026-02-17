import { EditOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Button, Fade, Typography } from "@mui/material";
import { alpha } from "@mui/material/styles";
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import DeleteHabitWithConfirm from "../../components/DeleteHabitWithConfirm";
import HabitHeatmap from "../../components/HabitHeatmap";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";
import { iconMap } from "../../constants/iconMap";
import { fetchHabitById } from "../../services/habitsPersistance";
import { Habit } from "../../types/Habit";
import { alphaOrFallback } from "../../utils/color";
import { toFriendlyFrequency } from "../../utils/helpers";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../../styles/designLanguage";
import SelectedHabitGraph from "./SelectedHabitGraph";
import SelectedHabitList from "./SelectedHabitList";

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  return {
    habit: await fetchHabitById(id),
  };
}

SelectedHabit.loader = loader;

export default function SelectedHabit() {
  const { habit } = useLoaderData() as { habit: Habit };
  const { id } = useParams();
  const navigate = useNavigate();

  const registerCount = habit.dates ? Object.keys(habit.dates).length : 0;
  return (
    <Box sx={ambientPageSx}>
      {/* ── Header ── */}
      <Fade in timeout={400}>
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
                  bgcolor: habit.color || "text.primary",
                  width: 56,
                  height: 56,
                  fontSize: "1.75rem",
                  mb: 1.5,
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? `0 12px 24px ${habit.color || "rgba(156, 207, 107, 0.3)"}55`
                      : `0 10px 20px ${habit.color || "rgba(63, 127, 45, 0.2)"}45`,
                }}
              >
                {iconMap[habit.icon]}
              </Avatar>
              <Box sx={{ display: "flex", alignItems: "center", gap: 0.75, mb: 0.5 }}>
                <Typography
                  variant="h5"
                  sx={{
                    color: habit.color || "text.primary",
                    fontWeight: 700,
                    lineHeight: 1.2,
                    textAlign: "center",
                  }}
                >
                  {habit.name}
                </Typography>
                <HabitNotificationIndicator sx={{ color: habit.color }} habit={habit} />
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

              {/* Actions */}
              <Box sx={{ display: "flex", gap: 1, mt: 1.5 }}>
                <Button
                  variant="contained"
                  color="primary"
                  size="medium"
                  startIcon={<EditOutlined />}
                  onClick={() => navigate(`/${id}/edit`)}
                  sx={{
                    borderRadius: 3,
                    textTransform: "none",
                    fontWeight: 500,
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
        <Fade in timeout={600}>
          <Box sx={{ pt: 1.5, px: 2 }}>
            <Alert severity="error">
              <AlertTitle>Habit not found! Please check the ID in the URL is correct.</AlertTitle>
            </Alert>
          </Box>
        </Fade>
      ) : (
        <Fade in timeout={600}>
          <Box sx={{ ...contentLayerSx, pt: 2, px: 2, pb: 2, mx: "auto", maxWidth: 800 }}>
            {/* Summary */}
            {habit.frequency && habit.frequencyUnit && (
              <Box
                sx={{
                  ...glassPanelSx,
                  mb: 2,
                  p: 2,
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-around",
                  borderLeft: 3,
                  borderLeftColor: habit.color || "primary.main",
                  borderColor: (theme) =>
                    alphaOrFallback(habit.color, theme.palette.primary.main, theme.palette.mode === "dark" ? 0.45 : 0.22),
                  bgcolor: (theme) =>
                    alphaOrFallback(habit.color, theme.palette.primary.main, theme.palette.mode === "dark" ? 0.1 : 0.08),
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? `0 12px 24px ${alphaOrFallback(habit.color, theme.palette.primary.main, 0.2)}`
                      : `0 10px 20px ${alphaOrFallback(habit.color, theme.palette.primary.main, 0.14)}`,
                }}
              >
                <Box textAlign="center">
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.64rem" }}
                  >
                    Goal
                  </Typography>
                  <Typography variant="body1" sx={{ color: habit.color || "primary.main", fontWeight: 600 }}>
                    {toFriendlyFrequency(habit)}
                  </Typography>
                </Box>
                <Box
                  sx={{
                    width: "1px",
                    bgcolor: (theme) =>
                      theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  }}
                />
                <Box textAlign="center">
                  <Typography
                    variant="overline"
                    color="text.secondary"
                    sx={{ fontWeight: 700, letterSpacing: "0.08em", fontSize: "0.64rem" }}
                  >
                    Registrations
                  </Typography>
                  <Typography variant="body1" sx={{ fontWeight: 700 }}>
                    {registerCount}
                  </Typography>
                </Box>
              </Box>
            )}

            <SelectedHabitGraph habit={habit} />
            <HabitHeatmap habit={habit} />
            <SelectedHabitList habit={habit} />
          </Box>
        </Fade>
      )}
    </Box>
  );
}
