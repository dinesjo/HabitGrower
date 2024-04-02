import { Form, LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router-dom";
import { Habit, fetchHabitById } from "../habitsModel";
import {
  Button,
  Container,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import Cover from "./Cover";
import { IconMap } from "../utils/IconMap";
import { toFriendlyString } from "../utils/helpers";

async function loader({ params }: LoaderFunctionArgs<{ id: string }>) {
  const { id } = params;
  if (!id) {
    return null;
  }
  return {
    habit: await fetchHabitById(id),
  };
}

EditHabitForm.loader = loader;

const colors = ["blue", "red", "green", "purple", "orange", "magenta", "brown", "teal", "grey"];

export default function EditHabitForm() {
  const { habit } = useLoaderData() as { habit: Habit };
  const navigate = useNavigate();

  return (
    <Cover>
      <Typography variant="h5" align="center" gutterBottom>
        Edit Habit: <b>{habit.name}</b>
      </Typography>
      <Container maxWidth="xs" component={Form} autoComplete="off" method="post">
        <Grid container spacing={2} sx={{ py: 1 }}>
          <Grid item xs={12} sm={6}>
            <TextField required name="name" label="Habit Name" defaultValue={habit.name} fullWidth />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              name="description"
              label="Description"
              defaultValue={habit.description || ""}
              multiline
              fullWidth
            />
          </Grid>
          <Grid item xs={4}>
            <FormControl required fullWidth>
              <InputLabel>Icon</InputLabel>
              <Select name="icon" label="Icon" defaultValue={habit.icon || ""}>
                {Object.keys(IconMap).map((icon) => (
                  <MenuItem dense key={icon} value={icon}>
                    {IconMap[icon]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select name="color" label="Color" defaultValue={habit.color || ""} fullWidth>
                <MenuItem value="">None</MenuItem>
                {colors.map((color) => (
                  <MenuItem key={color} value={color} sx={{ color: color }}>
                    {toFriendlyString(color)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={5}>
            <TextField
              name="frequency"
              label="Frequency"
              type="number"
              defaultValue={habit.frequency || ""}
              fullWidth
            />
          </Grid>
          <Grid item xs={7}>
            <FormControl fullWidth>
              <InputLabel id="frequencyUnit">Frequency Unit</InputLabel>
              <Select
                name="frequencyUnit"
                label="Frequency Unit"
                labelId="frequencyUnit"
                defaultValue={habit.frequencyUnit || ""}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                <MenuItem value="day">Day</MenuItem>
                <MenuItem value="week">Week</MenuItem>
                <MenuItem value="month">Month</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Stack direction={"row"} spacing={2} my={1}>
          <Button variant="contained" type="submit">
            Save
          </Button>
          <Button
            onClick={() => {
              navigate("/my-habits");
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Container>
    </Cover>
  );
}
