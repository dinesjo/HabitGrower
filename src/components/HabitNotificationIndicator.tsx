import { NotificationsActiveOutlined } from "@mui/icons-material";
import { Box, SxProps, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Habit } from "../types/Habit";

export default function HabitNotificationIndicator({ habit, ...props }: { habit: Habit; sx?: SxProps }) {
  if (habit.notificationEnabled && habit.notificationTime) {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.5,
            ...props.sx,
          }}
        >
          <NotificationsActiveOutlined sx={{ fontSize: "1rem" }} />•
          <Typography variant="caption">
            {dayjs("2020-01-01 " + habit.notificationTime + " Z")
              .local()
              .format("HH:mm")}
          </Typography>
        </Box>
      </>
    );
  }
}
