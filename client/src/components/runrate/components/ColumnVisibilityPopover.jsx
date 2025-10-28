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
} from "@mui/material";

const ColumnVisibilityPopover = ({
  open,
  anchorEl,
  onClose,
  columns,
  visibleColumns,
  onVisibilityChange,
}) => {
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
          width: 300,
          maxHeight: 400,
          borderRadius: 2,
        },
      }}
    >
      <Typography variant="subtitle1" sx={{ mb: 1, fontWeight: 600 }}>
        Show/Hide Columns
      </Typography>
      <Divider sx={{ mb: 1 }} />
      <List dense sx={{ py: 0 }}>
        {columns.map((column) => (
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
                  <Typography variant="body2" sx={{ fontSize: "0.875rem" }}>
                    {column.label}
                  </Typography>
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
