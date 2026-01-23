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
  const [countryFilter, setCountryFilter] = useState(["US"]);
  const [categoryFilter, setCategoryFilter] = useState([]);
  const [subCategoryFilter, setSubCategoryFilter] = useState([]);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userInputs, setUserInputs] = useState({});
  const [runRateOption, setRunRateOption] = useState("13weeks");
  const [levelFilter, setLevelFilter] = useState("SUB_CATEGORY"); // New state for level filter

  const clearFilters = () => {
    setSearch("");
    setCategoryFilter([]);
    setSubCategoryFilter([]);
  };

  const handleUserInputChange = (rowIndex, columnId, value) => {
    setUserInputs((prev) => ({
      ...prev,
      [`${rowIndex}-${columnId}`]: value,
    }));
  };

  const resetPage = () => setPage(0);

  // Changed to a function that accepts filters as parameters
  const hasActiveFilters = (categoryFilter, subCategoryFilter, businessUnitFilter) =>
    search ||
    (Array.isArray(businessUnitFilter) && businessUnitFilter.length > 0) ||
    (Array.isArray(categoryFilter) && categoryFilter.length > 0) ||
    (Array.isArray(subCategoryFilter) && subCategoryFilter.length > 0);

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
    runRateOption,
    setRunRateOption,
    levelFilter,
    setLevelFilter,
    clearFilters,
    handleUserInputChange,
    resetPage,
    hasActiveFilters,
  };
};

