import { EditOutlined } from "@mui/icons-material";
import { Alert, AlertTitle, Avatar, Box, Button, Grow, Typography } from "@mui/material";
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
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: ["calc(100vh - 72px)", "calc(100dvh - 72px)"], // Account for bottom navigation, use dvh for iOS Safari
        bgcolor: "background.default",
      }}
    >
      {/* Header */}
      <Grow in={true} timeout={400}>
        <Box
          sx={{
            display: "flex",
            alignItems: "flex-start", // Changed from center to flex-start
            p: 2,
            gap: 2,
            borderBottom: 1,
            borderColor: "divider",
          }}
        >
          <BackButton />
          {habit && (
            <>
              <Avatar
                sx={{
                  bgcolor: habit.color || "text.primary",
                  mt: 0.5, // Small top margin to align with text baseline
                }}
              >
                {iconMap[habit.icon]}
              </Avatar>
              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                {/* Added minWidth: 0 for text wrapping */}
                <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 0.5 }}>
                  <Typography
                    variant="h6"
                    sx={{
                      color: habit.color || "text.primary",
                      fontWeight: 600,
                      lineHeight: 1.2, // Tighter line height
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
                      lineHeight: 1.3, // Improved line height for description
                      wordBreak: "break-word", // Ensure long words break properly
                    }}
                  >
                    {habit.description}
                  </Typography>
                )}
              </Box>
            </>
          )}
        </Box>
      </Grow>
      {!habit || !id ? (
        <Grow in={true} timeout={600}>
          <Box sx={{ pt: 1.5, px: 2 }}>
            <Alert severity="error">
              <AlertTitle>Habit not found! Please check the ID in the URL is correct.</AlertTitle>
            </Alert>
          </Box>
        </Grow>
      ) : (
        <>
          {/* Content */}
          <Grow in={true} timeout={600}>
            <Box
              sx={{
                flexGrow: 1,
                pt: 2,
                px: 2,
                pb: 10, // Add padding bottom to prevent content from being hidden behind sticky footer
                mx: "auto",
                maxWidth: 800,
                overflowY: "auto",
                scrollbarWidth: "thin",
                scrollbarColor: "#ccc #222",
              }}
            >
              {/* Summary Section */}
              {habit.frequency && habit.frequencyUnit && (
                <Alert
                  severity="info"
                  icon={false}
                  sx={{
                    mb: 2,
                    borderRadius: 2,
                    bgcolor: "action.hover",
                    "& .MuiAlert-message": {
                      width: "100%",
                    },
                  }}
                >
                  <Box sx={{ display: "flex", flexDirection: "column", gap: 0.5 }}>
                    <Typography variant="body2">
                      Goal: {toFriendlyFrequency(habit)}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total registrations: <strong>{registerCount}</strong>
                    </Typography>
                  </Box>
                </Alert>
              )}

              <SelectedHabitGraph habit={habit} />
              <HabitHeatmap habit={habit} />
              <SelectedHabitList habit={habit} />
            </Box>
          </Grow>

          {/* Footer - Sticky */}
          <Grow in={true} timeout={800}>
            <Box
              sx={{
                position: "sticky",
                bottom: 0,
                p: 2,
                borderTop: 1,
                borderColor: "divider",
                bgcolor: "background.default",
                display: "flex",
                gap: 1,
                boxShadow: "0 -2px 8px rgba(0, 0, 0, 0.1)",
                backdropFilter: "blur(8px)",
                zIndex: 10,
              }}
            >
              <Button
                variant="contained"
                color="primary"
                startIcon={<EditOutlined />}
                onClick={() => navigate(`/${id}/edit`)}
                sx={{
                  borderRadius: 2,
                  textTransform: "none",
                  fontWeight: 500,
                }}
              >
                Edit
              </Button>
              <DeleteHabitWithConfirm habit={habit} id={id} />
            </Box>
          </Grow>
        </>
      )}
    </Box>
  );
}
