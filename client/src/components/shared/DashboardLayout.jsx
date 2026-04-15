import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const SIDEBAR_WIDTH = 220;
const BRAND_PRIMARY = "#1B938A";

const DashboardLayout = ({ title, navItems, basePath }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (itemPath) =>
    location.pathname === `/${basePath}/${itemPath}` ||
    (location.pathname === `/${basePath}` && navItems[0]?.path === itemPath);

  return (
    <Box sx={{ display: "flex", height: "calc(100vh - 56px)" }}>
      {/* Sidebar */}
      <Box
        sx={{
          width: SIDEBAR_WIDTH,
          flexShrink: 0,
          backgroundColor: "#1a2332",
          borderRight: "1px solid rgba(255,255,255,0.07)",
          display: "flex",
          flexDirection: "column",
          pt: 2.5,
        }}
      >
        {/* Sidebar Header */}
        <Box sx={{ px: 2.5, mb: 1.5 }}>
          <Typography
            variant="caption"
            sx={{
              color: BRAND_PRIMARY,
              fontWeight: 700,
              fontSize: "0.6rem",
              letterSpacing: "1.4px",
              textTransform: "uppercase",
              display: "block",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Divider sx={{ borderColor: "rgba(255,255,255,0.06)", mx: 1.5, mb: 1 }} />

        {/* Nav Items */}
        <List dense disablePadding>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(`/${basePath}/${item.path}`)}
                sx={{
                  mx: 1.5,
                  mb: 0.5,
                  borderRadius: 2,
                  borderLeft: active
                    ? `3px solid ${BRAND_PRIMARY}`
                    : "3px solid transparent",
                  backgroundColor: active
                    ? "rgba(27, 147, 138, 0.12)"
                    : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.55)",
                  "&:hover": {
                    backgroundColor: active
                      ? "rgba(27, 147, 138, 0.18)"
                      : "rgba(255, 255, 255, 0.05)",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: active ? BRAND_PRIMARY : "rgba(255,255,255,0.75)",
                    },
                  },
                  transition: "all 0.2s ease",
                  py: 1,
                  pl: 1.5,
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 34,
                    color: active ? BRAND_PRIMARY : "rgba(255,255,255,0.4)",
                    transition: "color 0.2s ease",
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontSize: "0.8rem",
                    fontWeight: active ? 600 : 400,
                    letterSpacing: "0.1px",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flex: 1,
          overflow: "auto",
          backgroundColor: "#111827",
        }}
      >
        <Outlet />
      </Box>
    </Box>
  );
};

export default DashboardLayout;
