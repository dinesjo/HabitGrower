import { Outlet } from "react-router-dom";
import Cover from "../../components/Cover";

export default function ProfileLayout() {
  return (
    <Cover>
      <Outlet />
    </Cover>
  );
}
