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
        p: "10px 16px",
        borderBottom: "1px solid rgba(255, 255, 255, 0.06)",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        background: "rgba(31, 41, 55, 0.7)",
        backdropFilter: "blur(20px)",
        boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
        position: "relative",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1.5 }}>
        {!drawerOpen && (
          <Tooltip title="Open Sidebar" placement="bottom">
            <IconButton
              onClick={onToggleDrawer}
              size="small"
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.primary.main,
                  bgcolor: "rgba(96, 165, 250, 0.1)",
                },
              }}
              aria-label="Toggle sidebar"
            >
              <MenuIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        )}
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            px: 1,
            py: 0.5,
            borderRadius: 1.5,
            background: "rgba(96, 165, 250, 0.05)",
            border: "1px solid rgba(96, 165, 250, 0.1)",
          }}
        >
          <img
            src={Logo}
            alt="InteliPlan Logo"
            height="24"
            style={{
              filter: "drop-shadow(0 1px 2px rgba(96, 165, 250, 0.3))",
            }}
          />
          <Box>
            <Typography
              variant="h6"
              sx={{
                fontWeight: 700,
                fontSize: "0.875rem",
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                backgroundClip: "text",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                letterSpacing: "-0.01em",
                lineHeight: 1.2,
              }}
            >
              IntelliPlan
            </Typography>
            <Typography
              variant="caption"
              sx={{
                color: theme.palette.text.secondary,
                fontSize: "0.625rem",
                fontWeight: 500,
                letterSpacing: "0.03em",
                textTransform: "uppercase",
              }}
            >
              AI Assistant
            </Typography>
          </Box>
        </Box>
      </Box>

      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        {showClearButton && (
          <Tooltip title="Clear conversation" placement="bottom">
            <IconButton
              onClick={onClearChat}
              sx={{
                color: theme.palette.text.secondary,
                "&:hover": {
                  color: theme.palette.error.main,
                  bgcolor: "rgba(239, 68, 68, 0.1)",
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
            width: 28,
            height: 28,
            background: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
            fontSize: "0.75rem",
            fontWeight: 600,
            boxShadow: "0 2px 6px rgba(96, 165, 250, 0.2)",
          }}
        >
          <AccountCircleIcon fontSize="small" />
        </Avatar>
      </Box>
    </Box>
  );
};

export default ChatHeader;
