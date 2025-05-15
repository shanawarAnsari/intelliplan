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
import Logger from "./Logger";

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
  logs,
  isLoadingLogs,
}) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoading, setImageLoading] = useState(isImage);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isLoggerExpanded, setIsLoggerExpanded] = useState(false);

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
    let isMounted = true;

    const loadImage = async (fileId) => {
      try {
        setImageLoading(true);
        const ImageService = await import("../services/ImageService").then(
          (module) => module.default
        );
        console.log("Fetching image with file ID:", fileId);
        const url = await ImageService.fetchImageFromOpenAI(fileId);
        if (isMounted) {
          setImageUrl(url);
          setImageLoading(false);
        }
      } catch (error) {
        console.error("Failed to load image:", error);
        if (isMounted) {
          setImageError(true);
          setImageLoading(false);
        }
      }
    };
    // Parse message text for image references and extract the file ID
    const parseMessageForImages = () => {
      if (!message) return null;

      // Match markdown image references like: ![Monthly Sales Chart](attachment://assistant-GsoXybGGDUJsLAqyCGZykV)
      const regex = /!\[(.*?)\]\(attachment:\/\/(.*?)\)/g;
      const matches = Array.from(message.matchAll(regex));

      if (matches && matches.length > 0) {
        // Found at least one image reference in the message text
        const firstMatch = matches[0];
        const attachmentId = firstMatch[2];
        const altText = firstMatch[1];
        console.log(
          "Found image reference in message:",
          attachmentId,
          "Alt text:",
          altText
        );

        return attachmentId;
      }
      return null;
    }; // If we have a message with an image attachment but no explicit imageFileId
    const extractedFileId = parseMessageForImages();

    // Determine which file ID to use
    const fileIdToUse = imageFileId || extractedFileId;

    // Log what's happening for debugging
    console.log(
      "Image processing - extractedFileId:",
      extractedFileId,
      "imageFileId:",
      imageFileId,
      "useFileId:",
      fileIdToUse,
      "isImage:",
      isImage
    );

    // Only load the image if we have a file ID or if this is marked as an image message
    if (fileIdToUse) {
      console.log("Loading image with file ID:", fileIdToUse);
      loadImage(fileIdToUse);
    } else if (isImage && !initialImageUrl) {
      console.log("Message marked as image but no file ID found");
      setImageError(true);
    }

    return () => {
      isMounted = false;
      if (imageUrl && imageUrl.startsWith("blob:") && !initialImageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isImage, initialImageUrl, imageFileId, message]);

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
          {isBot ? (
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {assistantName && (
                <Typography
                  variant="caption"
                  color="text.secondary"
                  sx={{ mb: 0.5, fontWeight: "medium" }}
                >
                  {assistantName} {routedFrom && `(via ${routedFrom})`}
                </Typography>
              )}{" "}
              {/* Image display - show if it's an image message or if we have a URL */}
              {(isImage || imageUrl) && (
                <Box sx={{ mt: 1, mb: 2, position: "relative" }}>
                  {imageLoading && (
                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "center",
                        alignItems: "center",
                        height: 200,
                        bgcolor: "background.paper",
                        borderRadius: 1,
                      }}
                    >
                      <CircularProgress size={30} />
                    </Box>
                  )}
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt="Generated content"
                      onLoad={handleImageLoad}
                      onError={handleImageError}
                      style={{
                        maxWidth: "100%",
                        maxHeight: "60vh",
                        borderRadius: "8px",
                        display: imageLoading ? "none" : "block",
                      }}
                    />
                  )}
                  {imageError && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      Failed to load image. Please try again.
                    </Typography>
                  )}
                </Box>
              )}{" "}
              {message && (
                <Typography variant="body1" sx={{ lineHeight: 1.6 }}>
                  {message.replace(/!\[.*?\]\(attachment:\/\/.*?\)/g, "")}
                </Typography>
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
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            mt: 0.5,
            mr: 1,
            color: theme.palette.text.secondary,
            fontSize: "0.65rem",
            alignSelf: "flex-end",
          }}
        >
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
      {!isBot && isLoggerExpanded && logs && (
        <Logger logs={logs} isLoading={isLoadingLogs} />
      )}
    </Box>
  );
};

export default ChatMessage;
