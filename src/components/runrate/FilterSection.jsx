import React, { useState } from "react";
import {
  Box,
  TextField,
  Button,
  Chip,
  Popover,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Checkbox,
  Typography,
  Badge,
  Divider,
  InputAdornment,
  Paper,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import FilterListIcon from "@mui/icons-material/FilterList";
import TuneIcon from "@mui/icons-material/Tune";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";
import ColumnVisibilityControl from "./ColumnVisibilityControl";
import { TableBar, ViewColumn } from "@mui/icons-material";

// Simplified filter popover component - only for categories and sub-categories
const SimplifiedFilterPopover = ({
  anchorEl,
  open,
  onClose,
  categories,
  subCategories,
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
  levelFilter, // Add levelFilter prop
}) => {
  // Convert to array format for consistency
  const selectedCategories = Array.isArray(categoryFilter) ? categoryFilter : [];
  const selectedSubCategories = Array.isArray(subCategoryFilter)
    ? subCategoryFilter
    : [];

  // Handle selection changes
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
    setCategoryFilter([]);
    setSubCategoryFilter([]);
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
          width: { xs: 300, sm: 500 },
          maxWidth: "95vw",
          maxHeight: "80vh",
          borderRadius: 2,
          boxShadow: "0 8px 24px rgba(0,0,0,0.12)",
          overflow: "auto",
        },
      }}
    >
      <Box sx={{ p: 2 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 1 }}>
          <Typography variant="h6" sx={{ fontSize: "1rem", fontWeight: 600 }}>
            Filter Products
          </Typography>
          {(selectedCategories.length > 0 || selectedSubCategories.length > 0) && (
            <Button
              size="small"
              onClick={handleClearAll}
              sx={{
                color: "#ef4444",
                "&:hover": { backgroundColor: "rgba(239, 68, 68, 0.08)" },
              }}
            >
              Clear All
            </Button>
          )}
        </Box>
        <Divider sx={{ mb: 2 }} />

        {/* Category Filter - Show only if level is CATEGORY or SUB_CATEGORY */}
        {(levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY") && (
          <Box sx={{ mb: 2 }}>
            <Typography
              variant="subtitle2"
              sx={{
                mb: 1,
                fontWeight: 600,
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              Categories
              {selectedCategories.length > 0 && (
                <Button
                  size="small"
                  onClick={() => setCategoryFilter([])}
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
            <Box
              sx={{
                maxHeight: 150,
                overflow: "auto",
              }}
            >
              {categories.map((category) => (
                <Chip
                  key={category}
                  label={category}
                  size="small"
                  onClick={() => handleCategoryToggle(category)}
                  variant={
                    selectedCategories.includes(category) ? "filled" : "outlined"
                  }
                  color={
                    selectedCategories.includes(category) ? "primary" : "default"
                  }
                  sx={{
                    m: 0.5,
                    borderRadius: 1,
                    height: 28,
                    fontSize: "0.75rem",
                  }}
                />
              ))}
            </Box>
          </Box>
        )}

        {levelFilter === "CATEGORY" && <Divider sx={{ my: 2 }} />}

        {/* Sub Category Filter - Only show for SUB_CATEGORY level */}
        {levelFilter === "SUB_CATEGORY" && (
          <>
            <Divider sx={{ my: 2 }} />
            <Box>
              <Typography
                variant="subtitle2"
                sx={{
                  mb: 1,
                  fontWeight: 600,
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                Sub Categories
                {selectedSubCategories.length > 0 && (
                  <Button
                    size="small"
                    onClick={() => setSubCategoryFilter([])}
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
              <Box
                sx={{
                  maxHeight: 150,
                  overflow: "auto",
                }}
              >
                {subCategories.map((subCategory) => (
                  <Chip
                    key={subCategory}
                    label={subCategory}
                    size="small"
                    onClick={() => handleSubCategoryToggle(subCategory)}
                    variant={
                      selectedSubCategories.includes(subCategory)
                        ? "filled"
                        : "outlined"
                    }
                    color={
                      selectedSubCategories.includes(subCategory)
                        ? "primary"
                        : "default"
                    }
                    sx={{
                      m: 0.5,
                      borderRadius: 1,
                      height: 28,
                      fontSize: "0.75rem",
                    }}
                  />
                ))}
              </Box>
            </Box>
          </>
        )}

        <Divider sx={{ my: 2 }} />
        {/* 
        <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
          <Button
            variant="contained"
            onClick={onClose}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.5)",
            }}
          >
            Apply Filters
          </Button>
        </Box> */}
      </Box>
    </Popover>
  );
};

// Combined filter button
const CombinedFilterButton = ({ selectedCount, hasSelection, onClick }) => (
  <Badge
    badgeContent={selectedCount > 0 ? selectedCount : null}
    color="primary"
    sx={{
      "& .MuiBadge-badge": {
        fontSize: "0.75rem",
        height: 18,
        minWidth: 18,
      },
    }}
  >
    <Button
      variant={hasSelection ? "contained" : "outlined"}
      size="small"
      onClick={onClick}
      startIcon={<TuneIcon />}
      sx={{
        borderRadius: 2,
        textTransform: "none",
        minWidth: 100,
        backgroundColor: hasSelection ? "#3b82f6" : "transparent",
        borderColor: hasSelection ? "#3b82f6" : "#d1d5db",
        color: "white",
      }}
    >
      Filter
    </Button>
  </Badge>
);

// Combined columns button with the same design as filter button
const CombinedColumnsButton = ({ selectedColumns, totalColumns, onClick }) => {
  const hiddenCount = totalColumns - selectedColumns.length;

  return (
    <Badge
      badgeContent={hiddenCount > 0 ? hiddenCount : null}
      color="primary"
      sx={{
        "& .MuiBadge-badge": {
          fontSize: "0.75rem",
          height: 18,
          minWidth: 18,
        },
      }}
    >
      <Button
        variant={hiddenCount > 0 ? "contained" : "outlined"}
        size="small"
        onClick={onClick}
        startIcon={<ViewColumn />}
        sx={{
          borderRadius: 2,
          textTransform: "none",
          minWidth: 100,
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
}) => {
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);
  const [columnsAnchorEl, setColumnsAnchorEl] = useState(null);

  // Calculate total selected filters based on level filter
  const totalSelectedFilters =
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

  // Handle column button click
  const handleColumnsClick = (event) => {
    setColumnsAnchorEl(event.currentTarget);
  };

  // Handle columns popover close
  const handleColumnsClose = () => {
    setColumnsAnchorEl(null);
  };

  // Handle level filter change and clear inappropriate filters
  const handleLevelFilterChange = (e) => {
    const newLevel = e.target.value;
    setLevelFilter(newLevel);

    // Clear filters that don't apply to the new level
    if (newLevel === "BUSINESS_UNIT") {
      setCategoryFilter([]);
      setSubCategoryFilter([]);
    } else if (newLevel === "CATEGORY") {
      setSubCategoryFilter([]);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        gap: 2,
      }}
    >
      {/* Top row - Search and Export */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          alignItems: { md: "center" },
          gap: 2,
        }}
      >
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{
            minWidth: { xs: "100%", md: 300 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
              borderColor: "#fff",
            },
          }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ color: "#6b7280" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          {/* Country Filter - Always show */}
          <FormControl
            size="small"
            sx={{
              minWidth: 150,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <InputLabel id="country-select-label">Country</InputLabel>
            <Select
              labelId="country-select-label"
              id="country-select"
              value={countryFilter}
              label="Country"
              onChange={(e) => setCountryFilter(e.target.value)}
            >
              {countries.map((country) => (
                <MenuItem key={country} value={country}>
                  {country}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          {/* Level Filter Dropdown */}
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <InputLabel id="level-select-label">Aggregation Level</InputLabel>
            <Select
              labelId="level-select-label"
              id="level-select"
              value={levelFilter}
              label="Aggregation Level"
              onChange={handleLevelFilterChange}
            >
              <MenuItem value="BUSINESS_UNIT">Business Unit</MenuItem>
              <MenuItem value="CATEGORY">Category</MenuItem>
              <MenuItem value="SUB_CATEGORY">Sub Category</MenuItem>
            </Select>
          </FormControl>

          {/* Run Rate Option Dropdown */}
          <FormControl
            size="small"
            sx={{
              minWidth: 180,
              "& .MuiOutlinedInput-root": {
                borderRadius: 2,
              },
            }}
          >
            <InputLabel id="runrate-select-label">Run Rate Period</InputLabel>
            <Select
              labelId="runrate-select-label"
              id="runrate-select"
              value={runRateOption}
              label="Run Rate Period"
              onChange={(e) => setRunRateOption(e.target.value)}
            >
              <MenuItem value="13weeks">13 Weeks</MenuItem>
              <MenuItem value="8weeks">8 Weeks</MenuItem>
            </Select>
          </FormControl>

          {/* Filter Button - Only show for relevant levels */}
          {(levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY") && (
            <CombinedFilterButton
              selectedCount={totalSelectedFilters}
              hasSelection={totalSelectedFilters > 0}
              onClick={(e) => setFiltersAnchorEl(e.currentTarget)}
            />
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
              sx={{
                borderRadius: 2,
                textTransform: "none",
                color: "#6b7280",
                borderColor: "#d1d5db",
              }}
            >
              Clear
            </Button>
          )}

          {/* Column Visibility Button */}
          <CombinedColumnsButton
            selectedColumns={visibleColumns}
            totalColumns={columns.length}
            onClick={handleColumnsClick}
          />

          {/* Export Button */}
          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onExport}
            sx={{
              borderRadius: 2,
              textTransform: "none",
              background: "linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)",
              boxShadow: "0 4px 6px -1px rgba(59, 130, 246, 0.5)",
              "&:hover": {
                boxShadow: "0 10px 15px -3px rgba(59, 130, 246, 0.5)",
              },
            }}
          >
            Export CSV
          </Button>
        </Box>
      </Box>

      {/* Simplified Filters Popover - Only for Category and SubCategory */}
      <SimplifiedFilterPopover
        anchorEl={filtersAnchorEl}
        open={Boolean(filtersAnchorEl)}
        onClose={() => setFiltersAnchorEl(null)}
        categories={categories}
        subCategories={subCategories}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        subCategoryFilter={subCategoryFilter}
        setSubCategoryFilter={setSubCategoryFilter}
        levelFilter={levelFilter} // Pass the levelFilter
      />

      {/* Column visibility popover */}
      <Popover
        open={Boolean(columnsAnchorEl)}
        anchorEl={columnsAnchorEl}
        onClose={handleColumnsClose}
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
                onClick={() => {
                  const currentIndex = visibleColumns.indexOf(column.id);
                  const newVisibleColumns = [...visibleColumns];

                  if (currentIndex === -1) {
                    newVisibleColumns.push(column.id);
                  } else {
                    newVisibleColumns.splice(currentIndex, 1);
                  }

                  onVisibilityChange(newVisibleColumns);
                }}
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
    </Box>
  );
};

const ActiveFiltersChips = ({
  search,
  setSearch,
  countryFilter,
  setCountryFilter,
  categoryFilter,
  setCategoryFilter,
  subCategoryFilter,
  setSubCategoryFilter,
  hasActiveFilters,
  levelFilter, // Add levelFilter prop
}) => {
  if (!hasActiveFilters) return null;

  const selectedCategories = Array.isArray(categoryFilter) ? categoryFilter : [];
  const selectedSubCategories = Array.isArray(subCategoryFilter)
    ? subCategoryFilter
    : [];

  const handleCategoryRemove = (categoryToRemove) => {
    const newCategories = selectedCategories.filter(
      (cat) => cat !== categoryToRemove
    );
    setCategoryFilter(newCategories);
  };

  const handleSubCategoryRemove = (subCategoryToRemove) => {
    const newSubCategories = selectedSubCategories.filter(
      (sub) => sub !== subCategoryToRemove
    );
    setSubCategoryFilter(newSubCategories);
  };

  return (
    <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
      {search && (
        <Chip
          label={`Search: "${search}"`}
          onDelete={() => setSearch("")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
      {countryFilter && (
        <Chip
          label={`Country: ${countryFilter}`}
          onDelete={() => setCountryFilter("")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}

      {/* Only show Category chips if level is appropriate */}
      {(levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY") &&
        selectedCategories.map((category) => (
          <Chip
            key={category}
            label={`Category: ${category}`}
            onDelete={() => handleCategoryRemove(category)}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}

      {/* Only show Sub Category chips if level is SUB_CATEGORY */}
      {levelFilter === "SUB_CATEGORY" &&
        selectedSubCategories.map((subCategory) => (
          <Chip
            key={subCategory}
            label={`Sub Category: ${subCategory}`}
            onDelete={() => handleSubCategoryRemove(subCategory)}
            size="small"
            color="primary"
            variant="outlined"
          />
        ))}
    </Box>
  );
};

// Change from default export to named exports
export { FilterSection, ActiveFiltersChips };
