import React, { useState, useEffect, useRef } from "react";
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
import ImageComponent from "./ImageComponent";
import FileService from "../services/FileService";

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
  id,
  threadId,
  hasImages,
  fileAttachmentId,
}) => {
  const theme = useTheme();
  const [isLiked, setIsLiked] = useState(false);
  const [imageLoading, setImageLoading] = useState(isImage);
  const [imageError, setImageError] = useState(false);
  const [imageUrl, setImageUrl] = useState(initialImageUrl);
  const [isLoggerExpanded, setIsLoggerExpanded] = useState(false);
  const [messageImages, setMessageImages] = useState(images || []);
  const [fileDownloadUrl, setFileDownloadUrl] = useState(null);
  const [fileDownloadName, setFileDownloadName] = useState(null);
  const [fileLoading, setFileLoading] = useState(false);
  const [fileError, setFileError] = useState(null);

  useEffect(() => {
    const likedMessages = JSON.parse(localStorage.getItem("likedMessages") || "[]");
    if (likedMessages.some((likedMsg) => likedMsg.id === id)) {
      setIsLiked(true);
    }
  }, [id]);

  const handleLike = () => {
    const currentLikedStatus = !isLiked;
    setIsLiked(currentLikedStatus);

    let likedMessages = JSON.parse(localStorage.getItem("likedMessages") || "[]");
    if (currentLikedStatus) {
      const messageToLike = {
        id,
        text: message,
        timestamp: timestamp,
        isBot: isBot,
      };
      likedMessages.push(messageToLike);
    } else {
      likedMessages = likedMessages.filter((likedMsg) => likedMsg.id !== id);
    }
    localStorage.setItem("likedMessages", JSON.stringify(likedMessages));
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

  const handleFileDownload = async (fileId) => {
    setFileLoading(true);
    setFileError(null);
    try {
      const { blobUrl, filename } = await FileService.fetchFileFromOpenAI(fileId);
      setFileDownloadUrl(blobUrl);
      setFileDownloadName(filename);
      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    } catch (err) {
      setFileError("Failed to download file");
    } finally {
      setFileLoading(false);
    }
  };

  const renderMarkdownLinks = (text) => {
    const regex = /\[Download ([^\]]+)\]\(([^)]+)\)/g;
    const parts = [];
    let lastIndex = 0;
    let match;
    let key = 0;
    while ((match = regex.exec(text)) !== null) {
      const before = text.slice(lastIndex, match.index);
      if (before) parts.push(before);
      const filename = match[1];
      // Always use fileAttachmentId if present for download
      parts.push(
        <Button
          key={`download-link-${key++}`}
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={async () => {
            if (!fileAttachmentId) return; // No file to download
            setFileLoading(true);
            setFileError(null);
            try {
              const { blobUrl } = await FileService.fetchFileFromOpenAI(
                fileAttachmentId
              );
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = filename;
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (err) {
              setFileError("Failed to download file");
            } finally {
              setFileLoading(false);
            }
          }}
          disabled={fileLoading || !fileAttachmentId}
          sx={{ mr: 1, mb: 1 }}
        >
          {filename}
        </Button>
      );
      lastIndex = regex.lastIndex;
    }
    if (lastIndex < text.length) {
      parts.push(text.slice(lastIndex));
    }
    return parts;
  };

  const renderFileAttachmentDownload = () => {
    if (!isFinal || !fileAttachmentId) return null;
    return (
      <Box sx={{ mt: 1, mb: 1 }}>
        <Button
          variant="outlined"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={async () => {
            setFileLoading(true);
            setFileError(null);
            try {
              const { blobUrl } = await FileService.fetchFileFromOpenAI(
                fileAttachmentId
              );
              const link = document.createElement("a");
              link.href = blobUrl;
              link.download = "FinalReport.pptx";
              document.body.appendChild(link);
              link.click();
              document.body.removeChild(link);
            } catch (err) {
              setFileError("Failed to download file");
            } finally {
              setFileLoading(false);
            }
          }}
          disabled={fileLoading}
          sx={{ mr: 1, mb: 1 }}
        >
          Download FinalReport.pptx
        </Button>
        {fileError && (
          <Typography color="error" variant="caption">
            {fileError}
          </Typography>
        )}
      </Box>
    );
  };

  const hasLoadedImageRef = useRef(false);

  useEffect(() => {
    let isMounted = true;

    const loadImage = async (fileId) => {
      if (hasLoadedImageRef.current && imageUrl) return;

      try {
        const ImageService = await import("../services/ImageService");
        const url = await ImageService.fetchImageFromOpenAI(fileId);

        if (isMounted) {
          setImageUrl(url);
          setImageLoading(false);
          hasLoadedImageRef.current = true;
        }
      } catch (error) {
        console.error("Error loading image:", error);
        if (isMounted) {
          setImageError(true);
          setImageLoading(false);
        }
      }
    };

    const parseMessageForImages = () => {
      if (!message) return null;

      const regex = /!\[(.*?)\]\(attachment:\/\/(.*?)\)/g;
      let match;
      let fileId = null;

      while ((match = regex.exec(message)) !== null) {
        fileId = match[2];
        break;
      }

      return fileId;
    };

    const extractedFileId = parseMessageForImages();
    const fileIdToUse = imageFileId || extractedFileId;

    if (fileIdToUse && (!imageUrl || !hasLoadedImageRef.current)) {
      loadImage(fileIdToUse);
    } else if (isImage && !imageUrl) {
      setImageLoading(false);
    }

    return () => {
      isMounted = false;
    };
  }, [isImage, initialImageUrl, imageFileId, message, images]);
  useEffect(() => {
    if (images && images.length > 0) {
      console.log(
        `[ChatMessage ${id}] Processing ${images.length} images for message`
      );

      setMessageImages([...images]);

      images.forEach((img) => {
        if (img.fileId && !img.url) {
          console.log(`[ChatMessage ${id}] Image ${img.fileId} needs URL loading`);
        }
      });
    }
  }, [images, id, threadId]);

  useEffect(() => {
    if (messageImages && messageImages.length > 0) {
      console.log(
        `[ChatMessage ${id}] Ready to render ${messageImages.length} images:`,
        messageImages.map((img) => ({
          fileId: img.fileId,
          hasUrl: !!img.url,
          threadId: img.threadId,
        }))
      );
    }
  }, [messageImages, id]);

  useEffect(() => {
    if (isImage) {
      setImageLoading(true);
      hasLoadedImageRef.current = false;
    }

    if (images && images.length > 0) {
      const relevantImages = images.filter(
        (img) =>
          !img.messageId ||
          img.messageId === id ||
          !img.threadId ||
          img.threadId === threadId
      );

      setMessageImages(relevantImages);
    }
  }, [isImage, images, imageFileId, id, threadId]);

  useEffect(() => {
    if (isImage) {
      console.log(`[ChatMessage] Image message detected:`, {
        id,
        imageFileId,
        hasImages: !!images && images.length > 0,
        imageCount: images ? images.length : 0,
      });
    }

    if (images && images.length > 0) {
      console.log(
        `[ChatMessage] Message has ${images.length} images:`,
        images.map((img) => ({ fileId: img.fileId, hasUrl: !!img.url }))
      );
    }
  }, [isImage, images, imageFileId, id]);

  let fileLinks = [];
  if (images && images.length > 0) {
    fileLinks = images.filter((img) => img.fileId && img.type === "file_citation");
  }

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
            p: isChunk ? 0.8 : 1,
            px: isChunk ? 1.5 : 2,
            maxWidth: { xs: isChunk ? "80%" : "85%", sm: isChunk ? "70%" : "75%" },
            bgcolor: isBot
              ? isChunk
                ? "rgba(37, 37, 37, 0.65)"
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
              ? `2px solid rgba(180, 180, 180, 0.6)`
              : isRoutingMessage
              ? `3px solid ${theme.palette.primary.main}`
              : `4px solid transparent`,
            opacity: isChunk ? 0.98 : 1,
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
              )}{" "}
              {messageImages && messageImages.length > 0 && (
                <Box sx={{ mt: 2, mb: 3 }}>
                  <Typography
                    variant="caption"
                    sx={{ mb: 1, display: "block", color: "text.secondary" }}
                  >
                    Generated images ({messageImages.length}):
                  </Typography>
                  <Box
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      gap: 2,
                    }}
                  >
                    {messageImages.map((img, index) => (
                      <ImageComponent
                        key={`img-${img.fileId || index}`}
                        img={img}
                        index={index}
                      />
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
                    ? renderMarkdownLinks(
                        message.replace(/!\[.*?\]\(attachment:\/\/.*?\)/g, "")
                      )
                    : ""}
                </Typography>
              )}
              {/* Always render download button for fileAttachmentId if present and isFinal */}
              {isFinal && fileAttachmentId && renderFileAttachmentDownload()}
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
