import { useMemo } from "react";

// Utility function to calculate totals for numeric columns
const calculateTotals = (data, columns) => {
  const totals = {};
  columns?.forEach((col) => {
    if (col.id === "COUNTRY") {
      totals[col.id] = "TOTAL";
    } else if (
      col.id === "CATEGORY" ||
      col.id === "SUB_CATEGORY" ||
      col.id === "BUSINESS_UNIT"
    ) {
      totals[col.id] = "";
    } else if (col.isUserInput) {
      totals[col.id] = "";
    } else if (col.id === "RUN_RATE_VS_FORECAST_MO") {
      totals[col.id] =
        (totals["RUN_RATE_FORECAST"] /
          totals["TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH"]) *
        100;
    } else {
      const sum = data?.reduce((acc, row) => {
        const value = parseFloat(row[col.id]) || 0;
        return acc + value;
      }, 0);
      totals[col.id] = sum;
    }
  });
  return totals;
};

const useDataTable = ({
  data,
  columns,
  page,
  rowsPerPage,
  userInputs,
  onUserInputChange,
}) => {
  // Calculate totals for all data (not just current page)
  const totals = useMemo(() => calculateTotals(data, columns), [data, columns]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, page, rowsPerPage]);

  // Separate frozen columns (first 4 essential columns) from scrollable columns
  const frozenColumns = useMemo(() => {
    // Always include the first 4 essential columns if they exist
    const essentialColumnIds = [
      "COUNTRY",
      "BUSINESS_UNIT",
      "CATEGORY",
      "SUB_CATEGORY",
    ];
    return columns?.filter((col) => essentialColumnIds.includes(col.id)) || [];
  }, [columns]);

  const scrollableColumns = useMemo(() => {
    // Include all columns except the essential frozen ones
    const essentialColumnIds = [
      "COUNTRY",
      "BUSINESS_UNIT",
      "CATEGORY",
      "SUB_CATEGORY",
    ];
    return columns?.filter((col) => !essentialColumnIds.includes(col.id)) || [];
  }, [columns]);

  // Check if column is basic info (frozen column)
  const isBasicInfoColumn = (columnId) => {
    return ["COUNTRY", "BUSINESS_UNIT", "CATEGORY", "SUB_CATEGORY"].includes(
      columnId
    );
  };

  // Check if column is frozen (first 4 columns)
  const isFrozenColumn = (columnId) => {
    return frozenColumns.some((col) => col.id === columnId);
  };

  // Handle user input validation
  const handleUserInput = (rowIndex, columnId, value) => {
    // Allow empty string, minus sign, or valid numbers
    if (
      value === "" ||
      value === "-" ||
      (!isNaN(value) && value >= -1000 && value <= 1000)
    ) {
      onUserInputChange(page * rowsPerPage + rowIndex, columnId, value);
    }
  };

  // Handle user input blur (validation on blur)
  const handleUserInputBlur = (rowIndex, columnId, value) => {
    const numValue = parseFloat(value);
    if (!isNaN(numValue)) {
      // Ensure value is within bounds
      const clampedValue = Math.max(-1000, Math.min(1000, numValue));
      onUserInputChange(
        page * rowsPerPage + rowIndex,
        columnId,
        clampedValue.toString()
      );
    }
  };

  // Get user input value for specific cell
  const getUserInputValue = (rowIndex, columnId) => {
    return userInputs[`${page * rowsPerPage + rowIndex}-${columnId}`] || "";
  };

  return {
    totals,
    paginatedData,
    frozenColumns,
    scrollableColumns,
    isBasicInfoColumn,
    isFrozenColumn,
    handleUserInput,
    handleUserInputBlur,
    getUserInputValue,
    hasData: data && data.length > 0,
  };
};

export default useDataTable;
