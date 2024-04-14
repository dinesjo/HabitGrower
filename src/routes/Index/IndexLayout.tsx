import { Paper } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function IndexLayout() {
  return (
    <Paper sx={{ mb: 6 }}>
      <Outlet />
    </Paper>
  );
}
