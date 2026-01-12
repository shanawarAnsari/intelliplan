export const tableColumns = [
  {
    id: "COUNTRY",
    label: "Country",
    align: "left",
    minWidth: 80,
    format: (value) => value,
  },
  {
    id: "BUSINESS_UNIT",
    label: "Business Unit",
    align: "left",
    minWidth: 100,
    format: (value) => value,
  },
  {
    id: "CATEGORY",
    label: "Category",
    align: "left",
    minWidth: 140,
    format: (value) => value,
  },
  {
    id: "SUB_CATEGORY",
    label: "Sub Category",
    align: "left",
    minWidth: 140,
    format: (value) => value,
  },
  {
    id: "TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH",
    label: "M-O - S&OP forecast - current month",
    align: "right",
    minWidth: 160,
    format: (value) => getCurrencyFormatting(value, 0),
  },
  {
    id: "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS",
    label: "13 weeks weekend shipment run rate",
    align: "right",
    minWidth: 140,
    format: (value) => getCurrencyFormatting(value, 2),
  },
  {
    id: "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS",
    label: "13 weeks weekday shipment run rate",
    align: "right",
    minWidth: 140,
    format: (value) => getCurrencyFormatting(value, 2),
  },
  {
    id: "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS",
    label: "8 weeks weekend shipment run rate",
    align: "right",
    minWidth: 140,
    format: (value) => getCurrencyFormatting(value, 2),
  },
  {
    id: "AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS",
    label: "8 weeks weekday shipment run rate",
    align: "right",
    minWidth: 140,
    format: (value) => getCurrencyFormatting(value, 2),
  },
  {
    id: "TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH",
    label: `Actual Shipments till date (${new Date().toLocaleDateString("en-US", {
      timeZone: "America/New_York",
    })})`,
    align: "right",
    minWidth: 140,
    format: (value) => getCurrencyFormatting(value, 2),
  },
  {
    id: "SHIPMENTS_REMAINING_DAYS",
    label: "Shipments for remaining days based on run rate",
    align: "right",
    minWidth: 180,
    format: (value) => getCurrencyFormatting(value, 2),
    headerColor: "#ffb3ba", // Pinkish orange color
  },
  {
    id: "RUN_RATE_FORECAST",
    label:
      "Run rate forecast (Actual shipments till date + Shipments for remaining days)",
    align: "right",
    minWidth: 220,
    format: (value) => getCurrencyFormatting(value, 0),
    headerColor: "#ffb3ba", // Pinkish orange color
  },
  {
    id: "RUN_RATE_VS_FORECAST_MO",
    label: "Run rate forecast vs M-O - S&OP forecast for MO",
    align: "right",
    minWidth: 200,
    format: (value) => {
      if (value === null || value === undefined || value === 0) return "0.00%";
      return typeof value === "number" && !isNaN(value)
        ? `${value.toFixed(2)}%`
        : "0.00%";
    },
    headerColor: "#ffb3ba", // Pinkish orange color
  },
  {
    id: "LOW_SIDE_PERCENT",
    label: "Low Side Percentage",
    align: "right",
    minWidth: 100,
    format: (value) => "", // Don't populate this column
    headerColor: "#fef7e6",
    isUserInput: true, // Mark as user input field
  },
  {
    id: "HIGH_SIDE_PERCENT",
    label: "High Side Percentage",
    align: "right",
    minWidth: 100,
    format: (value) => "", // Don't populate this column
    headerColor: "#fef7e6",
    isUserInput: true, // Mark as user input field
  },
  {
    id: "LOW_SIDE_GS",
    label: "Low Side",
    align: "right",
    minWidth: 120,
    format: (value) => getCurrencyFormatting(value, 2),
    headerColor: "#ffb3ba", // Pinkish orange color
  },
  {
    id: "HIGH_SIDE_GS",
    label: "High side GS",
    align: "right",
    minWidth: 120,
    format: (value) => getCurrencyFormatting(value, 2),
    headerColor: "#ffb3ba", // Pinkish orange color
  },
];

function getCurrencyFormatting(value, maximumFractionDigits) {
  if (value === null || value === undefined || value === 0) return "$0";
  return typeof value === "number" && !isNaN(value)
    ? `$${value.toLocaleString(undefined, {
        maximumFractionDigits: maximumFractionDigits,
      })}`
    : "$0";
}
