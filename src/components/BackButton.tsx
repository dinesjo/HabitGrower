import { ChevronLeft } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useNavigate } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  return (
    <Button
      startIcon={<ChevronLeft />}
      aria-label="back"
      variant="outlined"
      size="small"
      onClick={() => navigate("/")}
      sx={{ borderRadius: 999, px: 1.5 }}
    >
      Back
    </Button>
  );
}
