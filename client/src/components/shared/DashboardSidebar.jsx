import React, { useState } from "react";
import { Box, Typography, Tooltip, IconButton, alpha } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

const NAV_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
const SIDEBAR_W = 252;
const SIDEBAR_W_COLLAPSED = 64;

const NavItem = ({ icon: Icon, label, path, isActive, collapsed, accentColor }) => (
  <NavLink to={path} style={{ textDecoration: "none" }}>
    <Tooltip title={collapsed ? label : ""} placement="right" arrow>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1.5,
          px: collapsed ? 0 : 2,
          py: 1.05,
          mx: collapsed ? 0.75 : 1.25,
          my: 0.3,
          //borderRadius: "10px",
          cursor: "pointer",
          justifyContent: collapsed ? "center" : "flex-start",
          color: isActive ? "#fff" : "rgba(255, 255, 255, 0.70)",
          bgcolor: isActive ? alpha(accentColor, 0.13) : "transparent",
          transition: "all 0.2s cubic-bezier(0.4,0,0.2,1)",
          position: "relative",
          overflow: "hidden",
          "&:hover": {
            bgcolor: isActive ? alpha(accentColor, 0.18) : "rgba(255,255,255,0.045)",
            color: "#fff",
            "& .nav-icon": { color: accentColor },
          },
          ...(isActive &&
            !collapsed && {
            "&::before": {
              content: '""',
              position: "absolute",
              left: 0,
              top: "20%",
              bottom: "20%",
              width: 3,
              borderRadius: "0 4px 4px 0",
              bgcolor: accentColor,
              boxShadow: `0 0 8px ${alpha(accentColor, 0.5)}`,
            },
          }),
        }}
      >
        <Box
          className="nav-icon"
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: 32,
            height: 32,
            borderRadius: "8px",
            flexShrink: 0,
            bgcolor: isActive ? alpha(accentColor, 0.15) : "transparent",
            transition: "all 0.2s ease",
          }}
        >
          <Icon
            sx={{
              fontSize: 18,
              color: isActive ? accentColor : "inherit",
              transition: "color 0.2s ease",
            }}
          />
        </Box>
        {!collapsed && (
          <Typography
            sx={{
              fontFamily: NAV_FONT,
              fontWeight: isActive ? 650 : 450,
              fontSize: "0.82rem",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              color: "inherit",
              letterSpacing: "0.01em",
            }}
          >
            {label}
          </Typography>
        )}
      </Box>
    </Tooltip>
  </NavLink>
);

const DashboardSidebar = ({
  items,
  accentColor = "#1B938A",
  domain,
  topOffset = 56,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  const isItemActive = (path) =>
    location.pathname === path || location.pathname.startsWith(path + "/");

  const renderItems = () =>
    items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        return (
          <Box key={item.label} sx={{ mb: 0.25 }}>
            {!collapsed && (
              <Typography
                sx={{
                  fontFamily: NAV_FONT,
                  fontWeight: 700,
                  fontSize: "0.62rem",
                  letterSpacing: "0.12em",
                  textTransform: "uppercase",
                  color: "rgba(255,255,255,0.35)",
                  px: 3.25,
                  pt: 2.5,
                  pb: 0.75,
                  whiteSpace: "nowrap",
                  overflow: "hidden",
                }}
              >
                {item.label}
              </Typography>
            )}
            {collapsed && (
              <Box
                sx={{
                  my: 1.5,
                  mx: "auto",
                  width: 24,
                  height: 1,
                  bgcolor: "rgba(255,255,255,0.08)",
                  borderRadius: 1,
                }}
              />
            )}
            {item.children.map((child) => (
              <NavItem
                key={child.path}
                icon={child.icon}
                label={child.label}
                path={child.path}
                isActive={isItemActive(child.path)}
                collapsed={collapsed}
                accentColor={accentColor}
              />
            ))}
          </Box>
        );
      }

      return (
        <NavItem
          key={item.path}
          icon={item.icon}
          label={item.label}
          path={item.path}
          isActive={isItemActive(item.path)}
          collapsed={collapsed}
          accentColor={accentColor}
        />
      );
    });

  return (
    <Box
      sx={{
        width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
        flexShrink: 0,
        transition: "width 0.28s cubic-bezier(0.4,0,0.2,1)",
        background:
          "linear-gradient(180deg, rgba(6,18,32,0.98) 0%, rgba(4,12,24,0.99) 100%)",
        borderRight: "1px solid rgba(255,255,255,0.06)",
        display: "flex",
        flexDirection: "column",
        minHeight: `calc(100vh - ${topOffset}px)`,
        position: "sticky",
        top: topOffset,
        alignSelf: "flex-start",
        overflow: "hidden",
      }}
    >
      {/* Header */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          justifyContent: collapsed ? "center" : "space-between",
          px: collapsed ? 0 : 2.5,
          minHeight: 46,
        }}
      >
        {!collapsed && (
          <Box sx={{ display: "flex", alignItems: "center", gap: 1.2 }}>
            <Box
              sx={{
                width: 8,
                height: 8,
                borderRadius: "50%",
                bgcolor: accentColor,
                boxShadow: `0 0 10px ${alpha(accentColor, 0.6)}, 0 0 20px ${alpha(accentColor, 0.3)}`,
                flexShrink: 0,
              }}
            />
            <Typography
              sx={{
                fontFamily: NAV_FONT,
                fontWeight: 750,
                fontSize: "0.74rem",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "rgba(255,255,255,0.85)",
                whiteSpace: "nowrap",
                overflow: "hidden",
              }}
            >
              {domain}
            </Typography>
          </Box>
        )}
        <Tooltip title={collapsed ? "Expand" : "Collapse"} placement="right" arrow>
          <IconButton
            onClick={() => setCollapsed((p) => !p)}
            size="small"
            sx={{
              width: 32,
              height: 28,
              color: "rgba(255, 255, 255, 0.45)",
              border: "1px solid rgba(255,255,255,0.45)",
              borderRadius: "8px",
              "&:hover": {
                color: "#fff",
                bgcolor: "rgba(255,255,255,0.65)",
                borderColor: "rgba(255,255,255,0.65)",
              },
              transition: "all 0.2s ease",
            }}
          >
            {collapsed ? (
              <ChevronRightRoundedIcon sx={{ fontSize: 16 }} />
            ) : (
              <ChevronLeftRoundedIcon sx={{ fontSize: 16 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Divider */}
      <Box
        sx={{
          mx: collapsed ? 1 : 2,
          height: "1px",
          bgcolor: "rgba(255,255,255,0.06)",
          borderRadius: 1,
        }}
      />

      {/* Nav items */}
      <Box
        sx={{
          flex: 1,
          py: 1.5,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 3 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.08)",
            borderRadius: 4,
            "&:hover": { bgcolor: "rgba(255,255,255,0.15)" },
          },
          "&::-webkit-scrollbar-track": { bgcolor: "transparent" },
        }}
      >
        {renderItems()}
      </Box>

      {/* Bottom glow accent */}
      <Box
        sx={{
          height: 1,
          mx: 3,
          mb: 2,
          background: `linear-gradient(90deg, transparent, ${alpha(accentColor, 0.3)}, transparent)`,
          borderRadius: 1,
        }}
      />
    </Box>
  );
};

export default DashboardSidebar;
