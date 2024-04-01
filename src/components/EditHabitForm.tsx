import { Form, LoaderFunctionArgs, useLoaderData, useNavigate } from "react-router-dom";
import { fetchHabitById } from "../habitsModel";
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

export default function EditHabitForm() {
  const { habit } = useLoaderData();
  const navigate = useNavigate();

  return (
    <Cover>
      <Typography variant="h5" gutterBottom>
        Edit Habit
      </Typography>
      <Container
        component={Form}
        autoComplete="off"
        method="post"
        sx={{
          mt: 2,
        }}
      >
        <Grid container spacing={2}>
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
          <Grid item xs={6} sm={6}>
            <FormControl fullWidth>
              <InputLabel id="icon">Icon</InputLabel>
              <Select name="icon" labelId="icon" label="Icon" defaultValue={habit.icon || ""}>
                <MenuItem value="">None</MenuItem>
                {Object.keys(IconMap).map((icon) => (
                  <MenuItem dense key={icon} value={icon}>
                    {IconMap[icon]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField name="color" label="Color" defaultValue={habit.color || ""} fullWidth />
          </Grid>
          <Grid item xs={6} sm={6}>
            <TextField
              name="frequency"
              label="Frequency"
              type="number"
              defaultValue={habit.frequency || ""}
              fullWidth
            />
          </Grid>
          <Grid item xs={6} sm={6}>
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
        <Stack direction={"row"} spacing={2} mt={2}>
          <Button variant="contained" type="submit">
            Save
          </Button>
          <Button
            onClick={() => {
              navigate(-1);
            }}
          >
            Cancel
          </Button>
        </Stack>
      </Container>
    </Cover>
  );
}
