import React, { useState } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AutorenewIcon from "@mui/icons-material/Autorenew";

const ChatMessage = ({ message, isBot, timestamp, onRegenerateResponse }) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRegenerate = () => {
    if (onRegenerateResponse) {
      onRegenerateResponse();
    }
  };

  // Format timestamp
  const formattedTime = timestamp
    ? new Date(timestamp).toLocaleTimeString([], {
        hour: "numeric", // Changed to numeric for cleaner look
        minute: "2-digit",
        hour12: true,
      })
    : "";

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        mb: 1.5, // Increased margin bottom for more spacing
      }}
      className={isBot ? "message-in-left" : "message-in-right"}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start", // Align avatar to the top of the message bubble
          width: "100%", // Ensure full width for alignment
          justifyContent: isBot ? "flex-start" : "flex-end",
        }}
      >
        {isBot && (
          <Avatar
            sx={{
              width: 32, // Standardized avatar size
              height: 32,
              bgcolor: theme.palette.secondary.main, // Use theme secondary for bot
              mr: 1,
              boxShadow: theme.shadows[1], // Subtle shadow
            }}
          >
            <SmartToyIcon sx={{ fontSize: 18 }} /> {/* Adjusted icon size */}
          </Avatar>
        )}

        <Paper
          elevation={0} // Remove elevation, rely on background and border
          sx={{
            p: "10px 14px", // Adjusted padding
            maxWidth: { xs: "calc(100% - 48px)", sm: "75%" }, // Ensure it doesn't overlap avatar + margin
            bgcolor: isBot
              ? theme.palette.background.secondary // Use theme secondary background for bot
              : theme.palette.primary.main,
            color: isBot
              ? theme.palette.text.primary
              : theme.palette.primary.contrastText,
            borderRadius: "8px", // Use theme border radius
            border: isBot ? `1px solid ${theme.palette.divider}` : "none", // Add border for bot messages
            // No explicit shadow, for a flatter surface look
          }}
        >
          <Typography
            variant="chatMessage" // Use custom theme variant
            sx={{
              whiteSpace: "pre-wrap", // Keep for multi-line messages
              // fontSize and lineHeight are now from theme.typography.chatMessage
            }}
          >
            {message}
          </Typography>
        </Paper>

        {!isBot && (
          <Avatar
            sx={{
              width: 32, // Standardized avatar size
              height: 32,
              bgcolor: theme.palette.primary.dark, // Darker primary for user avatar
              ml: 1,
              boxShadow: theme.shadows[1], // Subtle shadow
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 18 }} /> {/* Adjusted icon size */}
          </Avatar>
        )}
      </Box>

      {/* Actions and Timestamp Area */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mt: 0.75, // Adjusted margin top
          pl: isBot ? "44px" : 0, // Align with message bubble (avatar width + margin)
          pr: !isBot ? "44px" : 0, // Align with message bubble for user
          alignSelf: isBot ? "flex-start" : "flex-end",
        }}
      >
        {isBot &&
          onRegenerateResponse && ( // Only show actions for bot messages with callback
            <>
              <Tooltip title={isLiked ? "Unlike" : "Like"}>
                <IconButton
                  size="small"
                  onClick={handleLike}
                  sx={{
                    p: 0.5,
                    mr: 0.5, // Reduced margin
                    color: isLiked
                      ? theme.palette.primary.main
                      : theme.palette.text.secondary,
                    "&:hover": {
                      color: theme.palette.primary.main, // Consistent hover color
                    },
                  }}
                >
                  {isLiked ? (
                    <ThumbUpIcon sx={{ fontSize: "1rem" }} /> // Adjusted icon size
                  ) : (
                    <ThumbUpAltOutlinedIcon sx={{ fontSize: "1rem" }} />
                  )}
                </IconButton>
              </Tooltip>
              <Tooltip title="Regenerate response">
                <IconButton
                  size="small"
                  onClick={handleRegenerate}
                  sx={{
                    p: 0.5,
                    color: theme.palette.text.secondary,
                    "&:hover": {
                      color: theme.palette.primary.main,
                    },
                  }}
                >
                  <AutorenewIcon sx={{ fontSize: "1rem" }} />{" "}
                  {/* Adjusted icon size */}
                </IconButton>
              </Tooltip>
            </>
          )}
        {timestamp && (
          <Typography
            variant="timestamp" // Use custom theme variant
            sx={{
              ml: isBot && onRegenerateResponse ? 1 : 0, // Add margin if actions are present
              // color and fontSize are from theme.typography.timestamp
            }}
          >
            {formattedTime}
          </Typography>
        )}
      </Box>
    </Box>
  );
};

export default ChatMessage;
