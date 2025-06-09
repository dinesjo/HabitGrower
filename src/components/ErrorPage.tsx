import { Container, Grow, Link, Typography } from "@mui/material";
import { Link as RouterLink, isRouteErrorResponse, useRouteError } from "react-router-dom";

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
    <Container
      sx={{ display: "flex", height: "70vh", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
    >
      <Grow in={true} timeout={600}>
        <div>
          <Typography variant="h3">Oops!</Typography>
          <Typography variant="subtitle1">Sorry, an unexpected error has occurred.</Typography>
          <Typography variant="subtitle2">{errorMessage}</Typography>
          <Link component={RouterLink} to="/">
            Return to Homepage
          </Link>
        </div>
      </Grow>
    </Container>
  );
}
