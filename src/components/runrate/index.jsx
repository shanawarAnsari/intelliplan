import React, { useState } from "react";
import { Box, Card, CardContent, Divider } from "@mui/material";
import { mockShipmentData } from "./mockData";
import { tableColumns } from "./constants";
import {
  useTableState,
  useDataFiltering,
  useDataExport,
  useCalculatedFields,
  useColumnVisibility,
  useDataAggregation,
} from "./hooks";
import { FilterSection, ActiveFiltersChips } from "./FilterSection";
import DataTable from "./DataTable";

const SalesForecastTable = () => {
  // Extract unique values for hierarchical filter dropdowns
  const countries = [...new Set(mockShipmentData.map((row) => row.COUNTRY))].sort();
  const businessUnits = [
    ...new Set(mockShipmentData.map((row) => row.BUSINESS_UNIT)),
  ].sort();

  // Get business units filtered by selected country
  const getAvailableBusinessUnits = (countryFilter) => {
    const filtered = countryFilter
      ? mockShipmentData.filter((row) => row.COUNTRY === countryFilter)
      : mockShipmentData;
    return [...new Set(filtered.map((row) => row.BUSINESS_UNIT))].sort();
  };

  // Get categories filtered by selected country and business unit
  const getAvailableCategories = (countryFilter, businessUnitFilter) => {
    let filtered = mockShipmentData;
    if (countryFilter) {
      filtered = filtered.filter((row) => row.COUNTRY === countryFilter);
    }
    if (businessUnitFilter) {
      filtered = filtered.filter((row) => row.BUSINESS_UNIT === businessUnitFilter);
    }
    return [...new Set(filtered.map((row) => row.CATEGORY))].sort();
  };

  // Get sub-categories filtered by selected country, business unit, and category
  const getAvailableSubCategories = (
    countryFilter,
    businessUnitFilter,
    categoryFilter
  ) => {
    let filtered = mockShipmentData;
    if (countryFilter) {
      filtered = filtered.filter((row) => row.COUNTRY === countryFilter);
    }
    if (businessUnitFilter) {
      filtered = filtered.filter((row) => row.BUSINESS_UNIT === businessUnitFilter);
    }
    if (categoryFilter && categoryFilter.length > 0) {
      filtered = filtered.filter((row) => categoryFilter.includes(row.CATEGORY));
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
    runRateOption,
    setRunRateOption,
    levelFilter,
    setLevelFilter,
    clearFilters,
    handleUserInputChange,
    resetPage,
    hasActiveFilters,
  } = useTableState();

  // Add state for business unit filter
  const [businessUnitFilter, setBusinessUnitFilter] = useState("");

  // Use column visibility hook
  const { visibleColumns, handleVisibilityChange, getVisibleColumns } =
    useColumnVisibility(tableColumns);

  // Get available options based on current filters
  const availableBusinessUnits = React.useMemo(
    () => getAvailableBusinessUnits(countryFilter),
    [countryFilter]
  );

  const availableCategories = React.useMemo(
    () => getAvailableCategories(countryFilter, businessUnitFilter),
    [countryFilter, businessUnitFilter]
  );

  const availableSubCategories = React.useMemo(
    () =>
      getAvailableSubCategories(countryFilter, businessUnitFilter, categoryFilter),
    [countryFilter, businessUnitFilter, categoryFilter]
  );

  // Clear dependent filters when parent filter changes
  React.useEffect(() => {
    if (businessUnitFilter && !availableBusinessUnits.includes(businessUnitFilter)) {
      setBusinessUnitFilter("");
    }
  }, [availableBusinessUnits, businessUnitFilter]);

  React.useEffect(() => {
    if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
      const validCategories = categoryFilter.filter((cat) =>
        availableCategories.includes(cat)
      );
      if (validCategories.length !== categoryFilter.length) {
        setCategoryFilter(validCategories);
      }
    }
  }, [availableCategories, categoryFilter, setCategoryFilter]);

  React.useEffect(() => {
    if (Array.isArray(subCategoryFilter) && subCategoryFilter.length > 0) {
      const validSubCategories = subCategoryFilter.filter((subCat) =>
        availableSubCategories.includes(subCat)
      );
      if (validSubCategories.length !== subCategoryFilter.length) {
        setSubCategoryFilter(validSubCategories);
      }
    }
  }, [availableSubCategories, subCategoryFilter, setSubCategoryFilter]);

  // Use custom hook for data filtering
  const filteredData = useDataFiltering(
    mockShipmentData,
    search,
    countryFilter,
    businessUnitFilter, // Add businessUnitFilter
    categoryFilter,
    subCategoryFilter,
    runRateOption
  );

  // Use data aggregation based on level filter
  const aggregatedData = useDataAggregation(filteredData, levelFilter);

  // Get visible columns based on run rate option and level filter
  const getFilteredVisibleColumns = () => {
    const visibleCols = getVisibleColumns();

    // Filter columns based on level filter
    let filteredCols = [...visibleCols];
    if (levelFilter === "BUSINESS_UNIT") {
      // Hide Category and SubCategory columns
      filteredCols = filteredCols.filter(
        (col) => !["CATEGORY", "SUB_CATEGORY"].includes(col.id)
      );
    } else if (levelFilter === "CATEGORY") {
      // Hide only SubCategory column
      filteredCols = filteredCols.filter((col) => col.id !== "SUB_CATEGORY");
    }

    // Filter out columns based on the runRateOption
    return filteredCols.filter((col) => {
      if (runRateOption === "13weeks") {
        return ![
          "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS",
          "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS",
        ].includes(col.id);
      } else {
        return ![
          "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS",
          "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS",
        ].includes(col.id);
      }
    });
  };

  // Use custom hook for calculating dynamic fields based on user inputs
  const calculatedData = useCalculatedFields(aggregatedData, userInputs);

  // Use custom hook for export functionality with visible columns only
  const { handleDownload } = useDataExport(getFilteredVisibleColumns());

  // Modified clearFilters function to also clear businessUnitFilter
  const handleClearAllFilters = () => {
    clearFilters();
    setBusinessUnitFilter("");
  };

  // Reset page when filters change
  React.useEffect(() => {
    resetPage();
  }, [
    search,
    countryFilter,
    businessUnitFilter, // Add businessUnitFilter
    categoryFilter,
    subCategoryFilter,
    resetPage,
    runRateOption,
    levelFilter,
  ]);

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
            clearFilters={handleClearAllFilters}
            onExport={handleExport}
            columns={tableColumns}
            visibleColumns={visibleColumns}
            onVisibilityChange={handleVisibilityChange}
            runRateOption={runRateOption}
            setRunRateOption={setRunRateOption}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            businessUnits={availableBusinessUnits}
            businessUnitFilter={businessUnitFilter}
            setBusinessUnitFilter={setBusinessUnitFilter}
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
            levelFilter={levelFilter}
            businessUnitFilter={businessUnitFilter}
            setBusinessUnitFilter={setBusinessUnitFilter}
          />

          {/* Data Table */}
          <Box sx={{ mt: 1 }}>
            <Divider sx={{ mb: 1 }} />
            <DataTable
              columns={getFilteredVisibleColumns()}
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
