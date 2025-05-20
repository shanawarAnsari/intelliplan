import React, { useState, useEffect } from "react";
import ReactApexChart from "react-apexcharts";
import {
  Box,
  Card,
  CardContent,
  Typography,
  FormControl,
  Select,
  MenuItem,
  ToggleButtonGroup,
  ToggleButton,
} from "@mui/material";
import { designTokens } from "../../styles/theme";
import { inventoryData } from "./inventoryData";

const InventoryStockChart = () => {
  const [timeRange, setTimeRange] = useState("all");
  const [chartType, setChartType] = useState("bar");
  const [processedData, setProcessedData] = useState(null);

  // Process the inventory data to be used in the chart
  useEffect(() => {
    // Sort data by date
    const sortedData = [...inventoryData].sort(
      (a, b) => new Date(a.WeekDate) - new Date(b.WeekDate)
    );

    // Extract dates and stock quantity data
    const dates = sortedData.map((item) => {
      const date = new Date(item.WeekDate);
      return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
    });

    const stockQuantity = sortedData.map((item) =>
      item["Sum_StockQuantity_GSU_Units"] ? parseInt(item["Sum_StockQuantity_GSU_Units"]) : null
    );

    // Get unique dates for month-year format
    const uniqueDates = [...new Set(dates)];

    // Calculate average stock quantity for each month
    const monthlyStockQuantity = {};
    const monthlyStockCount = {};

    dates.forEach((date, index) => {
      if (!monthlyStockQuantity[date]) {
        monthlyStockQuantity[date] = 0;
        monthlyStockCount[date] = 0;
      }

      if (stockQuantity[index]) {
        monthlyStockQuantity[date] += stockQuantity[index];
        monthlyStockCount[date]++;
      }
    });

    // Convert to arrays based on unique dates
    const stockData = uniqueDates.map((date) =>
      monthlyStockCount[date]
        ? Math.round(monthlyStockQuantity[date] / monthlyStockCount[date])
        : 0
    );

    // Store processed data
    setProcessedData({
      dates: uniqueDates,
      stocks: stockData,
    });
  }, []);

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType) {
      setChartType(newType);
    }
  };
  // Filter data based on selected time range
  const getFilteredData = () => {
    if (!processedData) return { dates: [], stocks: [] };

    if (timeRange === "all") return processedData;

    const monthCount =
      timeRange === "1m" ? 1 : timeRange === "3m" ? 3 : timeRange === "6m" ? 6 : 12;
    const cutoffIndex = Math.max(0, processedData.dates.length - monthCount);

    return {
      dates: processedData.dates.slice(cutoffIndex),
      stocks: processedData.stocks.slice(cutoffIndex),
    };
  };

  const filteredData = getFilteredData();

  const chartOptions = {
    chart: {
      height: 350,
      type: chartType,
      background: designTokens.palette.background.paper,
      toolbar: {
        show: true,
        tools: {
          download: true,
          selection: true,
          zoom: true,
          zoomin: true,
          zoomout: true,
          pan: true,
          reset: true,
        },
      },
    },
    colors: [designTokens.palette.secondary.dark],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: 2,
      curve: "smooth",
    },
    title: {
      text: "Average Monthly Inventory Stock Quantity",
      align: "center",
      style: {
        color: designTokens.palette.text.primary,
        fontSize: "16px",
        fontWeight: 500,
      },
    },

    grid: {
      borderColor: designTokens.palette.divider,
      row: {
        colors: [designTokens.palette.background.paper, "transparent"],
        opacity: 0.5,
      },
    },
    legend: {
      show: true,
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: designTokens.palette.text.primary,
      },
    },
    xaxis: {
      categories: filteredData.dates,
      labels: {
        style: {
          colors: designTokens.palette.text.secondary,
        },
        rotate: -45,
        rotateAlways: true,
      },
      axisBorder: {
        show: true,
        color: designTokens.palette.divider,
      },
      axisTicks: {
        show: true,
        color: designTokens.palette.divider,
      },
    },
    yaxis: {
      title: {
        text: "Stock Quantity",
        style: {
          color: designTokens.palette.text.secondary,
        },
      },
      labels: {
        style: {
          colors: designTokens.palette.text.secondary,
        },
        formatter: function (val) {
          return val.toLocaleString();
        },
      },
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: designTokens.palette.mode,
      y: {
        formatter: function (val) {
          return val.toLocaleString() + " units";
        },
      },
    },
    theme: {
      mode: designTokens.palette.mode,
    },
    plotOptions: {
      bar: {
        horizontal: false,
        columnWidth: "70%",
        borderRadius: 4,
      },
    },
  };

  const chartSeries = [
    {
      name: "Stock Quantity",
      data: filteredData.stocks,
    },
  ];

  if (!processedData) {
    return <div>Loading chart data...</div>;
  }

  return (
    <Card
      sx={{
        backgroundColor: designTokens.palette.background.paper,
        boxShadow: designTokens.shadows[4],
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ padding: "8px", marginBottom: -4, }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 1, marginBottom: -4, zIndex: 1 }}>
            <ToggleButtonGroup
              value={chartType}
              exclusive
              onChange={handleChartTypeChange}
              size="small"
              aria-label="chart type"
              sx={{
                "& .MuiToggleButton-root": {
                  color: designTokens.palette.text.secondary,
                  "&.Mui-selected": {
                    color: designTokens.palette.primary.main,
                    backgroundColor: designTokens.palette.background.secondary,
                  },
                },
              }}
            >
              <ToggleButton value="bar" aria-label="bar chart">
                Bar
              </ToggleButton>
              <ToggleButton value="line" aria-label="line chart">
                Line
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
        </Box>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type={chartType}
          height={325}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryStockChart;
