import React, { useState } from "react";
import { Box, TextField, Button, InputAdornment } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";

import SimplifiedFilterPopover from "./components/SimplifiedFilterPopover";
import {
  CombinedFilterButton,
  CombinedColumnsButton,
} from "./components/FilterButtons";
import ColumnVisibilityPopover from "./components/ColumnVisibilityPopover";
import FilterControls from "./components/FilterControls";
import ActiveFiltersChips from "./components/ActiveFiltersChips";

const FilterSection = ({
  search,
  setSearch,
  countryFilter,
  setCountryFilter,
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
  countries,
  categories,
  subCategories,
  hasActiveFilters,
  clearFilters,
  onExport,
  columns,
  visibleColumns,
  onVisibilityChange,
  runRateOption,
  setRunRateOption,
  levelFilter,
  setLevelFilter,
  businessUnits,
  businessUnitFilter,
  setBusinessUnitFilter,
}) => {
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);
  const [columnsAnchorEl, setColumnsAnchorEl] = useState(null);

  // Calculate total selected filters
  const selectedBusinessUnitsCount = Array.isArray(businessUnitFilter)
    ? businessUnitFilter.length
    : businessUnitFilter
    ? 1
    : 0;

  const totalSelectedFilters =
    selectedBusinessUnitsCount +
    (levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY"
      ? Array.isArray(categoryFilter)
        ? categoryFilter.length
        : 0
      : 0) +
    (levelFilter === "SUB_CATEGORY"
      ? Array.isArray(subCategoryFilter)
        ? subCategoryFilter.length
        : 0
      : 0);

  // Handle level filter change
  const handleLevelFilterChange = (e) => {
    const newLevel = e.target.value;
    setLevelFilter(newLevel);

    if (newLevel === "BUSINESS_UNIT") {
      setCategoryFilter([]);
      setSubCategoryFilter([]);
    } else if (newLevel === "CATEGORY") {
      setSubCategoryFilter([]);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 1.5 }}>
      {/* Top row - Search and Controls */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { md: "center" },
          gap: 1.5,
        }}
      >
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            minWidth: { xs: "100%", md: 280 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 1.5,
              borderColor: "#fff",
              fontSize: "0.85rem",
              height: "36px",
            },
            "& .MuiInputLabel-root": {
              fontSize: "0.85rem",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: "#6b7280", fontSize: "1.2rem" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <FilterControls
            countries={countries}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            runRateOption={runRateOption}
            setRunRateOption={setRunRateOption}
            onLevelChange={handleLevelFilterChange}
          />

          {/* Filter Button */}
          <CombinedFilterButton
            selectedCount={totalSelectedFilters}
            hasSelection={totalSelectedFilters > 0}
            onClick={(e) => setFiltersAnchorEl(e.currentTarget)}
          />

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon sx={{ fontSize: "1.1rem" }} />}
              onClick={clearFilters}
              sx={{
                borderRadius: 1.5,
                textTransform: "none",
                color: "#6b7280",
                borderColor: "#d1d5db",
                fontSize: "0.8rem",
                height: "36px",
                px: 2,
              }}
            >
              Clear
            </Button>
          )}

          {/* Column Visibility Button */}
          <CombinedColumnsButton
            selectedColumns={visibleColumns}
            totalColumns={columns.length}
            onClick={(e) => setColumnsAnchorEl(e.currentTarget)}
          />

          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<DownloadIcon sx={{ fontSize: "1.1rem" }} />}
            onClick={onExport}
            sx={{
              borderRadius: 1.5,
              textTransform: "none",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.5)",
              fontSize: "0.8rem",
              height: "32px",
              px: 2,
              "&:hover": {
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.5)",
              },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Popovers */}
      <SimplifiedFilterPopover
        anchorEl={filtersAnchorEl}
        open={Boolean(filtersAnchorEl)}
        onClose={() => setFiltersAnchorEl(null)}
        businessUnits={businessUnits}
        businessUnitFilter={businessUnitFilter}
        setBusinessUnitFilter={setBusinessUnitFilter}
        categories={categories}
        subCategories={subCategories}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        subCategoryFilter={subCategoryFilter}
        setSubCategoryFilter={setSubCategoryFilter}
        levelFilter={levelFilter}
      />

      <ColumnVisibilityPopover
        open={Boolean(columnsAnchorEl)}
        anchorEl={columnsAnchorEl}
        onClose={() => setColumnsAnchorEl(null)}
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibilityChange={onVisibilityChange}
      />
    </Box>
  );
};

export { FilterSection, ActiveFiltersChips };
