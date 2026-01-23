
const TIME_ZONE = "America/New_York"; // Change to any US timezone

// Helper: Get parts of a date in the target timezone
const getZonedParts = (date) => {
  const formatter = new Intl.DateTimeFormat("en-US", {
    timeZone: TIME_ZONE,
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });
  const parts = formatter.formatToParts(date);
  const year = parseInt(parts.find(p => p.type === "year").value, 10);
  const month = parseInt(parts.find(p => p.type === "month").value, 10);
  const day = parseInt(parts.find(p => p.type === "day").value, 10);
  return { year, month, day };
};

// Get today's date in US timezone
const nowInZone = () => {
  return getZonedParts(new Date());
};

// Calculate last day of month in US timezone
const getLastDayOfMonthInZone = ({ year, month }) => {
  // Create a UTC date for the first of next month
  const nextMonthUtc = new Date(Date.UTC(year, month, 1));
  // Subtract one day
  const lastDayUtc = new Date(nextMonthUtc.getTime() - 24 * 60 * 60 * 1000);
  return getZonedParts(lastDayUtc).day;
};

export const calculateRemainingDays = () => {
  const todayParts = nowInZone();
  const lastDay = getLastDayOfMonthInZone(todayParts);

  let remainingWeekdays = 0;
  let remainingWeekends = 0;

  for (let day = todayParts.day + 1; day <= lastDay; day++) {
    // Create UTC noon for stability
    const utcDate = new Date(Date.UTC(todayParts.year, todayParts.month - 1, day, 12));
    const zonedDate = new Intl.DateTimeFormat("en-US", {
      timeZone: TIME_ZONE,
      weekday: "short"
    }).format(utcDate);

    if (zonedDate === "Sat" || zonedDate === "Sun") {
      remainingWeekends++;
    } else {
      remainingWeekdays++;
    }
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

  const weekday13Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS);
  const weekend13Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS);
  const weekday8Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKDAYS);
  const weekend8Rate = parseNumeric(row.AVG_ACTUAL_SHIPMENTS_8WEEKS_WEEKENDS);

  const weekdayRate = runRateOption === "13weeks" ? weekday13Rate : weekday8Rate;
  const weekendRate = runRateOption === "13weeks" ? weekend13Rate : weekend8Rate;

  const actualShipments = parseNumeric(row.TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH);
  const shipmentsRemaining = calculateRemainingShipments(weekdayRate, weekendRate);
  const runRateForecast = actualShipments + shipmentsRemaining;
  const runRateVsForecast = totalForecast > 0 ? (runRateForecast / totalForecast) * 100 : 0;

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
}