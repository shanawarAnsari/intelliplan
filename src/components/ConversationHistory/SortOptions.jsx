/**
 * Sort Options Component for conversation list
 */
import React from "react";
import { Box, Typography, Chip, useTheme } from "@mui/material";
import { SORT_OPTIONS } from "../../utils/constants";

const SortOptions = ({ sortBy, onSortChange }) => {
  const theme = useTheme();

  return (
    <Box sx={{ px: 2, pt: 1.5, pb: 1 }}>
      <Typography
        variant="caption"
        sx={{
          display: "block",
          mb: 1,
          color: theme.palette.text.secondary,
          fontSize: "0.7rem",
          fontWeight: 600,
          textTransform: "uppercase",
          letterSpacing: "0.5px",
        }}
      >
        Sort by
      </Typography>
      <Box sx={{ display: "flex", gap: 0.5 }}>
        <Chip
          label="Recent"
          size="small"
          onClick={() => onSortChange(SORT_OPTIONS.RECENT)}
          variant={sortBy === SORT_OPTIONS.RECENT ? "filled" : "outlined"}
          sx={{
            height: "24px",
            fontSize: "0.7rem",
            bgcolor:
              sortBy === SORT_OPTIONS.RECENT
                ? theme.palette.primary.main
                : "transparent",
            color:
              sortBy === SORT_OPTIONS.RECENT
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary,
          }}
        />
        <Chip
          label="A-Z"
          size="small"
          onClick={() => onSortChange(SORT_OPTIONS.ALPHABETICAL)}
          variant={sortBy === SORT_OPTIONS.ALPHABETICAL ? "filled" : "outlined"}
          sx={{
            height: "24px",
            fontSize: "0.7rem",
            bgcolor:
              sortBy === SORT_OPTIONS.ALPHABETICAL
                ? theme.palette.primary.main
                : "transparent",
            color:
              sortBy === SORT_OPTIONS.ALPHABETICAL
                ? theme.palette.primary.contrastText
                : theme.palette.text.secondary,
          }}
        />
      </Box>
    </Box>
  );
};

export default SortOptions;
