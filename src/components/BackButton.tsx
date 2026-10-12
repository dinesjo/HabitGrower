import { ChevronLeft } from "@mui/icons-material";
import { Button } from "@mui/material";
import { useNavigate, useNavigation } from "react-router-dom";

export default function BackButton() {
  const navigate = useNavigate();
  const navigation = useNavigation();
  return (
    <Button
      startIcon={<ChevronLeft />}
      aria-label="Back to habits"
      variant="text"
      size="small"
      disabled={navigation.state === "submitting"}
      onClick={() => navigate("/")}
      sx={{ px: 1.5, minHeight: 44 }}
    >
      Back to habits
    </Button>
  );
}
