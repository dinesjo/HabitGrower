import { Habit } from "../../habitsModel";
import dayjs from "dayjs";
import { LineChart } from "@mui/x-charts";
import { Typography } from "@mui/material";

export default function SelectedHabitGraph({ habit }: { habit: Habit }) {
  // const { habit } = useLoaderData() as { habit: Habit };
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

  return habit.dates ? (
    <>
      <Typography variant="body2" color="text.secondary">
        You've registered this habit {habit.dates.length} times.
      </Typography>
      <LineChart
        width={300}
        height={200}
        xAxis={[
          {
            dataKey: "date",
            scaleType: "time",
            valueFormatter: (unix) => dayjs.unix(unix * (60 * 60 * 24)).format("MMM D"),
            label: "Date",
          },
        ]}
        yAxis={[
          {
            dataKey: "value",
            scaleType: "linear",
            min: 0,
            tickMinStep: 1, // integers
            label: "Habit done",
          },
        ]}
        series={[{ dataKey: "value", label: habit.name, color: habit.color || "#90c65b" }]}
        dataset={dateData}
      />
    </>
  ) : (
    <Typography variant="body2" color="text.secondary">
      You haven't registered this habit yet.
    </Typography>
  );
}
