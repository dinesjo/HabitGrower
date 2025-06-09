import { AlertColor, Box, Chip, LinearProgress, Tooltip, Typography } from "@mui/material";

export default function LinearProgressWithLabel({ ...props }) {
  const progressValue = Math.round(props.value);
  const bufferValue = Math.round(props.valueBuffer);
  const diff = bufferValue - progressValue;
  let chipColor: AlertColor = "success";
  if (diff > 40) {
    chipColor = "error";
  } else if (diff > 20) {
    chipColor = "warning";
  }

  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Tooltip
        title={
          <Box>
            <Typography variant="body2" sx={{ color: "success.main" }}>
              Green: on track
            </Typography>
            <Typography variant="body2" sx={{ color: "warning.main" }}>
              Yellow: behind schedule
            </Typography>
            <Typography variant="body2" sx={{ color: "error.main" }}>
              Red: far behind schedule
            </Typography>
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Gray: complete
            </Typography>
          </Box>
        }
      >
        <Box sx={{ minWidth: 50, mr: 1 }}>
          <Chip
            sx={{ padding: 0, width: "100%", height: "100%" }}
            variant="outlined"
            label={`${progressValue}%`}
            size="small"
            color={progressValue === 100 ? "default" : chipColor}
            disabled={progressValue === 100}
          />
        </Box>
      </Tooltip>
      <Tooltip title="Progress make to goal" arrow>
        <Box sx={{ width: "100%" }}>
          <LinearProgress variant="determinate" {...props} />
        </Box>
      </Tooltip>
    </Box>
  );
}
