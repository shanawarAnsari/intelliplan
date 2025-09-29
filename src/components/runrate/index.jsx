import React from "react";
import { Box, Card, CardContent, Divider } from "@mui/material";
import { mockShipmentData } from "./mockData";
import { tableColumns } from "./constants";
import {
  useTableState,
  useDataFiltering,
  useDataExport,
  useCalculatedFields,
} from "./hooks";
import { FilterSection, ActiveFiltersChips } from "./FilterSection";
import DataTable from "./DataTable";

const SalesForecastTable = () => {
  // Extract unique values for hierarchical filter dropdowns
  const countries = [...new Set(mockShipmentData.map((row) => row.COUNTRY))].sort();

  // Get categories filtered by selected country
  const getAvailableCategories = (countryFilter) => {
    const filtered = countryFilter
      ? mockShipmentData.filter((row) => row.COUNTRY === countryFilter)
      : mockShipmentData;
    return [...new Set(filtered.map((row) => row.CATEGORY))].sort();
  };

  // Get sub-categories filtered by selected country and category
  const getAvailableSubCategories = (countryFilter, categoryFilter) => {
    let filtered = mockShipmentData;
    if (countryFilter) {
      filtered = filtered.filter((row) => row.COUNTRY === countryFilter);
    }
    if (categoryFilter) {
      filtered = filtered.filter((row) => row.CATEGORY === categoryFilter);
    }
    return [...new Set(filtered.map((row) => row.SUB_CATEGORY))].sort();
  };

  // Use custom hooks for state management
  const {
    search,
    setSearch,
    countryFilter,
    setCountryFilter,
    categoryFilter,
    setCategoryFilter,
    subCategoryFilter,
    setSubCategoryFilter,
    page,
    setPage,
    rowsPerPage,
    setRowsPerPage,
    userInputs,
    clearFilters,
    handleUserInputChange,
    resetPage,
    hasActiveFilters,
  } = useTableState();

  // Get available options based on current filters
  const availableCategories = React.useMemo(
    () => getAvailableCategories(countryFilter),
    [countryFilter]
  );

  const availableSubCategories = React.useMemo(
    () => getAvailableSubCategories(countryFilter, categoryFilter),
    [countryFilter, categoryFilter]
  );

  // Clear dependent filters when parent filter changes
  React.useEffect(() => {
    if (categoryFilter && !availableCategories.includes(categoryFilter)) {
      setCategoryFilter("");
    }
  }, [categoryFilter, availableCategories, setCategoryFilter]);

  React.useEffect(() => {
    if (subCategoryFilter && !availableSubCategories.includes(subCategoryFilter)) {
      setSubCategoryFilter("");
    }
  }, [subCategoryFilter, availableSubCategories, setSubCategoryFilter]);

  // Use custom hook for data filtering
  const filteredData = useDataFiltering(
    mockShipmentData,
    search,
    countryFilter,
    categoryFilter,
    subCategoryFilter
  );

  // Use custom hook for calculating dynamic fields based on user inputs
  const calculatedData = useCalculatedFields(filteredData, userInputs);

  // Use custom hook for export functionality
  const { handleDownload } = useDataExport(tableColumns);

  // Reset page when filters change
  React.useEffect(() => {
    resetPage();
  }, [search, countryFilter, categoryFilter, subCategoryFilter, resetPage]);

  // Handle pagination
  const handlePageChange = (event, newPage) => {
    setPage(newPage);
  };

  const handleRowsPerPageChange = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle export
  const handleExport = () => {
    handleDownload(calculatedData);
  };

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: "#f8fafc",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      {/* Filters Section */}
      <Card
        elevation={0}
        sx={{
          mb: 3,
          borderRadius: 2,
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <CardContent>
          <FilterSection
            search={search}
            setSearch={setSearch}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            subCategoryFilter={subCategoryFilter}
            setSubCategoryFilter={setSubCategoryFilter}
            countries={countries}
            categories={availableCategories}
            subCategories={availableSubCategories}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            onExport={handleExport}
          />

          <ActiveFiltersChips
            search={search}
            setSearch={setSearch}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            subCategoryFilter={subCategoryFilter}
            setSubCategoryFilter={setSubCategoryFilter}
            hasActiveFilters={hasActiveFilters}
          />

          {/* Data Table */}
          <Box sx={{ mt: 1 }}>
            <Divider sx={{ mb: 1 }} />
            <DataTable
              columns={tableColumns}
              data={calculatedData}
              page={page}
              rowsPerPage={rowsPerPage}
              onPageChange={handlePageChange}
              onRowsPerPageChange={handleRowsPerPageChange}
              userInputs={userInputs}
              onUserInputChange={handleUserInputChange}
            />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalesForecastTable;
