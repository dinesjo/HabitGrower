import { Paper } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <Paper>
      <Outlet />
    </Paper>
  );
}
