import { getBackend } from "../data/backend";
import { isLocalMode } from "../data/mode";

export const fetchFcmToken = () => {
  if (!isLocalMode) void getBackend().then((backend) => backend.fetchFcmToken()).catch(console.error);
};
