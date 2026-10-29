import { Box, Paper, Tooltip, Typography, useTheme } from "@mui/material";
import dayjs from "dayjs";
import { Habit } from "../types/Habit";
import { glassPanelSx, sectionLabelSx } from "../styles/designLanguage";
import { readableHabitColor } from "../utils/color";
import { groupRegistrations } from "../utils/habitHistory";

interface HabitHeatmapProps {
  habit: Habit;
  months?: number;
}

export default function HabitHeatmap({ habit, months = 3 }: HabitHeatmapProps) {
  const theme = useTheme();
  const dailyCounts = groupRegistrations(habit.dates, (timestamp) => dayjs(timestamp).format("YYYY-MM-DD"));

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

      const count = dailyCounts[dateKey] || 0;

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
      return { bgcolor: theme.palette.divider, opacity: 1 };
    }

    const baseColor = readableHabitColor(habit.color, theme.palette.background.paper, theme.palette.primary.main, 3);
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
    <Paper elevation={0} sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2 }}>
      <Box sx={{ ...sectionLabelSx, mb: 2 }}>
        <Typography component="h2" variant="h6" sx={{ color: "text.primary" }}>
          Activity
        </Typography>
      </Box>

      <Box sx={{ display: "flex", gap: 1, overflowX: "auto", pb: 1 }}>
        {/* Day labels */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: "2px", pt: "14px", flexShrink: 0 }}>
          {dayLabels.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                fontSize: "0.75rem",
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
            <Box key={weekIdx} sx={{ display: "flex", flexDirection: "column", gap: "2px", flex: 1, minWidth: 12 }}>
              {/* Month label above first week of each month */}
              {weekIdx === 0 || dayjs(week[0]?.date).date() <= 7 ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.75rem",
                    height: 12,
                    color: "text.secondary",
                    textAlign: weekIdx === maxWeeks - 1 ? "right" : "left",
                    whiteSpace: "nowrap",
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
                    disableTouchListener
                  >
                    <Box
                      sx={{
                        width: "100%",
                        height: 12,
                        minWidth: 12,
                        bgcolor: bgcolor,
                        opacity: opacity,
                        borderRadius: 0.5,
                        transition: "opacity 150ms ease",
                        "@media (hover: hover) and (pointer: fine)": {
                          "&:hover": {
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
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
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
        <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.75rem" }}>
          More
        </Typography>
      </Box>
    </Paper>
  );
}
