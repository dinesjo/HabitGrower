import { Outlet } from "react-router-dom";
import Cover from "../../components/Cover";

export default function ProfileLayout() {
  return (
    <Cover sx={{ p: 1, minWidth: 300 }}>
      <Outlet />
    </Cover>
  );
}
