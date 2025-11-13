/**
 * Extract unique values from data array for a specific field
 */
export const getUniqueValues = (data, field) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];
  return [...new Set(data.map((row) => row[field]))].filter(Boolean).sort();
};

/**
 * Get filtered unique values based on parent filters
 * @param {Array} data - Source data
 * @param {string} field - Field to extract unique values from
 * @param {Object} filters - Parent filters to apply { COUNTRY: 'US', BUSINESS_UNIT: 'BU1' }
 */
export const getFilteredValues = (data, field, filters = {}) => {
  if (!data || !Array.isArray(data) || data.length === 0) return [];

  let filtered = data;

  // Apply each filter
  Object.entries(filters).forEach(([filterKey, filterValue]) => {
    if (filterValue) {
      if (Array.isArray(filterValue)) {
        if (filterValue.length > 0) {
          filtered = filtered.filter((row) => filterValue.includes(row[filterKey]));
        }
      } else {
        filtered = filtered.filter((row) => row[filterKey] === filterValue);
      }
    }
  });

  return getUniqueValues(filtered, field);
};
