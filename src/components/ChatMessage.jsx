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

const ChatMessage = ({
  message,
  isBot,
  timestamp,
  onRegenerateResponse,
  imageUrl: initialImageUrl,
  isImage,
  imageFileId,
  images, // Add support for multiple images array
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
              ? isChunk
                ? "rgba(129, 199, 132, 0.1)" // Light green background for chunks
                : isFinal
                ? "rgba(25, 118, 210, 0.12)" // Light blue background for final answer
                : isRoutingMessage
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
            borderLeft: isFinal
              ? `3px solid ${theme.palette.primary.main}`
              : isChunk
              ? `2px solid rgba(129, 199, 132, 0.6)`
              : isRoutingMessage
              ? `3px solid ${theme.palette.primary.main}`
              : "none",
            opacity: isChunk ? 0.93 : 1, // Slightly transparent for chunks
            transition: "opacity 0.3s ease, background-color 0.3s ease",
          }}
        >
          {" "}
          {isBot ? (
            <Box sx={{ display: "flex", flexDirection: "column", width: "100%" }}>
              {" "}
              {/* Removed assistant name display to simplify the interface */}{" "}
              {/* Streaming indicator - no longer needed as we use isChunk instead */}{" "}
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
                  )}{" "}
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
                          // Create a temporary anchor element
                          const a = document.createElement("a");
                          a.href = imageUrl;
                          a.download = `image-${Date.now()}.png`;
                          document.body.appendChild(a);
                          a.click();
                          document.body.removeChild(a);
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
              )}{" "}
              {/* Display multiple images if available */}
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
                      <Box key={`img-${index}`} sx={{ position: "relative" }}>
                        <img
                          src={img.url}
                          alt={`Generated content ${index + 1}`}
                          style={{
                            maxWidth: "100%",
                            maxHeight: "60vh",
                            borderRadius: "8px",
                          }}
                        />
                        <IconButton
                          onClick={() => {
                            const a = document.createElement("a");
                            a.href = img.url;
                            a.download = `image-${Date.now()}-${index}.png`;
                            document.body.appendChild(a);
                            a.click();
                            document.body.removeChild(a);
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
                    ))}
                  </Box>
                </Box>
              )}
              {message && (
                <>
                  {" "}
                  {isChunk && (
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ display: "block", mb: 0.5, fontStyle: "italic" }}
                    >
                      Thinking...
                    </Typography>
                  )}
                  {isFinal && (
                    <Typography
                      variant="caption"
                      color="primary"
                      sx={{ display: "block", mb: 0.5, fontWeight: "medium" }}
                    >
                      Final Answer
                    </Typography>
                  )}{" "}
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: 1.6,
                      fontSize: isChunk ? "0.9rem" : "1rem",
                      fontWeight: isFinal ? "medium" : "normal",
                    }}
                  >
                    {typeof message === "string"
                      ? message.replace(/!\[.*?\]\(attachment:\/\/.*?\)/g, "")
                      : ""}
                  </Typography>
                </>
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
      </Box>{" "}
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
          </Tooltip>{" "}
          {/* Removed assistant name and routing information display */}
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
