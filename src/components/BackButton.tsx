import { ChevronLeft } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      startIcon={<ChevronLeft />}
      aria-label="Back to habits"
      variant="text"
      size="small"
      onClick={() => navigate("/")}
      sx={{ px: 1.5, minHeight: 44 }}
    >
      Back to habits
    </Button>
  );
}
