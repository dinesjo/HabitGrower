import { Card, Grid, CardHeader, CardActionArea } from "@mui/material";
import { habitsAtom } from "../../store";
import { useAtom } from "jotai";
import { NavLink } from "react-router-dom";

export default function HabitsCards() {
  const [habits] = useAtom(habitsAtom);

  return (
    <>
      <Grid
        container
        direction="column"
        spacing={1}
        sx={{
          paddingRight: 0,
        }}
      >
        {habits.map((habit, index) => (
          <Grid item key={index}>
            <Card>
              <CardActionArea>
                <CardHeader
                  component={NavLink}
                  to={`/overview/${habit.id}`}
                  avatar={habit.icon}
                  title={habit.name}
                  subheader={habit.description}
                  sx={{ color: habit.color || "text.primary", textDecoration: "none" }}
                />
              </CardActionArea>
            </Card>
          </Grid>
        ))}
      </Grid>
    </>
  );
}
