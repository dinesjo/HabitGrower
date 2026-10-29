import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { TimePicker as MuiTimePicker, type TimePickerProps } from "@mui/x-date-pickers/TimePicker";
import type { Dayjs } from "dayjs";

// Only screens with a time field need the picker adapter and its plugins.
export default function TimePicker(props: TimePickerProps<Dayjs>) {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <MuiTimePicker {...props} />
    </LocalizationProvider>
  );
}
