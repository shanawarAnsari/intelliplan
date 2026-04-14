import React, { useState, useEffect } from "react";
import { Box, IconButton, Tooltip, Snackbar, Alert, useTheme } from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ShareIcon from "@mui/icons-material/Share";
import FileDownload from "@mui/icons-material/FileDownload";
import FeedbackDialog from "./FeedbackDialog";
import { useUserStore } from "../../store/userStore";

// CSV utilities (adjust path)
import {
  isExportableData,
  downloadCsvFromData,
} from "../../utils/csvExport";

const POSITIVE_CATEGORIES = [
  { value: "Data Looks Correct", tooltip: "The data presented appears accurate and aligns with expected values" },
  { value: "No Missing Data", tooltip: "All relevant data points required for the request are present" },
  { value: "Answered The Question", tooltip: "The output aligns correctly with the request and intended analysis." },
  { value: "Accurate Calculations", tooltip: "The calculations (e.g., Forecast Accuracy, Bias, unit conversions) appear correct." },
  { value: "Performance", tooltip: "The response was timely, efficient, and processed without delays." },
  { value: "Others", tooltip: "Any additional positive feedback not covered by the listed categories." },
];

const NEGATIVE_CATEGORIES = [
  { value: "Incorrect Data", tooltip: "The data presented appears inaccurate or does not match expected values" },
  { value: "Missing Data", tooltip: "Some expected data points are absent or incomplete." },
  { value: "Unexpected Results", tooltip: "The output does not align with the request or intended analysis." },
  { value: "Incorrect Calculations", tooltip: "The calculations (e.g., Forecast Accuracy, Bias, unit conversions) appear incorrect." },
  { value: "Performance", tooltip: "The response was slow, delayed, or did not perform efficiently" },
  { value: "No Answer Found", tooltip: "No results were returned even after trying multiple versions of the prompt." },
  { value: "Others", tooltip: "Any additional issues not addressed by the listed categories." },
];

