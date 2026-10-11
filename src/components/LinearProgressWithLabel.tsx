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
        disableTouchListener
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
        <Box sx={{ minWidth: 60, flexShrink: 0, mr: 1 }}>
          <Chip
            sx={{
              width: "100%",
              color: "text.primary",
              fontVariantNumeric: "tabular-nums",
              "& .MuiChip-label": { px: 1, overflow: "visible", textOverflow: "clip" },
            }}
            variant="outlined"
            label={`${progressValue}%`}
            size="small"
            color={progressValue === 100 ? "default" : chipColor}
          />
        </Box>
      </Tooltip>
      <Tooltip title="Progress toward your goal" arrow disableTouchListener>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <LinearProgress
            aria-label="Progress toward your goal"
            variant="determinate"
            {...props}
            sx={{
              borderRadius: 99,
              "& .MuiLinearProgress-bar": {
                borderRadius: 99,
              },
              ...(props.sx as object),
            }}
          />
        </Box>
      </Tooltip>
    </Box>
  );
}
