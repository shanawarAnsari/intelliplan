import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Alert,
  CircularProgress,
  Typography,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";

import { tableColumns } from "./constants";
import {
  useTableState,
  useDataFiltering,
  useDataExport,
  useCalculatedFields,
  useColumnVisibility,
  useDataAggregation,
} from "./hooks/useTableState";
import { FilterSection, ActiveFiltersChips } from "./FilterSection";
import DataTable from "./DataTable";
import { useRunRateData } from "./hooks/useRunRate";
import { getUniqueValues, getFilteredValues } from "./utils/filterUtils";

const SalesForecastTable = () => {
  const { data: mockShipmentData, error, loading, refetch } = useRunRateData();
  const [businessUnitFilter, setBusinessUnitFilter] = useState([]);

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
    hasActiveFilters: getHasActiveFilters,
  } = useTableState();

  // Calculate hasActiveFilters with businessUnitFilter
  const hasActiveFilters = getHasActiveFilters(
    categoryFilter,
    subCategoryFilter,
    businessUnitFilter
  );

  // Use column visibility hook
  const { visibleColumns, handleVisibilityChange, getVisibleColumns } =
    useColumnVisibility(tableColumns);

  // Extract unique values using utility function
  const countries = useMemo(
    () => getUniqueValues(mockShipmentData, "COUNTRY"),
    [mockShipmentData]
  );

  // Get available options based on current filters
  const availableBusinessUnits = useMemo(
    () =>
      getFilteredValues(mockShipmentData, "BUSINESS_UNIT", {
        COUNTRY: countryFilter,
      }),
    [mockShipmentData, countryFilter]
  );

  const availableCategories = useMemo(
    () =>
      getFilteredValues(mockShipmentData, "CATEGORY", {
        COUNTRY: countryFilter,
        BUSINESS_UNIT: businessUnitFilter,
      }),
    [mockShipmentData, countryFilter, businessUnitFilter]
  );

  const availableSubCategories = useMemo(
    () =>
      getFilteredValues(mockShipmentData, "SUB_CATEGORY", {
        COUNTRY: countryFilter,
        BUSINESS_UNIT: businessUnitFilter,
        CATEGORY: categoryFilter,
      }),
    [mockShipmentData, countryFilter, businessUnitFilter, categoryFilter]
  );

  // Clear dependent filters when parent filter changes
  useEffect(() => {
    if (Array.isArray(businessUnitFilter) && businessUnitFilter.length > 0) {
      const validBusinessUnits = businessUnitFilter.filter((bu) =>
        availableBusinessUnits.includes(bu)
      );
      if (validBusinessUnits.length !== businessUnitFilter.length) {
        setBusinessUnitFilter(validBusinessUnits);
      }
    }
  }, [availableBusinessUnits, businessUnitFilter]);

  useEffect(() => {
    if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
      const validCategories = categoryFilter.filter((cat) =>
        availableCategories.includes(cat)
      );
      if (validCategories.length !== categoryFilter.length) {
        setCategoryFilter(validCategories);
      }
    }
  }, [availableCategories, categoryFilter, setCategoryFilter]);

  useEffect(() => {
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
    businessUnitFilter,
    categoryFilter,
    subCategoryFilter,
    runRateOption
  );

  // Use data aggregation based on level filter
  const aggregatedData = useDataAggregation(filteredData, levelFilter);

  // Get visible columns based on run rate option and level filter
  const getFilteredVisibleColumns = () => {
    const visibleCols = getVisibleColumns();

    let filteredCols = [...visibleCols];
    if (levelFilter === "BUSINESS_UNIT") {
      filteredCols = filteredCols.filter(
        (col) => !["CATEGORY", "SUB_CATEGORY"].includes(col.id)
      );
    } else if (levelFilter === "CATEGORY") {
      filteredCols = filteredCols.filter((col) => col.id !== "SUB_CATEGORY");
    }

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

  // Use custom hook for calculating dynamic fields
  const calculatedData = useCalculatedFields(aggregatedData, userInputs);

  // Use custom hook for export functionality - pass the filtered visible columns directly
  const { handleDownload } = useDataExport(getFilteredVisibleColumns);

  // Clear all filters including businessUnitFilter
  const handleClearAllFilters = () => {
    clearFilters();
    setBusinessUnitFilter([]);
  };

  // Reset page when filters change
  useEffect(() => {
    resetPage();
  }, [
    search,
    countryFilter,
    businessUnitFilter,
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
    // Get the filtered visible columns at export time
    const visibleCols = getFilteredVisibleColumns();
    handleDownload(calculatedData, userInputs, visibleCols);
  };

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "400px",
          gap: 2,
        }}
      >
        <CircularProgress size={60} thickness={4} />
        <Typography variant="h6" color="text.secondary">
          Loading Run Rate Data...
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Please wait while we fetch the latest data
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          icon={<ErrorOutlineIcon fontSize="large" />}
          action={
            <Button
              color="inherit"
              size="small"
              startIcon={<RefreshIcon />}
              onClick={refetch}
            >
              Retry
            </Button>
          }
          sx={{
            "& .MuiAlert-message": {
              width: "100%",
            },
          }}
        >
          <Typography variant="h6" gutterBottom>
            Failed to Load Data
          </Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  // Check for null or empty data AFTER loading is complete
  if (!mockShipmentData || mockShipmentData.length === 0) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">
          <Typography variant="h6" gutterBottom>
            No Data Available
          </Typography>
          <Typography variant="body2">
            There is no run rate data available at this time.
          </Typography>
        </Alert>
      </Box>
    );
  }

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: "#f8fafc",
        background: "linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)",
      }}
    >
      <Card
        elevation={0}
        sx={{
          mb: 2,
          borderRadius: 2,
          boxShadow:
            "0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)",
        }}
      >
        <CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
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
