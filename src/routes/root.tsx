import { Outlet, useNavigation, NavLink, useRouteLoaderData } from "react-router-dom";
import { useEffect, useState } from "react";
import {
  Avatar,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  CircularProgress,
  LinearProgress,
  Paper,
} from "@mui/material";
import { AccountCircle, ChecklistRtl, FormatListBulleted } from "@mui/icons-material";
import { getUser } from "../firebase";
import { User } from "firebase/auth";

async function loader() {
  const user = await getUser();
  return user;
}

Root.loader = loader;

export default function Root() {
  // Router
  const navigation = useNavigation();
  const loading = navigation.state === "loading";
  const [showLoading, setShowLoading] = useState(false);

  useEffect(() => {
    let timeoutId: NodeJS.Timeout;
    if (loading) {
      timeoutId = setTimeout(() => setShowLoading(true), 200); // delay
    } else {
      setShowLoading(false);
    }
    return () => clearTimeout(timeoutId); // clear timeout on unmount or when loading changes
  }, [loading]);
  const user = useRouteLoaderData("root") as User | null;

  const pages = [
    {
      text: "Profile",
      path: "/profile",
      icon:
        loading && !user ? (
          <CircularProgress sx={{ color: "primary.contrastText" }} />
        ) : user?.photoURL ? (
          <Avatar src={user.photoURL} alt={user.displayName || "Profile Picture"} />
        ) : (
          <AccountCircle />
        ),
    },
    { text: "Overview", path: "/", icon: <ChecklistRtl /> },
    { text: "My Habits", path: "/my-habits", icon: <FormatListBulleted /> },
  ];

  return (
    <>
      <Box sx={{ width: "100%", height: "calc(100vh - 56px)" }}>
        <Outlet />
      </Box>
      <Paper
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 1001,
        }}
      >
        {showLoading && <LinearProgress />}
        <BottomNavigation>
          {pages.map((page, index) => (
            <BottomNavigationAction
              key={index}
              component={NavLink}
              to={page.path}
              label={page.text}
              showLabel={location.pathname === page.path}
              icon={page.icon}
              sx={{
                "&.active": {
                  bgcolor: "primary.main",
                  color: "primary.contrastText",
                },
                "&.pending": {
                  bgcolor: "primary.light",
                  color: "primary.contrastText",
                },
              }}
            />
          ))}
        </BottomNavigation>
      </Paper>
    </>
  );
}
