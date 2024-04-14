import { Paper } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <Paper sx={{ p: 1 }}>
      <Outlet />
    </Paper>
  );
}
