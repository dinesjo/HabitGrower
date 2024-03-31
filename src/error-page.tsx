import { Container, Link, Typography } from "@mui/material";
import { useRouteError, Link as RouterLink } from "react-router-dom";

export default function ErrorPage() {
  const error = useRouteError();

  return (
    <Container
      sx={{ display: "flex", height: "70vh", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
    >
      <Typography variant="h3">Oops!</Typography>
      <Typography variant="subtitle1">Sorry, an unexpected error has occurred.</Typography>
      <Typography variant="body1">
        <i>{error.statusText || error.message}</i>
      </Typography>
      <Link component={RouterLink} to="/">
        Return to Safety
      </Link>
    </Container>
  );
}
