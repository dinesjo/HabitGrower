import { Container } from "@mui/material";
import { Outlet } from "react-router-dom";

export default function ProfileLayout() {
  return (
    <Container sx={{ p: 1 }}>
      <Outlet />
    </Container>
  );
}
