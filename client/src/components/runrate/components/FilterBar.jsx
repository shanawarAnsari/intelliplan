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
        businessUnits.includes(bu)
      );
      if (validBusinessUnits.length !== businessUnitFilter.length) {
        setBusinessUnitFilter(validBusinessUnits);
      }
    }
  }, [businessUnits, businessUnitFilter, setBusinessUnitFilter]);

  useEffect(() => {
    if (categoryFilter?.length > 0) {
      const validCategories = categoryFilter.filter((cat) =>
        categories.includes(cat)
      );
      if (validCategories.length !== categoryFilter.length) {
        setCategoryFilter(validCategories);
      }
    }
  }, [categories, categoryFilter, setCategoryFilter]);

  useEffect(() => {
    if (subCategoryFilter?.length > 0) {
      const validSubCategories = subCategoryFilter.filter((sub) =>
        subCategories.includes(sub)
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
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", md: "row" },
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <TextField
          label="Search Products"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          sx={{ minWidth: { xs: "100%", md: 280 } }}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <SearchIcon sx={{ fontSize: "1.2rem" }} />
              </InputAdornment>
            ),
          }}
        />

        <Box sx={{ display: "flex", gap: 1, flexWrap: "wrap" }}>
          <FormControl size="small" sx={{ minWidth: 120 }}>
            <InputLabel>Country</InputLabel>
            <Select
              multiple
              value={countryFilter || []}
              label="Country"
              onChange={(e) => setCountryFilter(e.target.value)}
              renderValue={(selected) =>
                selected.length === 0 ? "" : `${selected.length} selected`
              }
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

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Level</InputLabel>
            <Select value={levelFilter} label="Level" onChange={handleLevelChange}>
              <MenuItem value="BUSINESS_UNIT">Business Unit</MenuItem>
              <MenuItem value="CATEGORY">Category</MenuItem>
              <MenuItem value="SUB_CATEGORY">Sub Category</MenuItem>
            </Select>
          </FormControl>

          <FormControl size="small" sx={{ minWidth: 150 }}>
            <InputLabel>Run Rate</InputLabel>
            <Select
              value={runRateOption}
              label="Run Rate"
              onChange={(e) => setRunRateOption(e.target.value)}
            >
              <MenuItem value="13weeks">13 Weeks</MenuItem>
              <MenuItem value="8weeks">8 Weeks</MenuItem>
            </Select>
          </FormControl>

          <Badge badgeContent={selectedFiltersCount || null} color="primary">
            <Button
              variant={selectedFiltersCount > 0 ? "contained" : "outlined"}
              size="small"
              startIcon={<TuneIcon />}
              onClick={(e) => setFiltersAnchor(e.currentTarget)}
            >
              Filter
            </Button>
          </Badge>

          {hasActiveFilters && (
            <Button
              variant="outlined"
              size="small"
              startIcon={<ClearIcon />}
              onClick={clearFilters}
            >
              Clear
            </Button>
          )}

          <Badge
            badgeContent={columns.length - visibleColumns.length || null}
            color="primary"
          >
            <Button
              variant="outlined"
              size="small"
              startIcon={<ViewColumnIcon />}
              onClick={(e) => setColumnsAnchor(e.currentTarget)}
            >
              Columns
            </Button>
          </Badge>

          <Button
            variant="contained"
            startIcon={<DownloadIcon />}
            onClick={onExport}
          >
            Export
          </Button>
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
                    : [...visibleColumns, col.id]
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