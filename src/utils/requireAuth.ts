import { LoaderFunction, LoaderFunctionArgs, redirect } from "react-router-dom";
import { getUser } from "../firebase";

/**
 * A higher-order function that wraps a loader function and enforces authentication.
 * If the user is not authorized, it redirects to the sign-in page.
 * If the user is authorized, it runs the loader function.
 *
 * @param loader - The loader function to be executed if the user is authorized.
 * @returns A function that enforces authentication and runs the loader function.
 */
export function requireAuth(loader: LoaderFunction) {
  return async function (args: LoaderFunctionArgs, handlerCtx?: unknown) {
    const user = await getUser();
    if (!user) {
      // If the user is not authorized, redirect to the sign-in page
      return redirect("/profile/signin");
    }
    // If the user is authorized, run the loader with both arguments
    return loader(args, handlerCtx);
  };
}
