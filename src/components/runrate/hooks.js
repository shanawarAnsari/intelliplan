import { useState, useEffect } from "react";
import { saveAs } from "file-saver";

const calculateRemainingDays = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  let remainingWeekdays = 0;
  let remainingWeekends = 0;
  for (let day = currentDate + 1; day <= lastDayOfMonth; day++) {
    const date = new Date(currentYear, currentMonth, day);
    const dayOfWeek = date.getDay(); // 0 = Sunday, 6 = Saturday
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      // Sunday or Saturday
      remainingWeekends++;
    } else {
      // Monday to Friday
      remainingWeekdays++;
    }
  }
  return { remainingWeekdays, remainingWeekends };
};

// Function to calculate shipments for remaining days based on run rate
const calculateRemainingShipments = (weekdayRunRate, weekendRunRate) => {
  const { remainingWeekdays, remainingWeekends } = calculateRemainingDays();
  const safeWeekdayRate =
    isNaN(weekdayRunRate) || weekdayRunRate === null ? 0 : weekdayRunRate;
  const safeWeekendRate =
    isNaN(weekendRunRate) || weekendRunRate === null ? 0 : weekendRunRate;

  const weekdayShipments = remainingWeekdays * safeWeekdayRate;
  const weekendShipments = remainingWeekends * safeWeekendRate;
  const total = weekdayShipments + weekendShipments;
  return total;
};

export { calculateRemainingDays, calculateRemainingShipments };

// Hook for managing table state (pagination, search, filters)
export const useTableState = () => {
  const [search, setSearch] = useState("");
  const [countryFilter, setCountryFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [subCategoryFilter, setSubCategoryFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userInputs, setUserInputs] = useState({});

  const clearFilters = () => {
    setSearch("");
    setCountryFilter("");
    setCategoryFilter("");
    setSubCategoryFilter("");
  };

  const handleUserInputChange = (rowIndex, columnId, value) => {
    setUserInputs((prev) => ({
      ...prev,
      [`${rowIndex}-${columnId}`]: value,
    }));
  };

  const resetPage = () => setPage(0);

  return {
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
    hasActiveFilters: search || countryFilter || categoryFilter || subCategoryFilter,
  };
};

// Hook for managing column visibility
export const useColumnVisibility = (columns) => {
  // Initially show all columns
  const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.id));

  const handleVisibilityChange = (newVisibleColumns) => {
    setVisibleColumns(newVisibleColumns);
  };

  // Get only visible columns
  const getVisibleColumns = () => {
    return columns.filter((col) => visibleColumns.includes(col.id));
  };

  return {
    visibleColumns,
    handleVisibilityChange,
    getVisibleColumns,
  };
};