// Hook for managing column visibility
export const useColumnVisibility = (columns) => {
  // Essential columns that cannot be hidden
  const ESSENTIAL_COLUMNS = ["COUNTRY", "BUSINESS_UNIT", "CATEGORY", "SUB_CATEGORY"];

  // Initially show all columns
  const [visibleColumns, setVisibleColumns] = useState(columns.map((col) => col.id));

  const handleVisibilityChange = (newVisibleColumns) => {
    // Ensure essential columns are always included
    const finalVisibleColumns = [
      ...new Set([...ESSENTIAL_COLUMNS, ...newVisibleColumns]),
    ];
    setVisibleColumns(finalVisibleColumns);
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
  businessUnitFilter,
  categoryFilter,
  subCategoryFilter,
  runRateOption
) => {
  const [filteredData, setFilteredData] = useState(null); // Changed from originalData to null

  useEffect(() => {
    // Handle null/undefined data during initial load
    if (!originalData) {
      setFilteredData(null);
      return;
    }

    let filtered = originalData || [];

    // Apply hierarchical filters
    if (countryFilter) {
      filtered = filtered?.filter((row) => row.COUNTRY === countryFilter);
    }

    if (Array.isArray(businessUnitFilter) && businessUnitFilter.length > 0) {
      filtered = filtered?.filter((row) =>
        businessUnitFilter.includes(row.BUSINESS_UNIT)
      );
    }

    if (Array.isArray(categoryFilter) && categoryFilter.length > 0) {
      filtered = filtered?.filter((row) => categoryFilter.includes(row.CATEGORY));
    }

    if (Array.isArray(subCategoryFilter) && subCategoryFilter.length > 0) {
      filtered = filtered?.filter((row) =>
        subCategoryFilter.includes(row.SUB_CATEGORY)
      );
    }

    // Apply search across all fields
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (row) =>
          row.BUSINESS_UNIT?.toLowerCase().includes(searchLower) ||
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

      // Use selected run rate option
      const weekdayRate =
        runRateOption === "13weeks"
          ? parseNumericValue(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS)
          : parseNumericValue(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS);

      const weekendRate =
        runRateOption === "13weeks"
          ? parseNumericValue(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS)
          : parseNumericValue(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS);

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
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: parseNumericValue(
          row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS
        ),
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: parseNumericValue(
          row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS
        ),
        AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS: parseNumericValue(
          row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS
        ),
        AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS: parseNumericValue(
          row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS
        ),
        TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: actualShipmentsTillDate,
        // Store the currently used rates for reference
        CURRENT_WEEKDAY_RATE: weekdayRate,
        CURRENT_WEEKEND_RATE: weekendRate,
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
  }, [
    originalData,
    search,
    countryFilter,
    businessUnitFilter,
    categoryFilter,
    subCategoryFilter,
    runRateOption,
  ]);

  return filteredData;
};

// Hook for export functionality
export const useDataExport = (getVisibleColumnsFunc) => {
  const handleDownload = (data, userInputs = {}, visibleColumns = null) => {
    if (!data || data.length === 0) {
      alert("No data to export");
      return;
    }

    // Get visible columns either from parameter or by calling the function
    let columns;
    if (visibleColumns) {
      columns = visibleColumns;
    } else if (typeof getVisibleColumnsFunc === "function") {
      columns = getVisibleColumnsFunc();
    } else {
      alert("Cannot determine visible columns");
      return;
    }

    // Create CSV header
    const headers = columns.map((col) => col.label).join(",");

    // Create CSV rows with actual displayed values
    const rows = data.map((row, rowIndex) => {
      return columns
        .map((col) => {
          let value;

          // Handle user input columns
          if (col.isUserInput) {
            const inputKey = `${rowIndex}-${col.id}`;
            value = userInputs[inputKey] || "";
          } else {
            // Get the actual value from the row
            value = row[col.id];

            // Format the value if formatter exists
            if (col.format && value !== null && value !== undefined) {
              const formattedValue = col.format(value);
              // Remove special characters for CSV
              value = formattedValue.replace(/[$,%]/g, "");
            } else if (value === null || value === undefined) {
              value = "";
            }
          }

          // Escape commas and quotes for CSV
          const stringValue = String(value);
          if (
            stringValue.includes(",") ||
            stringValue.includes('"') ||
            stringValue.includes("\n")
          ) {
            return `"${stringValue.replace(/"/g, '""')}"`;
          }
          return stringValue;
        })
        .join(",");
    });

    // Combine headers and rows
    const csv = [headers, ...rows].join("\n");

    // Create blob and download
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `run_rate_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    link.style.visibility = "hidden";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return { handleDownload };
};

// Hook for calculating dynamic values based on user inputs
export const useCalculatedFields = (data, userInputs) => {
  const [calculatedData, setCalculatedData] = useState(data);

  useEffect(() => {
    const updatedData = data?.map((row, rowIndex) => {
      // Get user input percentages
      const lowSidePercent =
        parseFloat(userInputs[`${rowIndex}-LOW_SIDE_PERCENT`]) || 0;
      const highSidePercent =
        parseFloat(userInputs[`${rowIndex}-HIGH_SIDE_PERCENT`]) || 0;

      // Calculate LOW_SIDE_GS and HIGH_SIDE_GS based on RUN_RATE_FORECAST
      const currentMonthSnop = row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH || 0;

      const lowSideGS =
        currentMonthSnop > 0 && lowSidePercent > 0
          ? (currentMonthSnop * lowSidePercent) / 100 - currentMonthSnop
          : 0;
      const highSideGS =
        currentMonthSnop > 0 && highSidePercent > 0
          ? (currentMonthSnop * highSidePercent) / 100 - currentMonthSnop
          : 0;

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

// New function to aggregate data based on level filter
export const useDataAggregation = (filteredData, levelFilter) => {
  const [aggregatedData, setAggregatedData] = useState(null); // Changed from filteredData to null

  useEffect(() => {
    // Handle null data during initial load
    if (!filteredData) {
      setAggregatedData(null);
      return;
    }

    if (!filteredData.length) {
      setAggregatedData([]);
      return;
    }

    if (levelFilter === "SUB_CATEGORY") {
      // No aggregation needed - this is the most detailed level
      setAggregatedData(filteredData);
      return;
    }

    // Define grouping keys based on level filter
    let groupingKeys = [];
    if (levelFilter === "BUSINESS_UNIT") {
      groupingKeys = ["COUNTRY", "BUSINESS_UNIT"];
    } else if (levelFilter === "CATEGORY") {
      groupingKeys = ["COUNTRY", "BUSINESS_UNIT", "CATEGORY"];
    }

    // Group data based on keys
    const groupedData = filteredData.reduce((acc, row) => {
      // Create a composite key for grouping
      const groupKey = groupingKeys.map((key) => row[key]).join("|");

      if (!acc[groupKey]) {
        // Initialize group with base values from current row
        acc[groupKey] = {
          ...groupingKeys.reduce((obj, key) => ({ ...obj, [key]: row[key] }), {}),
          // Initialize numeric fields to zero
          TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: 0,
          AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: 0,
          AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: 0,
          AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS: 0,
          AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS: 0,
          TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: 0,
          SHIPMENTS_REMAINING_DAYS: 0,
          ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING: 0,
          RUN_RATE_FORECAST: 0,
          LOW_SIDE_GS: 0,
          HIGH_SIDE_GS: 0,
          // Other fields that need aggregation
          _count: 0, // To track number of rows in group for averaging
        };
      }

      // Add numeric values to the group
      acc[groupKey].TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH +=
        row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH || 0;
      acc[groupKey].AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS +=
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS || 0;
      acc[groupKey].AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS +=
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS || 0;
      acc[groupKey].AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS +=
        row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS || 0;
      acc[groupKey].AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS +=
        row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS || 0;
      acc[groupKey].TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH +=
        row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH || 0;
      acc[groupKey].SHIPMENTS_REMAINING_DAYS += row.SHIPMENTS_REMAINING_DAYS || 0;
      acc[groupKey].ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING +=
        row.ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING || 0;
      acc[groupKey].RUN_RATE_FORECAST += row.RUN_RATE_FORECAST || 0;
      acc[groupKey].LOW_SIDE_GS += row.LOW_SIDE_GS || 0;
      acc[groupKey].HIGH_SIDE_GS += row.HIGH_SIDE_GS || 0;
      acc[groupKey]._count++;

      return acc;
    }, {});

    // Convert grouped data back to array
    let result = Object.values(groupedData).map((group) => {
      // Calculate averages for rate-based fields if needed
      const count = group._count;

      // For run rate fields, we average them
      if (count > 0) {
        group.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS /= count;
        group.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS /= count;
        group.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS /= count;
        group.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS /= count;
      }

      // Calculate RUN_RATE_VS_FORECAST_MO based on aggregated values
      group.RUN_RATE_VS_FORECAST_MO =
        group.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH > 0
          ? (group.RUN_RATE_FORECAST /
            group.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH) *
          100
          : 0;

      // Remove helper fields
      delete group._count;

      // Add placeholder empty values for fields not relevant at this aggregation level
      if (levelFilter === "BUSINESS_UNIT") {
        group.CATEGORY = "All Categories";
        group.SUB_CATEGORY = "All Sub Categories";
      } else if (levelFilter === "CATEGORY") {
        group.SUB_CATEGORY = "All Sub Categories";
      }

      return group;
    });

    setAggregatedData(result);
  }, [filteredData, levelFilter]);

  return aggregatedData;
};
