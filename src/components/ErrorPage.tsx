import { Box, Container, Grow, Link, Typography } from "@mui/material";
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
  return (
    <Box sx={ambientPageSx}>
      <Container
        sx={{ ...contentLayerSx, display: "flex", minHeight: "75vh", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
      >
        <Grow in={true} timeout={600}>
          <Box sx={{ ...glassPanelSx, px: 4, py: 3.5, maxWidth: 520, textAlign: "center" }}>
            <Typography variant="h3" sx={{ mb: 1 }}>
              Oops!
            </Typography>
            <Typography variant="subtitle1" sx={{ mb: 1 }}>
              Sorry, an unexpected error has occurred.
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {errorMessage}
            </Typography>
            <Link component={RouterLink} to="/" sx={{ fontWeight: 700 }}>
              Return to Homepage
            </Link>
          </Box>
        </Grow>
      </Container>
    </Box>
  );
}
