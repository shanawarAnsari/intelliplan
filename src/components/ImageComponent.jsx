import React, { useState, useEffect } from "react";
import {
  Box,
  CircularProgress,
  Typography,
  Button,
  IconButton,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
import { fetchImageFromOpenAI } from "../services/ImageService";

const ImageComponent = ({ img, index }) => {
  const [imgLoading, setImgLoading] = useState(true);
  const [imgError, setImgError] = useState(false);
  const [imgRetryCount, setImgRetryCount] = useState(0);

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
                const result = await fetchImageFromOpenAI(img.fileId);
                if (result) {
                  img.url = result; // Update the URL in the parent's state
                  setImgError(false);
                } else {
                  setImgError(true);
                }
              } catch (error) {
                console.error("Failed to load fallback image:", error);
                setImgError(true);
              } finally {
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
      )}
    </Box>
  );
};

export default ImageComponent;
