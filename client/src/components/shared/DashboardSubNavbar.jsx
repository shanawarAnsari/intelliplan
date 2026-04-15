import React from "react";
import { Box } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

const NAV_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";

const DashboardSubNavbar = ({ tabs, domain, accentColor = "#1B938A" }) => {
  const location = useLocation();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 56,
        zIndex: 100,
        bgcolor: "rgba(5,14,26,0.92)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid rgba(255,255,255,0.05)",
        px: { xs: 2, md: 4 },
        display: "flex",
        alignItems: "center",
        minHeight: 48,
        gap: 0,
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* Domain identifier */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.2,
          flexShrink: 0,
          width: 220,
          mr: 0,
        }}
      >
        <Box
          sx={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            bgcolor: accentColor,
            boxShadow: `0 0 8px ${accentColor}, 0 0 16px ${accentColor}80`,
            flexShrink: 0,
          }}
        />
        <Box
          sx={{
            fontFamily: NAV_FONT,
            fontWeight: 600,
            fontSize: "0.78rem",
            color: "#fff",
            letterSpacing: "0.06em",
            whiteSpace: "nowrap",
          }}
        >
          {domain}
        </Box>
        <Box
          sx={{
            ml: "auto",
            width: "1px",
            height: 18,
            bgcolor: "rgba(255,255,255,0.08)",
            flexShrink: 0,
          }}
        />
      </Box>

      {/* Tab links */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 0,
          flexShrink: 0,
          height: 48,
        }}
      >
        {tabs.map((tab) => {
          const isActive =
            location.pathname === tab.path ||
            location.pathname.startsWith(tab.path + "/");
          return (
            <NavLink
              key={tab.path}
              to={tab.path}
              style={{ textDecoration: "none", display: "flex" }}
            >
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 0.9,
                  px: 2,
                  fontFamily: NAV_FONT,
                  fontWeight: isActive ? 600 : 400,
                  fontSize: "0.82rem",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  position: "relative",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.38)",
                  transition: "color 0.18s ease",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "14%",
                    right: "14%",
                    height: "2px",
                    borderRadius: "2px 2px 0 0",
                    bgcolor: isActive ? accentColor : "transparent",
                    transition: "all 0.2s ease",
                  },
                  "&:hover": {
                    color: isActive ? "#fff" : "rgba(255,255,255,0.7)",
                    "&::after": {
                      bgcolor: isActive ? accentColor : "rgba(255,255,255,0.12)",
                    },
                  },
                }}
              >
                {/* Active dot */}
                {isActive && (
                  <Box
                    sx={{
                      width: 5,
                      height: 5,
                      borderRadius: "50%",
                      bgcolor: accentColor,
                      boxShadow: `0 0 6px ${accentColor}`,
                      flexShrink: 0,
                    }}
                  />
                )}
                {tab.icon && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: isActive ? accentColor : "inherit",
                    }}
                  >
                    {tab.icon}
                  </Box>
                )}
                {tab.label}
              </Box>
            </NavLink>
          );
        })}
      </Box>
    </Box>
  );
};

export default DashboardSubNavbar;
