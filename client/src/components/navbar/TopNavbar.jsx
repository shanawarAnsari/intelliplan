import React, { useMemo, useState } from "react";
import {
  Box,
  Typography,
  Avatar,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  Menu,
  Divider,
  Tooltip,
  ListItemIcon,
  ListItemText,
  Button,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import LogoutRoundedIcon from "@mui/icons-material/LogoutRounded";
import { NavLink, useNavigate } from "react-router-dom";
import Logo from "../../assets/Intelliplan-logo.png";
import { useUserStore } from "../../store/userStore";
import { oktaAuth } from "../Login/oktaConfig";

const BRAND_PRIMARY = "#1B938A";
const NAV_FONT =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";
const domains = [{ id: "demand", title: "Demand Planning" }];

const TopNavbar = () => {
  const {
    setIsLoggedIn,
    setIsUserLoading,
    setUser,
    setAuthToken,
    setIsUserAdmin,
  } = useUserStore();
  const theme = useTheme();
  const navigate = useNavigate();
  const { user, isLoggedIn } = useUserStore();
  const [selectedDomain, setSelectedDomain] = useState(domains[0]);
  const [menuAnchor, setMenuAnchor] = useState(null);

  const handleLogout = async () => {
    handleCloseMenu();

    // Clear your app session/state
    localStorage.removeItem("authToken");
    setIsUserLoading(false);
    setIsUserAdmin(false);
    setAuthToken("");
    setUser(null);
    setIsLoggedIn(false);

    navigate("/", { replace: true });
  };

  const handleOpenMenu = (event) => setMenuAnchor(event.currentTarget);
  const handleCloseMenu = () => setMenuAnchor(null);

  const isDark = theme.palette.mode === "dark";
  const HEIGHT = 56;

  const navLinkBase = {
    position: "relative",
    textDecoration: "none",
    color: theme.palette.text.primary,
    fontWeight: 600,
    fontSize: "0.82rem",
    fontFamily: NAV_FONT,
    padding: "6px 10px",
    margin: "0 2px",
    borderRadius: "8px",
    transition: "color 180ms ease, background-color 180ms ease",
    display: "inline-flex",
    alignItems: "center",
    lineHeight: 1,
    "&:hover": {
      color: BRAND_PRIMARY,
      backgroundColor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.04)",
    },
    "& .active-indicator": {
      content: '""',
      position: "absolute",
      left: 8,
      right: 8,
      bottom: -2,
      height: 2,
      borderRadius: 2,
      background: BRAND_PRIMARY,
      transform: "scaleX(0)",
      transformOrigin: "left",
      transition: "transform 200ms ease",
    },
    "&.active .active-indicator": {
      transform: "scaleX(1)",
    },
  };

  const initials = useMemo(() => {
    const name = user?.name || "";
    const parts = name.trim().split(" ").filter(Boolean);
    if (parts.length === 0) return "IP";
    if (parts.length === 1) return parts[0].charAt(0).toUpperCase();
    return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase();
  }, [user?.name]);

  const menuId = "account-menu";

  return (
    <Box
      component="header"
      sx={{
        position: "sticky",
        top: 0,
        zIndex: (t) => t.zIndex.appBar + 1,
        backgroundColor: isDark ? "#05121f" : "#ffffff",
        borderBottom: `1px solid ${theme.palette.divider}`,
        width: "100%",
      }}
    >
      <Box
        sx={{
          height: HEIGHT,
          px: { xs: 4, sm: 8 },
          display: "flex",
          alignItems: "center",
          width: "100%",
          gap: 1,
        }}
      >
        {/* Logo + domain select */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box
            onClick={() => navigate("/")}
            sx={{ display: "flex", alignItems: "center", cursor: "pointer", minWidth: 0 }}
          >
            <img src={Logo} alt="Intelliplan Logo" height="32" style={{ borderRadius: 6 }} />
          </Box>

          <Box aria-hidden sx={{ width: "1px", height: 20, mx: 1, bgcolor: theme.palette.divider, borderRadius: "1px", opacity: 0.9 }} />


        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Nav links + auth controls */}
        <Box sx={{ display: "flex", alignItems: "center", gap: { xs: 0.5, sm: 1.25 }, minWidth: 0 }}>
          <Box component="nav" sx={{ display: { xs: "none", sm: "flex" }, alignItems: "center", gap: 0.25, mr: 0.5 }} aria-label="Primary Navigation">
            <NavLink to="/" end style={{ textDecoration: "none" }}>
              {({ isActive }) => (
                <Box sx={{ ...navLinkBase }} className={isActive ? "active" : ""}>
                  Home <span className="active-indicator" />
                </Box>
              )}
            </NavLink>


          </Box>

          {/* Right side: Sign in button OR avatar */}
          {!isLoggedIn ? (
            <Button
              size="small"
              variant="outlined"
              onClick={() => navigate('/login')}
              sx={{ textTransform: 'none', fontWeight: 700 }}
            >
              Sign in
            </Button>
          ) : (
            <Tooltip title="Account" arrow enterDelay={300}>
              <Avatar
                sx={{
                  width: 30,
                  height: 30,
                  bgcolor: BRAND_PRIMARY,
                  color: "#fff",
                  fontWeight: 700,
                  fontSize: "0.8rem",
                  cursor: "pointer",
                }}
                onClick={handleOpenMenu}
                aria-controls={menuAnchor ? menuId : undefined}
                aria-haspopup="true"
                aria-expanded={menuAnchor ? "true" : undefined}
              >
                {initials}
              </Avatar>
            </Tooltip>
          )}
        </Box>
      </Box>

      {/* Profile Menu */}
      <Menu
        id={menuId}
        anchorEl={menuAnchor}
        open={Boolean(menuAnchor)}
        onClose={handleCloseMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        PaperProps={{
          elevation: 6,
          sx: {
            mt: 1,
            minWidth: 240,
            borderRadius: 2,
            border: `1px solid ${theme.palette.divider}`,
            backgroundImage: isDark
              ? "linear-gradient(180deg, rgba(15,23,42,0.98), rgba(15,23,42,0.98))"
              : "linear-gradient(180deg, #fff, #fff)",
            backdropFilter: "blur(6px)",
            overflow: "hidden",
          },
        }}
      >
        <Box sx={{ px: 1.5, pt: 1.5, pb: 1 }}>
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.25 }}>
            <Avatar sx={{ width: 28, height: 28, bgcolor: BRAND_PRIMARY, fontWeight: 700 }}>
              <Typography sx={{ fontWeight: 700, color: "text.primary" }}>{initials}</Typography>
            </Avatar>
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 700,
                  lineHeight: 1.2,
                  color: theme.palette.text.primary,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                }}
                title={user?.name || ""}
              >
                {user?.name || "Signed in"}
              </Typography>
              <Typography variant="caption" color="text.secondary" sx={{ display: "block" }}>
                {user?.email}
              </Typography>
            </Box>
          </Box>
        </Box>

        <Divider sx={{ my: 0.5 }} />

        <MenuItem
          onClick={handleLogout}
          sx={{
            py: 1,
            "& .MuiListItemIcon-root": { minWidth: 34 },
            "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
          }}
        >
          <ListItemIcon>
            <LogoutRoundedIcon sx={{ color: "#d32f2f" }} fontSize="small" />
          </ListItemIcon>
          <ListItemText
            primary={<Typography sx={{ fontWeight: 700, color: "#d32f2f" }}>Logout</Typography>}
          />
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default TopNavbar;