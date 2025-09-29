import React from "react";
import {
  Box,
  TextField,
  Button,
  Chip,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import ColumnVisibilityControl from "./ColumnVisibilityControl";

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
  // New props for column visibility
  columns,
  visibleColumns,
  onVisibilityChange,
}) => {
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
          <ColumnVisibilityControl
            columns={columns}
            visibleColumns={visibleColumns}
            onVisibilityChange={onVisibilityChange}
          />

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
              Clear Filters
            </Button>
          )}

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

      {/* Bottom row - Hierarchical filters */}
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          gap: 2,
          alignItems: { md: "center" },
        }}
      >
        <FormControl
          size="small"
          sx={{
            minWidth: { xs: "100%", md: 150 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <InputLabel>Country</InputLabel>
          <Select
            value={countryFilter}
            label="Country"
            onChange={(e) => setCountryFilter(e.target.value)}
          >
            <MenuItem value="">All Countries</MenuItem>
            {countries.map((country) => (
              <MenuItem key={country} value={country}>
                {country}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            minWidth: { xs: "100%", md: 200 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <InputLabel>Category</InputLabel>
          <Select
            value={categoryFilter}
            label="Category"
            onChange={(e) => setCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All Categories</MenuItem>
            {categories.map((category) => (
              <MenuItem key={category} value={category}>
                {category}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <FormControl
          size="small"
          sx={{
            minWidth: { xs: "100%", md: 200 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <InputLabel>Sub Category</InputLabel>
          <Select
            value={subCategoryFilter}
            label="Sub Category"
            onChange={(e) => setSubCategoryFilter(e.target.value)}
          >
            <MenuItem value="">All Sub Categories</MenuItem>
            {subCategories.map((subCategory) => (
              <MenuItem key={subCategory} value={subCategory}>
                {subCategory}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>
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
}) => {
  if (!hasActiveFilters) return null;

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
      {categoryFilter && (
        <Chip
          label={`Category: ${categoryFilter}`}
          onDelete={() => setCategoryFilter("")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
      {subCategoryFilter && (
        <Chip
          label={`Sub Category: ${subCategoryFilter}`}
          onDelete={() => setSubCategoryFilter("")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );
};

export { FilterSection, ActiveFiltersChips };
