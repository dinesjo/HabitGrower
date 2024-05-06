import { Form, LoaderFunctionArgs, useLoaderData, useNavigate, useNavigation, useParams } from "react-router-dom";
import { Habit, fetchHabitById } from "../habitsModel";
import {
  Button,
  Card,
  CardActions,
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
import { IconMap } from "../utils/IconMap";
import { toFriendlyString } from "../utils/helpers.tsx";
import DeleteWithConfirm from "./DeleteWithConfirm.tsx";
import { ChevronLeft, Save } from "@mui/icons-material";

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
  const { habit } = useLoaderData() as { habit: Habit };
  const { id } = useParams();
  const navigate = useNavigate();
  const navigation = useNavigation();
  const colorChoices = [
    "slategray",
    "steelblue",
    "skyblue",
    "slateblue",
    "mediumseagreen",
    "lightgreen",
    "forestgreen",
    "tomato",
    "salmon",
    "orange",
    "palevioletred",
    "sandybrown",
  ];

  const handleBack = () => {
    navigate(`/${id}`);
  };

  return (
    <Card>
      <CardActions>
        <Button startIcon={<ChevronLeft />} aria-label="back" onClick={handleBack}>
          Back
        </Button>
      </CardActions>
      <Container maxWidth="xs" component={Form} autoComplete="off" method="post">
        <Typography variant="h5" align="center" gutterBottom>
          Edit Habit: <b>{habit.name}</b>
        </Typography>
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
              <Select autoWidth name="icon" label="Icon" defaultValue={habit.icon || ""}>
                {Object.keys(IconMap).map((icon) => (
                  <MenuItem key={icon} value={icon}>
                    {IconMap[icon]}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={8}>
            <FormControl fullWidth>
              <InputLabel>Color</InputLabel>
              <Select
                name="color"
                label="Color"
                defaultValue={habit.color || ""}
                renderValue={(value) => {
                  return <Typography sx={{ color: value }}>{toFriendlyString(value)}</Typography>;
                }}
                fullWidth
              >
                <MenuItem value="">None</MenuItem>
                {colorChoices.map((color) => (
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
              label="How often?"
              type="number"
              defaultValue={habit.frequency || ""}
              fullWidth
            />
          </Grid>
          <Grid item xs={7}>
            <FormControl fullWidth>
              <InputLabel id="frequencyUnit">Every</InputLabel>
              <Select
                name="frequencyUnit"
                label="Every"
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
          <Button startIcon={<Save />} variant="contained" type="submit" disabled={navigation.state === "submitting"}>
            Save
          </Button>
          <Button onClick={handleBack}>Cancel</Button>
          <DeleteWithConfirm habit={habit} id={id!} />
        </Stack>
      </Container>
    </Card>
  );
}
