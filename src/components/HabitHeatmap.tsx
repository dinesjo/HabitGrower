import { Box, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { Habit } from "../types/Habit";

interface HabitHeatmapProps {
  habit: Habit;
  months?: number;
}

export default function HabitHeatmap({ habit, months = 3 }: HabitHeatmapProps) {
  const theme = useTheme();

  // Generate the last N months of data
  const generateHeatmapData = () => {
    const data: { date: string; count: number; dayOfWeek: number; week: number }[] = [];
    const startDate = dayjs().subtract(months, "month").startOf("week");
    const endDate = dayjs().endOf("week");

    let currentDate = startDate;
    let weekIndex = 0;
    let currentWeekStart = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
      const dateKey = currentDate.format("YYYY-MM-DD");

      // Check if ANY timestamp on this day has a registration
      // Dates are stored as ISO timestamps (e.g., "2025-01-15T10:00:00Z")
      const hasRegistrationOnDay = habit.dates
        ? Object.keys(habit.dates).some((timestamp) => {
            const timestampDay = dayjs(timestamp).format("YYYY-MM-DD");
            return timestampDay === dateKey && habit.dates![timestamp];
          })
        : false;

      const count = hasRegistrationOnDay ? 1 : 0;

      // Calculate week index
      if (currentDate.diff(currentWeekStart, "day") >= 7) {
        weekIndex++;
        currentWeekStart = currentWeekStart.add(7, "day");
      }

      data.push({
        date: dateKey,
        count,
        dayOfWeek: currentDate.day(),
        week: weekIndex,
      });

      currentDate = currentDate.add(1, "day");
    }

    return data;
  };

  const heatmapData = generateHeatmapData();
  const maxWeeks = Math.max(...heatmapData.map((d) => d.week)) + 1;

  // Group data by week
  const weekGroups = Array.from({ length: maxWeeks }, (_, weekIdx) =>
    heatmapData.filter((d) => d.week === weekIdx)
  );

  // Day labels
  const dayLabels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: "1px solid",
        borderColor: "divider",
        bgcolor: "background.paper",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
        Activity Heatmap
      </Typography>

      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
        {/* Day labels */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", pt: "20px", flexShrink: 0 }}>
          {dayLabels.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                height: 12,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
                lineHeight: 1,
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Heatmap grid */}
        <Box sx={{ display: "flex", gap: "2px", flexWrap: "nowrap", flex: 1, minWidth: 0 }}>
          {weekGroups.map((week, weekIdx) => (
            <Box key={weekIdx} sx={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1 }}>
              {/* Month label above first week of each month */}
              {weekIdx === 0 || dayjs(week[0]?.date).date() <= 7 ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    height: 12,
                    color: "text.secondary",
                    textAlign: "center",
                    lineHeight: 1,
                  }}
                >
                  {dayjs(week[0]?.date).format("MMM")}
                </Typography>
              ) : (
                <Box sx={{ height: 12 }} />
              )}

              {/* Days in this week */}
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const dayData = week.find((d) => d.dayOfWeek === dayIdx);
                if (!dayData) {
                  return <Box key={dayIdx} sx={{ width: "100%", height: 12 }} />;
                }

                const cellColor = dayData.count > 0
                  ? habit.color || theme.palette.primary.main
                  : theme.palette.action.hover;

                return (
                  <Tooltip
                    key={dayIdx}
                    title={
                      <Box>
                        <Typography variant="caption">{dayjs(dayData.date).format("MMM D, YYYY")}</Typography>
                        <Typography variant="caption" display="block">
                          {dayData.count > 0 ? "✓ Completed" : "No entry"}
                        </Typography>
                      </Box>
                    }
                    arrow
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 12,
                        minWidth: 12,
                        bgcolor: cellColor,
                        opacity: dayData.count > 0 ? 1 : 0.3,
                        borderRadius: 0.5,
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "&:hover": {
                          transform: "scale(1.2)",
                          opacity: 1,
                          zIndex: 10,
                        },
                      }}
                    />
                  </Tooltip>
                );
              })}
            </Box>
          ))}
        </Box>
      </Box>

      {/* Legend */}
      <Box sx={{ display: "flex", alignItems: "center", gap: 1, mt: 2, justifyContent: "flex-end" }}>
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
          Less
        </Typography>
        {[0, 1].map((level) => (
          <Box
            key={level}
            sx={{
              width: 12,
              height: 12,
              bgcolor: level > 0 ? habit.color || "primary.main" : "action.hover",
              opacity: level > 0 ? 1 : 0.3,
              borderRadius: 0.5,
            }}
          />
        ))}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
          More
        </Typography>
      </Box>
    </Paper>
  );
}
