import React, { useState } from "react";
import {
  Checkbox,
  Chip,
  Box,
  Button,
  Popover,
  IconButton,
  Typography,
  Divider,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import VisibilityIcon from "@mui/icons-material/Visibility";
import VisibilityOffIcon from "@mui/icons-material/VisibilityOff";
import SelectAllIcon from "@mui/icons-material/SelectAll";
import ClearIcon from "@mui/icons-material/Clear";

const ColumnVisibilityControl = ({
  columns,
  visibleColumns,
  onVisibilityChange,
}) => {
  const [anchorEl, setAnchorEl] = useState(null);
  const open = Boolean(anchorEl);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleToggleColumn = (columnId) => {
    const newVisibleColumns = visibleColumns.includes(columnId)
      ? visibleColumns.filter((id) => id !== columnId)
      : [...visibleColumns, columnId];
    onVisibilityChange(newVisibleColumns);
  };

  const handleSelectAll = () => {
    const allColumnIds = columns.map((col) => col.id);
    onVisibilityChange(allColumnIds);
  };

  const handleDeselectAll = () => {
    // Keep the first 3 columns (Country, Category, Sub Category) always visible
    const essentialColumns = columns.slice(0, 3).map((col) => col.id);
    onVisibilityChange(essentialColumns);
  };

  const getColumnGroups = () => {
    return [
      {
        name: "Basic Information",
        columns: columns.filter((col) =>
          ["COUNTRY", "CATEGORY", "SUB_CATEGORY"].includes(col.id)
        ),
      },
      {
        name: "Forecast & Actuals",
        columns: columns.filter((col) =>
          [
            "TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH",
            "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS",
            "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS",
            "TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH",
          ].includes(col.id)
        ),
      },
      {
        name: "Calculated Fields",
        columns: columns.filter((col) =>
          [
            "SHIPMENTS_REMAINING_DAYS",
            "RUN_RATE_FORECAST",
            "RUN_RATE_VS_FORECAST_MO",
          ].includes(col.id)
        ),
      },
      {
        name: "User Inputs & Results",
        columns: columns.filter((col) =>
          [
            "LOW_SIDE_PERCENT",
            "HIGH_SIDE_PERCENT",
            "LOW_SIDE_GS",
            "HIGH_SIDE_GS",
          ].includes(col.id)
        ),
      },
    ].filter((group) => group.columns.length > 0);
  };

  const hiddenCount = columns.length - visibleColumns.length;

  return (
    <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
      <Button
        variant="outlined"
        size="small"
        startIcon={<ViewColumnIcon />}
        onClick={handleClick}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          color: "#ffffff",
          borderColor: "#d1d5db",
          backgroundColor: "#6b7280",
          fontWeight: 500,
          "&:hover": {
            borderColor: "#9ca3af",
            backgroundColor: "#374151",
            transform: "translateY(-1px)",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
          },
          transition: "all 0.2s ease",
        }}
      >
        Columns
        {hiddenCount > 0 && (
          <Chip
            label={hiddenCount}
            size="small"
            sx={{
              ml: 1,
              height: 18,
              fontSize: "0.7rem",
              backgroundColor: "#fbbf24",
              color: "#ffffff",
              fontWeight: 600,
            }}
          />
        )}
      </Button>

      <Popover
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
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
            width: 350,
            maxHeight: 500,
            borderRadius: 2,
            boxShadow:
              "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
            border: "1px solid #e2e8f0",
          },
        }}
      >
        {/* Header */}
        <Box sx={{ p: 2, borderBottom: "1px solid #e2e8f0" }}>
          <Box
            sx={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              mb: 1,
            }}
          >
            <Typography
              variant="h6"
              sx={{ fontSize: "0.95rem", fontWeight: 600, color: "#ffffff" }}
            >
              Column Visibility
            </Typography>
            <Box sx={{ display: "flex", gap: 0.5 }}>
              <IconButton
                size="small"
                onClick={handleSelectAll}
                title="Show All"
                sx={{
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <SelectAllIcon fontSize="small" />
              </IconButton>
              <IconButton
                size="small"
                onClick={handleDeselectAll}
                title="Hide All (except required)"
                sx={{
                  color: "#ffffff",
                  "&:hover": {
                    backgroundColor: "rgba(255, 255, 255, 0.1)",
                    transform: "scale(1.05)",
                  },
                  transition: "all 0.2s ease",
                }}
              >
                <ClearIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
          <Typography variant="body2" sx={{ color: "#e5e7eb", fontSize: "0.8rem" }}>
            {visibleColumns.length} of {columns.length} columns visible
          </Typography>
        </Box>

        {/* Content */}
        <Box sx={{ maxHeight: 350, overflowY: "auto" }}>
          {getColumnGroups().map((group, groupIndex) => (
            <Box key={group.name}>
              {/* Group Header */}
              <Box
                sx={{
                  px: 2,
                  py: 1,
                  backgroundColor: "#4b5563",
                  borderBottom: "1px solid #6b7280",
                }}
              >
                <Typography
                  variant="subtitle2"
                  sx={{
                    fontSize: "0.8rem",
                    fontWeight: 600,
                    color: "#ffffff",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  {group.name}
                  <Chip
                    label={`${
                      group.columns.filter((col) => visibleColumns.includes(col.id))
                        .length
                    }/${group.columns.length}`}
                    size="small"
                    sx={{
                      ml: 1,
                      height: 16,
                      fontSize: "0.65rem",
                      backgroundColor: "#6b7280",
                      color: "#ffffff",
                    }}
                  />
                </Typography>
              </Box>

              {/* Group Items */}
              <List dense sx={{ py: 0, backgroundColor: "#374151" }}>
                {group.columns.map((column) => {
                  const isVisible = visibleColumns.includes(column.id);
                  const isEssential = [
                    "COUNTRY",
                    "CATEGORY",
                    "SUB_CATEGORY",
                  ].includes(column.id);

                  return (
                    <ListItem key={column.id} disablePadding>
                      <ListItemButton
                        onClick={() => !isEssential && handleToggleColumn(column.id)}
                        disabled={isEssential}
                        sx={{
                          py: 0.5,
                          px: 2,
                          "&:hover": !isEssential ? {
                            backgroundColor: "rgba(255, 255, 255, 0.05)",
                            transform: "translateX(2px)",
                          } : {},
                          "&.Mui-disabled": {
                            opacity: 0.6,
                          },
                          transition: "all 0.2s ease",
                        }}
                      >
                        <ListItemIcon sx={{ minWidth: 36 }}>
                          <Checkbox
                            checked={isVisible}
                            disabled={isEssential}
                            size="small"
                            sx={{
                              color: "#9ca3af",
                              "&.Mui-checked": {
                                color: "#10b981",
                              },
                              "&.Mui-disabled": {
                                color: "#6b7280",
                              },
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={
                            <Box
                              sx={{ display: "flex", alignItems: "center", gap: 1 }}
                            >
                              {isVisible ? (
                                <VisibilityIcon
                                  sx={{ fontSize: 14, color: "#10b981" }}
                                />
                              ) : (
                                <VisibilityOffIcon
                                  sx={{ fontSize: 14, color: "#ef4444" }}
                                />
                              )}
                              <Typography
                                variant="body2"
                                sx={{
                                  fontSize: "0.8rem",
                                  color: "#ffffff",
                                  fontWeight: isVisible ? 500 : 400,
                                  opacity: isVisible ? 1 : 0.7,
                                }}
                              >
                                {column.label}
                              </Typography>
                              {isEssential && (
                                <Chip
                                  label="Required"
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: "0.6rem",
                                    backgroundColor: "#3b82f6",
                                    color: "#ffffff",
                                  }}
                                />
                              )}
                            </Box>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  );
                })}
              </List>

              {groupIndex < getColumnGroups().length - 1 && <Divider sx={{ borderColor: "#6b7280" }} />}
            </Box>
          ))}
        </Box>

        {/* Footer */}
        <Box sx={{ p: 2, borderTop: "1px solid #6b7280", backgroundColor: "#4b5563" }}>
          <Button
            fullWidth
            variant="outlined"
            size="small"
            onClick={handleClose}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              color: "#ffffff",
              borderColor: "#9ca3af",
              "&:hover": {
                borderColor: "#d1d5db",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                transform: "translateY(-1px)",
              },
              transition: "all 0.2s ease",
            }}
          >
            Close
          </Button>
        </Box>
      </Popover>
    </Box>
  );
};

export default ColumnVisibilityControl;
