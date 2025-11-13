import React from "react";
import { Button, Badge } from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import { ViewColumn } from "@mui/icons-material";

export const CombinedFilterButton = ({ selectedCount, hasSelection, onClick }) => (
  <Badge
    badgeContent={selectedCount > 0 ? selectedCount : null}
    color="primary"
    sx={{
      "& .MuiBadge-badge": {
        fontSize: "0.7rem",
        height: 18,
        minWidth: 18,
      },
    }}
  >
    <Button
      variant={hasSelection ? "contained" : "outlined"}
      size="small"
      onClick={onClick}
      startIcon={<TuneIcon sx={{ fontSize: "1.1rem" }} />}
      sx={{
        borderRadius: 1.5,
        textTransform: "none",
        minWidth: 90,
        height: "32px",
        fontSize: "0.8rem",
        px: 2,
        backgroundColor: hasSelection ? "#3b82f6" : "transparent",
        borderColor: hasSelection ? "#3b82f6" : "#d1d5db",
        color: "white",
      }}
    >
      Filter
    </Button>
  </Badge>
);

export const CombinedColumnsButton = ({
  selectedColumns,
  totalColumns,
  onClick,
}) => {
  const hiddenCount = totalColumns - selectedColumns.length;

  return (
    <Badge
      badgeContent={hiddenCount > 0 ? hiddenCount : null}
      color="primary"
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.7rem",
          height: 18,
          minWidth: 18,
        },
      }}
    >
      <Button
        variant={hiddenCount > 0 ? "contained" : "outlined"}
        size="small"
        onClick={onClick}
        startIcon={<ViewColumn sx={{ fontSize: "1.1rem" }} />}
        sx={{
          borderRadius: 1.5,
          textTransform: "none",
          minWidth: 95,
          height: "32px",
          fontSize: "0.8rem",
          px: 2,
          backgroundColor: hiddenCount > 0 ? "#3b82f6" : "transparent",
          borderColor: hiddenCount > 0 ? "#3b82f6" : "#d1d5db",
          color: "white",
        }}
      >
        Columns
      </Button>
    </Badge>
  );
};
