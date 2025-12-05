export const calculateRemainingDays = () => {
  const today = new Date();
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
  let remainingWeekdays = 0,
    remainingWeekends = 0;

  for (let day = today.getDate() + 1; day <= lastDay; day++) {
    const date = new Date(today.getFullYear(), today.getMonth(), day);
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) remainingWeekends++;
    else remainingWeekdays++;
  }

  return { remainingWeekdays, remainingWeekends };
};

export const calculateRemainingShipments = (weekdayRate, weekendRate) => {
  const { remainingWeekdays, remainingWeekends } = calculateRemainingDays();
  const safeWeekday = isNaN(weekdayRate) || weekdayRate === null ? 0 : weekdayRate;
  const safeWeekend = isNaN(weekendRate) || weekendRate === null ? 0 : weekendRate;
  return remainingWeekdays * safeWeekday + remainingWeekends * safeWeekend;
};

export const parseNumeric = (value) => {
  if (value === "" || value === null || value === undefined) return 0;
  const parsed = parseFloat(value);
  return isNaN(parsed) ? 0 : parsed;
};

export const calculateRowMetrics = (row, runRateOption) => {
  const totalForecast = parseNumeric(row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH);

  // Keep the original run rate values from the database
  const weekday13Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS);
  const weekend13Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS);
  const weekday8Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS);
  const weekend8Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS);

  // Select rates based on run rate option
  const weekdayRate = runRateOption === "13weeks" ? weekday13Rate : weekday8Rate;
  const weekendRate = runRateOption === "13weeks" ? weekend13Rate : weekend8Rate;

  const actualShipments = parseNumeric(row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH);
  const shipmentsRemaining = calculateRemainingShipments(weekdayRate, weekendRate);
  const runRateForecast = actualShipments + shipmentsRemaining;
  const runRateVsForecast =
    totalForecast > 0 ? (runRateForecast / totalForecast) * 100 : 0;

  return {
    ...row,
    TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: totalForecast,
    AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS: weekday13Rate,
    AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS: weekend13Rate,
    AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS: weekday8Rate,
    AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS: weekend8Rate,
    TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH: actualShipments,
    SHIPMENTS_REMAINING_DAYS: shipmentsRemaining,
    RUN_RATE_FORECAST: runRateForecast,
    RUN_RATE_VS_FORECAST_MO: runRateVsForecast,
    LOW_SIDE_GS: null,
    HIGH_SIDE_GS: null,
  };
};