const MessageActions = ({
  dataTable,
  message,
  isBot,
  feedback,
  onFeedbackChange,
  onFeedbackSubmit,
  sessionId,
  messageId,
  tableRef,
  containerRef,
}) => {
  const theme = useTheme();
  const { user } = useUserStore();
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");
  // Feedback dialog state (bot only)
  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isShareSupported, setIsShareSupported] = useState(false);

  const safeMessage = typeof message === "string" ? message : String(message ?? "");

  useEffect(() => {
    // Run on client only to avoid SSR hydration mismatches
    try {
      const ua = typeof navigator !== "undefined" ? navigator.userAgent || "" : "";
      const isFirefox = /firefox/i.test(ua);
      const hasWebShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

      // Hide on Firefox even if navigator.share is polyfilled, to avoid UX traps.
      // If you want to allow Firefox for Android (which may support it in some versions),
      // you could narrow the check: const isFirefoxDesktop = isFirefox && !/android/i.test(ua);
      setIsShareSupported(hasWebShare && !isFirefox);
    } catch {
      setIsShareSupported(false);
    }
  }, []);

  const handleCopy = async () => {
    try {
      const parts = [];
      if (safeMessage.trim()) {
        parts.push(safeMessage.trim());
      }
      const textToCopy = parts.length > 0 ? parts.join("\n\n") : "";
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setSnackbarSeverity("success");
      setSnackbarMessage(isBot ? "Copied response!" : "Copied question!");
      setSnackbar(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to copy.");
      setSnackbar(true);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          text: safeMessage,
          title: "IntelliPlan Message",
        });
      } catch (err) {
        console.error("Share failed:", err);
      }
    }
  };

  // Download CSV (dynamic shapes supported)
  const handleDownloadCsv = () => {
    try {
      // Customize if needed (e.g., lock header order or filename)
      // const options = {
      //   filename: "forecast_export.csv",
      //   columns: ["SELLING_SKU", "FORECAST_MONTH", "CONSTRAINED_DP_DC_GSU_TOTAL_FORECAST"],
      //   newline: "\r\n", // CRLF for Excel
      //   flatten: true,    // keep true to handle nested objects if they appear
      //   decodeHtml: true, // decode entities like N&amp;#x2F;A → N/A
      // };
      const options = {};
      downloadCsvFromData(dataTable, options);
      setSnackbarSeverity("success");
      setSnackbarMessage("CSV download started.");
      setSnackbar(true);
    } catch (err) {
      console.error("CSV export failed:", err);
      setSnackbarSeverity("error");
      setSnackbarMessage(err?.message || "CSV export failed.");
      setSnackbar(true);
    }
  };

  const handleFeedbackClick = (type) => {
    setPendingType(type);
    setDialogOpen(true);
  };

  const handleDialogSubmit = async (formData) => {
    setIsSubmitting(true);

    const payload = {
      ...formData,
      user_email: user?.email,
      message: safeMessage,
      sessionId,
      messageId,
      id: messageId,
    };

    try {
      if (onFeedbackSubmit) {
        const result = await onFeedbackSubmit(payload);
        if (result && result.success === false) {
          throw new Error(result.error || "Failed to submit feedback");
        }
      } else {
        console.log("Feedback payload:", payload);
      }

      if (onFeedbackChange) {
        onFeedbackChange({
          score: parseInt(formData.score, 10),
          categoriesText: formData.categoriesText,
          comment: formData.comment,
          submittedAt: formData.requestTime,
        });
      }

      setSnackbarSeverity("success");
      setSnackbarMessage("Thanks! Your feedback was submitted successfully.");
      setSnackbar(true);

      setDialogOpen(false);
      setPendingType(null);
    } catch (error) {
      console.error("Failed to submit feedback:", error);

      setSnackbarSeverity("error");
      setSnackbarMessage(error?.message || "Unable to send feedback. Please try again.");
      setSnackbar(true);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = () => {
    setDialogOpen(false);
    setPendingType(null);
  };

  const getFeedbackTooltip = (type) => {
    if (!feedback) return type === "helpful" ? "Helpful" : "Not helpful";

    const isPositive = feedback.score === 1 || feedback.score === "1";
    const isHelpfulButton = type === "helpful";

    if ((isPositive && isHelpfulButton) || (!isPositive && !isHelpfulButton)) {
      const cats = feedback.categoriesText
        ? feedback.categoriesText
        : Array.isArray(feedback.categories)
          ? feedback.categories.join(", ")
          : "";

      const comment = feedback.comment ? ` - ${feedback.comment}` : "";
      return cats ? `Feedback: ${cats}${comment}` : `Feedback submitted${comment}`;
    }

    return "";
  };

  const categoriesForDialog =
    pendingType === "helpful" ? POSITIVE_CATEGORIES : pendingType === "unhelpful" ? NEGATIVE_CATEGORIES : [];

  return (
    <>
      {/* ACTION BAR */}
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
        {/* Copy */}
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
            aria-label="copy-message"
          >
            <ContentCopyIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>

        {/* Feedback buttons: BOT ONLY */}
        {isBot && (
          <>
            {/* Thumbs up */}
            {!feedback || feedback?.score === 1 || feedback?.score === "1" ? (
              <Tooltip title={getFeedbackTooltip("helpful")} placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleFeedbackClick("helpful")}
                    disabled={!!(feedback && (feedback.score === 0 || feedback.score === 1 || feedback.score === "0" || feedback.score === "1"))}
                    sx={{
                      width: 24,
                      height: 24,
                      color:
                        feedback?.score === 1 || feedback?.score === "1"
                          ? theme.palette.success.main
                          : theme.palette.text.secondary,
                      "&:hover": {
                        bgcolor: "transparent",
                        color: theme.palette.success.main,
                      },
                      "&.Mui-disabled": {
                        color:
                          feedback?.score === 1 || feedback?.score === "1"
                            ? theme.palette.success.main
                            : theme.palette.text.secondary,
                      },
                    }}
                    aria-label="thumbs-up"
                  >
                    <ThumbUpIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <span>
                <IconButton
                  size="small"
                  disabled
                  sx={{
                    width: 24,
                    height: 24,
                    color: theme.palette.text.secondary,
                    "&.Mui-disabled": {
                      color: theme.palette.text.secondary,
                    },
                  }}
                  aria-label="thumbs-up-disabled"
                >
                  <ThumbUpIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            )}

            {/* Thumbs down */}
            {!feedback || feedback?.score === 0 || feedback?.score === "0" ? (
              <Tooltip title={getFeedbackTooltip("unhelpful")} placement="top">
                <span>
                  <IconButton
                    size="small"
                    onClick={() => handleFeedbackClick("unhelpful")}
                    disabled={!!(feedback && (feedback.score === 0 || feedback.score === 1 || feedback.score === "0" || feedback.score === "1"))}
                    sx={{
                      width: 24,
                      height: 24,
                      color:
                        feedback?.score === 0 || feedback?.score === "0"
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
                      "&:hover": {
                        bgcolor: "transparent",
                        color: theme.palette.error.main,
                      },
                      "&.Mui-disabled": {
                        color:
                          feedback?.score === 0 || feedback?.score === "0"
                            ? theme.palette.error.main
                            : theme.palette.text.secondary,
                      },
                    }}
                    aria-label="thumbs-down"
                  >
                    <ThumbDownIcon sx={{ fontSize: 14 }} />
                  </IconButton>
                </span>
              </Tooltip>
            ) : (
              <span>
                <IconButton
                  size="small"
                  disabled
                  sx={{
                    width: 24,
                    height: 24,
                    color: theme.palette.text.secondary,
                    "&.Mui-disabled": {
                      color: theme.palette.text.secondary,
                    },
                  }}
                  aria-label="thumbs-down-disabled"
                >
                  <ThumbDownIcon sx={{ fontSize: 14 }} />
                </IconButton>
              </span>
            )}
          </>
        )}

        {/* Share */}
        {isShareSupported && <Tooltip title="Share" placement="top">
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
            aria-label="share"
          >
            <ShareIcon sx={{ fontSize: 14 }} />
          </IconButton>
        </Tooltip>}

        {/* Download CSV (dynamic) */}
        {isBot && isExportableData(dataTable) && (
          <Tooltip title="Download CSV" placement="top">
            <IconButton
              size="small"
              onClick={handleDownloadCsv}
              sx={{
                width: 24,
                height: 24,
                color: theme.palette.text.secondary,
                "&:hover": {
                  bgcolor: "rgba(34,197,94,0.10)",
                  color: theme.palette.success.main,
                },
              }}
              aria-label="download-csv"
            >
              <FileDownload sx={{ fontSize: 18 }} />
            </IconButton>
          </Tooltip>
        )}
      </Box>

      {/* Feedback dialog: BOT ONLY */}
      {isBot && (
        <FeedbackDialog
          open={dialogOpen}
          onClose={handleDialogClose}
          onSubmit={handleDialogSubmit}
          type={pendingType}
          categories={categoriesForDialog}
          isSubmitting={isSubmitting}
        />
      )}

      {/* Snackbar */}
      <Snackbar
        open={snackbar}
        autoHideDuration={snackbarSeverity === "error" ? 6000 : 3000}
        onClose={() => setSnackbar(false)}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbarSeverity}
          onClose={() => setSnackbar(false)}
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