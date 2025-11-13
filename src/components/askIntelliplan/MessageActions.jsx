/**
 * Message Actions Component - Copy, react, and share buttons
 */
import React, { useState } from "react";
import { Box, IconButton, Tooltip, Snackbar, Alert, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ShareIcon from "@mui/icons-material/Share";

const MessageActions = ({ message, isBot, feedback, onFeedbackChange }) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setSnackbarMessage("Copied to clipboard!");
    setSnackbar(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleFeedback = (type) => {
    if (onFeedbackChange) {
      onFeedbackChange(type);
      setSnackbarMessage(
        type === "helpful"
          ? "Thanks for your feedback!"
          : "We appreciate your feedback!"
      );
      setSnackbar(true);
    }
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
          borderRadius: 1.5,
          background: "rgba(31, 41, 55, 0.6)",
          backdropFilter: "blur(10px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          boxShadow: "0 1px 4px rgba(0, 0, 0, 0.1)",
        }}
      >
        <Tooltip title="Copy" placement="top">
          <IconButton
            size="small"
            onClick={handleCopy}
            sx={{
              width: 24,
              height: 24,
              color: copied
                ? theme.palette.success.main
                : theme.palette.text.secondary,
              "&:hover": {
                bgcolor: "rgba(96, 165, 250, 0.1)",
                color: theme.palette.primary.main,
              },
            }}
          >
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

        {isBot && (
          <>
            <Tooltip title="Helpful" placement="top">
              <IconButton
                size="small"
                onClick={() => handleFeedback("helpful")}
                sx={{
                  width: 24,
                  height: 24,
                  color:
                    feedback === "helpful"
                      ? theme.palette.success.main
                      : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: "rgba(16, 185, 129, 0.1)",
                    color: theme.palette.success.main,
                  },
                }}
              >
                <ThumbUpIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>

            <Tooltip title="Not helpful" placement="top">
              <IconButton
                size="small"
                onClick={() => handleFeedback("unhelpful")}
                sx={{
                  width: 24,
                  height: 24,
                  color:
                    feedback === "unhelpful"
                      ? theme.palette.error.main
                      : theme.palette.text.secondary,
                  "&:hover": {
                    bgcolor: "rgba(239, 68, 68, 0.1)",
                    color: theme.palette.error.main,
                  },
                }}
              >
                <ThumbDownIcon sx={{ fontSize: 14 }} />
              </IconButton>
            </Tooltip>
          </>
        )}

        <Tooltip title="Share" placement="top">
          <IconButton
            size="small"
            onClick={handleShare}
            sx={{
              width: 24,
              height: 24,
              color: theme.palette.text.secondary,
              "&:hover": {
                bgcolor: "rgba(167, 139, 250, 0.1)",
                color: theme.palette.secondary.main,
              },
            }}
          >
            <ShareIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>
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
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </>
  );
};

export default MessageActions;
