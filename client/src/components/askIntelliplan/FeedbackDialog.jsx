
import React, { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  Chip,
  Tooltip,
  useTheme,
  Checkbox,
  ListItemText
} from "@mui/material";

const FeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  type, // "helpful" | "unhelpful"
  categories = [], // [{ value, tooltip }]
}) => {
  const theme = useTheme();

  const score = useMemo(() => {
    if (type === "helpful") return 1;
    if (type === "unhelpful") return 0;
    return null;
  }, [type]);

  const [selectedCategories, setSelectedCategories] = useState([]);
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setSelectedCategories([]);
      setComment("");
    }
  }, [open, type]);

  const tooltipByValue = useMemo(() => {
    const map = {};
    categories.forEach((c) => (map[c.value] = c.tooltip));
    return map;
  }, [categories]);

  const titleText =
    type === "helpful"
      ? "Thanks! What worked well?"
      : "Sorry! What went wrong?";

  const chipLabel =
    type === "helpful"
      ? "Helpful (1)"
      : type === "unhelpful"
        ? "Not helpful (0)"
        : "Feedback";

  const chipColor =
    type === "helpful" ? "success" : type === "unhelpful" ? "error" : "default";

  const handleSubmit = () => {
    const categoriesText = selectedCategories.join(", "); // ✅ comma-separated

    const payload = {
      type,
      score: score.toString(),
      // categories: selectedCategories,     // ✅ array
      categoriesText,                    // ✅ comma-separated string
      comment,
      requestTime: (new Date().getTime()).toString(),
    };

    onSubmit(payload);
  };

  const isSubmitDisabled = selectedCategories.length === 0;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 2,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box display="flex" alignItems="center" justifyContent="space-between" gap={2}>
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Feedback
          </Typography>
          <Chip label={chipLabel} color={chipColor} size="small" />
        </Box>

        <Typography variant="body2" sx={{ mt: 0.5, color: theme.palette.text.secondary }}>
          {titleText}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel id="feedback-category-label">Category</InputLabel>


            <Select
              labelId="feedback-category-label"
              multiple
              value={selectedCategories}
              label="Category"
              onChange={(e) => setSelectedCategories(e.target.value)}
              renderValue={(selected) => selected.join(", ")} // ✅ simple + reliable
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c.value} value={c.value}>
                  <Checkbox checked={selectedCategories.includes(c.value)} />

                  {/* Tooltip INSIDE MenuItem */}
                  <Tooltip title={c.tooltip} placement="right" arrow>
                    <ListItemText primary={c.value} />
                  </Tooltip>
                </MenuItem>
              ))}
            </Select>


            <Typography variant="caption" sx={{ mt: 0.5, color: theme.palette.text.secondary }}>
              Select one or more categories.
            </Typography>
          </FormControl>

          <TextField
            label="Comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            multiline
            minRows={3}
            placeholder="Tell us more so we can improve..."
            fullWidth
            size="small"
            sx={{
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: "rgba(255,255,255,0.16)",
              },
            }}
          />
        </Box>
      </DialogContent>

      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          variant="outlined"
          sx={{
            borderColor: "rgba(255,255,255,0.18)",
            color: theme.palette.text.primary,
            "&:hover": { borderColor: "rgba(255,255,255,0.28)" },
          }}
        >
          Cancel
        </Button>

        <Button
          onClick={handleSubmit}
          variant="contained"
          disabled={isSubmitDisabled}
          sx={{
            background:
              type === "helpful"
                ? "rgba(16,185,129,0.85)"
                : "rgba(239,68,68,0.85)",
            "&:hover": {
              background:
                type === "helpful"
                  ? "rgba(16,185,129,1)"
                  : "rgba(239,68,68,1)",
            },
          }}
        >
          Submit
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default FeedbackDialog;
