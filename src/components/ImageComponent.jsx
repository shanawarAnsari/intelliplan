import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import ZoomOutMapIcon from "@mui/icons-material/ZoomOutMap"; // Add import for expand icon
import { displayImage } from "../services/ImageService"; // Import displayImage function

const ImageComponent = ({ img, index }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgRetryCount, setImgRetryCount] = useState(0);

  // Debug logging to trace component lifecycle and state
  useEffect(() => {
    console.log(`[ImageComponent ${index}] Mounting/Updating:`, {
      fileId: img.fileId,
      url: img.url,
      loading: imgLoading,
      error: imgError,
    });

    return () => {
      console.log(`[ImageComponent ${index}] Unmounting`);
    };
  }, [img.fileId, img.url, imgLoading, imgError, index]);

  // Original useEffect for error handling
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
    a.href = img.url;
    a.download = `image-${Date.now()}-${index}.png`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  // Handle expanding the image using the displayImage function
  const handleExpandImage = () => {
    if (img.url) {
      displayImage(img.url);
    }
  };

  // Add image loading directly from fileId if URL is not available
  useEffect(() => {
    if (img.fileId && !img.url) {
      console.log(`[ImageComponent] Loading image from fileId: ${img.fileId}`);
      setImgLoading(true);

      const loadImageFromFileId = async () => {
        try {
          // Import dynamically to avoid circular dependencies
          const ImageService = await import("../services/ImageService");
          console.log(`[ImageComponent] Fetching image for fileId: ${img.fileId}`);
          const url = await ImageService.fetchImageFromOpenAI(img.fileId);

          console.log(`[ImageComponent] Fetch result:`, { url, fileId: img.fileId });

          if (url) {
            console.log(`[ImageComponent] Image loaded successfully: ${img.fileId}`);
            img.url = url; // Update the URL directly in the parent's state

            // Force a re-render after setting the URL by explicitly updating state
            setImgLoading(false);
            setImgError(false);
          } else {
            console.error(
              `[ImageComponent] No URL returned for fileId: ${img.fileId}`
            );
            setImgError(true);
            setImgLoading(false);
          }
        } catch (error) {
          console.error(`[ImageComponent] Error loading image from fileId:`, error);
          setImgError(true);
          setImgLoading(false);
        }
      };

      loadImageFromFileId();
    }
  }, [img.fileId, img.url]);

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

              // Try loading the image again on retry
              if (img.fileId) {
                const loadRetryImage = async () => {
                  try {
                    const ImageService = await import("../services/ImageService");
                    const result = await ImageService.fetchImageFromOpenAI(
                      img.fileId
                    );
                    if (result) {
                      img.url = result;
                      setImgLoading(false);
                      setImgError(false);
                      console.log(
                        `[ImageComponent] Retry successful for ${img.fileId}`
                      );
                    } else {
                      setImgError(true);
                      setImgLoading(false);
                    }
                  } catch (error) {
                    console.error("Failed to load retry image:", error);
                    setImgError(true);
                    setImgLoading(false);
                  }
                };
                loadRetryImage();
              }
            }}
          >
            Retry Loading
          </Button>
        </Box>
      )}

      {img.url && (
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
            console.log(`[ImageComponent] Image ${index} loaded:`, img.url);
            setImgLoading(false);
          }}
          onError={(e) => {
            console.error(`[ImageComponent] Error loading image ${index}:`, e);
            setImgError(true);
            setImgLoading(false);
          }}
        />
      )}

      {!imgLoading && !imgError && img.url && (
        <>
          {/* Download button - left corner */}
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

          {/* Expand button - right corner */}
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
