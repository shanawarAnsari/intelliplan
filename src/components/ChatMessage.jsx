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
import DownloadIcon from "@mui/icons-material/Download";
import Logger from "./Logger";
import ImageComponent from "./ImageComponent";

const ChatMessage = ({
  message,
  isBot,
  timestamp,
  onRegenerateResponse,
  imageUrl: initialImageUrl,
  isImage,
  imageFileId,
  images,
  assistantName,
  routedFrom,
  isRoutingMessage,
  logs,
  isLoadingLogs,
  isChunk = false,
  isFinal = false,
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
        const ImageService = await import("../services/ImageService");
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

    const parseMessageForImages = () => {
      if (!message) return null;
      const regex = /!\[(.*?)\]\(attachment:\/\/(.*?)\)/g;
      const matches = Array.from(message.matchAll(regex));

      if (matches && matches.length > 0) {
        const firstMatch = matches[0];
        return firstMatch[2];
      }
      return null;
    };

    const extractedFileId = parseMessageForImages();
    const fileIdToUse = imageFileId || extractedFileId;

    if (fileIdToUse) {
      loadImage(fileIdToUse);
    } else if (isImage && images && images.length > 0) {
      setImageLoading(false);
    } else if (isImage && !initialImageUrl && !images) {
      setImageError(true);
      setImageLoading(false);
    }

    return () => {
      isMounted = false;
      if (imageUrl && imageUrl.startsWith("blob:") && !initialImageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isImage, initialImageUrl, imageFileId, message, images, imageUrl]);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: isChunk ? "center" : isBot ? "flex-start" : "flex-end",
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
          justifyContent: isChunk ? "center" : isBot ? "flex-start" : "flex-end",
          mb: 0.5,
        }}
      >
        {isBot && !isChunk && (
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
            p: isChunk ? 0.5 : 1,
            px: isChunk ? 1.2 : 2,
            maxWidth: { xs: isChunk ? "75%" : "85%", sm: isChunk ? "60%" : "75%" },
            bgcolor: isBot
              ? isChunk
                ? "rgba(37, 37, 37, 0.52)"
                : isFinal
                ? "rgba(25, 118, 210, 0.12)"
                : isRoutingMessage
                ? "rgba(25, 118, 210, 0.08)"
                : theme.palette.background.secondary
              : theme.palette.primary.main,
            color: isBot
              ? theme.palette.text.primary
              : theme.palette.primary.contrastText,
            borderRadius: isChunk ? "8px" : "12px",
            boxShadow: isBot
              ? isChunk
                ? "none"
                : "0px 1px 3px rgba(0,0,0,0.12)"
              : "0px 1px 3px rgba(0,0,0,0.2)",
            borderLeft: isFinal
              ? `4px solid ${theme.palette.primary.main}`
              : isChunk
              ? `2px solid rgb(136, 136, 136)`
              : isRoutingMessage
              ? `3px solid ${theme.palette.primary.main}`
              : "none",
            opacity: isChunk ? 0.95 : 1,
            transition: "opacity 0.3s ease, background-color 0.3s ease",
          }}
        >
          {isBot ? (
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
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
                    <Box sx={{ position: "relative" }}>
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
                      <IconButton
                        onClick={() => {
                          const link = document.createElement("a");
                          link.href = imageUrl;
                          const filename =
                            imageUrl.substring(imageUrl.lastIndexOf("/") + 1) ||
                            "downloaded-image";
                          link.download = filename;
                          document.body.appendChild(link);
                          link.click();
                          document.body.removeChild(link);
                        }}
                        sx={{
                          position: "absolute",
                          top: 8,
                          left: 8,
                          backgroundColor: "rgba(0, 0, 0, 0.5)",
                          color: "#fff",
                          "&:hover": {
                            backgroundColor: "rgba(0, 0, 0, 0.7)",
                            transform: "scale(1.1)",
                          },
                          transition: "all 0.2s ease",
                          padding: "6px",
                        }}
                        size="small"
                        title="Download image"
                      >
                        <DownloadIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  )}
                  {imageError && (
                    <Typography color="error" sx={{ mt: 1 }}>
                      Failed to load image. Please try again.
                    </Typography>
                  )}
                </Box>
              )}
              {!isChunk && (assistantName || routedFrom) && (
                <Typography
                  variant="caption"
                  sx={{
                    display: "block",
                    mb: 0.5,
                    fontWeight: "medium",
                    color: theme.palette.text.secondary,
                    fontSize: "0.7rem",
                  }}
                >
                  {assistantName && `via ${assistantName}`}
                  {routedFrom && ` (${routedFrom})`}
                </Typography>
              )}
              {images && images.length > 0 && (
                <Box sx={{ mt: 1, mb: 2 }}>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {images.map((img, index) => (
                      <ImageComponent key={`img-${index}`} img={img} index={index} />
                    ))}
                  </Box>
                </Box>
              )}
              {message && (
                <Typography
                  variant="body1"
                  sx={{
                    lineHeight: isChunk ? 1.5 : 1.6,
                    fontSize: isChunk ? "0.85rem" : "1rem",
                    fontWeight: isFinal ? "medium" : "normal",
                    whiteSpace: "pre-wrap",
                    wordBreak: "break-word",
                    "& code": {
                      backgroundColor: "rgba(0, 0, 0, 0.04)",
                      padding: "2px 4px",
                      borderRadius: "4px",
                      fontFamily: "monospace",
                    },
                  }}
                >
                  {typeof message === "string"
                    ? message.replace(/!\[.*?\]\(attachment:\/\/.*?\)/g, "")
                    : ""}
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
      {isBot && !isChunk && (
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
        </Box>
      )}
      {!isBot && isLoggerExpanded && logs && (
        <Logger logs={logs} isLoading={isLoadingLogs} />
      )}
    </Box>
  );
};

export default ChatMessage;