// Hook for data filtering and processing
export const useDataFiltering = (
  originalData,
  search,
  countryFilter,
  categoryFilter,
  subCategoryFilter
) => {
  const [filteredData, setFilteredData] = useState(originalData);

  useEffect(() => {
    let filtered = originalData;

    // Apply hierarchical filters
    if (countryFilter) {
      filtered = filtered.filter((row) => row.COUNTRY === countryFilter);
    }

    if (categoryFilter) {
      filtered = filtered.filter((row) => row.CATEGORY === categoryFilter);
    }

    if (subCategoryFilter) {
      filtered = filtered.filter((row) => row.SUB_CATEGORY === subCategoryFilter);
    }

    // Apply search across all three fields
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.COUNTRY?.toLowerCase().includes(searchLower) ||
          row.CATEGORY?.toLowerCase().includes(searchLower) ||
          row.SUB_CATEGORY?.toLowerCase().includes(searchLower)
      );
    }

    // Calculate derived fields for each row
    const processedData = filtered.map((row, index) => {
      // Convert string values to numbers
      const parseNumericValue = (value) => {
        if (value === "" || value === null || value === undefined) return 0;
        const parsed = parseFloat(value);
        return isNaN(parsed) ? 0 : parsed;
      };

      const totalForecast = parseNumericValue(
        row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH
      );
      const weekdayRate = parseNumericValue(
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS
      );
      const weekendRate = parseNumericValue(
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS
      );
      const actualShipmentsTillDate = parseNumericValue(
        row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH
      );

      // Calculate SHIPMENTS_REMAINING_DAYS
      const shipmentsRemainingDays = calculateRemainingShipments(
        weekdayRate,
        weekendRate
      );

      // Calculate ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING
      const actualPlusRemaining = actualShipmentsTillDate + shipmentsRemainingDays;

      // Calculate RUN_RATE_FORECAST (same as ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING)
      const runRateForecast = actualPlusRemaining;

      // Calculate RUN_RATE_VS_FORECAST_MO (percentage difference)
      const runRateVsForecast =
        totalForecast > 0 ? (actualPlusRemaining / totalForecast) * 100 : 0;

      return {
        ...row,
        // Convert string values to numbers for proper display
        TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: totalForecast,
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: weekdayRate,
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: weekendRate,
        TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: actualShipmentsTillDate,
        // Calculated fields
        SHIPMENTS_REMAINING_DAYS: shipmentsRemainingDays,
        ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING: actualPlusRemaining,
        RUN_RATE_FORECAST: runRateForecast,
        RUN_RATE_VS_FORECAST_MO: runRateVsForecast,
        // Set other calculated fields to null/empty to not populate them initially
        LOW_SIDE_GS: null,
        HIGH_SIDE_GS: null,
      };
    });

    setFilteredData(processedData);
  }, [originalData, search, countryFilter, categoryFilter, subCategoryFilter]);

  return filteredData;
};

// Hook for export functionality
export const useDataExport = (columns) => {
  const handleDownload = (data) => {
    const csv = [
      columns.map((col) => col.label).join(","),
      ...data.map((row) =>
        columns
          .map((col) => {
            const value = row[col.id];
            if (col.format) {
              return col.format(value);
            }
            return typeof value === "number" ? value : value || "";
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, `sales_forecast_${new Date().toISOString().split("T")[0]}.csv`);
  };

  return { handleDownload };
};

// Hook for calculating dynamic values based on user inputs
export const useCalculatedFields = (data, userInputs) => {
  const [calculatedData, setCalculatedData] = useState(data);

  useEffect(() => {
    const updatedData = data.map((row, rowIndex) => {
      // Get user input percentages
      const lowSidePercent =
        parseFloat(userInputs[`${rowIndex}-LOW_SIDE_PERCENT`]) || 0;
      const highSidePercent =
        parseFloat(userInputs[`${rowIndex}-HIGH_SIDE_PERCENT`]) || 0;

      // Calculate LOW_SIDE_GS and HIGH_SIDE_GS based on RUN_RATE_FORECAST
      const runRateForecast = row.RUN_RATE_FORECAST || 0;
      const lowSideGS =
        runRateForecast > 0 && lowSidePercent > 0
          ? (runRateForecast * lowSidePercent) / 100 - runRateForecast
          : 0;
      const highSideGS =
        runRateForecast > 0 && highSidePercent > 0
          ? (runRateForecast * highSidePercent) / 100 - runRateForecast
          : 0;

      // Debug logging for first few rows
      if (rowIndex < 3) {
        console.log(`💰 Calculating GS for row ${rowIndex}:`);
        console.log(`- Run Rate Forecast: ${runRateForecast}`);
        console.log(
          `- Low Side %: ${lowSidePercent}%, High Side %: ${highSidePercent}%`
        );
        console.log(`- Low Side GS: ${lowSideGS}, High Side GS: ${highSideGS}`);
      }

      return {
        ...row,
        LOW_SIDE_GS: lowSideGS,
        HIGH_SIDE_GS: highSideGS,
      };
    });

    setCalculatedData(updatedData);
  }, [data, userInputs]);

  return calculatedData;
};
