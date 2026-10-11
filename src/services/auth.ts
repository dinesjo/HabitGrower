import { redirect } from "react-router-dom";
import { getBackend } from "../data/backend";
import { isLocalMode } from "../data/mode";
import { showSnackBar } from "../utils/helpers";

export async function getUser() { return (await getBackend()).getUser(); }

export async function signOut() {
  await (await getBackend()).signOut();
  if (!isLocalMode) showSnackBar("Signed out successfully!", "success");
  return redirect(isLocalMode ? "/" : "/profile/signin");
}
