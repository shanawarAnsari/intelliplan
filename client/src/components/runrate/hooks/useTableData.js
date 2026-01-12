import { useState, useEffect, useMemo } from "react";
import { calculateRowMetrics } from "../utils/calculations";

export const useTableData = (rawData, filters, runRateOption, userInputs) => {
  const [processedData, setProcessedData] = useState(null);

  // Filter data
  const filteredData = useMemo(() => {
    if (!rawData) return null;
    let data = rawData;

    // Apply filters - only filter if countries are selected
    if (filters.country?.length > 0)
      data = data.filter((r) => filters.country.includes(r.COUNTRY));
    if (filters.businessUnit?.length > 0)
      data = data.filter((r) => filters.businessUnit.includes(r.BUSINESS_UNIT));
    if (filters.category?.length > 0)
      data = data.filter((r) => filters.category.includes(r.CATEGORY));
    if (filters.subCategory?.length > 0)
      data = data.filter((r) => filters.subCategory.includes(r.SUB_CATEGORY));
    if (filters.search) {
      const search = filters.search.toLowerCase();
      data = data.filter(
        (r) =>
          r.BUSINESS_UNIT?.toLowerCase().includes(search) ||
          r.COUNTRY?.toLowerCase().includes(search) ||
          r.CATEGORY?.toLowerCase().includes(search) ||
          r.SUB_CATEGORY?.toLowerCase().includes(search)
      );
    }

    return data.map((row) => calculateRowMetrics(row, runRateOption));
  }, [rawData, filters, runRateOption]);

  // Aggregate data
  const aggregatedData = useMemo(() => {
    if (!filteredData) return null;
    if (filters.level === "SUB_CATEGORY") return filteredData;

    const groupKeys =
      filters.level === "BUSINESS_UNIT"
        ? ["COUNTRY", "BUSINESS_UNIT"]
        : ["COUNTRY", "BUSINESS_UNIT", "CATEGORY"];

    const grouped = filteredData.reduce((acc, row) => {
      const key = groupKeys.map((k) => row[k]).join("|");
      if (!acc[key]) {
        acc[key] = {
          ...groupKeys.reduce((obj, k) => ({ ...obj, [k]: row[k] }), {}),
          TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: 0,
          AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: 0,
          AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: 0,
          AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS: 0,
          AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS: 0,
          TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: 0,
          SHIPMENTS_REMAINING_DAYS: 0,
          RUN_RATE_FORECAST: 0,
          _count: 0,
        };
      }
      acc[key].TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH +=
        row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH || 0;
      acc[key].AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS +=
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS || 0;
      acc[key].AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS +=
        row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS || 0;
      acc[key].AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS +=
        row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS || 0;
      acc[key].AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS +=
        row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS || 0;
      acc[key].TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH +=
        row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH || 0;
      acc[key].SHIPMENTS_REMAINING_DAYS += row.SHIPMENTS_REMAINING_DAYS || 0;
      acc[key].RUN_RATE_FORECAST += row.RUN_RATE_FORECAST || 0;
      acc[key]._count++;
      return acc;
    }, {});

    return Object.values(grouped).map((group) => {
      const count = group._count;
      if (count > 0) {
        group.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS /= count;
        group.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS /= count;
        group.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS /= count;
        group.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS /= count;
      }
      group.RUN_RATE_VS_FORECAST_MO =
        group.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH > 0
          ? (group.RUN_RATE_FORECAST /
              group.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH) *
            100
          : 0;
      delete group._count;
      if (filters.level === "BUSINESS_UNIT") {
        group.CATEGORY = "All Categories";
        group.SUB_CATEGORY = "All Sub Categories";
      } else {
        group.SUB_CATEGORY = "All Sub Categories";
      }
      return group;
    });
  }, [filteredData, filters.level]);

  // Apply user inputs
  useEffect(() => {
    if (!aggregatedData) {
      setProcessedData(null);
      return;
    }

    const withInputs = aggregatedData.map((row, idx) => {
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

    setProcessedData(withInputs);
  }, [aggregatedData, userInputs]);

  return processedData;
};
