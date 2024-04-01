import {
  Box,
  Divider,
  Fab,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import Cover from "../../components/Cover";
import { Form, redirect, useLoaderData, useNavigate } from "react-router-dom";
import { Habit, fetchHabits } from "../../habitsModel";
import { Add, Edit } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";
import { getUser } from "../../firebase";

async function loader() {
  const user = await getUser();
  if (!user) {
    return redirect("/profile/signin");
  }

  return {
    habits: await fetchHabits(),
  };
}

MyHabitsIndex.loader = loader;

export default function MyHabitsIndex() {
  const { habits } = useLoaderData() as { habits: Record<string, Habit> };
  const navigate = useNavigate();

  return (
    <>
      <Cover>
        <Box sx={{ position: "relative" }}>
          <Typography variant="h5" align="center" gutterBottom>
            My Habits
          </Typography>
          <Divider />
          <List
            sx={{
              minWidth: 260,
              maxHeight: "calc(100vh - 200px)",
              overflow: "auto",
            }}
          >
            {Object.keys(habits).map((key) => {
              const habit = habits[key];
              return (
                <ListItem
                  disablePadding
                  key={key}
                  secondaryAction={
                    <IconButton edge="end" onClick={() => navigate(`/my-habits/${key}/edit`)}>
                      <Edit />
                    </IconButton>
                  }
                >
                  <ListItemButton sx={{ p: 1 }} onClick={() => navigate(`/my-habits/${key}`)}>
                    <ListItemAvatar sx={{ color: habit.color }}>{IconMap[habit.icon || "Default"]}</ListItemAvatar>
                    <ListItemText
                      primary={<Typography sx={{ color: habit.color }}>{habit.name}</Typography>}
                      secondary={habit.description}
                    />
                  </ListItemButton>
                </ListItem>
              );
            })}
          </List>
          <Box
            sx={{
              position: "absolute",
              bottom: -48,
              right: 0,
              transform: "translate(-50%, 50%)",
            }}
          >
            <Form action="/my-habits/new-habit" method="post">
              <Fab type="submit" variant="extended" color="primary">
                <Add sx={{ mr: 1 }} />
                New Habit
              </Fab>
            </Form>
          </Box>
        </Box>
      </Cover>
    </>
  );
}
