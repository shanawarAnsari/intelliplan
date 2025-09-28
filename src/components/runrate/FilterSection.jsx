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

const FilterSection = ({
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
  sources,
  hasActiveFilters,
  clearFilters,
  onExport,
}) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        alignItems: { md: "center" },
        gap: 2,
      }}
    >
      {/* Left side - Search */}
      <TextField
        label="Search Category"
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

      {/* Right side - Source Filter and Export */}
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <FormControl
          size="small"
          sx={{
            minWidth: { xs: "100%", md: 200 },
            "& .MuiOutlinedInput-root": {
              borderRadius: 2,
            },
          }}
        >
          <InputLabel>Source Filter</InputLabel>
          <Select
            value={sourceFilter}
            label="Source Filter"
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            {sources.map((source) => (
              <MenuItem key={source} value={source}>
                {source}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
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
    </Box>
  );
};

const ActiveFiltersChips = ({
  search,
  setSearch,
  sourceFilter,
  setSourceFilter,
  hasActiveFilters,
}) => {
  if (!hasActiveFilters) return null;

  return (
    <Box sx={{ mt: 2, display: "flex", gap: 1, flexWrap: "wrap" }}>
      {search && (
        <Chip
          label={`Category: "${search}"`}
          onDelete={() => setSearch("")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
      {sourceFilter && (
        <Chip
          label={`Source: ${sourceFilter}`}
          onDelete={() => setSourceFilter("")}
          size="small"
          color="primary"
          variant="outlined"
        />
      )}
    </Box>
  );
};

export { FilterSection, ActiveFiltersChips };
