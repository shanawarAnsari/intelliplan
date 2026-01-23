

import React, { useState } from "react";
import { Box, IconButton, Tooltip, Snackbar, Alert, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ShareIcon from "@mui/icons-material/Share";
import FeedbackDialog from "./FeedbackDialog";

const GOOD_CATEGORIES = [
  "Accurate / Correct answer",
  "Clear explanation",
  "Helpful steps",
  "Saved me time",
  "Good formatting",
  "Exactly what I needed",
  "Other (Positive)",
];

const BAD_CATEGORIES = [
  "Incorrect information",
  "Incomplete answer",
  "Too generic",
  "Confusing explanation",
  "Did not follow instructions",
  "UI/Formatting issue",
  "Performance / Slow",
  "Other (Negative)",
];

const MessageActions = ({
  message,
  isBot,
  feedback,
  onFeedbackChange,
  onFeedbackSubmit
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");


  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(message);
    setCopied(true);
    setSnackbarMessage("Copied to clipboard!");
    setSnackbar(true);
    setTimeout(() => setCopied(false), 2000);
  };


  const handleFeedbackClick = (type) => {
    setPendingType(type);
    setDialogOpen(true);
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingType(null);
  };


  const handleDialogSubmit = (formData) => {

    const payload = {
      ...formData,
      message,
      source: "message-actions",
    };


    if (onFeedbackChange) onFeedbackChange(formData.type);


    if (onFeedbackSubmit) onFeedbackSubmit(payload);
    else console.log("Feedback payload:", payload);

    setSnackbarMessage("Thanks! Your feedback was submitted.");
    setSnackbar(true);

    handleDialogClose();
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
              color: copied ? theme.palette.success.main : theme.palette.text.secondary,
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
                onClick={() => handleFeedbackClick("helpful")}
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
                onClick={() => handleFeedbackClick("unhelpful")}
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

      <FeedbackDialog
        open={dialogOpen}
        onClose={handleDialogClose}
        onSubmit={handleDialogSubmit}
        type={pendingType}
        categories={pendingType === "helpful" ? GOOD_CATEGORIES : BAD_CATEGORIES}
      />


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
