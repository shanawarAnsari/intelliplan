import React, { useState } from "react";
import { Box, Typography, Tooltip, IconButton } from "@mui/material";
import { NavLink, useLocation } from "react-router-dom";
import ChevronLeftRoundedIcon from "@mui/icons-material/ChevronLeftRounded";
import ChevronRightRoundedIcon from "@mui/icons-material/ChevronRightRounded";

const NAV_FONT = "'Inter', ui-sans-serif, system-ui, -apple-system, sans-serif";
const SIDEBAR_W = 264;
const SIDEBAR_W_COLLAPSED = 64;

const DashboardSidebar = ({
  items,
  accentColor = "#1B938A",
  domain,
  topOffset = 110,
}) => {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();

  // Flatten items: if item has children, those become direct nav links under a section label
  const renderItems = () => {
    return items.map((item) => {
      const hasChildren = item.children && item.children.length > 0;

      if (hasChildren) {
        return (
          <Box key={item.label} sx={{ mb: 0.5 }}>
            {/* Section label */}
            {!collapsed && (
              <Typography
                sx={{
                  fontFamily: NAV_FONT,
                  fontWeight: 800,
                  fontSize: "0.68rem",
                  letterSpacing: "0.1em",
                  textTransform: "uppercase",
                  color: "#FFF",
                  px: 2.5,
                  pt: 2.5,
                  pb: 1,
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
                  width: 28,
                  height: 1,
                  bgcolor: "rgba(255,255,255,0.1)",
                }}
              />
            )}
            {/* Child links */}
            {item.children.map((child) => {
              const ChildIcon = child.icon;
              const isActive =
                location.pathname === child.path ||
                location.pathname.startsWith(child.path + "/");
              return (
                <NavLink
                  key={child.path}
                  to={child.path}
                  style={{ textDecoration: "none" }}
                >
                  <Tooltip title={collapsed ? child.label : ""} placement="right">
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        gap: 1.8,
                        px: collapsed ? 0 : 2.5,
                        py: 1.35,
                        mx: collapsed ? 0 : 1,
                        borderRadius: "10px",
                        cursor: "pointer",
                        justifyContent: collapsed ? "center" : "flex-start",
                        color: isActive ? "#fff" : "rgba(255,255,255,0.48)",
                        bgcolor: isActive ? `${accentColor}20` : "transparent",
                        transition: "all 0.18s ease",
                        position: "relative",
                        "&:hover": {
                          bgcolor: isActive
                            ? `${accentColor}28`
                            : "rgba(255,255,255,0.06)",
                          color: "#fff",
                        },
                        ...(isActive &&
                          !collapsed && {
                            "&::before": {
                              content: '""',
                              position: "absolute",
                              left: 4,
                              top: "50%",
                              transform: "translateY(-50%)",
                              width: 3,
                              height: "60%",
                              borderRadius: 4,
                              bgcolor: accentColor,
                            },
                          }),
                      }}
                    >
                      <ChildIcon
                        sx={{
                          fontSize: 19,
                          flexShrink: 0,
                          color: isActive ? accentColor : "inherit",
                          transition: "color 0.18s ease",
                        }}
                      />
                      {!collapsed && (
                        <Typography
                          sx={{
                            fontFamily: NAV_FONT,
                            fontWeight: isActive ? 700 : 500,
                            fontSize: "0.9rem",
                            whiteSpace: "nowrap",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            color: "inherit",
                          }}
                        >
                          {child.label}
                        </Typography>
                      )}
                    </Box>
                  </Tooltip>
                </NavLink>
              );
            })}
          </Box>
        );
      }

      // Flat item (no children)
      const Icon = item.icon;
      const isActive =
        location.pathname === item.path ||
        location.pathname.startsWith(item.path + "/");
      return (
        <NavLink key={item.path} to={item.path} style={{ textDecoration: "none" }}>
          <Tooltip title={collapsed ? item.label : ""} placement="right">
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1.8,
                px: collapsed ? 0 : 2.5,
                py: 1.35,
                mx: collapsed ? 0 : 1,
                borderRadius: "10px",
                cursor: "pointer",
                justifyContent: collapsed ? "center" : "flex-start",
                color: isActive ? "#fff" : "rgba(255,255,255,0.48)",
                bgcolor: isActive ? `${accentColor}20` : "transparent",
                transition: "all 0.18s ease",
                position: "relative",
                "&:hover": {
                  bgcolor: isActive ? `${accentColor}28` : "rgba(255,255,255,0.06)",
                  color: "#fff",
                },
                ...(isActive &&
                  !collapsed && {
                    "&::before": {
                      content: '""',
                      position: "absolute",
                      left: 4,
                      top: "50%",
                      transform: "translateY(-50%)",
                      width: 3,
                      height: "60%",
                      borderRadius: 4,
                      bgcolor: accentColor,
                    },
                  }),
              }}
            >
              <Icon
                sx={{
                  fontSize: 19,
                  flexShrink: 0,
                  color: isActive ? accentColor : "inherit",
                }}
              />
              {!collapsed && (
                <Typography
                  sx={{
                    fontFamily: NAV_FONT,
                    fontWeight: isActive ? 700 : 500,
                    fontSize: "0.9rem",
                    whiteSpace: "nowrap",
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    color: "inherit",
                  }}
                >
                  {item.label}
                </Typography>
              )}
            </Box>
          </Tooltip>
        </NavLink>
      );
    });
  };

  return (
    <Box
      sx={{
        width: collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W,
        flexShrink: 0,
        transition: "width 0.26s cubic-bezier(0.4,0,0.2,1)",
        bgcolor: "rgba(4,17,30,0.97)",
        borderRight: "1px solid rgba(255,255,255,0.07)",
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
          py: 2,
          borderBottom: "1px solid rgba(255,255,255,0.06)",
          minHeight: 56,
        }}
      >
        {!collapsed && (
          <Typography
            sx={{
              fontFamily: NAV_FONT,
              fontWeight: 800,
              fontSize: "0.75rem",
              letterSpacing: "0.1em",
              textTransform: "uppercase",
              color: accentColor,
              whiteSpace: "nowrap",
              overflow: "hidden",
            }}
          >
            {domain}
          </Typography>
        )}
        <Tooltip
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          placement="right"
        >
          <IconButton
            onClick={() => setCollapsed((p) => !p)}
            size="small"
            sx={{
              color: "rgba(255,255,255,0.35)",
              "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.07)" },
            }}
          >
            {collapsed ? (
              <ChevronRightRoundedIcon sx={{ fontSize: 20 }} />
            ) : (
              <ChevronLeftRoundedIcon sx={{ fontSize: 20 }} />
            )}
          </IconButton>
        </Tooltip>
      </Box>

      {/* Nav items */}
      <Box
        sx={{
          flex: 1,
          py: 1.5,
          overflowY: "auto",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: "rgba(255,255,255,0.1)",
            borderRadius: 2,
          },
        }}
      >
        {renderItems()}
      </Box>
    </Box>
  );
};

export default DashboardSidebar;
