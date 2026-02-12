import React from "react";
import { Box, Button, Chip, Popover, Typography, Divider } from "@mui/material";

const SimplifiedFilterPopover = ({
  anchorEl,
  open,
  onClose,
  regions,
  regionFilter,
  setRegionFilter,
  countries,
  countryFilter,
  setCountryFilter,
  businessUnits,
  businessUnitFilter,
  setBusinessUnitFilter,
  categories,
  subCategories,
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
  selectedLevels,
}) => {
  const selectedRegions = Array.isArray(regionFilter) ? regionFilter : [];
  const selectedCountries = Array.isArray(countryFilter) ? countryFilter : [];
  const selectedBusinessUnits = Array.isArray(businessUnitFilter)
    ? businessUnitFilter
    : [];
  const selectedCategories = Array.isArray(categoryFilter) ? categoryFilter : [];
  const selectedSubCategories = Array.isArray(subCategoryFilter)
    ? subCategoryFilter
    : [];

  const handleClearAll = () => {
    setRegionFilter([]);
    setCountryFilter([]);
    setBusinessUnitFilter([]);
    setCategoryFilter([]);
    setSubCategoryFilter([]);
  };

  const totalSelectedFilters =
    selectedRegions.length +
    selectedCountries.length +
    selectedBusinessUnits.length +
    selectedCategories.length +
    selectedSubCategories.length;

  const FilterSection = ({
    title,
    items,
    selectedItems,
    onToggle,
    onClear,
    showSection,
  }) => {
    if (!showSection) return null;

    return (
      <>
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
        <Divider sx={{ my: 2 }} />
      </>
    );
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
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 2,
          }}
        >
          <Typography variant="h6" sx={{ fontSize: "0.95rem", fontWeight: 600 }}>
            Filter Products
          </Typography>
          {totalSelectedFilters > 0 && (
            <Button
              size="small"
              onClick={handleClearAll}
              sx={{
                p: 0,
                minWidth: "auto",
                fontSize: "0.75rem",
                color: "#ef4444",
                fontWeight: 600,
                "&:hover": {
                  backgroundColor: "rgba(239, 68, 68, 0.08)",
                },
              }}
            >
              Clear All
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Region Filter */}
        <FilterSection
          showSection={selectedLevels.includes("REGION")}
          title="Region"
          items={regions || []}
          selectedItems={selectedRegions}
          onToggle={(item) => {
            const newSelected = selectedRegions.includes(item)
              ? selectedRegions.filter((i) => i !== item)
              : [...selectedRegions, item];
            setRegionFilter(newSelected);
          }}
          onClear={() => setRegionFilter([])}
        />

        {/* Country Filter */}
        <FilterSection
          showSection={selectedLevels.includes("COUNTRY")}
          title="Country"
          items={countries || []}
          selectedItems={selectedCountries}
          onToggle={(item) => {
            const newSelected = selectedCountries.includes(item)
              ? selectedCountries.filter((i) => i !== item)
              : [...selectedCountries, item];
            setCountryFilter(newSelected);
          }}
          onClear={() => setCountryFilter([])}
        />

        {/* Business Unit Filter */}
        <FilterSection
          showSection={selectedLevels.includes("BUSINESS_UNIT")}
          title="Business Unit"
          items={businessUnits || []}
          selectedItems={selectedBusinessUnits}
          onToggle={(item) => {
            const newSelected = selectedBusinessUnits.includes(item)
              ? selectedBusinessUnits.filter((i) => i !== item)
              : [...selectedBusinessUnits, item];
            setBusinessUnitFilter(newSelected);
          }}
          onClear={() => setBusinessUnitFilter([])}
        />

        {/* Category Filter */}
        <FilterSection
          showSection={selectedLevels.includes("CATEGORY")}
          title="Category"
          items={categories || []}
          selectedItems={selectedCategories}
          onToggle={(item) => {
            const newSelected = selectedCategories.includes(item)
              ? selectedCategories.filter((i) => i !== item)
              : [...selectedCategories, item];
            setCategoryFilter(newSelected);
          }}
          onClear={() => setCategoryFilter([])}
        />

        {/* Sub Category Filter */}
        <FilterSection
          showSection={selectedLevels.includes("SUB_CATEGORY")}
          title="Sub Category"
          items={subCategories || []}
          selectedItems={selectedSubCategories}
          onToggle={(item) => {
            const newSelected = selectedSubCategories.includes(item)
              ? selectedSubCategories.filter((i) => i !== item)
              : [...selectedSubCategories, item];
            setSubCategoryFilter(newSelected);
          }}
          onClear={() => setSubCategoryFilter([])}
        />
      </Box>
    </Popover>
  );
};

export default SimplifiedFilterPopover;
