import { Box, Container, ToggleButton, ToggleButtonGroup, Typography, useTheme } from "@mui/material";
import { useMediaQuery } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { daysShownAtom, graphFrequencyUnitAtom } from "../../store";
import { Habit } from "../../types/Habit";

const daysShownMap: Record<number, string> = {
  14: "14 Days",
  30: "30 Days",
  90: "3 Months",
} as const;

// Helper function to get period key for aggregation
function getPeriodKey(date: dayjs.Dayjs, unit: "day" | "week" | "month"): string {
  switch (unit) {
    case "day":
      return date.format("YYYY-MM-DD");
    case "week":
      // Get the start of the week (Monday)
      return date.startOf("week").add(1, "day").format("YYYY-MM-DD");
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
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const isTablet = useMediaQuery(theme.breakpoints.down('md'));
  
  // Calculate responsive width based on breakpoints
  // Mobile (sm): ~300px, Tablet (md): ~330px, Desktop: 350px
  const chartWidth = isMobile ? 300 : isTablet ? 330 : 350;

  if (!habit.dates) {
    return null;
  }

  // Filter data to only show the last n days
  const filteredDates = Object.fromEntries(
    Object.entries(habit.dates).filter(([date]) => {
      const daysAgo = Math.ceil(dayjs().diff(dayjs(date), "day", true));
      return daysAgo < daysShown;
    })
  );

  // Aggregate data by the selected frequency unit
  const aggregatedData: Record<string, number> = {};
  
  Object.entries(filteredDates).forEach(([date, completed]) => {
    const dateObj = dayjs(date);
    const periodKey = getPeriodKey(dateObj, graphFrequencyUnit);
    
    if (!aggregatedData[periodKey]) {
      aggregatedData[periodKey] = 0;
    }
    
    if (completed) {
      aggregatedData[periodKey] += 1;
    }
  });

  // Convert aggregated data to chart format
  const dateData = Object.entries(aggregatedData).map(([periodKey, value]) => ({
    period: periodKey,
    value,
    label: getPeriodLabel(periodKey, graphFrequencyUnit),
  }));

  // Fill in missing periods with value 0
  const periods: string[] = [];
  let current = dayjs().subtract(daysShown, "day");
  const end = dayjs();

  while (current.isBefore(end) || current.isSame(end)) {
    const periodKey = getPeriodKey(current, graphFrequencyUnit);
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
    if (!dateData.find((data) => data.period === periodKey)) {
      dateData.push({
        period: periodKey,
        value: 0,
        label: getPeriodLabel(periodKey, graphFrequencyUnit),
      });
    }
  });

  // Sort by period
  dateData.sort((a, b) => a.period.localeCompare(b.period));

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
