/**
 * Chat Header Component
 */
import React from "react";
import {
  Box,
  Typography,
  IconButton,
  Tooltip,
  Avatar,
  useTheme,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import Logo from "../../assets/InteliPlan.jpg";

const ChatHeader = ({
  drawerOpen,
  onToggleDrawer,
  onClearChat,
  showClearButton,
}) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: "14px 20px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(31, 41, 55, 0.7)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 4px 16px rgba(0, 0, 0, 0.1)",
        position: "relative",
        "&::after": {
          content: '""',
          position: "absolute",
          bottom: 0,
          left: "5%",
          right: "5%",
          height: "1px",
          background:
            "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent)",
        },
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
        {!drawerOpen && (
          <Tooltip title="Open Sidebar (Ctrl+Shift+H)" placement="bottom">
            <IconButton
              onClick={onToggleDrawer}
              sx={{
                color: theme.palette.text.secondary,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  color: theme.palette.primary.main,
                  bgcolor: "rgba(96, 165, 250, 0.15)",
                  transform: "scale(1.1)",
                },
              }}
              aria-label="Toggle sidebar"
            >
              <MenuIcon />
            </IconButton>
          </Tooltip>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            p: 1,
            borderRadius: 2,
            background: "rgba(96, 165, 250, 0.05)",
            border: "1px solid rgba(96, 165, 250, 0.1)",
            transition: "all 0.3s ease",
            "&:hover": {
              background: "rgba(96, 165, 250, 0.1)",
              border: "1px solid rgba(96, 165, 250, 0.2)",
            },
          }}
        >
          <img
            src={Logo}
            alt="InteliPlan Logo"
            height="32"
            style={{
              filter: "drop-shadow(0 2px 4px rgba(96, 165, 250, 0.3))",
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 800,
                fontSize: "1.125rem",
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.02em",
              }}
            >
              IntelliPlan
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.6875rem",
                fontWeight: 500,
                letterSpacing: "0.05em",
                textTransform: "uppercase",
              }}
            >
              AI Assistant
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {showClearButton && (
          <Tooltip title="Clear conversation" placement="bottom">
            <IconButton
              onClick={onClearChat}
              sx={{
                color: theme.palette.text.secondary,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  color: theme.palette.error.main,
                  bgcolor: "rgba(239, 68, 68, 0.15)",
                  transform: "scale(1.1)",
                },
              }}
              size="small"
              aria-label="Clear conversation"
            >
              <DeleteOutlineIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Avatar
          sx={{
            width: 36,
            height: 36,
            background: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
            fontSize: "0.9rem",
            fontWeight: 600,
            boxShadow: "0 4px 12px rgba(96, 165, 250, 0.3)",
            transition: "all 0.3s ease",
            "&:hover": {
              transform: "scale(1.1)",
              boxShadow: "0 6px 16px rgba(96, 165, 250, 0.4)",
            },
          }}
        >
          <AccountCircleIcon />
        </Avatar>
      </Box>
    </Box>
  );
};

export default ChatHeader;
