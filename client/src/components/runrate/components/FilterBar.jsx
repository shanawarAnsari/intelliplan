import React, { useState, useEffect } from "react";
import {
  Box,
  TextField,
  Button,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Chip,
  Badge,
  Popover,
} from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import DownloadIcon from "@mui/icons-material/Download";
import ClearIcon from "@mui/icons-material/Clear";
import TuneIcon from "@mui/icons-material/Tune";
import ViewColumnIcon from "@mui/icons-material/ViewColumn";

const FilterBar = ({
  search,
  setSearch,
  countries,
  countryFilter,
  setCountryFilter,
  levelFilter,
  setLevelFilter,
  runRateOption,
  setRunRateOption,
  businessUnits,
  businessUnitFilter,
  setBusinessUnitFilter,
  categories,
  categoryFilter,
  setCategoryFilter,
  subCategories,
  subCategoryFilter,
  setSubCategoryFilter,
  hasActiveFilters,
  clearFilters,
  onExport,
  columns,
  visibleColumns,
  onVisibilityChange,
}) => {
  const [filtersAnchor, setFiltersAnchor] = useState(null);
  const [columnsAnchor, setColumnsAnchor] = useState(null);

  const selectedFiltersCount =
    (countryFilter?.length || 0) +
    (businessUnitFilter?.length || 0) +
    (categoryFilter?.length || 0) +
    (subCategoryFilter?.length || 0);

  const handleLevelChange = (e) => {
    const newLevel = e.target.value;
    setLevelFilter(newLevel);
    if (newLevel === "BUSINESS_UNIT") {
      setCategoryFilter([]);
      setSubCategoryFilter([]);
    } else if (newLevel === "CATEGORY") {
      setSubCategoryFilter([]);
    }
  };

  // Clear dependent filters when parent selection changes and options become unavailable
  useEffect(() => {
    if (businessUnitFilter?.length > 0) {
      const validBusinessUnits = businessUnitFilter.filter((bu) =>
        businessUnits.includes(bu),
      );
      if (validBusinessUnits.length !== businessUnitFilter.length) {
        setBusinessUnitFilter(validBusinessUnits);
      }
    }
  }, [businessUnits, businessUnitFilter, setBusinessUnitFilter]);

  useEffect(() => {
    if (categoryFilter?.length > 0) {
      const validCategories = categoryFilter.filter((cat) =>
        categories.includes(cat),
      );
      if (validCategories.length !== categoryFilter.length) {
        setCategoryFilter(validCategories);
      }
    }
  }, [categories, categoryFilter, setCategoryFilter]);

  useEffect(() => {
    if (subCategoryFilter?.length > 0) {
      const validSubCategories = subCategoryFilter.filter((sub) =>
        subCategories.includes(sub),
      );
      if (validSubCategories.length !== subCategoryFilter.length) {
        setSubCategoryFilter(validSubCategories);
      }
    }
  }, [subCategories, subCategoryFilter, setSubCategoryFilter]);

  const FilterChip = ({ items, selected, onToggle, label, showCount = true }) => (
    <Box sx={{ mb: 1.5 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", mb: 0.5 }}>
        <Box
          component="span"
          sx={{ fontSize: "0.85rem", fontWeight: 600, color: "#f9fafb" }}
        >
          {label}{" "}
          {showCount && items?.length > 0 && (
            <span style={{ color: "#9ca3af" }}>({items.length})</span>
          )}
        </Box>
        {selected?.length > 0 && (
          <Button
            size="small"
            onClick={() => onToggle([])}
            sx={{ p: 0, minWidth: "auto", fontSize: "0.75rem", color: "#93c5fd" }}
          >
            Clear ({selected.length})
          </Button>
        )}
      </Box>
      <Box
        sx={{
          maxHeight: 200,
          overflow: "auto",
          "&::-webkit-scrollbar": { width: "6px" },
          "&::-webkit-scrollbar-thumb": {
            background: "#4b5563",
            borderRadius: "3px",
          },
        }}
      >
        {items && items.length > 0 ? (
          items.map((item) => (
            <Chip
              key={item}
              label={item}
              size="small"
              onClick={() => {
                const newSelected = selected?.includes(item)
                  ? selected.filter((i) => i !== item)
                  : [...(selected || []), item];
                onToggle(newSelected);
              }}
              variant={selected?.includes(item) ? "filled" : "outlined"}
              color={selected?.includes(item) ? "primary" : "default"}
              sx={{
                m: 0.5,
                borderRadius: 1,
                height: 26,
                fontSize: "0.75rem",
                backgroundColor: selected?.includes(item)
                  ? "#0087b9"
                  : "transparent",
                color: selected?.includes(item) ? "#fff" : "#d1d5db",
                borderColor: selected?.includes(item) ? "#0087b9" : "#4b5563",
                "&:hover": {
                  backgroundColor: selected?.includes(item)
                    ? "#006a94"
                    : "rgba(147, 197, 253, 0.1)",
                  borderColor: selected?.includes(item) ? "#006a94" : "#60a5fa",
                },
              }}
            />
          ))
        ) : (
          <Box
            sx={{
              p: 2,
              textAlign: "center",
              color: "#9ca3af",
              fontSize: "0.8rem",
            }}
          >
            No options available
          </Box>
        )}
      </Box>
    </Box>
  );

  return (
    <>
      {/* Filter Container */}
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          gap: 2,
          mb: 2,
        }}
      >
        {/* Search Row */}
        <Box
          sx={{
            display: "flex",
            gap: 2,
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <TextField
            placeholder="Search Products"
            variant="outlined"
            size="small"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            sx={{
              flex: 1,
              minWidth: { xs: "100%", sm: 300 },
              maxWidth: { xs: "100%", sm: 400 },
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
        </Box>
        {/* Filters and Actions Row */}
        <Box
          sx={{
            display: "flex",
            gap: 1.5,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "space-between",
            p: 1.5,
            backgroundColor: "#0f172a",
            borderRadius: 1.5,
            border: "1px solid #1e293b",
          }}
        >
          {/* Left Side - Filter Dropdowns */}
          <Box
            sx={{
              display: "flex",
              gap: 1.5,
              alignItems: "center",
              flexWrap: "wrap",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                Country
              </InputLabel>
              <Select
                multiple
                value={countryFilter || []}
                label="Country"
                onChange={(e) => setCountryFilter(e.target.value)}
                renderValue={(selected) =>
                  selected.length === 0 ? "All" : `${selected.length} selected`
                }
                sx={{
                  backgroundColor: "#1a2332",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#3f4f63",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#60a5fa",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0087b9",
                  },
                }}
              >
                {countries.map((c) => (
                  <MenuItem key={c} value={c}>
                    <input
                      type="checkbox"
                      checked={countryFilter?.includes(c) || false}
                      readOnly
                      style={{ marginRight: 8 }}
                    />
                    {c}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 140 }}>
              <InputLabel sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                Aggregation Level
              </InputLabel>
              <Select
                value={levelFilter}
                label="Aggregation Level"
                onChange={handleLevelChange}
                sx={{
                  backgroundColor: "#1a2332",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#3f4f63",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#60a5fa",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0087b9",
                  },
                }}
              >
                <MenuItem value="BUSINESS_UNIT">Business Unit</MenuItem>
                <MenuItem value="CATEGORY">Category</MenuItem>
                <MenuItem value="SUB_CATEGORY">Sub Category</MenuItem>
              </Select>
            </FormControl>

            <FormControl size="small" sx={{ minWidth: 120 }}>
              <InputLabel sx={{ color: "#94a3b8", fontSize: "0.85rem" }}>
                Run Rate Period
              </InputLabel>
              <Select
                value={runRateOption}
                label="Run Rate Period"
                onChange={(e) => setRunRateOption(e.target.value)}
                sx={{
                  backgroundColor: "#1a2332",
                  color: "#e2e8f0",
                  fontSize: "0.9rem",
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#3f4f63",
                  },
                  "&:hover .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#60a5fa",
                  },
                  "&.Mui-focused .MuiOutlinedInput-notchedOutline": {
                    borderColor: "#0087b9",
                  },
                }}
              >
                <MenuItem value="13weeks">13 Weeks</MenuItem>
                <MenuItem value="8weeks">8 Weeks</MenuItem>
              </Select>
            </FormControl>
          </Box>

          {/* Right Side - Action Buttons */}
          <Box
            sx={{
              display: "flex",
              gap: 1,
              alignItems: "center",
            }}
          >
            <Badge badgeContent={selectedFiltersCount || null} color="primary">
              <Button
                variant={selectedFiltersCount > 0 ? "contained" : "outlined"}
                size="small"
                startIcon={<TuneIcon sx={{ fontSize: "1rem" }} />}
                onClick={(e) => setFiltersAnchor(e.currentTarget)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  px: 2,
                  backgroundColor:
                    selectedFiltersCount > 0 ? "#0087b9" : "rgba(0, 135, 185, 0.08)",
                  color: selectedFiltersCount > 0 ? "#fff" : "#60a5fa",
                  borderColor: "#60a5fa",
                  border: selectedFiltersCount > 0 ? "none" : "1px solid #60a5fa",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor:
                      selectedFiltersCount > 0 ? "#006a94" : "#0087b9",
                    color: "#fff",
                    borderColor: "#0087b9",
                  },
                }}
              >
                Filter
              </Button>
            </Badge>

            <Badge
              badgeContent={columns.length - visibleColumns.length || null}
              color="primary"
            >
              <Button
                variant="outlined"
                size="small"
                startIcon={<ViewColumnIcon sx={{ fontSize: "1rem" }} />}
                onClick={(e) => setColumnsAnchor(e.currentTarget)}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  px: 2,
                  color: "#cbd5e1",
                  borderColor: "#475569",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(96, 165, 250, 0.1)",
                    borderColor: "#60a5fa",
                    color: "#60a5fa",
                  },
                }}
              >
                Columns
              </Button>
            </Badge>

            {hasActiveFilters && (
              <Button
                variant="outlined"
                size="small"
                startIcon={<ClearIcon sx={{ fontSize: "1rem" }} />}
                onClick={clearFilters}
                sx={{
                  textTransform: "none",
                  fontWeight: 600,
                  fontSize: "0.85rem",
                  px: 2,
                  color: "#fca5a5",
                  borderColor: "#7f1d1d",
                  transition: "all 0.2s ease",
                  "&:hover": {
                    backgroundColor: "rgba(248, 113, 113, 0.12)",
                    borderColor: "#f87171",
                    color: "#f87171",
                  },
                }}
              >
                Clear
              </Button>
            )}

            <Button
              variant="contained"
              size="small"
              startIcon={<DownloadIcon sx={{ fontSize: "1rem" }} />}
              onClick={onExport}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                fontSize: "0.85rem",
                px: 2,
                backgroundColor: "#0087b9",
                color: "#fff",
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "#006a94",
                  boxShadow: "0 4px 12px rgba(0, 135, 185, 0.3)",
                },
              }}
            >
              Export
            </Button>
          </Box>
        </Box>
      </Box>

      {/* Filter Popover */}
      <Popover
        open={Boolean(filtersAnchor)}
        anchorEl={filtersAnchor}
        onClose={() => setFiltersAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 520,
            maxHeight: "80vh",
            p: 2.5,
            borderRadius: 2,
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
          },
        }}
      >
        <FilterChip
          items={countries}
          selected={countryFilter || []}
          onToggle={setCountryFilter}
          label="Country"
        />
        <FilterChip
          items={businessUnits}
          selected={businessUnitFilter || []}
          onToggle={setBusinessUnitFilter}
          label="Business Unit"
        />
        {(levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY") && (
          <FilterChip
            items={categories}
            selected={categoryFilter || []}
            onToggle={setCategoryFilter}
            label="Category"
          />
        )}
        {levelFilter === "SUB_CATEGORY" && (
          <FilterChip
            items={subCategories}
            selected={subCategoryFilter || []}
            onToggle={setSubCategoryFilter}
            label="Sub Category"
          />
        )}
      </Popover>

      {/* Column Visibility Popover */}
      <Popover
        open={Boolean(columnsAnchor)}
        anchorEl={columnsAnchor}
        onClose={() => setColumnsAnchor(null)}
        anchorOrigin={{ vertical: "bottom", horizontal: "left" }}
        PaperProps={{
          sx: {
            width: 300,
            maxHeight: 400,
            p: 2,
            borderRadius: 2,
            backgroundColor: "#1f2937",
            border: "1px solid #374151",
          },
        }}
      >
        {columns.map((col) => {
          const isVisible = visibleColumns.includes(col.id);
          const isEssential = [
            "COUNTRY",
            "BUSINESS_UNIT",
            "CATEGORY",
            "SUB_CATEGORY",
          ].includes(col.id);
          return (
            <Box
              key={col.id}
              onClick={() =>
                !isEssential &&
                onVisibilityChange(
                  isVisible
                    ? visibleColumns.filter((id) => id !== col.id)
                    : [...visibleColumns, col.id],
                )
              }
              sx={{
                p: 1,
                cursor: isEssential ? "not-allowed" : "pointer",
                opacity: isEssential ? 0.5 : 1,
                "&:hover": !isEssential
                  ? { bgcolor: "rgba(96, 165, 250, 0.1)" }
                  : {},
                borderRadius: 1,
              }}
            >
              <input
                type="checkbox"
                checked={isVisible}
                disabled={isEssential}
                readOnly
              />
              <span
                style={{ marginLeft: 8, fontSize: "0.875rem", color: "#f9fafb" }}
              >
                {col.label}
              </span>
            </Box>
          );
        })}
      </Popover>

      {/* Active Filter Chips */}
      {hasActiveFilters && (
        <Box sx={{ mt: 1.5, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
          {search && (
            <Chip
              label={`Search: "${search}"`}
              onDelete={() => setSearch("")}
              size="small"
            />
          )}
          {countryFilter?.map((country) => (
            <Chip
              key={country}
              label={`Country: ${country}`}
              size="small"
              onDelete={() =>
                setCountryFilter(countryFilter.filter((c) => c !== country))
              }
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
            />
          ))}
          {categoryFilter?.map((cat) => (
            <Chip
              key={cat}
              label={`Cat: ${cat}`}
              size="small"
              onDelete={() =>
                setCategoryFilter(categoryFilter.filter((c) => c !== cat))
              }
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
            />
          ))}
        </Box>
      )}
    </>
  );
};

export default FilterBar;
