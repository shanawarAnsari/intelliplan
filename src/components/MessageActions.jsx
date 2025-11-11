/**
 * Message Actions Component - Copy, react, and share buttons
 */
import React, { useState } from "react";
import { Box, IconButton, Tooltip, Snackbar, Alert, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ShareIcon from "@mui/icons-material/Share";

const MessageActions = ({ message, isBot }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [feedback, setFeedback] = useState(null);
  const [snackbar, setSnackbar] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setSnackbar(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    setFeedback(type);
    setSnackbar(true);
    setTimeout(() => setFeedback(null), 2000);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: message,
          title: "IntelliPlan Message",
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  return (
    <>
      <Box
        sx={{
          display: "flex",
          gap: 0.5,
          alignItems: "center",
          p: 0.5,
          borderRadius: 2,
          background: "rgba(31, 41, 55, 0.7)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
          transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
          "&:hover": {
            boxShadow: "0 4px 12px rgba(0, 0, 0, 0.15)",
          },
        }}
      >
        <Tooltip title="Copy" placement="top">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              width: 30,
              height: 30,
              color: copied
                ? theme.palette.success.main
                : theme.palette.text.secondary,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                bgcolor: "rgba(96, 165, 250, 0.15)",
                color: theme.palette.primary.main,
                transform: "scale(1.1)",
              },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 16 }} />
          </IconButton>
        </Tooltip>

        {isBot && (
          <>
            <Tooltip title="Helpful" placement="top">
              <IconButton
                size="small"
                onClick={() => handleFeedback("helpful")}
                sx={{
                  width: 30,
                  height: 30,
                  color:
                    feedback === "helpful"
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(16, 185, 129, 0.15)",
                    color: theme.palette.success.main,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <ThumbUpIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Not helpful" placement="top">
              <IconButton
                size="small"
                onClick={() => handleFeedback("unhelpful")}
                sx={{
                  width: 30,
                  height: 30,
                  color:
                    feedback === "unhelpful"
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                  transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.15)",
                    color: theme.palette.error.main,
                    transform: "scale(1.1)",
                  },
                }}
              >
                <ThumbDownIcon sx={{ fontSize: 16 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        {navigator.share && (
          <Tooltip title="Share" placement="top">
            <IconButton
              size="small"
              onClick={handleShare}
              sx={{
                width: 30,
                height: 30,
                color: theme.palette.text.secondary,
                transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                "&:hover": {
                  bgcolor: "rgba(167, 139, 250, 0.15)",
                  color: theme.palette.secondary.main,
                  transform: "scale(1.1)",
                },
              }}
            >
              <ShareIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      <Snackbar
        open={snackbar}
        autoHideDuration={2000}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity="success"
          sx={{
            width: "100%",
            background: "rgba(31, 41, 55, 0.95)",
            backdropFilter: "blur(20px)",
            border: "1px solid rgba(16, 185, 129, 0.3)",
            color: theme.palette.text.primary,
            "& .MuiAlert-icon": {
              color: theme.palette.success.main,
            },
          }}
        >
          {copied && "Copied to clipboard!"}
          {feedback === "helpful" && "Thanks for your feedback!"}
          {feedback === "unhelpful" && "We appreciate your feedback!"}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageActions;
