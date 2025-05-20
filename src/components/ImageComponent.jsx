import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap";
import { displayImage } from "../services/ImageService";

const ImageComponent = ({ img, index }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgRetryCount, setImgRetryCount] = useState(0);
  const [imgUrl, setImgUrl] = useState(img.url || null);

  console.log(`[ImageComponent] Rendering image ${index}:`, {
    fileId: img.fileId,
    hasUrl: !!img.url,
    imgUrl: !!imgUrl,
    threadId: img.threadId,
    messageId: img.messageId,
  });

  useEffect(() => {
    console.log(`[ImageComponent ${index}] Mounting/Updating:`, {
      fileId: img.fileId,
      threadId: img.threadId,
      messageId: img.messageId,
      url: img.url,
      loading: imgLoading,
      error: imgError,
    });

    return () => {
      console.log(`[ImageComponent ${index}] Unmounting`);
    };
  }, [
    img.fileId,
    img.url,
    img.threadId,
    img.messageId,
    imgLoading,
    imgError,
    index,
  ]);

  useEffect(() => {
    let timerId;
    if (imgError && imgRetryCount < 3) {
      timerId = setTimeout(() => {
        setImgError(false);
        setImgLoading(true);
        setImgRetryCount((prev) => prev + 1);
      }, 2000 * (imgRetryCount + 1));
    }

    return () => clearTimeout(timerId);
  }, [imgError, imgRetryCount]);

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = imgUrl;
    a.download = `image-${Date.now()}-${index}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleExpandImage = () => {
    if (imgUrl) {
      displayImage(imgUrl);
    }
  }; // First load attempt
  useEffect(() => {
    const loadImage = async () => {
      try {
        if (img.fileId) {
          console.log(
            `[ImageComponent] Loading image ${index} from fileId: ${img.fileId}`
          );
          const ImageService = await import("../services/ImageService");
          const url = await ImageService.fetchImageFromOpenAI(img.fileId);

          if (url) {
            console.log(
              `[ImageComponent] Successfully loaded image ${index}: ${img.fileId}`
            );
            setImgUrl(url);
            img.url = url; // Update the image object directly
            setImgLoading(false);
          } else {
            console.error(
              `[ImageComponent] Failed to get URL for image ${index}: ${img.fileId}`
            );
            setImgError(true);
            setImgLoading(false);
          }
        } else if (img.url) {
          console.log(`[ImageComponent] Using provided URL for image ${index}`);
          setImgUrl(img.url);
          setImgLoading(false);
        } else {
          console.error(`[ImageComponent] No fileId or URL for image ${index}`);
          setImgError(true);
          setImgLoading(false);
        }
      } catch (error) {
        console.error(`[ImageComponent] Error loading image ${index}:`, error);
        setImgError(true);
        setImgLoading(false);
      }
    };

    loadImage();
  }, [img.fileId, index]);

  return (
    <Box sx={{ position: "relative" }}>
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
          <Typography variant="caption" sx={{ ml: 1 }}>
            Loading image...
          </Typography>
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

              if (img.fileId) {
                const loadImage = async () => {
                  try {
                    const ImageService = await import("../services/ImageService");
                    const url = await ImageService.fetchImageFromOpenAI(img.fileId);
                    if (url) {
                      setImgUrl(url);
                      img.url = url;
                      setImgLoading(false);
                    } else {
                      setImgError(true);
                      setImgLoading(false);
                    }
                  } catch (error) {
                    console.error("Error reloading image:", error);
                    setImgError(true);
                    setImgLoading(false);
                  }
                };
                loadImage();
              }
            }}
          >
            Retry Loading
          </Button>
        </Box>
      )}{" "}
      {imgUrl && (
        <img
          src={imgUrl}
          alt={`Generated content ${index + 1}`}
          style={{
            width: "100%",
            maxHeight: "60vh",
            borderRadius: "8px",
            display: imgLoading ? "none" : "block",
          }}
          onLoad={() => {
            console.log(
              `[ImageComponent] Image ${index} loaded successfully:`,
              imgUrl
            );
            setImgLoading(false);
          }}
          onError={(e) => {
            console.error(`[ImageComponent] Error displaying image ${index}:`, e);
            setImgError(true);
            setImgLoading(false);
          }}
        />
      )}
      {!imgLoading && !imgError && imgUrl && (
        <>
          <IconButton
            onClick={handleDownload}
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

          <IconButton
            onClick={handleExpandImage}
            sx={{
              position: "absolute",
              top: 8,
              right: 8,
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
            title="Expand image"
          >
            <ZoomOutMapIcon fontSize="small" />
          </IconButton>
        </>
      )}
    </Box>
  );
};

export default ImageComponent;
