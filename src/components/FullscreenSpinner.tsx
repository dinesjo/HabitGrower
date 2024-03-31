import { Box, CircularProgress } from "@mui/material";
import Cover from "./Cover";

export default function FullscreenSpinner() {
  return (
    <Box sx={{ width: "100%", height: "100vh" }}>
      <Cover>
        <CircularProgress />
      </Cover>
    </Box>
  );
}
