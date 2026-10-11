// Never enable the demo on a deployed build, or through a URL parameter.
const loopbackHosts = ["localhost", "127.0.0.1", "[::1]"];
export const isLocalMode = import.meta.env.DEV && import.meta.env.MODE === "local-demo";

if (import.meta.env.MODE === "local-demo" && !import.meta.env.DEV) {
  throw new Error("Local demo mode requires a development server.");
}

if (isLocalMode && !loopbackHosts.includes(window.location.hostname)) {
  throw new Error("Local demo mode must run on localhost.");
}
