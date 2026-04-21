import React, { useState, useEffect, useRef } from "react";
import {
  Box,
  TextField,
  Button,
  IconButton,
  Tooltip,
  InputAdornment,
  Chip,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import RefreshIcon from "@mui/icons-material/Refresh";

import SimplifiedFilterPopover from "./components/SimplifiedFilterPopover";
import {
  CombinedFilterButton,
  CombinedColumnsButton,
} from "./components/FilterButtons";
import ColumnVisibilityPopover from "./components/ColumnVisibilityPopover";
import FilterControls from "./components/FilterControls";
import LevelSelector from "./components/LevelSelector";

const FilterSection = ({
  search,
  setSearch,
  countryFilter,
  setCountryFilter,
  regionFilter,
  setRegionFilter,
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
  isMsuMode,
  setIsMsuMode,
  selectedLevels,
  setSelectedLevels,
  businessUnits,
  businessUnitFilter,
  setBusinessUnitFilter,
  regions,
  userInputs,
  resetUserInputs,
}) => {
  const [filtersAnchorEl, setFiltersAnchorEl] = useState(null);
  const [columnsAnchorEl, setColumnsAnchorEl] = useState(null);
  const [localSearch, setLocalSearch] = useState(search);
  const debounceTimer = useRef(null);

  // Debounce search input (300ms delay)
  useEffect(() => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    debounceTimer.current = setTimeout(() => {
      setSearch(localSearch);
    }, 300);

    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [localSearch, setSearch]);

  // Update local search when prop changes (e.g., when filters are cleared)
  useEffect(() => {
    setLocalSearch(search);
  }, [search]);

  const totalSelectedFilters = [
    regionFilter,
    countryFilter,
    businessUnitFilter,
    categoryFilter,
    subCategoryFilter,
  ].reduce((sum, filter) => sum + (Array.isArray(filter) ? filter.length : 0), 0);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
      {/* Row 1: Search and Filters */}
      <Box
        sx={{
          display: "flex",
          gap: 1.5,
          alignItems: "center",
          flexDirection: { xs: "column", sm: "row" },
        }}
      >
        {/* Search Bar - Left Side */}
        <TextField
          placeholder="Search Products"
          variant="outlined"
          size="small"
          value={localSearch}
          onChange={(e) => setLocalSearch(e.target.value)}
          sx={{
            flex: { xs: 1, sm: "0 0 350px" },
            minWidth: { xs: "100%", sm: 300 },
            "& .MuiOutlinedInput-root": {
              backgroundColor: "#1a2332",
              borderRadius: 1.5,
              fontSize: "0.9rem",
              transition: "all 0.2s ease",
              "& fieldset": {
                borderColor: "#3f4f63",
              },
              "&:hover fieldset": {
                borderColor: "#60a5fa",
              },
              "&.Mui-focused fieldset": {
                borderColor: "#0087b9",
                boxShadow: "0 0 0 3px rgba(0, 135, 185, 0.1)",
              },
            },
            "& .MuiOutlinedInput-input": {
              color: "#e2e8f0",
              fontSize: "0.9rem",
              "&::placeholder": {
                color: "#94a3b8",
                opacity: 1,
              },
            },
          }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon sx={{ fontSize: "1.3rem", color: "#94a3b8" }} />
              </InputAdornment>
            ),
          }}
        />

        {/* MSU / Sales toggle */}
        <ToggleButtonGroup
          exclusive
          value={isMsuMode ? "msu" : "sales"}
          onChange={(_, val) => {
            if (val !== null) setIsMsuMode(val === "msu");
          }}
          size="small"
          sx={{
            backgroundColor: "#1a2332",
            border: "1px solid #3f4f63",
            borderRadius: "8px",
            overflow: "hidden",
            "& .MuiToggleButtonGroup-grouped": {
              border: 0,
              borderRadius: 0,
              px: 1.5,
              py: 0.5,
              fontSize: "0.78rem",
              fontWeight: 700,
              textTransform: "none",
              color: "#94a3b8",
              transition: "all 0.2s ease",
              "&.Mui-selected": {
                color: "#fff",
                backgroundColor: "#0087b9",
                "&:hover": { backgroundColor: "#0099d4" },
              },
              "&:hover": { backgroundColor: "rgba(0,135,185,0.12)" },
            },
          }}
        >
          <ToggleButton value="sales" disableRipple={false}>
            Sales ($)
          </ToggleButton>
          <ToggleButton value="msu" disableRipple={false}>
            MSU
          </ToggleButton>
        </ToggleButtonGroup>

        {/* Right Side - Filter Controls */}
        <Box
          sx={{
            display: "flex",
            gap: 1,
            alignItems: "center",
            flexWrap: "wrap",
            flex: 1,
            justifyContent: { xs: "stretch", sm: "flex-end" },
            width: { xs: "100%", sm: "auto" },
          }}
        >
          {userInputs && Object.keys(userInputs).length > 0 && (
            <Tooltip title="Reset all input percentages" arrow>
              <IconButton
                onClick={resetUserInputs}
                color="inherit"
                aria-label="Reset all input percentages"
                size="medium"
                sx={{
                  border: "1px solid #fff",
                  borderRadius: "10px",
                  color: "#fff",
                  "&:hover": { backgroundColor: "rgba(255,255,255,0.08)" },
                }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>
            </Tooltip>
          )}
          <LevelSelector
            selectedLevels={selectedLevels}
            onLevelsChange={setSelectedLevels}
          />

          <FilterControls
            runRateOption={runRateOption}
            setRunRateOption={setRunRateOption}
          />

          {/* Filter Button */}
          <CombinedFilterButton
            selectedCount={totalSelectedFilters}
            hasSelection={totalSelectedFilters > 0}
            onClick={(e) => setFiltersAnchorEl(e.currentTarget)}
          />

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
              fontWeight: 600,
              fontSize: "0.85rem",
              height: "38px",
              px: 2,
              background: "linear-gradient(135deg, #0087b9 0%, #006a94 100%)",
              boxShadow: "0 4px 6px -1px rgba(0, 135, 185, 0.3)",
              color: "#fff",
              transition: "all 0.2s ease",
              "&:hover": {
                boxShadow: "0 10px 15px -3px rgba(0, 135, 185, 0.4)",
              },
            }}
          >
            Export
          </Button>
        </Box>
      </Box>

      {/* Row 2: Selected Filters - Full Width Scrollable */}
      {hasActiveFilters && (
        <Box
          sx={{
            p: 1.5,
            backgroundColor: "#0f172a",
            borderRadius: 1.5,
            border: "1px solid #1e293b",
            overflow: "auto",
            "&::-webkit-scrollbar": {
              height: "6px",
            },
            "&::-webkit-scrollbar-track": {
              background: "#0f172a",
            },
            "&::-webkit-scrollbar-thumb": {
              background: "#3f4f63",
              borderRadius: "3px",
            },
            "&::-webkit-scrollbar-thumb:hover": {
              background: "#475569",
            },
          }}
        >
          <Box
            sx={{
              display: "flex",
              gap: 0.75,
              flexWrap: "nowrap",
              minWidth: "fit-content",
            }}
          >
            {search && (
              <Chip
                label={`Search: "${search}"`}
                onDelete={() => setSearch("")}
                size="small"
                sx={{
                  backgroundColor: "rgba(0, 135, 185, 0.15)",
                  color: "#60a5fa",
                  borderColor: "#60a5fa",
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": {
                    color: "#60a5fa",
                    "&:hover": {
                      color: "#fff",
                    },
                  },
                }}
              />
            )}
            {regionFilter?.map((region) => (
              <Chip
                key={region}
                label={`Region: ${region}`}
                size="small"
                onDelete={() =>
                  setRegionFilter(regionFilter.filter((r) => r !== region))
                }
                sx={{
                  backgroundColor: "rgba(0, 135, 185, 0.15)",
                  color: "#60a5fa",
                  borderColor: "#60a5fa",
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": {
                    color: "#60a5fa",
                    "&:hover": {
                      color: "#fff",
                    },
                  },
                }}
              />
            ))}
            {countryFilter?.map((country) => (
              <Chip
                key={country}
                label={`Country: ${country}`}
                size="small"
                onDelete={() =>
                  setCountryFilter(countryFilter.filter((c) => c !== country))
                }
                sx={{
                  backgroundColor: "rgba(0, 135, 185, 0.15)",
                  color: "#60a5fa",
                  borderColor: "#60a5fa",
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": {
                    color: "#60a5fa",
                    "&:hover": {
                      color: "#fff",
                    },
                  },
                }}
              />
            ))}
            {businessUnitFilter?.map((bu) => (
              <Chip
                key={bu}
                label={`BU: ${bu}`}
                size="small"
                onDelete={() =>
                  setBusinessUnitFilter(businessUnitFilter.filter((b) => b !== bu))
                }
                sx={{
                  backgroundColor: "rgba(0, 135, 185, 0.15)",
                  color: "#60a5fa",
                  borderColor: "#60a5fa",
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": {
                    color: "#60a5fa",
                    "&:hover": {
                      color: "#fff",
                    },
                  },
                }}
              />
            ))}
            {categoryFilter?.map((cat) => (
              <Chip
                key={cat}
                label={`Category: ${cat}`}
                size="small"
                onDelete={() =>
                  setCategoryFilter(categoryFilter.filter((c) => c !== cat))
                }
                sx={{
                  backgroundColor: "rgba(0, 135, 185, 0.15)",
                  color: "#60a5fa",
                  borderColor: "#60a5fa",
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": {
                    color: "#60a5fa",
                    "&:hover": {
                      color: "#fff",
                    },
                  },
                }}
              />
            ))}
            {subCategoryFilter?.map((sub) => (
              <Chip
                key={sub}
                label={`Sub: ${sub}`}
                size="small"
                onDelete={() =>
                  setSubCategoryFilter(subCategoryFilter.filter((s) => s !== sub))
                }
                sx={{
                  backgroundColor: "rgba(0, 135, 185, 0.15)",
                  color: "#60a5fa",
                  borderColor: "#60a5fa",
                  fontSize: "0.8rem",
                  "& .MuiChip-deleteIcon": {
                    color: "#60a5fa",
                    "&:hover": {
                      color: "#fff",
                    },
                  },
                }}
              />
            ))}
          </Box>
        </Box>
      )}

      {/* Popovers */}
      <SimplifiedFilterPopover
        anchorEl={filtersAnchorEl}
        open={Boolean(filtersAnchorEl)}
        onClose={() => setFiltersAnchorEl(null)}
        regions={regions}
        regionFilter={regionFilter}
        setRegionFilter={setRegionFilter}
        countries={countries}
        countryFilter={countryFilter}
        setCountryFilter={setCountryFilter}
        businessUnits={businessUnits}
        businessUnitFilter={businessUnitFilter}
        setBusinessUnitFilter={setBusinessUnitFilter}
        categories={categories}
        subCategories={subCategories}
        categoryFilter={categoryFilter}
        setCategoryFilter={setCategoryFilter}
        subCategoryFilter={subCategoryFilter}
        setSubCategoryFilter={setSubCategoryFilter}
        selectedLevels={selectedLevels}
      />

      <ColumnVisibilityPopover
        open={Boolean(columnsAnchorEl)}
        anchorEl={columnsAnchorEl}
        onClose={() => setColumnsAnchorEl(null)}
        columns={columns}
        visibleColumns={visibleColumns}
        onVisibilityChange={onVisibilityChange}
        selectedLevels={selectedLevels}
      />
    </Box>
  );
};

export { FilterSection };
