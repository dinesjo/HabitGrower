import { LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router-dom";
import { Habit, fetchHabitById } from "../../habitsModel";
import dayjs from "dayjs";
import { LineChart } from "@mui/x-charts";
import { Avatar, Button, Card, CardActions, CardContent, CardHeader, Typography } from "@mui/material";
import Cover from "../../components/Cover";
import { ChevronLeft } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  return {
    habit: await fetchHabitById(id),
  };
}

SelectedHabitGraph.loader = loader;

export default function SelectedHabitGraph() {
  const { habit } = useLoaderData() as { habit: Habit };
  const navigate = useNavigate();
  const dateData = Object.keys(habit.dates || {}).reduce((acc: { date: number; value: number }[], date: string) => {
    const currentDate = dayjs(date).startOf("day").unix() / (60 * 60 * 24);
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
  console.log(dateData);

  return habit.dates ? (
    <Cover sx={{ p: 1, minWidth: 300 }}>
      <Card>
        <CardActions>
          <Button startIcon={<ChevronLeft />} aria-label="back" onClick={() => navigate("/")}>
            Back
          </Button>
        </CardActions>
        <CardHeader
          avatar={
            <Avatar
              sx={{
                bgcolor: habit.color || "text.primary",
              }}
            >
              {IconMap[habit.icon || "default"]}
            </Avatar>
          }
          title={
            <Typography
              variant="h5"
              sx={{
                color: habit.color || "text.primary",
              }}
            >
              {habit.name}
            </Typography>
          }
          subheader={habit.description}
        />
        <CardContent>
          <Typography variant="body2" color="text.secondary">
            You've registered this habit {habit.dates.length} times.
          </Typography>
          <LineChart
            width={300}
            height={200}
            xAxis={[
              {
                dataKey: "date",
                valueFormatter: (unix) => dayjs.unix(unix).format("MMM D"),
              },
            ]}
            series={dateData.map((entry) => ({
              dataKey: "value",
              label: dayjs.unix(entry.date).format("MMM D"),
            }))}
            dataset={dateData}
          />
        </CardContent>
      </Card>
    </Cover>
  ) : (
    <Typography variant="body2" color="text.secondary">
      You haven't registered this habit yet.
    </Typography>
  );
}
