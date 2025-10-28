import React from "react";
import { Box, Button, Chip, Popover, Typography, Divider } from "@mui/material";

const SimplifiedFilterPopover = ({
  anchorEl,
  open,
  onClose,
  businessUnits,
  businessUnitFilter,
  setBusinessUnitFilter,
  categories,
  subCategories,
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
  levelFilter,
}) => {
  // Convert to array format for consistency
  const selectedBusinessUnits = Array.isArray(businessUnitFilter)
    ? businessUnitFilter
    : businessUnitFilter
    ? [businessUnitFilter]
    : [];
  const selectedCategories = Array.isArray(categoryFilter) ? categoryFilter : [];
  const selectedSubCategories = Array.isArray(subCategoryFilter)
    ? subCategoryFilter
    : [];

  // Handle selection changes
  const handleBusinessUnitToggle = (value) => {
    const newSelected = selectedBusinessUnits.includes(value)
      ? selectedBusinessUnits.filter((item) => item !== value)
      : [...selectedBusinessUnits, value];
    setBusinessUnitFilter(newSelected);
  };

  const handleCategoryToggle = (value) => {
    const newSelected = selectedCategories.includes(value)
      ? selectedCategories.filter((item) => item !== value)
      : [...selectedCategories, value];
    setCategoryFilter(newSelected);
  };

  const handleSubCategoryToggle = (value) => {
    const newSelected = selectedSubCategories.includes(value)
      ? selectedSubCategories.filter((item) => item !== value)
      : [...selectedSubCategories, value];
    setSubCategoryFilter(newSelected);
  };

  // Clear all filters
  const handleClearAll = () => {
    setBusinessUnitFilter([]);
    setCategoryFilter([]);
    setSubCategoryFilter([]);
  };

  const FilterSection = ({ title, items, selectedItems, onToggle, onClear }) => (
    <Box sx={{ mb: 2 }}>
      <Typography
        variant="subtitle2"
        sx={{
          mb: 1,
          fontWeight: 600,
          fontSize: "0.85rem",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        {title}
        {selectedItems.length > 0 && (
          <Button
            size="small"
            onClick={onClear}
            sx={{
              p: 0,
              minWidth: "auto",
              fontSize: "0.75rem",
              color: "#6b7280",
            }}
          >
            Clear
          </Button>
        )}
      </Typography>
      <Box sx={{ maxHeight: 140, overflow: "auto" }}>
        {items.map((item) => (
          <Chip
            key={item}
            label={item}
            size="small"
            onClick={() => onToggle(item)}
            variant={selectedItems.includes(item) ? "filled" : "outlined"}
            color={selectedItems.includes(item) ? "primary" : "default"}
            sx={{
              m: 0.5,
              borderRadius: 1,
              height: 26,
              fontSize: "0.75rem",
            }}
          />
        ))}
      </Box>
    </Box>
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
          width: { xs: 300, sm: 480 },
          maxWidth: "95vw",
          maxHeight: "75vh",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "auto",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Filter Products
          </Typography>
          {(selectedBusinessUnits.length > 0 ||
            selectedCategories.length > 0 ||
            selectedSubCategories.length > 0) && (
            <Button
              size="small"
              onClick={handleClearAll}
              sx={{
                color: "#ef4444",
                fontSize: "0.75rem",
                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
              }}
            >
              Clear All
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Business Unit Filter */}
        <FilterSection
          title="Business Unit"
          items={businessUnits}
          selectedItems={selectedBusinessUnits}
          onToggle={handleBusinessUnitToggle}
          onClear={() => setBusinessUnitFilter([])}
        />

        {/* Category Filter */}
        {(levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY") && (
          <>
            <Divider sx={{ my: 2 }} />
            <FilterSection
              title="Categories"
              items={categories}
              selectedItems={selectedCategories}
              onToggle={handleCategoryToggle}
              onClear={() => setCategoryFilter([])}
            />
          </>
        )}

        {/* Sub Category Filter */}
        {levelFilter === "SUB_CATEGORY" && (
          <>
            <Divider sx={{ my: 2 }} />
            <FilterSection
              title="Sub Categories"
              items={subCategories}
              selectedItems={selectedSubCategories}
              onToggle={handleSubCategoryToggle}
              onClear={() => setSubCategoryFilter([])}
            />
          </>
        )}

        <Divider sx={{ my: 2 }} />
      </Box>
    </Popover>
  );
};

export default SimplifiedFilterPopover;
