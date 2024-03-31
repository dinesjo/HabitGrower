import { Outlet, useLoaderData } from "react-router-dom";
import ProfileController from "../routes/SignIn/ProfileController";

export default function AuthorizedOutlet() {
  const user = useLoaderData();
  return user ? <Outlet /> : <ProfileController />;
}
