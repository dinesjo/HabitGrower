import { EditOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Button, Fade, Typography } from "@mui/material";
import { LoaderFunctionArgs, useLoaderData, useNavigate, useParams } from "react-router-dom";
import BackButton from "../../components/BackButton";
import DeleteHabitWithConfirm from "../../components/DeleteHabitWithConfirm";
import HabitHeatmap from "../../components/HabitHeatmap";
import HabitNotificationIndicator from "../../components/HabitNotificationIndicator";
import { iconMap } from "../../constants/iconMap";
import { fetchHabitById } from "../../services/habitsPersistance";
import { Habit } from "../../types/Habit";
import { toFriendlyFrequency } from "../../utils/helpers";
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
    <Box sx={{ bgcolor: "background.default" }}>
      {/* ── Header ── */}
      <Fade in timeout={400}>
        <Box
          sx={{
            position: "relative",
            overflow: "hidden",
            background: (theme) =>
              theme.palette.mode === "dark"
                ? "linear-gradient(180deg, rgba(14, 30, 18, 0.5) 0%, rgba(14, 30, 18, 0.15) 100%)"
                : "linear-gradient(180deg, rgba(232, 245, 233, 0.5) 0%, rgba(232, 245, 233, 0.15) 100%)",
            borderBottom: 1,
            borderColor: (theme) =>
              theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
          }}
        >
          {/* Back button row */}
          <Box sx={{ px: 1, pt: 1 }}>
            <BackButton />
          </Box>

          {/* Habit identity + actions */}
          {habit && id && (
            <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", px: 3, pt: 0.5, pb: 2 }}>
              <Avatar
                sx={{
                  bgcolor: habit.color || "text.primary",
                  width: 56,
                  height: 56,
                  fontSize: "1.75rem",
                  mb: 1.5,
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? `0 4px 20px ${habit.color || "rgba(144, 198, 91, 0.3)"}40`
                      : `0 4px 16px ${habit.color || "rgba(46, 125, 50, 0.2)"}30`,
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
                  size="small"
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
          <Box
            sx={{
              pt: 2,
              px: 2,
              pb: 2,
              mx: "auto",
              maxWidth: 800,
            }}
          >
            {/* Summary */}
            {habit.frequency && habit.frequencyUnit && (
              <Box
                sx={{
                  mb: 2,
                  p: 2,
                  borderRadius: 3,
                  border: 1,
                  borderColor: (theme) =>
                    theme.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
                  bgcolor: "background.paper",
                  boxShadow: (theme) =>
                    theme.palette.mode === "dark"
                      ? "0 2px 12px rgba(0,0,0,0.25)"
                      : "0 1px 8px rgba(0,0,0,0.04)",
                  display: "flex",
                  gap: 2,
                  justifyContent: "space-around",
                  borderLeft: 3,
                  borderLeftColor: habit.color || "primary.main",
                }}
              >
                <Box textAlign="center">
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}
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
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontWeight: 600, letterSpacing: "0.05em", textTransform: "uppercase", fontSize: "0.65rem" }}
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
