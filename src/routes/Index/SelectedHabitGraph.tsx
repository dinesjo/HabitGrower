import { Habit } from "../../habitsModel";
import dayjs from "dayjs";
import { LineChart } from "@mui/x-charts";
import { Container, Typography } from "@mui/material";

export default function SelectedHabitGraph({ habit }: { habit: Habit }) {
  if (!habit.dates) {
    return (
      <Typography variant="body2" color="text.secondary">
        You haven't registered this habit yet.
      </Typography>
    );
  }

  const dateData = Object.keys(habit.dates || {}).reduce((acc: { date: number; value: number }[], date: string) => {
    const currentDate = Math.ceil(dayjs(date).startOf("day").unix() / (60 * 60 * 24));
    const existingData = acc.find((data) => data.date === currentDate);
    if (!existingData) {
      acc.push({
        date: currentDate,
        value: Number(habit.dates![date]),
      });
    } else {
      existingData.value += Number(habit.dates![date]);
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
        You've registered this habit {dateData.length} times.
      </Typography>
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
          series={[{ dataKey: "value", label: habit.name, color: habit.color || "#90c65b" }]}
        />
      </Container>
    </>
  );
}
