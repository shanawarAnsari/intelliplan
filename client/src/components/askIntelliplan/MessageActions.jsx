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
  dataTable,
  isBot,
  feedback, // Now an object: { score, category, comment, submittedAt } or null
  onFeedbackChange,
  onFeedbackSubmit,
  sessionId,
  messageId,
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState(null);

  const handleCopy = () => {
    navigator.clipboard.writeText(
      message + JSON.stringify(dataTable || "", null, 2),
    );
    setCopied(true);
    setSnackbarSeverity("success");
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

  const handleDialogSubmit = async (formData) => {
    const payload = {
      ...formData, // Includes type, score, category, comment, submittedAt
      message,
      sessionId,
      messageId,
    };

    if (onFeedbackChange) onFeedbackChange(formData.score); // Update UI feedback state

    try {
      if (onFeedbackSubmit) {
        await onFeedbackSubmit(payload); // Send full payload to context/API
      } else {
        console.log("Feedback payload:", payload);
      }

      setSnackbarSeverity("success");
      setSnackbarMessage("Thanks! Your feedback was submitted.");
      setSnackbar(true);
    } catch (error) {
      console.error("Failed to submit feedback:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage(
        error.message || "Failed to submit feedback. Please try again.",
      );
      setSnackbar(true);
    }

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

  // Helper to get tooltip text
  const getFeedbackTooltip = (type) => {
    if (!feedback) return type === "helpful" ? "Helpful" : "Not helpful";
    const isPositive = feedback.score === 1;
    const isHelpfulButton = type === "helpful";
    if ((isPositive && isHelpfulButton) || (!isPositive && !isHelpfulButton)) {
      return `Feedback: ${feedback.category}${feedback.comment ? ` - ${feedback.comment}` : ""}`;
    }
    return type === "helpful" ? "Helpful" : "Not helpful";
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
            <Tooltip title={getFeedbackTooltip("helpful")} placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleFeedbackClick("helpful")}
                  disabled={feedback !== null} // Disable if feedback already given
                  sx={{
                    width: 24,
                    height: 24,
                    color:
                      feedback?.score === 1
                        ? theme.palette.success.main
                        : theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor: "transparent", // Keep transparent on hover to show tooltip
                      color: theme.palette.success.main, // Maintain color
                    },
                    "&.Mui-disabled": {
                      color:
                        feedback?.score === 1
                          ? theme.palette.success.main
                          : theme.palette.text.secondary, // Keep color when disabled
                    },
                  }}
                >
                  <ThumbUpIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            </Tooltip>

            <Tooltip title={getFeedbackTooltip("unhelpful")} placement="top">
              <span>
                <IconButton
                  size="small"
                  onClick={() => handleFeedbackClick("unhelpful")}
                  disabled={feedback !== null} // Disable if feedback already given
                  sx={{
                    width: 24,
                    height: 24,
                    color:
                      feedback?.score === 0
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor: "transparent", // Keep transparent on hover to show tooltip
                      color: theme.palette.error.main, // Maintain color
                    },
                    "&.Mui-disabled": {
                      color:
                        feedback?.score === 0
                          ? theme.palette.error.main
                          : theme.palette.text.secondary, // Keep color when disabled
                    },
                  }}
                >
                  <ThumbDownIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
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
          severity={snackbarSeverity}
          sx={{
            width: "100%",
            background: "rgba(31, 41, 55, 0.95)",
            backdropFilter: "blur(20px)",
            border:
              snackbarSeverity === "error"
                ? "1px solid rgba(239, 68, 68, 0.3)"
                : "1px solid rgba(16, 185, 129, 0.3)",
            color: theme.palette.text.primary,
            "& .MuiAlert-icon": {
              color:
                snackbarSeverity === "error"
                  ? theme.palette.error.main
                  : theme.palette.success.main,
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
