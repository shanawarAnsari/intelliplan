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
  Button,
} from "@mui/material";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ThumbUpAltOutlinedIcon from "@mui/icons-material/ThumbUpAltOutlined";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import DownloadIcon from "@mui/icons-material/Download";
import Logger from "./Logger";

const ImageComponent = ({ img, index }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgRetryCount, setImgRetryCount] = useState(0);

  useEffect(() => {
    let timerId;
    if (imgError && imgRetryCount < 3) {
      timerId = setTimeout(() => {
        console.log(`Retrying image ${index} (attempt ${imgRetryCount + 1})`);
        setImgRetryCount((prev) => prev + 1);
        setImgError(false);
        setImgLoading(true);
      }, 2000 * (imgRetryCount + 1)); // Increasing backoff
    }
    return () => clearTimeout(timerId);
  }, [imgError, imgRetryCount, index]);

  return (
    <Box key={`img-${index}`} sx={{ position: "relative" }}>
      {imgLoading && (
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

      {imgError && (
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            height: 150,
            bgcolor: "background.paper",
            borderRadius: 1,
            p: 2,
          }}
        >
          <Typography color="error" sx={{ mb: 1 }}>
            Image failed to load
          </Typography>
          <Button
            variant="outlined"
            size="small"
            onClick={() => {
              setImgRetryCount((prev) => prev + 1);
              setImgError(false);
              setImgLoading(true);
            }}
          >
            Retry Loading
          </Button>
        </Box>
      )}

      <img
        src={img.url}
        alt={`Generated content ${index + 1}`}
        style={{
          maxWidth: "100%",
          maxHeight: "60vh",
          borderRadius: "8px",
          display: imgLoading || imgError ? "none" : "block",
        }}
        onLoad={() => {
          console.log(`Image ${index} loaded:`, img.url);
          setImgLoading(false);
        }}
        onError={(e) => {
          console.error(`Error loading image ${index}:`, e);
          if (img.fileId) {
            setImgLoading(true);
            const loadFallbackImage = async () => {
              try {
                const ImageService = await import("../services/ImageService");
                const url = await ImageService.default.fetchImageFromOpenAI(
                  img.fileId
                );
                if (url) {
                  e.target.src = url;
                } else {
                  setImgError(true);
                  setImgLoading(false);
                }
              } catch (err) {
                console.error("Failed to load fallback image:", err);
                setImgError(true);
                setImgLoading(false);
              }
            };
            loadFallbackImage();
          } else {
            setImgError(true);
            setImgLoading(false);
          }
        }}
      />

      {!imgLoading && !imgError && (
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
      )}
    </Box>
  );
};

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
      isImage,
      "images:",
      images
    );

    // Only load the image if we have a file ID or if this is marked as an image message
    if (fileIdToUse) {
      console.log("Loading image with file ID:", fileIdToUse);
      loadImage(fileIdToUse);
    } else if (isImage && images && images.length > 0) {
      // If we have images array from progressImages, use those directly
      console.log("Using images from progressImages array:", images);
      // No need to load anything, the image URLs are already in the images array
      setImageLoading(false);
    } else if (isImage && !initialImageUrl && !images) {
      console.log("Message marked as image but no file ID found");
      setImageError(true);
      setImageLoading(false);
    }

    return () => {
      isMounted = false;
      if (imageUrl && imageUrl.startsWith("blob:") && !initialImageUrl) {
        URL.revokeObjectURL(imageUrl);
      }
    };
  }, [isImage, initialImageUrl, imageFileId, message, images]);

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
        )}{" "}
        <Paper
          elevation={1}
          sx={{
            p: isChunk ? 0.5 : 1,
            px: isChunk ? 1.2 : 2,
            maxWidth: { xs: isChunk ? "75%" : "85%", sm: isChunk ? "60%" : "75%" },
            bgcolor: isBot
              ? isChunk
                ? "rgba(37, 37, 37, 0.52)" // Lighter background for chunks
                : isFinal
                ? "rgba(25, 118, 210, 0.12)" // Light blue for final answer
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
                          // Create a temporary link element
                          const link = document.createElement("a");
                          link.href = imageUrl;
                          // Extract filename from URL or use a default
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
              {/* Remove assistant name and routed from if it's a chunk */}
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
                <>
                  {" "}
                  <Typography
                    variant="body1"
                    sx={{
                      lineHeight: isChunk ? 1.5 : 1.6,
                      fontSize: isChunk ? "0.85rem" : "1rem",
                      fontWeight: isFinal ? "medium" : "normal",
                      whiteSpace: "pre-wrap", // Preserve line breaks and formatting
                      wordBreak: "break-word", // Prevent long words from breaking layout
                      "& code": {
                        // Style code blocks
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
