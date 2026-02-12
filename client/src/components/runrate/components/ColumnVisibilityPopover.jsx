import React from "react";
import {
  Popover,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  Checkbox,
  ListItemText,
  Box,
  Chip,
} from "@mui/material";

const ColumnVisibilityPopover = ({
  open,
  anchorEl,
  onClose,
  columns,
  visibleColumns,
  onVisibilityChange,
  selectedLevels,
}) => {
  const ESSENTIAL_COLUMNS = [
    "REGION",
    "COUNTRY",
    "BUSINESS_UNIT",
    "CATEGORY",
    "SUB_CATEGORY",
  ];

  // Get level columns that are selected
  const levelColumns = ESSENTIAL_COLUMNS.filter((col) =>
    selectedLevels.includes(col),
  );

  const handleToggle = (columnId) => {
    const currentIndex = visibleColumns.indexOf(columnId);
    const newVisibleColumns = [...visibleColumns];

    if (currentIndex === -1) {
      newVisibleColumns.push(columnId);
    } else {
      newVisibleColumns.splice(currentIndex, 1);
    }

    onVisibilityChange(newVisibleColumns);
  };

  // Filter columns: only show level columns that are selected + all metric columns
  const displayColumns = columns.filter(
    (col) => selectedLevels.includes(col.id) || !ESSENTIAL_COLUMNS.includes(col.id),
  );

  return (
    <Popover
      open={open}
      anchorEl={anchorEl}
      onClose={onClose}
      anchorOrigin={{
        vertical: "bottom",
        horizontal: "left",
      }}
      transformOrigin={{
        vertical: "top",
        horizontal: "left",
      }}
      PaperProps={{
        sx: {
          p: 2,
          width: 400,
          maxHeight: 400,
          borderRadius: 2,
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Show/Hide Columns
      </Typography>
      <Typography variant="caption" sx={{ color: "#666", display: "block", mb: 1 }}>
        Showing {displayColumns.length} available columns
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List dense sx={{ py: 0 }}>
        {displayColumns.map((column) => (
          <ListItem key={column.id} disablePadding>
            <ListItemButton
              onClick={() => handleToggle(column.id)}
              dense
              sx={{ py: 0.5 }}
            >
              <Checkbox
                edge="start"
                checked={visibleColumns.indexOf(column.id) !== -1}
                tabIndex={-1}
                disableRipple
                sx={{ py: 0.5 }}
              />
              <ListItemText
                primary={
                  <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    <Typography variant="body2" sx={{ fontSize: "0.675rem" }}>
                      {column.label}
                    </Typography>
                    {levelColumns.includes(column.id) && (
                      <Chip
                        label="Level"
                        size="small"
                        sx={{
                          height: 18,
                          fontSize: "0.6rem",
                          backgroundColor: "#dbeafe",
                          color: "#1e40af",
                          fontWeight: 600,
                        }}
                      />
                    )}
                  </Box>
                }
              />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
    </Popover>
  );
};

export default ColumnVisibilityPopover;
