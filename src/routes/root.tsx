import { Outlet, useNavigation, NavLink, useRouteLoaderData } from "react-router-dom";
import { useState } from "react";
import {
  Avatar,
  Box,
  CircularProgress,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Theme,
  Toolbar,
  Typography,
  useMediaQuery,
} from "@mui/material";
import { AccountCircle, Add, Home, Menu } from "@mui/icons-material";
import { DevTools } from "jotai-devtools";
import FullscreenSpinner from "../components/FullscreenSpinner";
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
  const user = useRouteLoaderData("root") as User | null;

  const isMobile = useMediaQuery((theme: Theme) => theme.breakpoints.down("md"));
  const [drawerOpen, setDrawerOpen] = useState(false);

  const pages = [
    {
      text: "Profile",
      path: "/profile",
      icon: loading ? (
        <CircularProgress sx={{ color: "primary.contrastText" }} />
      ) : user?.photoURL ? (
        <Avatar src={user.photoURL} alt={user.displayName || "Profile Picture"} />
      ) : (
        <AccountCircle />
      ),
    },
    { text: "Overview", path: "/", icon: <Home /> },
    { text: "New Habit", path: "/add-habit", icon: <Add />, disabled: true },
  ];

  return (
    <>
      <Box sx={{ display: "flex" }}>
        {/* Mobile Menu button */}
        {isMobile && (
          <IconButton
            size="large"
            onClick={() => setDrawerOpen(true)}
            sx={{
              color: "primary.contrastText",
              top: 0,
              left: 0,
              position: "fixed",
              zIndex: 1000,
              bgcolor: "primary.main",
              borderRadius: "0 0 30px 0",
            }}
          >
            <Menu />
          </IconButton>
        )}
        <Drawer
          open={drawerOpen}
          onClose={() => setDrawerOpen(false)}
          sx={{
            width: 240,
            flexShrink: 0,
            "& .MuiDrawer-paper": {
              bgcolor: "#535353",
              color: "white",
              width: 240,
              boxSizing: "border-box",
            },
            "& .MuiListItemIcon-root": {
              // for icons
              color: "white",
            },
          }}
          variant={isMobile ? "temporary" : "permanent"}
          anchor="left"
        >
          <Toolbar>
            <Typography
              variant="h4"
              sx={{
                fontWeight: "bold",
                textAlign: "center",
                width: "100%",
              }}
            >
              HabitGrower
            </Typography>
          </Toolbar>
          <List>
            {pages.map((page, index) => (
              <ListItemButton
                key={index}
                component={NavLink}
                to={page.path}
                sx={{
                  borderRadius: "30px",
                  "&.active": {
                    backgroundColor: "primary.main",
                  },
                  "&.pending": {
                    backgroundColor: "primary.light",
                  },
                }}
                onClick={() => setDrawerOpen(false)} // close mobile sidebar on click
                disabled={page.disabled}
              >
                <ListItemIcon>{page.icon}</ListItemIcon>
                <ListItemText primary={<Typography variant="h6">{page.text}</Typography>} />
              </ListItemButton>
            ))}
          </List>
        </Drawer>
        {loading ? (
          <FullscreenSpinner />
        ) : (
          <Box sx={{ width: "100%", height: "100vh" }}>
            <Outlet />
          </Box>
        )}
      </Box>{" "}
      <DevTools />
    </>
  );
}
