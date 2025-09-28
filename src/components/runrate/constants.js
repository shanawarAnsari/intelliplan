export const tableColumns = [
  {
    id: "category",
    label: "Product Category",
    align: "left",
    minWidth: 180,
    format: (value) => value,
  },
  {
    id: "TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH",
    label: "M-O - S&OP forecast - current month",
    align: "right",
    minWidth: 160,
    format: (value) =>
      typeof value === "number"
        ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : "N/A",
  },
  {
    id: "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS",
    label: "13 weeks weekend shipment run rate",
    align: "right",
    minWidth: 140,
    format: (value) =>
      typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "N/A",
  },
  {
    id: "AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS",
    label: "13 weeks weekday shipment run rate",
    align: "right",
    minWidth: 140,
    format: (value) =>
      typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "N/A",
  },
  {
    id: "TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH",
    label: "Actual Shipments till date",
    align: "right",
    minWidth: 140,
    format: (value) =>
      typeof value === "number" && !isNaN(value) ? value.toLocaleString() : "N/A",
  },

  {
    id: "SHIPMENTS_REMAINING_DAYS",
    label: "Shipments for remaining days based on run rate",
    align: "right",
    minWidth: 180,
    format: (value) =>
      typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "0.00",
    headerColor: "#ffb3ba",
  },
  {
    id: "ACTUAL_SHIPMENTS_TILL_DATE_PLUS_REMAINING",
    label: "Run rate forecast (Actual shipments till date + Shipments for remaining days)",
    align: "right",
    minWidth: 200,
    format: (value) =>
      typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "0.00",
    headerColor: "#ffb3ba",
  },
  {
    id: "RUN_RATE_VS_FORECAST_MO",
    label: "Run rate forecast vs M-O - S&OP forecast for MO",
    align: "right",
    minWidth: 200,
    format: (value) =>
      typeof value === "number" && !isNaN(value) ? value.toFixed(2) : "0.00",
    headerColor: "#ffb3ba",
  },
  {
    id: "LOW_SIDE_PERCENT",
    label: "Low side %",
    align: "right",
    minWidth: 125,
    format: (value) => "",
    headerColor: "#F0F0F0",
    isUserInput: true,
  },
  {
    id: "HIGH_SIDE_PERCENT",
    label: "High side %",
    align: "right",
    minWidth: 125,
    format: (value) => "",
    headerColor: "#F0F0F0",
    isUserInput: true,
  },
  {
    id: "LOW_SIDE_GS",
    label: "Low side GS",
    align: "right",
    minWidth: 120,
    format: (value) =>
      typeof value === "number"
        ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : "0",
    headerColor: "#ffb3ba",
  },
  {
    id: "HIGH_SIDE_GS",
    label: "High side GS",
    align: "right",
    minWidth: 120,
    format: (value) =>
      typeof value === "number"
        ? `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`
        : "0",
    headerColor: "#ffb3ba",
  },
];
