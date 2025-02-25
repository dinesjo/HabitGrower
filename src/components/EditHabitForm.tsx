import { Form, LoaderFunctionArgs, useLoaderData, useNavigate, useNavigation, useParams } from "react-router-dom";
import { Habit, fetchHabitById } from "../habitsModel";
import {
  Box,
  Button,
  Card,
  CardActions,
  CardContent,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  MenuItem,
  Select,
  TextField,
  Typography,
} from "@mui/material";
import { IconMap } from "../utils/IconMap";
import { toFriendlyString } from "../utils/helpers";
import DeleteHabitWithConfirm from "./DeleteHabitWithConfirm";
import { ColorLens, EventRepeat, Save } from "@mui/icons-material";
import BackButton from "./BackButton";

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
    "SlateGray",
    "SteelBlue",
    "SkyBlue",
    "SlateBlue",
    "MediumSeaGreen",
    "LightGreen",
    "ForestGreen",
    "Tomato",
    "Salmon",
    "Orange",
    "PaleVioletRed",
    "SandyBrown",
  ];

  const handleBack = () => {
    navigate(`/${id}`);
  };

  return (
    <Card>
      <CardActions>
        <BackButton />
      </CardActions>
      <Form autoComplete="off" method="post">
        <Typography variant="h5" align="center" gutterBottom>
          Edit Habit: <b>{habit.name}</b>
        </Typography>
        <CardContent>
          <Grid container spacing={2}>
            {/* Section tile */}
            <Grid item xs={12}>
              <Divider>
                <Chip icon={<ColorLens />} label="APPEARANCE" size="small" />
              </Divider>
            </Grid>
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
            <Grid item container xs={12} spacing={2} display="flex" alignItems="start" sx={{ height: "100%" }}>
              <Grid item xs={"auto"} sx={{ height: "inherit" }}>
                <FormControl required fullWidth>
                  <InputLabel>Icon</InputLabel>
                  <Select
                    autoWidth
                    name="icon"
                    label="Icon"
                    defaultValue={habit.icon || ""}
                    renderValue={(icon) => {
                      return <Box sx={{ height: "1em" }}>{IconMap[icon]}</Box>;
                    }}
                  >
                    {Object.keys(IconMap).map((icon) => (
                      <MenuItem key={icon} value={icon}>
                        {IconMap[icon]}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs>
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
            </Grid>
            {/* Section tile */}
            <Grid item xs={12}>
              <Divider>
                <Chip icon={<EventRepeat />} label="HOW OFTEN?" size="small" />
              </Divider>
            </Grid>
            <Grid item xs={5}>
              <TextField
                name="frequency"
                label="Frequency"
                placeholder="3"
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
        </CardContent>
        <Divider />
        <CardActions>
          <Button startIcon={<Save />} variant="contained" type="submit" disabled={navigation.state === "submitting"}>
            Save
          </Button>
          <Button onClick={handleBack}>Cancel</Button>
          <DeleteHabitWithConfirm habit={habit} id={id!} />
        </CardActions>
      </Form>
    </Card>
  );
}
