import React from "react";
import { Box, alpha } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";

const NAV_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";

const DashboardSubNavbar = ({ tabs, domain, accentColor = "#1B938A" }) => {
  const location = useLocation();

  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 100,
        background:
          "linear-gradient(180deg, rgba(8,16,28,0.96) 0%, rgba(6,14,26,0.94) 100%)",
        backdropFilter: "blur(24px)",
        WebkitBackdropFilter: "blur(24px)",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
        px: { xs: 2.5, md: 4 },
        display: "flex",
        alignItems: "center",
        minHeight: 46,
        gap: 0,
        overflowX: "auto",
        "&::-webkit-scrollbar": { display: "none" },
      }}
    >
      {/* Tab links */}
      <Box
        sx={{
          display: "flex",
          alignItems: "stretch",
          gap: 0.5,
          flexShrink: 0,
          height: 46,
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
                  gap: 0.8,
                  px: 1.75,
                  fontFamily: NAV_FONT,
                  fontWeight: isActive ? 650 : 420,
                  fontSize: "0.8rem",
                  whiteSpace: "nowrap",
                  cursor: "pointer",
                  position: "relative",
                  color: isActive ? "#fff" : "rgba(255,255,255,0.4)",
                  borderRadius: "8px 8px 0 0",
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: 0,
                    left: "12%",
                    right: "12%",
                    height: "2px",
                    borderRadius: "2px 2px 0 0",
                    bgcolor: isActive ? accentColor : "transparent",
                    boxShadow: isActive
                      ? `0 0 8px ${alpha(accentColor, 0.5)}`
                      : "none",
                    transition: "all 0.25s ease",
                  },
                  "&:hover": {
                    color: isActive ? "#fff" : "rgba(255,255,255,0.75)",
                    bgcolor: isActive ? "transparent" : "rgba(255,255,255,0.03)",
                    "&::after": {
                      bgcolor: isActive ? accentColor : "rgba(255,255,255,0.1)",
                    },
                  },
                }}
              >
                {tab.icon && (
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      color: isActive ? accentColor : "inherit",
                      transition: "color 0.2s ease",
                      "& > *": { fontSize: "0.95rem" },
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
