import { Box, Button, Container, Typography } from "@mui/material";
import { Link as RouterLink, isRouteErrorResponse, useRouteError } from "react-router-dom";
import { ambientPageSx, contentLayerSx, glassPanelSx } from "../styles/designLanguage";

export default function ErrorPage() {
  const error = useRouteError();
  let errorMessage: string;

  if (isRouteErrorResponse(error)) {
    // error is type `ErrorResponse`
    errorMessage = error.data.message || error.statusText;
  } else if (error instanceof Error) {
    errorMessage = error.message;
  } else if (typeof error === "string") {
    errorMessage = error;
  } else {
    console.error(error);
    errorMessage = "Unknown error";
  }
  const missingHabit = isRouteErrorResponse(error) && error.status === 404;
  return (
    <Box sx={{ ...ambientPageSx, minHeight: ["100vh", "100dvh"] }}>
      <Container sx={{ ...contentLayerSx, display: "flex", minHeight: ["100vh", "100dvh"], alignItems: "center", justifyContent: "center", py: 4 }}>
        <Box sx={{ ...glassPanelSx, p: { xs: 3, sm: 4 }, maxWidth: 480, width: "100%", textAlign: "center" }}>
          <Typography component="h1" variant="h4" sx={{ fontSize: "2rem", mb: 1.5 }}>
            {missingHabit ? "Habit not found" : "Something went wrong"}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 3, lineHeight: 1.6, overflowWrap: "anywhere" }}>
            {missingHabit ? "Open a habit from your list to continue." : errorMessage}
          </Typography>
          <Button component={RouterLink} to="/" variant="contained" fullWidth sx={{ minHeight: 48 }}>
            Back to habits
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
