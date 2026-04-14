import React from "react";
import { Box, useTheme, IconButton, Tooltip } from "@mui/material";
import { NavLink, useNavigate, useLocation } from "react-router-dom";
import ArrowBackRoundedIcon from "@mui/icons-material/ArrowBackRounded";
import Logo from "../../assets/Intelliplan-logo.png";

const BRAND_PRIMARY = "#1B938A";
const NAV_FONT =
  "'Inter', ui-sans-serif, system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, 'Noto Sans', 'Apple Color Emoji', 'Segoe UI Emoji', 'Segoe UI Symbol'";

const TopNavbar = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const location = useLocation();

  const isLanding = location.pathname === "/";
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
        {/* Logo */}
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, minWidth: 0 }}>
          <Box
            onClick={() => navigate("/")}
            sx={{
              display: "flex",
              alignItems: "center",
              cursor: "pointer",
              minWidth: 0,
            }}
          >
            <img
              src={Logo}
              alt="Intelliplan Logo"
              height="32"
              style={{ borderRadius: 6 }}
            />
          </Box>
          <Box
            aria-hidden
            sx={{
              width: "1px",
              height: 20,
              mx: 1,
              bgcolor: theme.palette.divider,
              borderRadius: "1px",
              opacity: 0.9,
            }}
          />
          {/* Back button — hidden on landing page */}
          {!isLanding && (
            <Tooltip title="Go back" placement="bottom">
              <IconButton
                onClick={() => navigate("/")}
                size="small"
                sx={{
                  color: "rgba(255,255,255,0.5)",
                  bgcolor: "rgba(255,255,255,0.05)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  borderRadius: "8px",
                  width: 30,
                  height: 30,
                  "&:hover": {
                    color: "#fff",
                    bgcolor: "rgba(255,255,255,0.1)",
                    borderColor: "rgba(255,255,255,0.2)",
                  },
                  transition: "all 0.18s ease",
                }}
              >
                <ArrowBackRoundedIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          )}
        </Box>

        <Box sx={{ flex: 1 }} />

        {/* Nav links */}
        <Box
          component="nav"
          sx={{
            display: { xs: "none", sm: "flex" },
            alignItems: "center",
            gap: 0.25,
          }}
          aria-label="Primary Navigation"
        >
          <NavLink to="/" end style={{ textDecoration: "none" }}>
            {({ isActive }) => (
              <Box sx={{ ...navLinkBase }} className={isActive ? "active" : ""}>
                Home <span className="active-indicator" />
              </Box>
            )}
          </NavLink>
        </Box>
      </Box>
    </Box>
  );
};

export default TopNavbar;
