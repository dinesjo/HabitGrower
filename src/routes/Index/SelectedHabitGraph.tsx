import { Habit } from "../../habitsModel";
import dayjs from "dayjs";
import { LineChart } from "@mui/x-charts";
import { Box, Container, ToggleButton, ToggleButtonGroup, Typography } from "@mui/material";
import { useAtom } from "jotai";
import { atomWithStorage } from "jotai/utils";

const daysShownMap: Record<number, string> = {
  14: "14 Days",
  30: "30 Days",
  99999: "Show All",
} as const;

const daysShownAtom = atomWithStorage<number>("daysShown", 30);

export default function SelectedHabitGraph({ habit }: { habit: Habit }) {
  const [daysShown] = useAtom(daysShownAtom);

  if (!habit.dates) {
    return (
      <Typography variant="body2" color="text.secondary">
        You haven't registered this habit yet.
      </Typography>
    );
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
  const firstDay = dateData[0].date; // e.g. 19815
  const today = Math.ceil(dayjs().startOf("day").unix() / (60 * 60 * 24)); // e.g. 19824
  const allDays = Array.from({ length: today - firstDay + 1 }, (_, i) => firstDay + i); // e.g. [19815, 19816, ..., 19824]
  const missingDays = allDays.filter((day) => !dateData.find((data) => data.date === day));
  missingDays.forEach((date) => dateData.push({ date, value: 0 }));
  dateData.sort((a, b) => a.date - b.date);

  // Get max value in the dataSet
  const maxValue = Math.max(...dateData.map((data) => data.value));

  return (
    <>
      <Typography variant="body2" color="text.secondary">
        You've registered this habit {dateData.length} times within selected timespan.
      </Typography>
      <Container sx={{ my: 1, display: "flex", justifyContent: "center" }}>
        <HabitGraphControls />
      </Container>
      <Container disableGutters sx={{ display: "flex", justifyContent: "center" }}>
        <LineChart
          dataset={dateData}
          width={300}
          height={200}
          xAxis={[
            {
              dataKey: "date",
              scaleType: "point",
              valueFormatter: (unix) => dayjs.unix(unix * (60 * 60 * 24)).format("MMM D"),
              label: "Date",
            },
          ]}
          yAxis={[
            {
              dataKey: "value",
              min: 0,
              max: Math.max(habit.frequency || 0, maxValue),
              tickMinStep: 1, // integers
              label: "Habit done",
            },
          ]}
          series={[{ dataKey: "value", color: habit.color || "#90c65b" }]}
        />
      </Container>
    </>
  );
}

function HabitGraphControls() {
  const [daysShown, setDaysShown] = useAtom(daysShownAtom);

  return (
    <Box>
      <Typography variant="body2" color="text.secondary">
        Select time span:
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
