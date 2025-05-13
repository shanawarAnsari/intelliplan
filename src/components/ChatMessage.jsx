import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Paper,
  useTheme,
  Avatar,
  IconButton,
  Tooltip,
  CircularProgress,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import { fetchImageFromOpenAI } from "../services/ImageService";

const ChatMessage = ({
  message,
  isBot,
  timestamp,
  onRegenerateResponse,
  imageUrl: initialImageUrl,
  isImage,
  imageFileId,
  assistantName,
  routedFrom,
  isRoutingMessage,
}) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoading, setImageLoading] = useState(isImage);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);

  const handleLike = () => {
    setIsLiked(!isLiked);
  };

  const handleRegenerate = () => {
    if (onRegenerateResponse) {
      onRegenerateResponse();
    }
  };

  const handleImageLoad = () => {
    setImageLoading(false);
  };

  const handleImageError = () => {
    setImageLoading(false);
    setImageError(true);
  };

  useEffect(() => {
    if (isImage) {
      setImageLoading(true);
      if (initialImageUrl) {
        setImageUrl(initialImageUrl);
      } else if (imageFileId) {
        const loadImage = async () => {
          try {
            const url = await fetchImageFromOpenAI(imageFileId);
            setImageUrl(url);
            setImageError(false);
          } catch (error) {
            console.error("Failed to load image:", error);
            setImageError(true);
          } finally {
            setImageLoading(false);
          }
        };

        loadImage();
      } else {
        setImageError(true);
        setImageLoading(false);
      }
    }
  }, [isImage, initialImageUrl, imageFileId]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isBot ? "flex-start" : "flex-end",
        mb: 1,
      }}
      className={isBot ? "message-in-left" : "message-in-right"}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "row",
          alignItems: "flex-start",
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
              ? isRoutingMessage
                ? "rgba(25, 118, 210, 0.08)"
                : theme.palette.background.secondary
              : theme.palette.primary.main,
            color: isBot
              ? theme.palette.text.primary
              : theme.palette.primary.contrastText,
            borderRadius: "12px",
            boxShadow: isBot
              ? "0px 1px 3px rgba(0,0,0,0.12)"
              : "0px 1px 3px rgba(0,0,0,0.2)",
            borderLeft: isRoutingMessage
              ? `3px solid ${theme.palette.primary.main}`
              : "none",
          }}
        >
          {isImage ? (
            <Box sx={{ textAlign: "center", position: "relative", minHeight: 100 }}>
              {imageLoading && (
                <Box
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    py: 4,
                  }}
                >
                  <CircularProgress size={40} />
                </Box>
              )}
              {imageError ? (
                <Typography color="secondary" sx={{ py: 2, fontSize: "0.75rem" }}>
                  Image Unavailable!
                </Typography>
              ) : (
                <img
                  src={imageUrl}
                  alt="AI generated visualization"
                  style={{
                    maxWidth: "100%",
                    borderRadius: 8,
                    display: imageLoading ? "none" : "block",
                  }}
                  onLoad={handleImageLoad}
                  onError={handleImageError}
                />
              )}
            </Box>
          ) : (
            <Typography
              sx={{
                whiteSpace: "pre-wrap",
                fontSize: "0.9rem",
                lineHeight: 1.5,
              }}
            >
              {message}
            </Typography>
          )}
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
      </Box>
      {isBot && (
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 0.5,
            ml: 4,
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
          {assistantName && (
            <Typography
              variant="caption"
              sx={{
                display: "inline-block",
                ml: 1,
                color: theme.palette.primary.main,
                fontWeight: "bold",
                fontSize: "0.7rem",
                border: `1px solid ${theme.palette.primary.main}`,
                borderRadius: "4px",
                px: 0.5,
                backgroundColor:
                  assistantName === "Sales"
                    ? "rgba(25, 118, 210, 0.08)"
                    : assistantName === "Forecast"
                    ? "rgba(46, 125, 50, 0.08)"
                    : "transparent",
              }}
            >
              {assistantName}
            </Typography>
          )}
          {routedFrom && (
            <Typography
              variant="caption"
              sx={{
                display: "inline-block",
                ml: 1,
                color: theme.palette.text.secondary,
                fontSize: "0.65rem",
                fontStyle: "italic",
                backgroundColor: "rgba(0, 0, 0, 0.04)",
                borderRadius: "2px",
                px: 0.5,
              }}
            >
              via {routedFrom}
            </Typography>
          )}
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
            pr: 4,
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
