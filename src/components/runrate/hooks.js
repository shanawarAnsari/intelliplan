import { useState, useEffect } from "react";
import { saveAs } from "file-saver";

// Utility function to calculate remaining weekdays and weekends in current month
const calculateRemainingDays = () => {
  const today = new Date();
  const currentYear = today.getFullYear();
  const currentMonth = today.getMonth();
  const currentDate = today.getDate();

  // Get the last day of the current month
  const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  let remainingWeekdays = 0;
  let remainingWeekends = 0;

  // Count remaining days from tomorrow until end of month
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

  // Debug: Log the calculation (remove this in production)
  console.log(`Remaining days calculation for ${today.toDateString()}:`);
  console.log(`- Remaining weekdays: ${remainingWeekdays}`);
  console.log(`- Remaining weekends: ${remainingWeekends}`);

  return { remainingWeekdays, remainingWeekends };
};

// Function to calculate shipments for remaining days based on run rate
const calculateRemainingShipments = (weekdayRunRate, weekendRunRate) => {
  const { remainingWeekdays, remainingWeekends } = calculateRemainingDays();

  // Handle NaN values
  const safeWeekdayRate =
    isNaN(weekdayRunRate) || weekdayRunRate === null ? 0 : weekdayRunRate;
  const safeWeekendRate =
    isNaN(weekendRunRate) || weekendRunRate === null ? 0 : weekendRunRate;

  const weekdayShipments = remainingWeekdays * safeWeekdayRate;
  const weekendShipments = remainingWeekends * safeWeekendRate;
  const total = weekdayShipments + weekendShipments;

  // Enhanced logging for debugging
  console.log(
    `🚢 Shipments calculation for rates - Weekday: ${safeWeekdayRate}, Weekend: ${safeWeekendRate}`
  );
  console.log(
    `📅 Remaining days - Weekdays: ${remainingWeekdays}, Weekends: ${remainingWeekends}`
  );
  console.log(
    `💰 Calculated shipments - Weekday: ${weekdayShipments}, Weekend: ${weekendShipments}, Total: ${total}`
  );

  return total;
};

// Export utility functions for potential external use
export { calculateRemainingDays, calculateRemainingShipments };

// Hook for managing table state (pagination, search, filters)
export const useTableState = () => {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [userInputs, setUserInputs] = useState({});

  const clearFilters = () => {
    setSearch("");
    setSourceFilter("");
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
    hasActiveFilters: search || sourceFilter,
  };
};

// Hook for data filtering and processing
export const useDataFiltering = (originalData, search, sourceFilter) => {
  const [filteredData, setFilteredData] = useState(originalData);

  useEffect(() => {
    let filtered = originalData;

    if (sourceFilter) {
      filtered = filtered.filter((row) => row.SOURCE === sourceFilter);
    }

    if (search) {
      filtered = filtered.filter((row) =>
        row.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    // Calculate derived fields for each row
    const processedData = filtered.map((row, index) => {
      // Log first few rows for debugging
      if (index < 3) {
        console.log(`🔍 Processing row ${index} - Category: ${row.category}`);
        console.log(
          `📊 Weekday Rate: ${row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS}, Weekend Rate: ${row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS}`
        );
      }

      // Calculate SHIPMENTS_REMAINING_DAYS
      const shipmentsRemainingDays = calculateRemainingShipments(
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS,
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS
      );

      // Log the calculated value for first few rows
      if (index < 3) {
        console.log(
          `💫 Calculated SHIPMENTS_REMAINING_DAYS for ${row.category}: ${shipmentsRemainingDays}`
        );
      }

      // Calculate ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING
      const actualShipmentsTillDate = isNaN(row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH)
        ? 0
        : row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH;
      const actualPlusRemaining = actualShipmentsTillDate + shipmentsRemainingDays;
      return {
        ...row,
        SHIPMENTS_REMAINING_DAYS: shipmentsRemainingDays,
        ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING: actualPlusRemaining,
        // Set other calculated fields to null/empty to not populate them
        RUN_RATE_FORECAST: null,
        RUN_RATE_VS_FORECAST_MO: null,
        LOW_SIDE_GS: null,
        HIGH_SIDE_GS: null,
      };
    });

    setFilteredData(processedData);
  }, [originalData, search, sourceFilter]);

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
      const lowSideGS = (runRateForecast * lowSidePercent) / 100;
      const highSideGS = (runRateForecast * highSidePercent) / 100;

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
