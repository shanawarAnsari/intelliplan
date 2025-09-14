import React from "react";
import { Box, Card, CardContent, Divider } from "@mui/material";
import { mockShipemntData } from "./mockData";
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
  // Extract unique sources for filter dropdown
  const sources = [...new Set(mockShipemntData.map((row) => row.SOURCE))];

  // Use custom hooks for state management
  const {
    search,
    setSearch,
    sourceFilter,
    setSourceFilter,
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

  // Use custom hook for data filtering
  const filteredData = useDataFiltering(mockShipemntData, search, sourceFilter);

  // Use custom hook for calculating dynamic fields based on user inputs
  const calculatedData = useCalculatedFields(filteredData, userInputs);

  // Use custom hook for export functionality
  const { handleDownload } = useDataExport(tableColumns);

  // Reset page when filters change
  React.useEffect(() => {
    resetPage();
  }, [search, sourceFilter, resetPage]);

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
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
            sources={sources}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            onExport={handleExport}
          />

          <ActiveFiltersChips
            search={search}
            setSearch={setSearch}
            sourceFilter={sourceFilter}
            setSourceFilter={setSourceFilter}
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
