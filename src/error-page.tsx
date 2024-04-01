import { Container, Link, Typography } from "@mui/material";
import { Link as RouterLink } from "react-router-dom";

export default function ErrorPage() {
  return (
    <Container
      sx={{ display: "flex", height: "70vh", flexDirection: "column", justifyContent: "center", alignItems: "center" }}
    >
      <Typography variant="h3">Oops!</Typography>
      <Typography variant="subtitle1">Sorry, an unexpected error has occurred.</Typography>
      <Link component={RouterLink} to="/">
        Return to Homepage
      </Link>
    </Container>
  );
}
