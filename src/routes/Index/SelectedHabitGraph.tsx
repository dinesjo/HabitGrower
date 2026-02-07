import { Box, Container, Divider, Grid2, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { InsertChartOutlined, TrendingUp, LocalFireDepartment, CalendarToday } from "@mui/icons-material";
import { BarChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { daysShownAtom, graphFrequencyUnitAtom, userWeekStartsAtMondayAtom } from "../../store";
import { Habit } from "../../types/Habit";

const daysShownMap: Record<number, string> = {
  14: "14 Days",
  30: "30 Days",
  90: "3 Months",
} as const;

// Helper function to calculate current streak - counts consecutive DAYS, not registrations
function calculateStreak(dates: Record<string, boolean | number>): number {
  // Get unique days (not timestamps) where there are registrations
  const uniqueDays = new Set(
    Object.keys(dates)
      .filter((dateStr) => dates[dateStr])
      .map((dateStr) => dayjs(dateStr).format("YYYY-MM-DD"))
  );

  const sortedDays = Array.from(uniqueDays).sort((a, b) => dayjs(b).diff(dayjs(a)));

  if (sortedDays.length === 0) return 0;

  let streak = 0;
  let currentDate = dayjs().startOf("day");

  for (const day of sortedDays) {
    const checkDate = dayjs(day).startOf("day");
    const daysDiff = currentDate.diff(checkDate, "day");

    if (daysDiff === 0 || daysDiff === 1) {
      streak++;
      currentDate = checkDate;
    } else {
      break;
    }
  }

  return streak;
}

// Helper function to calculate longest streak - counts consecutive DAYS, not registrations
function calculateLongestStreak(dates: Record<string, boolean | number>): number {
  // Get unique days (not timestamps) where there are registrations
  const uniqueDays = new Set(
    Object.keys(dates)
      .filter((dateStr) => dates[dateStr])
      .map((dateStr) => dayjs(dateStr).format("YYYY-MM-DD"))
  );

  const sortedDays = Array.from(uniqueDays).sort((a, b) => dayjs(a).diff(dayjs(b)));

  if (sortedDays.length === 0) return 0;

  let longestStreak = 1;
  let currentStreak = 1;

  for (let i = 1; i < sortedDays.length; i++) {
    const prevDate = dayjs(sortedDays[i - 1]).startOf("day");
    const currDate = dayjs(sortedDays[i]).startOf("day");
    const daysDiff = currDate.diff(prevDate, "day");

    if (daysDiff === 1) {
      currentStreak++;
      longestStreak = Math.max(longestStreak, currentStreak);
    } else {
      currentStreak = 1;
    }
  }

  return longestStreak;
}

// Helper function to get period key for aggregation
function getPeriodKey(date: dayjs.Dayjs, unit: "day" | "week" | "month", userWeekStartsAtMonday: boolean): string {
  switch (unit) {
    case "day":
      return date.format("YYYY-MM-DD");
    case "week": {
      // Use the same logic as in getFrequencyUnitStart from helpers.ts
      let weekStart = date.startOf("week").add(Number(userWeekStartsAtMonday), "day");
      if (userWeekStartsAtMonday && date.day() === 0) {
        // edge case for Sunday and userWeekStartsAtMonday
        weekStart = weekStart.subtract(1, "week");
      }
      return weekStart.format("YYYY-MM-DD");
    }
    case "month":
      return date.format("YYYY-MM");
    default:
      return date.format("YYYY-MM-DD");
  }
}

// Helper function to get period label for display
function getPeriodLabel(periodKey: string, unit: "day" | "week" | "month"): string {
  switch (unit) {
    case "day":
      return dayjs(periodKey).format("MMM D");
    case "week": {
      const weekStart = dayjs(periodKey);
      const weekEnd = weekStart.add(6, "day");
      return `${weekStart.format("MMM D")}-${weekEnd.format("D")}`;
    }
    case "month":
      return dayjs(periodKey + "-01").format("MMM YYYY");
    default:
      return periodKey;
  }
}

export default function SelectedHabitGraph({ habit }: { habit: Habit }) {
  const [daysShown] = useAtom(daysShownAtom);
  const [graphFrequencyUnit] = useAtom(graphFrequencyUnitAtom);
  const [userWeekStartsAtMonday] = useAtom(userWeekStartsAtMondayAtom);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));

  // Memoize filtered dates to avoid recalculation on every render
  const filteredDates = useMemo(() => {
    if (!habit.dates) {
      return {};
    }
    return Object.fromEntries(
      Object.entries(habit.dates).filter(([date]) => {
        const daysAgo = Math.ceil(dayjs().diff(dayjs(date), "day", true));
        return daysAgo < daysShown;
      })
    );
  }, [habit.dates, daysShown]);

  // Memoize aggregated data to avoid recalculation when frequency unit or dates don't change
  const aggregatedData = useMemo(() => {
    const data: Record<string, number> = {};

    Object.entries(filteredDates).forEach(([date, completed]) => {
      const dateObj = dayjs(date);
      const periodKey = getPeriodKey(dateObj, graphFrequencyUnit, userWeekStartsAtMonday);

      if (!data[periodKey]) {
        data[periodKey] = 0;
      }

      if (completed) {
        data[periodKey] += 1;
      }
    });

    return data;
  }, [filteredDates, graphFrequencyUnit, userWeekStartsAtMonday]);

  // Memoize chart data to avoid regenerating the full dataset unnecessarily
  const dateData = useMemo(() => {
    // Convert aggregated data to chart format
    const chartData = Object.entries(aggregatedData).map(([periodKey, value]) => ({
      period: periodKey,
      value,
      label: getPeriodLabel(periodKey, graphFrequencyUnit),
    }));

    // Fill in missing periods with value 0
    const periods: string[] = [];
    let current = dayjs().subtract(daysShown, "day");
    const end = dayjs();

    while (current.isBefore(end) || current.isSame(end)) {
      const periodKey = getPeriodKey(current, graphFrequencyUnit, userWeekStartsAtMonday);
      if (!periods.includes(periodKey)) {
        periods.push(periodKey);
      }

      // Increment by appropriate unit
      switch (graphFrequencyUnit) {
        case "day":
          current = current.add(1, "day");
          break;
        case "week":
          current = current.add(1, "week");
          break;
        case "month":
          current = current.add(1, "month");
          break;
      }
    }

    // Add missing periods with value 0
    periods.forEach((periodKey) => {
      if (!chartData.find((data) => data.period === periodKey)) {
        chartData.push({
          period: periodKey,
          value: 0,
          label: getPeriodLabel(periodKey, graphFrequencyUnit),
        });
      }
    });

    // Sort by period
    chartData.sort((a, b) => a.period.localeCompare(b.period));

    return chartData;
  }, [aggregatedData, graphFrequencyUnit, userWeekStartsAtMonday, daysShown]);

  // Check if there's any data
  const hasData = habit.dates && Object.keys(habit.dates).length > 0;

  if (!hasData) {
    return (
      <Box
        sx={{
          p: 3,
          mb: 2,
          borderRadius: 3,
          border: 1,
          borderColor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
          bgcolor: "background.paper",
          boxShadow: (t) => (t.palette.mode === "dark" ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 8px rgba(0,0,0,0.04)"),
        }}
      >
        <SectionTitle>Progress Chart</SectionTitle>
        <Box sx={{ mb: 3, display: "flex", justifyContent: "center", px: { xs: 2, sm: 2 } }}>
          <GraphControls />
        </Box>
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            bgcolor: "action.hover",
            borderRadius: 2,
            border: "1px dashed",
            borderColor: "divider",
          }}
        >
          <InsertChartOutlined sx={{ fontSize: 48, color: "text.disabled", mb: 1 }} />
          <Typography variant="body1" color="text.secondary" gutterBottom>
            No data yet
          </Typography>
          <Typography variant="body2" color="text.disabled">
            Register this habit to see your progress chart
          </Typography>
        </Box>
      </Box>
    );
  }

  // Get max value in the dataSet
  const maxValue = Math.max(...dateData.map((data) => data.value));

  // Calculate stats
  const stats = useMemo(() => {
    if (!habit.dates) return null;

    // Sum up total registrations in the period (values can be numbers for multiple registrations)
    const totalRegistrationsInPeriod = Object.values(filteredDates).reduce(
      (sum, val) => sum + Number(val || 0),
      0
    );

    // Average registrations per day
    const avgPerDay = (totalRegistrationsInPeriod / daysShown).toFixed(1);

    // Streaks count consecutive DAYS (not total registrations)
    const currentStreak = calculateStreak(habit.dates);
    const longestStreak = calculateLongestStreak(habit.dates);

    return {
      avgPerDay,
      currentStreak,
      longestStreak,
    };
  }, [filteredDates, daysShown, habit.dates]);

  // Calculate target line value
  const targetValue = habit.frequency && habit.frequencyUnit && graphFrequencyUnit === habit.frequencyUnit
    ? habit.frequency
    : null;

  return (
    <Box
      sx={{
        p: 3,
        mb: 2,
        borderRadius: 3,
        border: 1,
        borderColor: (t) => (t.palette.mode === "dark" ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"),
        bgcolor: "background.paper",
        boxShadow: (t) => (t.palette.mode === "dark" ? "0 2px 12px rgba(0,0,0,0.25)" : "0 1px 8px rgba(0,0,0,0.04)"),
      }}
    >
      <SectionTitle>Progress Chart</SectionTitle>
      <Box sx={{ mb: 3, display: "flex", justifyContent: "center", px: { xs: 2, sm: 2 } }}>
        <GraphControls />
      </Box>
      <Container
        disableGutters
        sx={{
          display: "flex",
          justifyContent: "center",
          width: "100%",
          maxWidth: "100%",
        }}
      >
        <Box
          sx={{
            width: "100%",
            maxWidth: { xs: 320, sm: 400, md: 500 },
            display: "flex",
            justifyContent: "center",
          }}
        >
          <BarChart
            dataset={dateData}
            width={isMobile ? 320 : isTablet ? 400 : 500}
            height={220}
            margin={{ top: 20, right: 10, bottom: 40, left: 30 }}
            xAxis={[
              {
                dataKey: "period",
                scaleType: "band",
                valueFormatter: (value) => {
                  const dataPoint = dateData.find(d => d.period === value);
                  return dataPoint?.label || "";
                },
              },
            ]}
            yAxis={[
              {
                dataKey: "value",
                min: 0,
                max: graphFrequencyUnit === "day" && habit.frequencyUnit === "day"
                  ? Math.max(habit.frequency || 0, maxValue)
                  : maxValue,
                tickMinStep: 1, // will always be integers
              },
            ]}
            series={[{ dataKey: "value", color: habit.color || "#90c65b", label: "Completions" }]}
            grid={{ horizontal: true }}
            slotProps={{
              legend: { hidden: true },
            }}
            sx={{
              "& .MuiChartsReferenceLine-root": {
                strokeDasharray: "5 5",
                strokeWidth: 2,
              },
            }}
          >
            {targetValue && (
              <text
                x={isMobile ? 160 : isTablet ? 200 : 250}
                y={15}
                textAnchor="middle"
                style={{
                  fill: habit.color || "#90c65b",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Goal: {targetValue}
              </text>
            )}
          </BarChart>
        </Box>
      </Container>

      {/* Stats */}
      {stats && (
        <>
          <Divider sx={{ my: 3, opacity: 0.4 }} />

          <Grid2 container spacing={1.5}>
            <Grid2 size={{ xs: 4, sm: 4 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: (t) =>
                    t.palette.mode === "dark" ? "rgba(144, 198, 91, 0.06)" : "rgba(46, 125, 50, 0.04)",
                  border: 1,
                  borderColor: (t) =>
                    t.palette.mode === "dark" ? "rgba(144, 198, 91, 0.08)" : "rgba(46, 125, 50, 0.06)",
                }}
              >
                <TrendingUp sx={{ fontSize: 24, color: "primary.main", mb: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 0.25, lineHeight: 1.2 }}>
                  {stats.avgPerDay}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                  Avg/Day
                </Typography>
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 4, sm: 4 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: (t) =>
                    stats.currentStreak > 0
                      ? t.palette.mode === "dark"
                        ? "rgba(144, 198, 91, 0.12)"
                        : "rgba(46, 125, 50, 0.08)"
                      : t.palette.mode === "dark"
                        ? "rgba(144, 198, 91, 0.06)"
                        : "rgba(46, 125, 50, 0.04)",
                  border: 1,
                  borderColor: (t) =>
                    stats.currentStreak > 0
                      ? t.palette.mode === "dark"
                        ? "rgba(144, 198, 91, 0.2)"
                        : "rgba(46, 125, 50, 0.12)"
                      : t.palette.mode === "dark"
                        ? "rgba(144, 198, 91, 0.08)"
                        : "rgba(46, 125, 50, 0.06)",
                }}
              >
                <LocalFireDepartment
                  sx={{
                    fontSize: 24,
                    color: stats.currentStreak > 0 ? "error.main" : "text.disabled",
                    mb: 0.5,
                  }}
                />
                <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 0.25, lineHeight: 1.2 }}>
                  {stats.currentStreak}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                  Day Streak
                </Typography>
              </Box>
            </Grid2>

            <Grid2 size={{ xs: 4, sm: 4 }}>
              <Box
                sx={{
                  textAlign: "center",
                  p: 1.5,
                  borderRadius: 2.5,
                  bgcolor: (t) =>
                    t.palette.mode === "dark" ? "rgba(144, 198, 91, 0.06)" : "rgba(46, 125, 50, 0.04)",
                  border: 1,
                  borderColor: (t) =>
                    t.palette.mode === "dark" ? "rgba(144, 198, 91, 0.08)" : "rgba(46, 125, 50, 0.06)",
                }}
              >
                <CalendarToday sx={{ fontSize: 24, color: "secondary.main", mb: 0.5 }} />
                <Typography variant="h5" sx={{ fontWeight: 700, color: "text.primary", mb: 0.25, lineHeight: 1.2 }}>
                  {stats.longestStreak}
                </Typography>
                <Typography variant="caption" color="text.secondary" sx={{ fontSize: "0.65rem" }}>
                  Best Streak
                </Typography>
              </Box>
            </Grid2>
          </Grid2>
        </>
      )}
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 2 }}>
      <Box sx={{ width: 6, height: 6, borderRadius: "50%", bgcolor: "primary.main", flexShrink: 0 }} />
      <Typography variant="h6" sx={{ fontWeight: 600, color: "text.primary" }}>
        {children}
      </Typography>
    </Box>
  );
}

