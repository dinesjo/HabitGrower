import { Box, Container, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
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
  
  // Calculate responsive width based on breakpoints
  // Mobile (sm): ~300px, Tablet (md): ~330px, Desktop: 350px
  const chartWidth = isMobile ? 300 : isTablet ? 330 : 350;

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

  if (!habit.dates) {
    return null;
  }

  // Get max value in the dataSet
  const maxValue = Math.max(...dateData.map((data) => data.value));

  return (
    <>
      <Container sx={{ my: 1, display: "flex", justifyContent: "center" }}>
        <GraphControls />
      </Container>
      <Container disableGutters sx={{ display: "flex", justifyContent: "center" }}>
        <BarChart
          dataset={dateData}
          width={chartWidth}
          height={200}
          margin={{ top: 20, right: 20, bottom: 30, left: 20 }} // remove excess margin
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
          series={[{ dataKey: "value", color: habit.color || "#90c65b" }]}
          grid={{ horizontal: true }}
        />
      </Container>
    </>
  );
}

function GraphControls() {
  const [daysShown, setDaysShown] = useAtom(daysShownAtom);
  const [graphFrequencyUnit, setGraphFrequencyUnit] = useAtom(graphFrequencyUnitAtom);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
      <Box>
        <Typography variant="subtitle2" color="primary.main">
          Time span:
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
        >
          {Object.entries(daysShownMap).map(([days, icon]) => (
            <ToggleButton key={days} value={Number(days)}>
              {icon}
            </ToggleButton>
          ))}
        </ToggleButtonGroup>
      </Box>
      
      <Box>
        <Typography variant="subtitle2" color="primary.main">
          Group by:
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
        >
          <ToggleButton value="day">Day</ToggleButton>
          <ToggleButton value="week">Week</ToggleButton>
          <ToggleButton value="month">Month</ToggleButton>
        </ToggleButtonGroup>
      </Box>
    </Box>
  );
}
