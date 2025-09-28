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

export const useTableState = () => {
  const [search, setSearch] = useState("");
  const [sourceFilter, setSourceFilter] = useState("EPH_CDC");
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
      console.log(row)
      // Calculate SHIPMENTS_REMAINING_DAYS
      const shipmentsRemainingDays = calculateRemainingShipments(
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS,
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS
      );

      // Calculate ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING
      const actualShipmentsTillDate = isNaN(row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH)
        ? 0
        : row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH;
      const actualPlusRemaining = actualShipmentsTillDate + shipmentsRemainingDays;
      const runRateForecast = (actualPlusRemaining / row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH) * 100;
      return {
        ...row,
        SHIPMENTS_REMAINING_DAYS: shipmentsRemainingDays,
        ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING: actualPlusRemaining,
        RUN_RATE_VS_FORECAST_MO: runRateForecast,
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
      const lowSideGS = lowSidePercent !== 0 && ((row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH * (lowSidePercent / 100)) - row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH);
      const highSideGS = highSidePercent !== 0 && (row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH * (highSidePercent / 100)) - row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH;

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
