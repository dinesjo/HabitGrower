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
      const count = habit.dates && habit.dates[dateKey] ? 1 : 0;

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

  // Calculate cell size based on screen width
  const cellSize = 12;
  const cellGap = 2;

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
        overflowX: "auto",
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, fontWeight: 600, color: "text.primary" }}>
        Activity Heatmap
      </Typography>

      <Box sx={{ display: "flex", gap: 1 }}>
        {/* Day labels */}
        <Box sx={{ display: "flex", flexDirection: "column", gap: `${cellGap}px`, pt: 2 }}>
          {dayLabels.map((day) => (
            <Typography
              key={day}
              variant="caption"
              sx={{
                fontSize: "0.65rem",
                height: cellSize,
                display: "flex",
                alignItems: "center",
                color: "text.secondary",
              }}
            >
              {day}
            </Typography>
          ))}
        </Box>

        {/* Heatmap grid */}
        <Box sx={{ display: "flex", gap: `${cellGap}px`, flexWrap: "nowrap" }}>
          {weekGroups.map((week, weekIdx) => (
            <Box key={weekIdx} sx={{ display: "flex", flexDirection: "column", gap: `${cellGap}px` }}>
              {/* Month label above first week of each month */}
              {weekIdx === 0 || dayjs(week[0]?.date).date() <= 7 ? (
                <Typography
                  variant="caption"
                  sx={{
                    fontSize: "0.65rem",
                    height: cellSize,
                    color: "text.secondary",
                    textAlign: "center",
                  }}
                >
                  {dayjs(week[0]?.date).format("MMM")}
                </Typography>
              ) : (
                <Box sx={{ height: cellSize }} />
              )}

              {/* Days in this week */}
              {Array.from({ length: 7 }, (_, dayIdx) => {
                const dayData = week.find((d) => d.dayOfWeek === dayIdx);
                if (!dayData) {
                  return <Box key={dayIdx} sx={{ width: cellSize, height: cellSize }} />;
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
                        width: cellSize,
                        height: cellSize,
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
              width: cellSize,
              height: cellSize,
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
