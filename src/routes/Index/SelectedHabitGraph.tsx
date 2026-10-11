import { Box, Divider, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { useMemo } from "react";
import { daysShownAtom, graphFrequencyUnitAtom, userWeekStartsAtMondayAtom } from "../../store";
import { Habit } from "../../types/Habit";
import { glassPanelSx, sectionLabelSx } from "../../styles/designLanguage";

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

  const stats = useMemo(() => {
    if (!habit.dates) return null;

    // Sum up total registrations in the period (values can be numbers for multiple registrations)
    const totalRegistrationsInPeriod = Object.values(filteredDates).reduce<number>(
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

  if (!hasData) {
    return (
      <Box sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2 }}>
        <SectionTitle>Progress</SectionTitle>
        <GraphControls />
        <Box sx={{ py: 4, textAlign: "center" }}>
          <Typography variant="body1" sx={{ fontWeight: 600, mb: 1 }}>
            Your progress starts here
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Register this habit to see your progress over time.
          </Typography>
        </Box>
      </Box>
    );
  }

  // Get max value in the dataSet
  const maxValue = Math.max(...dateData.map((data) => data.value));

  // Calculate target line value
  const targetValue = habit.frequency && habit.frequencyUnit && graphFrequencyUnit === habit.frequencyUnit
    ? habit.frequency
    : null;

  return (
    <Box sx={{ ...glassPanelSx, p: { xs: 2, sm: 3 }, mb: 2 }}>
      <SectionTitle>Progress</SectionTitle>
      <GraphControls />
      <Box sx={{ width: "100%", minWidth: 0, mt: 2, touchAction: "pan-y" }}>
          <BarChart
            dataset={dateData}
            height={220}
            skipAnimation
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
              color: "text.secondary",
              touchAction: "pan-y",
              "& .MuiChartsReferenceLine-root": {
                strokeDasharray: "5 5",
                strokeWidth: 2,
              },
            }}
          >
            {targetValue && (
              <text
                x="50%"
                y={15}
                textAnchor="middle"
                style={{
                  fill: "currentColor",
                  fontSize: "0.75rem",
                  fontWeight: 600,
                }}
              >
                Goal: {targetValue}
              </text>
            )}
          </BarChart>
      </Box>

      {stats && (
        <>
          <Divider sx={{ my: 2 }} />
          <Box component="dl" sx={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", m: 0 }}>
            {[
              { value: stats.avgPerDay, label: "Avg. per day" },
              { value: stats.currentStreak, label: "Day streak" },
              { value: stats.longestStreak, label: "Best streak" },
            ].map(({ value, label }, index) => (
              <Box key={label} sx={{ textAlign: "center", px: 0.5, borderLeft: index ? 1 : 0, borderColor: "divider" }}>
                <Typography component="dd" variant="h5" sx={{ m: 0, mb: 0.75, fontFamily: "inherit", fontWeight: 700, fontVariantNumeric: "tabular-nums", lineHeight: 1.2 }}>
                  {value}
                </Typography>
                <Typography component="dt" variant="caption" color="text.secondary" sx={{ display: "block", fontSize: "0.75rem", lineHeight: 1.4 }}>
                  {label}
                </Typography>
              </Box>
            ))}
          </Box>
        </>
      )}
    </Box>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ ...sectionLabelSx, mb: 2 }}>
      <Typography component="h2" variant="h6" sx={{ color: "text.primary" }}>
        {children}
      </Typography>
    </Box>
  );
}

const controlGroupSx = {
  width: "100%",
  "& .MuiToggleButton-root": {
    minWidth: 0,
    minHeight: 44,
    px: 0.5,
    fontSize: "0.8125rem",
    fontWeight: 600,
    whiteSpace: "nowrap",
    textTransform: "none",
    borderColor: "divider",
    borderRadius: "var(--hg-control-radius)",
    color: "text.primary",
    "&.Mui-selected": {
      bgcolor: "primary.main",
      color: "primary.contrastText",
      borderColor: "primary.main",
      "@media (hover: hover) and (pointer: fine)": { "&:hover": { bgcolor: "primary.dark" } },
    },
  },
};

function GraphControls() {
  const [daysShown, setDaysShown] = useAtom(daysShownAtom);
  const [graphFrequencyUnit, setGraphFrequencyUnit] = useAtom(graphFrequencyUnitAtom);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
          Time span
        </Typography>
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={daysShown}
          exclusive
          onChange={(_, v) => { if (v) setDaysShown(v); }}
          aria-label="Time span"
          fullWidth
          sx={controlGroupSx}
        >
          {Object.entries(daysShownMap).map(([days, label]) => (
            <ToggleButton key={days} value={Number(days)}>{label}</ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      <Box>
        <Typography variant="caption" color="text.secondary" sx={{ display: "block", mb: 0.75, fontWeight: 600 }}>
          Group by
        </Typography>
        <ToggleButtonGroup
          color="primary"
          size="small"
          value={graphFrequencyUnit}
          exclusive
          onChange={(_, v) => { if (v) setGraphFrequencyUnit(v); }}
          aria-label="Frequency unit"
          fullWidth
          sx={controlGroupSx}
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
