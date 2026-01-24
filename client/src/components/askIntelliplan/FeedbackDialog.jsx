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
  useTheme,
} from "@mui/material";

const FeedbackDialog = ({
  open,
  onClose,
  onSubmit,
  type, // "helpful" | "unhelpful"
  categories = [],
}) => {
  const theme = useTheme();

  const score = useMemo(() => (type === "helpful" ? 1 : 0), [type]);

  const [category, setCategory] = useState("");
  const [comment, setComment] = useState("");

  useEffect(() => {
    if (open) {
      setCategory("");
      setComment("");
    }
  }, [open, type]);

  const titleText =
    type === "helpful" ? "Thanks! What worked well?" : "Sorry! What went wrong?";
  const chipLabel = type === "helpful" ? "Helpful (1)" : "Not helpful (0)";
  const chipColor = type === "helpful" ? "success" : "error";

  const handleSubmit = () => {
    const payload = {
      type, // "helpful" | "unhelpful"
      score, // 1 | 0
      category, // selected category
      comment, // free text
      submittedAt: new Date().toISOString(),
    };

    onSubmit(payload);
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: {
          background: "rgba(17, 24, 39, 0.9)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.08)",
          borderRadius: 3,
          color: theme.palette.text.primary,
        },
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        <Box
          display="flex"
          alignItems="center"
          justifyContent="space-between"
          gap={2}
        >
          <Typography variant="h6" sx={{ fontWeight: 700 }}>
            Feedback
          </Typography>
          <Chip label={chipLabel} color={chipColor} size="small" />
        </Box>
        <Typography
          variant="body2"
          sx={{ mt: 0.5, color: theme.palette.text.secondary }}
        >
          {titleText}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ p: 2 }}>
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <FormControl fullWidth size="small" sx={{ mt: 2 }}>
            <InputLabel id="feedback-category-label">Category</InputLabel>
            <Select
              labelId="feedback-category-label"
              value={category}
              label="Category"
              onChange={(e) => setCategory(e.target.value)}
              sx={{
                "& .MuiOutlinedInput-notchedOutline": {
                  borderColor: "rgba(255,255,255,0.16)",
                },
              }}
            >
              {categories.map((c) => (
                <MenuItem key={c} value={c}>
                  {c}
                </MenuItem>
              ))}
            </Select>
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
          disabled={!category}
          sx={{
            background:
              type === "helpful" ? "rgba(16,185,129,0.85)" : "rgba(239,68,68,0.85)",
            "&:hover": {
              background:
                type === "helpful" ? "rgba(16,185,129,1)" : "rgba(239,68,68,1)",
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
