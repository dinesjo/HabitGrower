import { ChevronLeft } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button startIcon={<ChevronLeft />} aria-label="back" onClick={() => navigate("/")}>
      Back
    </Button>
  );
}
