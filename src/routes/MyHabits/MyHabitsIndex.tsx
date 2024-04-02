import {
  Avatar,
  Box,
  CircularProgress,
  Divider,
  Fab,
  List,
  ListItem,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography,
} from "@mui/material";
import Cover from "../../components/Cover";
import { Form, useLoaderData, useNavigate, useNavigation } from "react-router-dom";
import { Habit, fetchHabits } from "../../habitsModel";
import { Add } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";

async function loader() {
  return {
    habits: await fetchHabits(),
  };
}

MyHabitsIndex.loader = loader;

export default function MyHabitsIndex() {
  const { habits } = useLoaderData() as { habits: Record<string, Habit> };
  const navigate = useNavigate();
  const navigation = useNavigation();

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
                <ListItem disablePadding key={key}>
                  <ListItemButton sx={{ p: 1 }} onClick={() => navigate(`/my-habits/${key}`)}>
                    <ListItemAvatar sx={{ color: habit.color }}>
                      <Avatar
                        sx={{
                          bgcolor: habit.color || "text.primary",
                        }}
                      >
                        {IconMap[habit.icon || "default"]}
                      </Avatar>
                    </ListItemAvatar>
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
              width: "100%",
              display: "flex",
              justifyContent: "center",
              bottom: "-2rem",
            }}
          >
            <Form action="/my-habits/new-habit" method="post">
              {navigation.state === "submitting" ? (
                <Fab type="submit" variant="extended" color="primary" disabled>
                  <CircularProgress size="2rem" sx={{ mr: 1 }} />
                  New Habit
                </Fab>
              ) : (
                <Fab type="submit" variant="extended" color="primary">
                  <Add sx={{ mr: 1 }} />
                  New Habit
                </Fab>
              )}
            </Form>
          </Box>
        </Box>
      </Cover>
    </>
  );
}
