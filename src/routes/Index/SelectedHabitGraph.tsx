import { Box, Container, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { BarChart } from "@mui/x-charts";
import dayjs from "dayjs";
import { useAtom } from "jotai";
import { daysShownAtom } from "../../store";
import { Habit } from "../../types/Habit";

const daysShownMap: Record<number, string> = {
  14: "14 Days",
  30: "30 Days",
  90: "3 Months",
} as const;

export default function SelectedHabitGraph({ habit }: { habit: Habit }) {
  const [daysShown] = useAtom(daysShownAtom);

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

  // Create dataset from filteredDates
  const dateData = Object.keys(filteredDates).reduce((acc: { date: number; value: number }[], date: string) => {
    const currentDate = Math.ceil(dayjs(date).startOf("day").unix() / (60 * 60 * 24));
    const existingData = acc.find((data) => data.date === currentDate);
    if (!existingData) {
      acc.push({
        date: currentDate,
        value: Number(filteredDates![date]),
      });
    } else {
      existingData.value += Number(filteredDates![date]);
    }
    return acc;
  }, []);

  // Fill in missing dates with value 0
  const firstDay = Math.ceil(dayjs().subtract(daysShown, "day").startOf("day").unix() / (60 * 60 * 24)); // e.g. 19815
  const today = Math.ceil(dayjs().startOf("day").unix() / (60 * 60 * 24)); // e.g. 19824
  const allDays = Array.from({ length: today - firstDay + 1 }, (_, i) => firstDay + i); // e.g. [19815, 19816, ..., 19824]
  const missingDays = allDays.filter((day) => !dateData.find((data) => data.date === day));
  missingDays.forEach((date) => dateData.push({ date, value: 0 }));
  dateData.sort((a, b) => a.date - b.date);

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
          width={350}
          height={200}
          margin={{ top: 20, right: 20, bottom: 30, left: 20 }} // remove excess margin
          xAxis={[
            {
              dataKey: "date",
              scaleType: "band",
              valueFormatter: (unix) => dayjs.unix(unix * (60 * 60 * 24)).format("MMM D"),
            },
          ]}
          yAxis={[
            {
              dataKey: "value",
              min: 0,
              max: habit.frequencyUnit === "day" ? Math.max(habit.frequency || 0, maxValue) : maxValue,
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

  return (
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
  );
}
