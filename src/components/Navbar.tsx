import React, { useState, useContext, useEffect } from "react";
import {
  AppBar,
  Toolbar,
  Button,
  Box,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Avatar,
  Menu,
  MenuItem,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import { useNavigate, useLocation } from "react-router-dom";
import logo from "../assets/logokit/Forsynse logo_Bold_white.png";
import api from "../utils/api";
import {
  getUser,
  setUser,
  removeUser,
  isAuthenticated,
  setAuthenticated,
  removeAuthenticated,
} from "../utils/localStorage";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const isAuth = isAuthenticated();
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const openProfile = Boolean(anchorEl);
  const [user, setUserState] = useState<{ name?: string; email?: string }>({});

  useEffect(() => {
    const auth = isAuthenticated();
    const stored = getUser();
    if (auth && stored?.email) {
      api
        .get(`/auth/otp-user?email=${encodeURIComponent(stored.email)}`)
        .then((res) => setUserState(res.data))
        .catch(() => setUserState(stored));
    } else {
      setUserState(stored || {});
    }
  }, [isAuth]);

  function getInitials(userObj: any) {
    if (!userObj) return "U";
    if (userObj.firstName && userObj.lastName)
      return (userObj.firstName[0] + userObj.lastName[0]).toUpperCase();
    if (userObj.firstName) return userObj.firstName[0].toUpperCase();
    if (userObj.email && userObj.email.includes("@"))
      return userObj.email[0].toUpperCase();
    return "U";
  }

  const handleDrawerToggle = () => setDrawerOpen((prev) => !prev);
  const handleProfileClick = (event: React.MouseEvent<HTMLElement>) =>
    setAnchorEl(event.currentTarget);
  const handleProfileClose = () => setAnchorEl(null);

  const handleLogout = () => {
    removeAuthenticated();
    removeUser();
    navigate("/login");
    handleProfileClose();
  };

  // Navigation links for Drawer
  const navLinks = [
    {
      label: "Login",
      path: "/login",
      show: !isAuth && location.pathname !== "/login",
    },
    {
      label: "Sign Up",
      path: "/signup",
      show: !isAuth && location.pathname !== "/signup",
    },
    {
      label: "Dashboard",
      path: "/dashboard",
      show: isAuth && location.pathname !== "/dashboard",
    },
  ];

  return (
    <AppBar
      position="sticky"
      color="default"
      elevation={0}
      sx={{
        mb: 2,
        background: "#22292f",
        boxShadow: "0 2px 8px rgba(34,41,47,0.18)",
        borderBottom: "1px solid #28292c",
        zIndex: 1100,
      }}
    >
      <Toolbar
        sx={{
          display: "flex",
          justifyContent: "space-between",
          minHeight: 96,
          px: { xs: 2, sm: 8 },
          fontFamily: "Nunito, Nunito Sans, sans-serif",
        }}
      >
        <Box
          display="flex"
          alignItems="center"
          sx={{ cursor: "pointer", gap: 2 }}
          onClick={() => navigate("/")}
        >
          <img
            src={logo}
            alt="Logo"
            style={{
              height: 44,
              width: "auto",
              background: "#22292f",
              padding: 2,
              display: "block",
              maxWidth: 180,
              boxShadow: "0 2px 8px rgba(0,0,0,0.10)",
              borderRadius: 6,
            }}
          />
        </Box>
        {/* Desktop Nav */}
        <Box display={{ xs: "none", md: "flex" }} alignItems="center" gap={2}>
          {!isAuth ? (
            <>
              {location.pathname !== "/login" && (
                <Button
                  color="inherit"
                  variant="text"
                  onClick={() => navigate("/login")}
                  sx={{
                    fontWeight: 600,
                    fontSize: 19,
                    px: 2.5,
                    py: 1.5,
                    textTransform: "none",
                    letterSpacing: 0.2,
                    color: "#fff",
                    transition: "background 0.2s, box-shadow 0.2s",
                    borderRadius: 2,
                    "&:hover": {
                      color: "#fff",
                      background:
                        "linear-gradient(90deg, #218c36 0%, #2563eb 100%)",
                      boxShadow: "0 4px 16px rgba(52,175,69,0.22)",
                    },
                  }}
                >
                  Login
                </Button>
              )}
              {location.pathname !== "/signup" && (
                <Button
                  color="inherit"
                  variant="text"
                  onClick={() => navigate("/signup")}
                  sx={{
                    fontWeight: 600,
                    fontSize: 19,
                    px: 2.5,
                    py: 1.5,
                    textTransform: "none",
                    letterSpacing: 0.2,
                    color: "#fff",
                    transition: "background 0.2s, box-shadow 0.2s",
                    borderRadius: 2,
                    "&:hover": {
                      color: "#fff",
                      background:
                        "linear-gradient(90deg, #218c36 0%, #2563eb 100%)",
                      boxShadow: "0 4px 16px rgba(52,175,69,0.22)",
                    },
                  }}
                >
                  Sign Up
                </Button>
              )}
              <Button
                color="success"
                variant="contained"
                onClick={() => navigate("/signup")}
                sx={{
                  fontWeight: 700,
                  borderRadius: 3,
                  background: "#34af45",
                  color: "#fff",
                  px: 4,
                  py: 1.5,
                  ml: 2,
                  boxShadow: "0 2px 8px rgba(52,175,69,0.10)",
                  textTransform: "none",
                  fontSize: 15,
                  letterSpacing: 0.5,
                  transition: "background 0.2s, box-shadow 0.2s",
                  "&:hover": {
                    background:
                      "linear-gradient(90deg, #218c36 0%, #2563eb 100%)",
                    boxShadow: "0 4px 16px rgba(52,175,69,0.22)",
                  },
                }}
              >
                Get Started
              </Button>
            </>
          ) : (
            <>
              {location.pathname !== "/dashboard" && (
                <Button
                  color="inherit"
                  variant="text"
                  onClick={() => navigate("/dashboard")}
                  sx={{
                    fontWeight: 600,
                    fontSize: 19,
                    px: 2.5,
                    py: 1.5,
                    textTransform: "none",
                    letterSpacing: 0.2,
                    color: "#fff",
                    transition: "background 0.2s, box-shadow 0.2s",
                    borderRadius: 2,
                    "&:hover": {
                      color: "#fff",
                      background:
                        "linear-gradient(90deg, #218c36 0%, #2563eb 100%)",
                      boxShadow: "0 4px 16px rgba(52,175,69,0.22)",
                    },
                  }}
                >
                  Dashboard
                </Button>
              )}
              {/* Profile Avatar */}
              <IconButton onClick={handleProfileClick} sx={{ ml: 2 }}>
                <Avatar sx={{ bgcolor: "#34af45", width: 40, height: 40 }}>
                  {getInitials(user)}
                </Avatar>
              </IconButton>
              {/* Only one Menu for avatar */}
              {openProfile && (
                <Menu
                  anchorEl={anchorEl}
                  open={openProfile}
                  onClose={handleProfileClose}
                >
                  <MenuItem disabled>
                    {user.firstName || user.email || "User"}
                  </MenuItem>
                  <MenuItem onClick={handleLogout}>Logout</MenuItem>
                </Menu>
              )}
            </>
          )}
        </Box>
        {/* Mobile Nav */}
        <Box display={{ xs: "flex", md: "none" }}>
          <IconButton onClick={handleDrawerToggle} sx={{ color: "#fff" }}>
            <MenuIcon fontSize="large" />
          </IconButton>
          <Drawer anchor="right" open={drawerOpen} onClose={handleDrawerToggle}>
            <Box sx={{ width: 260, p: 2 }}>
              <Box display="flex" alignItems="center" mb={2}>
                <img
                  src={logo}
                  alt="Logo"
                  style={{ height: 36, width: "auto", marginRight: 8 }}
                />
              </Box>
              <List>
                {navLinks
                  .filter((link) => link.show)
                  .map((link) => (
                    <ListItem key={link.label} disablePadding>
                      <ListItemButton
                        onClick={() => {
                          navigate(link.path);
                          setDrawerOpen(false);
                        }}
                        sx={{
                          borderRadius: 2,
                          transition: "background 0.2s, box-shadow 0.2s",
                          "&:hover": {
                            background:
                              "linear-gradient(90deg, #218c36 0%, #2563eb 100%)",
                            color:
                              link.label === "Dashboard"
                                ? "#60a5fa"
                                : "#34af45",
                            boxShadow: "0 4px 16px rgba(52,175,69,0.22)",
                          },
                        }}
                      >
                        <ListItemText primary={link.label} />
                      </ListItemButton>
                    </ListItem>
                  ))}
                {!isAuth && (
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => {
                        navigate("/signup");
                        setDrawerOpen(false);
                      }}
                    >
                      <ListItemText
                        primary="Get Started"
                        sx={{ color: "#34af45", fontWeight: 700 }}
                      />
                    </ListItemButton>
                  </ListItem>
                )}
                {isAuth && (
                  <ListItem disablePadding>
                    <ListItemButton onClick={handleLogout}>
                      <ListItemText primary="Logout" />
                    </ListItemButton>
                  </ListItem>
                )}
              </List>
            </Box>
          </Drawer>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
