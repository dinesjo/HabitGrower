import { IconButton, List, ListItem, ListItemAvatar, ListItemText } from "@mui/material";
import Cover from "../../components/Cover";
import { useLoaderData, useNavigate } from "react-router-dom";
import { fetchHabits } from "../../habitsModel";
import { Edit } from "@mui/icons-material";
import { IconMap } from "../../utils/IconMap";

async function loader() {
  return {
    habits: await fetchHabits(),
  };
}

MyHabitsIndex.loader = loader;

export default function MyHabitsIndex() {
  const { habits } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Cover>
      <List>
        {habits.map((habit, index) => (
          <List key={index}>
            <ListItem
              secondaryAction={
                <IconButton edge="end" onClick={() => navigate(`/my-habits/edit/${habit.id}`)}>
                  <Edit />
                </IconButton>
              }
            >
              <ListItemAvatar sx={{ color: habit.color }}>{IconMap[habit.icon]}</ListItemAvatar>
              <ListItemText primary={habit.name} secondary={habit.description} />
            </ListItem>
          </List>
        ))}
      </List>
    </Cover>
  );
}
