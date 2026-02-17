import { NotificationsActiveOutlined } from "@mui/icons-material";
import { Box, SxProps, Typography } from "@mui/material";
import dayjs from "dayjs";
import { Habit } from "../types/Habit";
import { alphaOrFallback } from "../utils/color";

export default function HabitNotificationIndicator({ habit, ...props }: { habit: Habit; sx?: SxProps }) {
  if (habit.notificationEnabled && habit.notificationTime) {
    return (
      <>
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0.6,
            color: habit.color,
            px: 0.8,
            py: 0.35,
            borderRadius: 999,
            border: "1px solid",
            borderColor: (theme) =>
              alphaOrFallback(habit.color, theme.palette.primary.main, theme.palette.mode === "dark" ? 0.35 : 0.2),
            bgcolor: (theme) =>
              alphaOrFallback(habit.color, theme.palette.primary.main, theme.palette.mode === "dark" ? 0.18 : 0.09),
            ...props.sx,
          }}
        >
          <NotificationsActiveOutlined sx={{ fontSize: "1rem" }} />
          <Typography variant="caption">
            {(() => {
              const [hours, minutes] = habit.notificationTime.split(":");
              return dayjs.utc().set("hour", parseInt(hours)).set("minute", parseInt(minutes)).local().format("HH:mm");
            })()}
          </Typography>
        </Box>
      </>
    );
  }

  return null;
}
