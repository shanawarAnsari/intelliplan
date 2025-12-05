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
import { tableColumns } from "./constants";
import { useTableData } from "./hooks/useTableData";
import FilterBar from "./components/FilterBar";
import DataTable from "./DataTable";
import { useRunRateData } from "./hooks/useRunRate";

const getUniqueValues = (data, field) =>
  data ? [...new Set(data.map((r) => r[field]))].filter(Boolean).sort() : [];

const getFilteredValues = (data, field, filters = {}) => {
  if (!data) return [];
  let filtered = data;
  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      filtered =
        Array.isArray(value) && value.length
          ? filtered.filter((r) => value.includes(r[key]))
          : filtered.filter((r) => r[key] === value);
    }
  });
  return getUniqueValues(filtered, field);
};

const SalesForecastTable = () => {
  const { data: rawData, error, loading, refetch } = useRunRateData();

  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("US");
  const [businessUnitFilter, setBusinessUnitFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);
  const [levelFilter, setLevelFilter] = useState("SUB_CATEGORY");
  const [runRateOption, setRunRateOption] = useState("13weeks");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userInputs, setUserInputs] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    tableColumns.map((c) => c.id)
  );

  const countries = useMemo(() => getUniqueValues(rawData, "COUNTRY"), [rawData]);

  // Get ALL options for initial display (not filtered by selections)
  const allBusinessUnits = useMemo(
    () => getFilteredValues(rawData, "BUSINESS_UNIT", { COUNTRY: countryFilter }),
    [rawData, countryFilter]
  );

  const allCategories = useMemo(
    () => getFilteredValues(rawData, "CATEGORY", { COUNTRY: countryFilter }),
    [rawData, countryFilter]
  );

  const allSubCategories = useMemo(
    () => getFilteredValues(rawData, "SUB_CATEGORY", { COUNTRY: countryFilter }),
    [rawData, countryFilter]
  );

  // Get filtered options based on user selections (for cascading filtering AFTER selection)
  const availableCategories = useMemo(
    () =>
      businessUnitFilter?.length > 0
        ? getFilteredValues(rawData, "CATEGORY", {
            COUNTRY: countryFilter,
            BUSINESS_UNIT: businessUnitFilter,
          })
        : allCategories,
    [rawData, countryFilter, businessUnitFilter, allCategories]
  );

  const availableSubCategories = useMemo(() => {
    const filters = { COUNTRY: countryFilter };
    if (businessUnitFilter?.length > 0) {
      filters.BUSINESS_UNIT = businessUnitFilter;
    }
    if (categoryFilter?.length > 0) {
      filters.CATEGORY = categoryFilter;
    }
    return businessUnitFilter?.length > 0 || categoryFilter?.length > 0
      ? getFilteredValues(rawData, "SUB_CATEGORY", filters)
      : allSubCategories;
  }, [rawData, countryFilter, businessUnitFilter, categoryFilter, allSubCategories]);

  const filters = useMemo(
    () => ({
      search,
      country: countryFilter,
      businessUnit: businessUnitFilter,
      category: categoryFilter,
      subCategory: subCategoryFilter,
      level: levelFilter,
    }),
    [
      search,
      countryFilter,
      businessUnitFilter,
      categoryFilter,
      subCategoryFilter,
      levelFilter,
    ]
  );

  const processedData = useTableData(rawData, filters, runRateOption, userInputs);

  const hasActiveFilters =
    search ||
    businessUnitFilter?.length > 0 ||
    categoryFilter?.length > 0 ||
    subCategoryFilter?.length > 0;

  const clearFilters = () => {
    setSearch("");
    setBusinessUnitFilter([]);
    setCategoryFilter([]);
    setSubCategoryFilter([]);
  };

  const getVisibleColumns = () => {
    let cols = tableColumns.filter((c) => visibleColumns.includes(c.id));
    if (levelFilter === "BUSINESS_UNIT")
      cols = cols.filter((c) => !["CATEGORY", "SUB_CATEGORY"].includes(c.id));
    else if (levelFilter === "CATEGORY")
      cols = cols.filter((c) => c.id !== "SUB_CATEGORY");
    return cols.filter((c) => {
      if (runRateOption === "13weeks") {
        return ![
          "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS",
          "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS",
        ].includes(c.id);
      }
      return ![
        "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS",
        "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS",
      ].includes(c.id);
    });
  };

  const handleExport = () => {
    if (!processedData?.length) return alert("No data to export");
    const cols = getVisibleColumns();
    const headers = cols.map((c) => c.label).join(",");
    const rows = processedData.map((row, rowIndex) =>
      cols
        .map((c) => {
          let val;
          // Handle user input columns - use the same key format as DataTable
          if (c.isUserInput) {
            val = userInputs[`${rowIndex}-${c.id}`] || "";
          } else {
            val = row[c.id];
            if (c.format && val != null) val = c.format(val).replace(/[$,%]/g, "");
          }
          const str = String(val || "");
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    );
    const csv = [headers, ...rows].join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `run_rate_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  useEffect(() => {
    setPage(0);
  }, [
    search,
    countryFilter,
    businessUnitFilter,
    categoryFilter,
    subCategoryFilter,
    runRateOption,
    levelFilter,
  ]);

  if (loading) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: 400,
          gap: 2,
        }}
      >
        <CircularProgress size={60} />
        <Typography variant="h6" color="text.secondary">
          Loading Run Rate Data...
        </Typography>
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert
          severity="error"
          action={
            <Button color="inherit" startIcon={<RefreshIcon />} onClick={refetch}>
              Retry
            </Button>
          }
        >
          <Typography variant="h6">Failed to Load Data</Typography>
          <Typography variant="body2">{error}</Typography>
        </Alert>
      </Box>
    );
  }

  if (!rawData?.length) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="info">No data available</Alert>
      </Box>
    );
  }

  return (
    <Box sx={{ p: 1 }}>
      <Card elevation={3} sx={{ borderRadius: 1, background: "#111827" }}>
        <CardContent sx={{ pt: 1, "&:last-child": { pb: 1 } }}>
          <FilterBar
            search={search}
            setSearch={setSearch}
            countries={countries}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            levelFilter={levelFilter}
            setLevelFilter={setLevelFilter}
            runRateOption={runRateOption}
            setRunRateOption={setRunRateOption}
            businessUnits={allBusinessUnits}
            businessUnitFilter={businessUnitFilter}
            setBusinessUnitFilter={setBusinessUnitFilter}
            categories={availableCategories}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            subCategories={availableSubCategories}
            subCategoryFilter={subCategoryFilter}
            setSubCategoryFilter={setSubCategoryFilter}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            onExport={handleExport}
            columns={tableColumns}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
          />
          <Divider sx={{ my: 1 }} />
          <DataTable
            columns={getVisibleColumns()}
            data={processedData}
            page={page}
            rowsPerPage={rowsPerPage}
            onPageChange={(e, p) => setPage(p)}
            onRowsPerPageChange={(e) => {
              setRowsPerPage(parseInt(e.target.value, 10));
              setPage(0);
            }}
            userInputs={userInputs}
            onUserInputChange={(idx, col, val) =>
              setUserInputs((prev) => ({ ...prev, [`${idx}-${col}`]: val }))
            }
          />
        </CardContent>
      </Card>
    </Box>
  );
};

export default SalesForecastTable;
