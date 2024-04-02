import { Outlet, useLoaderData } from "react-router-dom";
import SignInView from "../routes/Profile/SignInView";

export default function AuthorizedOutlet() {
  const user = useLoaderData();
  return user ? <Outlet /> : <SignInView />;
}
