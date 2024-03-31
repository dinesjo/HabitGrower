import { Avatar, Button, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { User } from "firebase/auth";
import { Logout } from "@mui/icons-material";
import { Form, redirect, useLoaderData, useNavigation } from "react-router-dom";
import Cover from "../../components/Cover";
import { getUser } from "../../firebase";

async function loader() {
  const user = await getUser();
  if (user) {
    return user;
  } else {
    throw redirect("/profile/signin");
  }
}

SignedInView.loader = loader;

export default function SignedInView() {
  const user = useLoaderData() as User;
  const loading = useNavigation().state === "loading";
  const { displayName, email, photoURL } = user!;

  return (
    <Cover>
      {loading ? (
        <CircularProgress />
      ) : (
        <>
          <Stack direction="row" spacing={2} justifyContent="center" alignItems="center">
            <Typography variant="h6" mb={2} textAlign="center">
              Hi, {displayName || "there"}!
            </Typography>
            {photoURL && <Avatar alt={"Profile Picture"} src={photoURL} />}
          </Stack>
          <Divider sx={{ my: 1 }} />
          <Typography variant="h5" textAlign={"center"}>
            User Profile
          </Typography>
          {
            <Typography variant="body2" mb={1} textAlign="center">
              You are logged in as <b>{email || "Unknown Email"}</b>.
            </Typography>
          }
          <Form method="post" action="signout">
            <Button variant="contained" startIcon={<Logout />} color="error" type="submit">
              Sign out
            </Button>
          </Form>
        </>
      )}
    </Cover>
  );
}
