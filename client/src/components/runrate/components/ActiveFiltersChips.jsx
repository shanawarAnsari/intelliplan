import React from "react";
import { Box, Chip } from "@mui/material";

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
  levelFilter,
  businessUnitFilter,
  setBusinessUnitFilter,
}) => {
  if (!hasActiveFilters) return null;

  const selectedCountries = Array.isArray(countryFilter) ? countryFilter : [];
  const selectedBusinessUnits = Array.isArray(businessUnitFilter)
    ? businessUnitFilter
    : businessUnitFilter
    ? [businessUnitFilter]
    : [];
  const selectedCategories = Array.isArray(categoryFilter) ? categoryFilter : [];
  const selectedSubCategories = Array.isArray(subCategoryFilter)
    ? subCategoryFilter
    : [];

  const handleBusinessUnitRemove = (businessUnitToRemove) => {
    const newBusinessUnits = selectedBusinessUnits.filter(
      (bu) => bu !== businessUnitToRemove
    );
    setBusinessUnitFilter(newBusinessUnits);
  };

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

  const handleCountryRemove = (countryToRemove) => {
    const newCountries = selectedCountries.filter((c) => c !== countryToRemove);
    setCountryFilter(newCountries);
  };

  return (
    <Box sx={{ mt: 1.5, display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {search && (
        <Chip
          label={`Search: "${search}"`}
          onDelete={() => setSearch("")}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ height: 24, fontSize: "0.75rem", "& .MuiChip-label": { px: 1.5 } }}
        />
      )}
      {selectedCountries.map((country) => (
        <Chip
          key={country}
          label={`Country: ${country}`}
          onDelete={() => handleCountryRemove(country)}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ height: 24, fontSize: "0.75rem", "& .MuiChip-label": { px: 1.5 } }}
        />
      ))}

      {selectedBusinessUnits.map((businessUnit) => (
        <Chip
          key={businessUnit}
          label={`Business Unit: ${businessUnit}`}
          onDelete={() => handleBusinessUnitRemove(businessUnit)}
          size="small"
          color="primary"
          variant="outlined"
          sx={{ height: 24, fontSize: "0.75rem", "& .MuiChip-label": { px: 1.5 } }}
        />
      ))}

      {(levelFilter === "CATEGORY" || levelFilter === "SUB_CATEGORY") &&
        selectedCategories.map((category) => (
          <Chip
            key={category}
            label={`Category: ${category}`}
            onDelete={() => handleCategoryRemove(category)}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 24, fontSize: "0.75rem", "& .MuiChip-label": { px: 1.5 } }}
          />
        ))}

      {levelFilter === "SUB_CATEGORY" &&
        selectedSubCategories.map((subCategory) => (
          <Chip
            key={subCategory}
            label={`Sub Category: ${subCategory}`}
            onDelete={() => handleSubCategoryRemove(subCategory)}
            size="small"
            color="primary"
            variant="outlined"
            sx={{ height: 24, fontSize: "0.75rem", "& .MuiChip-label": { px: 1.5 } }}
          />
        ))}
    </Box>
  );
};

export default ActiveFiltersChips;
