import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Snackbar,
  Alert,
  useTheme,
} from "@mui/material";
import ContentCopyIcon from "@mui/icons-material/ContentCopy";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbDownIcon from "@mui/icons-material/ThumbDown";
import ShareIcon from "@mui/icons-material/Share";
import FeedbackDialog from "./FeedbackDialog";

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

/**
 * Optional props for table copy:
 * - tableRef: a React ref to the <table> element you want to copy
 * - containerRef: a React ref to a container; the first <table> within will be copied
 */
const MessageActions = ({
  message,
  dataTable,
  isBot,
  feedback, // { score, categories:[], categoriesText:"a, b", comment, submittedAt } or null
  onFeedbackChange,
  onFeedbackSubmit,
  sessionId,
  messageId,
  tableRef, // optional: React ref to a <table>
  containerRef, // optional: React ref to a container that has a <table> inside
}) => {
  const theme = useTheme();
  const [copied, setCopied] = useState(false);
  const [snackbar, setSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [dialogOpen, setDialogOpen] = useState(false);
  const [pendingType, setPendingType] = useState(null);

  // --- helpers for table copy ---
  const findTableElement = () => {
    if (tableRef && tableRef.current) return tableRef.current;
    if (containerRef && containerRef.current) {
      return containerRef.current.querySelector("table");
    }
    return null;
  };

  const tableToTSV = (tableEl) => {
    const rows = Array.from(tableEl.querySelectorAll("tr"));
    return rows
      .map((tr) => {
        const cells = Array.from(tr.cells || []);
        return cells
          .map((cell) =>
            (cell.innerText || "")
              .replace(/\t/g, " ")
              .replace(/\r?\n|\r/g, " ")
              .trim(),
          )
          .join("\t");
      })
      .join("\n");
  };

  const copyTableIfAvailable = async () => {
    const tableEl = findTableElement();
    if (!tableEl) return false;

    const html = tableEl.outerHTML;
    const tsv = tableToTSV(tableEl);

    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const item = new ClipboardItem({
          "text/html": new Blob([html], { type: "text/html" }),
          "text/plain": new Blob([tsv], { type: "text/plain" }),
        });
        await navigator.clipboard.write([item]);
      } else if (navigator.clipboard?.writeText) {
        // Fallback: at least copy TSV (works great for Excel/Sheets)
        await navigator.clipboard.writeText(tsv);
      } else {
        return false; // will fallback outside
      }
      return true;
    } catch (err) {
      console.error("Table copy failed, falling back to message text:", err);
      return false;
    }
  };

  // --- original handlers with enhancements ---
  const handleCopy = async () => {
    try {
      const tableCopied = await copyTableIfAvailable();
      if (!tableCopied) {
        // fallback to message string
        if (navigator.clipboard?.writeText) {
          await navigator.clipboard.writeText(
            typeof message === "string" ? message : String(message),
          );
        } else {
          // very old fallback (execCommand) omitted intentionally to keep component clean
          throw new Error("Clipboard API not supported");
        }
      }

      setCopied(true);
      setSnackbarSeverity("success");
      setSnackbarMessage(tableCopied ? "Table copied to clipboard!" : "Copied to clipboard!");
      setSnackbar(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      console.error("Copy failed:", error);
      setSnackbarSeverity("error");
      setSnackbarMessage("Failed to copy to clipboard.");
      setSnackbar(true);
    }
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
    // formData includes categories[] and categoriesText (comma-separated)
    const payload = {
      ...formData,
      message,
      sessionId,
      messageId,
    };

    // Store full object so tooltip shows the categories later
    if (onFeedbackChange) {
      onFeedbackChange({
        score: formData.score,
        categories: formData.categories,
        categoriesText: formData.categoriesText,
        comment: formData.comment,
        submittedAt: formData.submittedAt,
      });
    }

    // --- requested try/catch with snackbarSeverity ---
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
        error?.message || "Failed to submit feedback. Please try again.",
      );
      setSnackbar(true);
    }

    handleDialogClose();
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({ text: message, title: "IntelliPlan Message" });
      } catch (err) {
        console.error("Share failed:", err);
      }
    } else {
      handleCopy();
    }
  };

  const getFeedbackTooltip = (type) => {
    if (!feedback) return type === "helpful" ? "Helpful" : "Not helpful";

    const isPositive = feedback.score === 1;
    const isHelpfulButton = type === "helpful";
    const matches =
      (isPositive && isHelpfulButton) || (!isPositive && !isHelpfulButton);

    if (!matches) return type === "helpful" ? "Helpful" : "Not helpful";

    const cats = feedback.categoriesText
      ? feedback.categoriesText
      : Array.isArray(feedback.categories)
        ? feedback.categories.join(", ")
        : "";

    const comment = feedback.comment ? ` - ${feedback.comment}` : "";
    return cats ? `Feedback: ${cats}${comment}` : `Feedback submitted${comment}`;
  };

  const categoriesForDialog =
    pendingType === "helpful"
      ? POSITIVE_CATEGORIES
      : pendingType === "unhelpful"
        ? NEGATIVE_CATEGORIES
        : [];

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
                  disabled={feedback !== null}
                  sx={{
                    width: 24,
                    height: 24,
                    color:
                      feedback?.score === 1
                        ? theme.palette.success.main
                        : theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor: "transparent",
                      color: theme.palette.success.main,
                    },
                    "&.Mui-disabled": {
                      color:
                        feedback?.score === 1
                          ? theme.palette.success.main
                          : theme.palette.text.secondary,
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
                  disabled={feedback !== null}
                  sx={{
                    width: 24,
                    height: 24,
                    color:
                      feedback?.score === 0
                        ? theme.palette.error.main
                        : theme.palette.text.secondary,
                    "&:hover": {
                      bgcolor: "transparent",
                      color: theme.palette.error.main,
                    },
                    "&.Mui-disabled": {
                      color:
                        feedback?.score === 0
                          ? theme.palette.error.main
                          : theme.palette.text.secondary,
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
        categories={categoriesForDialog}
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