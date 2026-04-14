/**
 * Aggregate data based on selected levels
 * @param {Array} data - Filtered data to aggregate
 * @param {Array} selectedLevels - Selected aggregation levels (e.g., ['COUNTRY', 'BUSINESS_UNIT'])
 * @returns {Array} Aggregated data
 */
export const aggregateDataByLevels = (data, selectedLevels = []) => {
  if (!data || data.length === 0) return [];

  // If no levels selected, return original data
  if (selectedLevels.length === 0) return data;

  // Sort levels to ensure consistent grouping order
  const orderedLevels = [
    "REGION",
    "COUNTRY",
    "BUSINESS_UNIT",
    "CATEGORY",
    "SUB_CATEGORY",
  ].filter((level) => selectedLevels.includes(level));

  // Always aggregate based on selected levels - groups rows that have identical values
  // for all selected levels, even if all levels are selected or only SUB_CATEGORY is selected
  // This ensures metrics are properly summed/averaged and duplicate rows are merged

  // Group data by selected levels
  const grouped = data.reduce((acc, row) => {
    // Create composite key from selected levels
    const groupKey = orderedLevels.map((level) => row[level]).join("|");

    if (!acc[groupKey]) {
      // Initialize group with level values
      acc[groupKey] = {
        ...orderedLevels.reduce(
          (obj, level) => ({
            ...obj,
            [level]: row[level],
          }),
          {},
        ),
        // Numeric fields to sum
        TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: 0,
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: 0,
        AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: 0,
        AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS: 0,
        AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS: 0,
        TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: 0,
        SHIPMENTS_REMAINING_DAYS: 0,
        RUN_RATE_FORECAST: 0,
        LOW_SIDE_GS: 0,
        HIGH_SIDE_GS: 0,
        _count: 0,
      };
    }

    // Sum numeric fields
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
    acc[groupKey].RUN_RATE_FORECAST += row.RUN_RATE_FORECAST || 0;
    acc[groupKey].LOW_SIDE_GS += row.LOW_SIDE_GS || 0;
    acc[groupKey].HIGH_SIDE_GS += row.HIGH_SIDE_GS || 0;
    acc[groupKey]._count++;

    return acc;
  }, {});

  // Convert to array and average the rate fields
  return Object.values(grouped).map((group) => {
    const count = group._count;
    if (count > 0) {
      group.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS /= count;
      group.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS /= count;
      group.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS /= count;
      group.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS /= count;
    }

    // Recalculate RUN_RATE_VS_FORECAST_MO after aggregation
    group.RUN_RATE_VS_FORECAST_MO =
      group.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH > 0
        ? (group.RUN_RATE_FORECAST /
          group.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH) *
        100
        : 0;

    delete group._count;
    return group;
  });
};

/**
 * Get columns relevant to selected levels
 * @param {Array} allColumns - All available columns
 * @param {Array} selectedLevels - Selected aggregation levels
 * @returns {Array} Filtered columns
 */
export const getColumnsForLevels = (allColumns, selectedLevels = []) => {
  const levelColumns = [
    "REGION",
    "COUNTRY",
    "BUSINESS_UNIT",
    "CATEGORY",
    "SUB_CATEGORY",
  ];

  // Keep only level columns that are selected, plus all metric columns
  return allColumns.filter(
    (col) => selectedLevels.includes(col.id) || !levelColumns.includes(col.id),
  );
};

/**
 * Get available filter options for a level based on selected levels and current filters
 * @param {Array} data - Original data
 * @param {string} targetLevel - Level to get options for
 * @param {Array} selectedLevels - Selected aggregation levels
 * @param {Object} activeFilters - Currently active filters
 * @returns {Array} Available options for target level
 */
export const getAvailableOptionsForLevel = (
  data,
  targetLevel,
  selectedLevels = [],
  activeFilters = {},
) => {
  if (!data || !Array.isArray(data)) return [];

  let filtered = data;

  // Apply existing filters
  Object.entries(activeFilters).forEach(([filterKey, filterValue]) => {
    if (filterValue && filterValue.length > 0) {
      filtered = filtered.filter((row) => filterValue.includes(row[filterKey]));
    }
  });

  // Get unique values for target level
  return [...new Set(filtered.map((row) => row[targetLevel]))]
    .filter(Boolean)
    .sort();
};