function GraphControls() {
  const [daysShown, setDaysShown] = useAtom(daysShownAtom);
  const [graphFrequencyUnit, setGraphFrequencyUnit] = useAtom(graphFrequencyUnitAtom);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, width: '100%', maxWidth: 400 }}>
      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
          TIME SPAN
        </Typography>
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={daysShown}
          exclusive
          onChange={(_, v) => {
            if (v) setDaysShown(v);
          }}
          aria-label="Time span"
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              py: 0.75,
              px: 1.5,
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 1.5,
              transition: 'all 0.2s ease-in-out',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.paper',
              "&.Mui-selected": {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                borderColor: 'primary.main',
                "&:hover": {
                  bgcolor: 'primary.dark',
                },
              },
              "&:hover": {
                bgcolor: 'action.hover',
              },
            },
            gap: 0.5,
          }}
        >
          {Object.entries(daysShownMap).map(([days, label]) => (
            <ToggleButton key={days} value={Number(days)}>
              {label}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>

      <Box>
        <Typography variant="subtitle2" color="text.secondary" sx={{ mb: 1, fontSize: '0.75rem', fontWeight: 600 }}>
          GROUP BY
        </Typography>
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={graphFrequencyUnit}
          exclusive
          onChange={(_, v) => {
            if (v) setGraphFrequencyUnit(v);
          }}
          aria-label="Frequency unit"
          fullWidth
          sx={{
            "& .MuiToggleButton-root": {
              py: 0.75,
              px: 1.5,
              fontSize: '0.8rem',
              fontWeight: 500,
              textTransform: 'none',
              borderRadius: 1.5,
              transition: 'all 0.2s ease-in-out',
              border: '1px solid',
              borderColor: 'divider',
              color: 'text.primary',
              bgcolor: 'background.paper',
              "&.Mui-selected": {
                bgcolor: 'primary.main',
                color: 'primary.contrastText',
                fontWeight: 600,
                borderColor: 'primary.main',
                "&:hover": {
                  bgcolor: 'primary.dark',
                },
              },
              "&:hover": {
                bgcolor: 'action.hover',
              },
            },
            gap: 0.5,
          }}
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
