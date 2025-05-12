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
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        mb: 1, // Reduced from 1.5 to 1
      }}
      className={isBot ? "message-in-left" : "message-in-right"}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start", // Changed from flex-end to center for vertical alignment
          width: "100%",
          justifyContent: isBot ? "flex-start" : "flex-end",
          mb: 0.5,
        }}
      >
        {isBot && (
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: theme.palette.secondary.main,
              mr: 1,
              boxShadow: "0px 1px 3px rgba(0,0,0,0.12)",
            }}
          >
            <SmartToyIcon sx={{ fontSize: 16 }} />
          </Avatar>
        )}

        <Paper
          elevation={1}
          sx={{
            p: 1,
            px: 2,
            maxWidth: { xs: "85%", sm: "75%" },
            bgcolor: isBot
              ? theme.palette.background.secondary
              : theme.palette.primary.main,
            color: isBot
              ? theme.palette.text.primary
              : theme.palette.primary.contrastText,
            borderRadius: "12px",
            boxShadow: isBot
              ? "0px 1px 3px rgba(0,0,0,0.12)"
              : "0px 1px 3px rgba(0,0,0,0.2)",
          }}
        >
          <Typography
            sx={{
              whiteSpace: "pre-wrap",
              fontSize: "0.9rem",
              lineHeight: 1.5,
            }}
          >
            {message}
          </Typography>
        </Paper>

        {!isBot && (
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: theme.palette.primary.dark,
              ml: 1,
              boxShadow: "0px 1px 3px rgba(0,0,0,0.2)",
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 16 }} />
          </Avatar>
        )}
      </Box>{" "}
      {isBot && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 0.5,
            ml: 4, // Align with the message
          }}
        >
          <Tooltip title={isLiked ? "Unlike" : "Like"}>
            <IconButton
              size="small"
              onClick={handleLike}
              sx={{
                p: 0.5,
                mr: 1,
                color: isLiked ? "primary.main" : "text.secondary",
                "&:hover": {
                  color: isLiked ? "primary.light" : "primary.main",
                },
              }}
            >
              {isLiked ? (
                <ThumbUpIcon fontSize="small" />
              ) : (
                <ThumbUpAltOutlinedIcon fontSize="small" />
              )}
            </IconButton>
          </Tooltip>
          <Tooltip title="Regenerate response">
            <IconButton
              size="small"
              onClick={handleRegenerate}
              sx={{
                p: 0.5,
                color: "text.secondary",
                "&:hover": {
                  color: "primary.main",
                },
              }}
            >
              <AutorenewIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          {timestamp && (
            <Typography
              variant="caption"
              sx={{
                display: "inline-block",
                ml: 1,
                color: theme.palette.text.secondary,
                fontSize: "0.65rem",
              }}
            >
              {new Date(timestamp).toLocaleTimeString([], {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true,
              })}
            </Typography>
          )}
        </Box>
      )}
      {!isBot && timestamp && (
        <Typography
          variant="caption"
          sx={{
            display: "block",
            mt: 0.5,
            mr: 1,
            color: theme.palette.text.secondary,
            fontSize: "0.65rem",
            alignSelf: "flex-end",
            pr: 4, // Add padding to align with the message when there's an avatar
          }}
        >
          {new Date(timestamp).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
            hour12: true,
          })}
        </Typography>
      )}
    </Box>
  );
};

export default ChatMessage;
