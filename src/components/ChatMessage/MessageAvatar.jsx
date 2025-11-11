/**
 * Message Avatar Component
 */
import React from "react";
import { Avatar, Tooltip, useTheme } from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";

const MessageAvatar = ({ isBot }) => {
  const theme = useTheme();

  if (isBot) {
    return (
      <Tooltip title="IntelliPlan Assistant">
        <Avatar
          sx={{
            width: 32,
            height: 32,
            bgcolor: theme.palette.secondary.main,
            boxShadow: "0px 1px 3px rgba(0,0,0,0.12)",
            flexShrink: 0,
          }}
          aria-label="Bot message"
        >
          <SmartToyIcon sx={{ fontSize: 18 }} />
        </Avatar>
      </Tooltip>
    );
  }

  return (
    <Tooltip title="Your message">
      <Avatar
        sx={{
          width: 32,
          height: 32,
          bgcolor: theme.palette.primary.dark,
          boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
          flexShrink: 0,
        }}
        aria-label="User message"
      >
        <AccountCircleIcon sx={{ fontSize: 18 }} />
      </Avatar>
    </Tooltip>
  );
};

export default MessageAvatar;
