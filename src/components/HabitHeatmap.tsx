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
    const endDate = dayjs().endOf("day"); // End with current day, not end of week

    let currentDate = startDate;
    let weekIndex = 0;
    let currentWeekStart = startDate;

    while (currentDate.isBefore(endDate) || currentDate.isSame(endDate, "day")) {
      const dateKey = currentDate.format("YYYY-MM-DD");

      // Count ALL registrations on this day
      // Dates are stored as ISO timestamps (e.g., "2025-01-15T10:00:00Z")
      const count = habit.dates
        ? Object.keys(habit.dates).filter((timestamp) => {
            const timestampDay = dayjs(timestamp).format("YYYY-MM-DD");
            return timestampDay === dateKey && habit.dates![timestamp];
          }).length
        : 0;

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

  // Calculate max count for intensity scaling
  const maxCount = Math.max(...heatmapData.map((d) => d.count), 1);

  // Get intensity level (0-4) based on count - GitHub style
  const getIntensityLevel = (count: number): number => {
    if (count === 0) return 0;
    if (maxCount === 1) return 4; // If max is 1, show full intensity

    const percentage = count / maxCount;
    if (percentage >= 0.75) return 4;
    if (percentage >= 0.5) return 3;
    if (percentage >= 0.25) return 2;
    return 1;
  };

  // Get color for intensity level
  const getIntensityColor = (level: number): { bgcolor: string; opacity: number } => {
    if (level === 0) {
      return { bgcolor: theme.palette.action.hover, opacity: 0.3 };
    }

    const baseColor = habit.color || theme.palette.primary.main;
    // Use different opacity levels to create gradient effect
    const opacities = [0, 0.4, 0.6, 0.8, 1];
    return { bgcolor: baseColor, opacity: opacities[level] };
  };

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

                const intensityLevel = getIntensityLevel(dayData.count);
                const { bgcolor, opacity } = getIntensityColor(intensityLevel);

                return (
                  <Tooltip
                    key={dayIdx}
                    title={
                      <Box>
                        <Typography variant="caption">{dayjs(dayData.date).format("MMM D, YYYY")}</Typography>
                        <Typography variant="caption" display="block">
                          {dayData.count > 0
                            ? `${dayData.count} registration${dayData.count !== 1 ? "s" : ""}`
                            : "No entry"}
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
                        bgcolor: bgcolor,
                        opacity: opacity,
                        borderRadius: 0.5,
                        cursor: "pointer",
                        transition: "all 0.2s ease-in-out",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
                            transform: "scale(1.2)",
                            opacity: 1,
                            zIndex: 10,
                          },
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
        {[0, 1, 2, 3, 4].map((level) => {
          const { bgcolor, opacity } = getIntensityColor(level);
          return (
            <Box
              key={level}
              sx={{
                width: 12,
                height: 12,
                bgcolor: bgcolor,
                opacity: opacity,
                borderRadius: 0.5,
              }}
            />
          );
        })}
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.7rem" }}>
          More
        </Typography>
      </Box>
    </Paper>
  );
}
