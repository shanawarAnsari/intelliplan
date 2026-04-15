import React from "react";
import {
  Box,
  Typography,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  alpha,
} from "@mui/material";
import { Outlet, useNavigate, useLocation } from "react-router-dom";

const NAV_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
const SIDEBAR_WIDTH = 252;
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
          background:
            "linear-gradient(180deg, rgba(6,18,32,0.98) 0%, rgba(4,12,24,0.99) 100%)",
          borderRight: "1px solid rgba(255,255,255,0.06)",
          display: "flex",
          flexDirection: "column",
          pt: 2,
        }}
      >
        {/* Sidebar Header */}
        <Box
          sx={{ px: 2.5, mb: 1.5, display: "flex", alignItems: "center", gap: 1.2 }}
        >
          <Box
            sx={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              bgcolor: BRAND_PRIMARY,
              boxShadow: `0 0 10px ${alpha(BRAND_PRIMARY, 0.6)}, 0 0 20px ${alpha(BRAND_PRIMARY, 0.3)}`,
              flexShrink: 0,
            }}
          />
          <Typography
            sx={{
              fontFamily: NAV_FONT,
              color: "rgba(255,255,255,0.85)",
              fontWeight: 750,
              fontSize: "0.74rem",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
            }}
          >
            {title}
          </Typography>
        </Box>

        <Box
          sx={{
            mx: 2,
            mb: 1,
            height: "1px",
            bgcolor: "rgba(255,255,255,0.06)",
            borderRadius: 1,
          }}
        />

        {/* Nav Items */}
        <List dense disablePadding sx={{ px: 0.5 }}>
          {navItems.map((item) => {
            const active = isActive(item.path);
            return (
              <ListItemButton
                key={item.path}
                onClick={() => navigate(`/${basePath}/${item.path}`)}
                sx={{
                  mx: 1.25,
                  my: 0.3,
                  borderRadius: "10px",
                  position: "relative",
                  overflow: "hidden",
                  backgroundColor: active
                    ? alpha(BRAND_PRIMARY, 0.13)
                    : "transparent",
                  color: active ? "#fff" : "rgba(255,255,255,0.5)",
                  "&:hover": {
                    backgroundColor: active
                      ? alpha(BRAND_PRIMARY, 0.18)
                      : "rgba(255,255,255,0.045)",
                    color: "#fff",
                    "& .MuiListItemIcon-root": {
                      color: BRAND_PRIMARY,
                    },
                  },
                  transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
                  py: 1.05,
                  pl: 2,
                  ...(active && {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 0,
                      top: "20%",
                      bottom: "20%",
                      width: 3,
                      borderRadius: "0 4px 4px 0",
                      bgcolor: BRAND_PRIMARY,
                      boxShadow: `0 0 8px ${alpha(BRAND_PRIMARY, 0.5)}`,
                    },
                  }),
                }}
              >
                <ListItemIcon
                  sx={{
                    minWidth: 36,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    width: 32,
                    height: 32,
                    borderRadius: "8px",
                    bgcolor: active ? alpha(BRAND_PRIMARY, 0.15) : "transparent",
                    color: active ? BRAND_PRIMARY : "rgba(255,255,255,0.4)",
                    transition: "all 0.2s ease",
                    mr: 0.5,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.label}
                  primaryTypographyProps={{
                    fontFamily: NAV_FONT,
                    fontSize: "0.82rem",
                    fontWeight: active ? 650 : 450,
                    letterSpacing: "0.01em",
                  }}
                />
              </ListItemButton>
            );
          })}
        </List>

        <Box sx={{ flex: 1 }} />

        {/* Bottom accent */}
        <Box
          sx={{
            height: 1,
            mx: 3,
            mb: 2,
            background: `linear-gradient(90deg, transparent, ${alpha(BRAND_PRIMARY, 0.3)}, transparent)`,
            borderRadius: 1,
          }}
        />
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
