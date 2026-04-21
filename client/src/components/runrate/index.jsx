import React, { useState, useMemo, useEffect } from "react";
import {
  Box,
  Card,
  CardContent,
  Divider,
  Alert,
  Typography,
  Button,
} from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";
import { tableColumns } from "./constants";
import { useRunRateData } from "./hooks/useRunRate";
import {
  aggregateDataByLevels,
  getColumnsForLevels,
} from "./utils/aggregationUtils";
import { FilterSection } from "./FilterSection";
import DataTable from "./DataTable";
import { Loader } from "../../utils/Loader";

const getUniqueValues = (data, field) =>
  data ? [...new Set(data.map((r) => r[field]))].filter(Boolean).sort() : [];

const getFilteredValues = (data, field, filters = {}) => {
  if (!data) return [];
  let filtered = data;
  Object.entries(filters).forEach(([key, value]) => {
    if (value && Array.isArray(value) && value.length > 0) {
      filtered = filtered.filter((r) => value.includes(r[key]));
    }
  });
  return getUniqueValues(filtered, field);
};

const SalesForecastTable = () => {
  const { data: rawData, error, loading, refetch } = useRunRateData();

  const [search, setSearch] = useState("");
  const [regionFilter, setRegionFilter] = useState([]);
  const [countryFilter, setCountryFilter] = useState([]);
  const [businessUnitFilter, setBusinessUnitFilter] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);
  const [selectedLevels, setSelectedLevels] = useState([
    "REGION",
    "COUNTRY",
    "BUSINESS_UNIT",
    "CATEGORY",
    "SUB_CATEGORY",
  ]);

  // Handler to reset userInputs
  const resetUserInputs = () => setUserInputs({});

  // Wrap setSelectedLevels to also reset userInputs
  const handleSetSelectedLevels = (levels) => {
    setSelectedLevels(levels);
    resetUserInputs();
  };
  const [runRateOption, setRunRateOption] = useState("13weeks");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userInputs, setUserInputs] = useState({});
  const [visibleColumns, setVisibleColumns] = useState(
    tableColumns.map((c) => c.id),
  );

  // Get unique values
  const regions = useMemo(() => getUniqueValues(rawData, "REGION"), [rawData]);
  const countries = useMemo(() => getUniqueValues(rawData, "COUNTRY"), [rawData]);
  const allBusinessUnits = useMemo(
    () =>
      getFilteredValues(rawData, "BUSINESS_UNIT", {
        REGION: regionFilter,
        COUNTRY: countryFilter,
      }),
    [rawData, regionFilter, countryFilter],
  );
  const allCategories = useMemo(
    () =>
      getFilteredValues(rawData, "CATEGORY", {
        REGION: regionFilter,
        COUNTRY: countryFilter,
        BUSINESS_UNIT: businessUnitFilter,
      }),
    [rawData, regionFilter, countryFilter, businessUnitFilter],
  );
  const allSubCategories = useMemo(
    () =>
      getFilteredValues(rawData, "SUB_CATEGORY", {
        REGION: regionFilter,
        COUNTRY: countryFilter,
        BUSINESS_UNIT: businessUnitFilter,
        CATEGORY: categoryFilter,
      }),
    [rawData, regionFilter, countryFilter, businessUnitFilter, categoryFilter],
  );

  // Filter data
  const filteredData = useMemo(() => {
    if (!rawData) return [];
    let data = rawData;

    if (search) {
      const s = search.toLowerCase();
      data = data.filter(
        (r) =>
          r.REGION?.toLowerCase().includes(s) ||
          r.COUNTRY?.toLowerCase().includes(s) ||
          r.BUSINESS_UNIT?.toLowerCase().includes(s) ||
          r.CATEGORY?.toLowerCase().includes(s) ||
          r.SUB_CATEGORY?.toLowerCase().includes(s),
      );
    }

    if (regionFilter.length > 0)
      data = data.filter((r) => regionFilter.includes(r.REGION));
    if (countryFilter.length > 0)
      data = data.filter((r) => countryFilter.includes(r.COUNTRY));
    if (businessUnitFilter.length > 0)
      data = data.filter((r) => businessUnitFilter.includes(r.BUSINESS_UNIT));
    if (categoryFilter.length > 0)
      data = data.filter((r) => categoryFilter.includes(r.CATEGORY));
    if (subCategoryFilter.length > 0)
      data = data.filter((r) => subCategoryFilter.includes(r.SUB_CATEGORY));

    return data.map((row) => {
      const parseNumeric = (val) => {
        const p = parseFloat(val);
        return isNaN(p) ? 0 : p;
      };

      const totalForecast = parseNumeric(
        row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH,
      );
      const weekday13 = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS);
      const weekend13 = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS);
      const weekday8 = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS);
      const weekend8 = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS);
      const actualShips = parseNumeric(row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH);

      const { remainingWeekdays, remainingWeekends } = (() => {
        const today = new Date();
        const year = today.getFullYear();
        const month = today.getMonth();
        const day = today.getDate();
        const lastDay = new Date(year, month + 1, 0).getDate();
        let rwd = 0,
          rwk = 0;
        for (let d = day; d <= lastDay; d++) {
          const dow = new Date(year, month, d).getDay();
          if (dow === 0 || dow === 6) rwk++;
          else rwd++;
        }
        return { remainingWeekdays: rwd, remainingWeekends: rwk };
      })();

      const weekdayRate = runRateOption === "13weeks" ? weekday13 : weekday8;
      const weekendRate = runRateOption === "13weeks" ? weekend13 : weekend8;
      const shipmentsRemaining =
        remainingWeekdays * weekdayRate + remainingWeekends * weekendRate;
      const runRateForecast = actualShips + shipmentsRemaining;
      const runRateVsForecast =
        totalForecast > 0 ? (runRateForecast / totalForecast) * 100 : 0;

      return {
        ...row,
        TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: totalForecast,
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: weekday13,
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: weekend13,
        AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS: weekday8,
        AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS: weekend8,
        TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: actualShips,
        SHIPMENTS_REMAINING_DAYS: shipmentsRemaining,
        RUN_RATE_FORECAST: runRateForecast,
        RUN_RATE_VS_FORECAST_MO: runRateVsForecast,
        LOW_SIDE_GS: null,
        HIGH_SIDE_GS: null,
      };
    });
  }, [
    rawData,
    search,
    regionFilter,
    countryFilter,
    businessUnitFilter,
    categoryFilter,
    subCategoryFilter,
    runRateOption,
  ]);

  // Aggregate data based on selected levels
  const aggregatedData = useMemo(
    () => aggregateDataByLevels(filteredData, selectedLevels),
    [filteredData, selectedLevels],
  );

  // Apply user inputs to aggregated data
  const processedData = useMemo(() => {
    if (!aggregatedData) return [];
    return aggregatedData.map((row, idx) => {
      const lowPercent = parseFloat(userInputs[`${idx}-LOW_SIDE_PERCENT`]) || 0;
      const highPercent = parseFloat(userInputs[`${idx}-HIGH_SIDE_PERCENT`]) || 0;
      const forecast = row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH || 0;

      return {
        ...row,
        LOW_SIDE_GS:
          forecast > 0 && lowPercent > 0
            ? (forecast * lowPercent) / 100 - forecast
            : 0,
        HIGH_SIDE_GS:
          forecast > 0 && highPercent > 0
            ? (forecast * highPercent) / 100 - forecast
            : 0,
      };
    });
  }, [aggregatedData, userInputs]);

  const hasActiveFilters =
    search ||
    regionFilter.length > 0 ||
    countryFilter.length > 0 ||
    businessUnitFilter.length > 0 ||
    categoryFilter.length > 0 ||
    subCategoryFilter.length > 0;

  const clearFilters = () => {
    setSearch("");
    setRegionFilter([]);
    setCountryFilter([]);
    setBusinessUnitFilter([]);
    setCategoryFilter([]);
    setSubCategoryFilter([]);
  };

  // Get columns for selected levels
  const visibleColumnsForLevels = useMemo(
    () => getColumnsForLevels(tableColumns, selectedLevels),
    [selectedLevels],
  );

  const getVisibleColumns = () => {
    let cols = visibleColumnsForLevels.filter((c) => visibleColumns.includes(c.id));
    if (runRateOption === "13weeks") {
      cols = cols.filter(
        (c) =>
          ![
            "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS",
            "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS",
          ].includes(c.id),
      );
    } else {
      cols = cols.filter(
        (c) =>
          ![
            "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS",
            "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS",
          ].includes(c.id),
      );
    }
    return cols;
  };

  const handleExport = () => {
    if (!processedData?.length) return alert("No data to export");

    const cols = getVisibleColumns();
    const headers = cols.map((c) => c.label).join(",");

    // Helper to normalize numeric values
    const toNumber = (val) => {
      const num = Number(String(val).replace(/[$,%]/g, ""));
      return isNaN(num) ? 0 : num;
    };

    // Build data rows
    const rows = processedData.map((row, rowIndex) =>
      cols
        .map((c) => {
          let val;

          if (c.isUserInput) {
            val = userInputs[`${rowIndex}-${c.id}`] || "";
          } else {
            val = row[c.id];
            if (c.format && val != null) {
              val = c.format(val).replace(/[$,%]/g, "");
            }
          }
          const str = String(val ?? "");
          return str.includes(",") || str.includes('"')
            ? `"${str.replace(/"/g, '""')}"`
            : str;
        })
        .join(",")
    );
    // Build TOTAL row
    const EXCLUDED_TOTAL_COLUMNS = [
      "Run rate forecast vs M-O - S&OP forecast for MO"
    ];

    const totalRow = cols
      .map((c, colIndex) => {
        if (colIndex === 0) return "TOTAL"; // first column label

        if (EXCLUDED_TOTAL_COLUMNS.includes(c.label)) {
          return "";
        }

        if (c.isUserInput) return ""; // skip user-input cols

        const total = processedData.reduce((sum, row, rowIndex) => {
          let val = c.isUserInput
            ? userInputs[`${rowIndex}-${c.id}`]
            : row[c.id];

          if (c.format && val != null) {
            val = c.format(val);
          }

          return sum + toNumber(val);
        }, 0);

        return total ? total.toString() : "";
      })
      .join(",");

    const csv = [headers, ...rows, totalRow].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `run_rate_${new Date().toISOString().split("T")[0]}.csv`;
    link.click();
  };

  useEffect(
    () => setPage(0),
    [
      search,
      regionFilter,
      countryFilter,
      businessUnitFilter,
      categoryFilter,
      subCategoryFilter,
      selectedLevels,
      runRateOption,
    ],
  );

  if (loading) {
    return (
      <Box sx={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center"
      }}>
        <Loader />
        <Typography variant="h6" color="text.secondary" sx={{ mt: -12 }}>
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
          <FilterSection
            search={search}
            setSearch={setSearch}
            regions={regions}
            regionFilter={regionFilter}
            setRegionFilter={setRegionFilter}
            countries={countries}
            countryFilter={countryFilter}
            setCountryFilter={setCountryFilter}
            categoryFilter={categoryFilter}
            setCategoryFilter={setCategoryFilter}
            subCategoryFilter={subCategoryFilter}
            setSubCategoryFilter={setSubCategoryFilter}
            categories={allCategories}
            subCategories={allSubCategories}
            hasActiveFilters={hasActiveFilters}
            clearFilters={clearFilters}
            onExport={handleExport}
            columns={tableColumns}
            visibleColumns={visibleColumns}
            onVisibilityChange={setVisibleColumns}
            runRateOption={runRateOption}
            setRunRateOption={setRunRateOption}
            selectedLevels={selectedLevels}
            setSelectedLevels={handleSetSelectedLevels}
            businessUnits={allBusinessUnits}
            businessUnitFilter={businessUnitFilter}
            setBusinessUnitFilter={setBusinessUnitFilter}
            userInputs={userInputs}
            resetUserInputs={resetUserInputs}
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