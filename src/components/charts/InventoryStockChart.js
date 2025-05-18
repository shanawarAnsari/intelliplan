import React, { useState } from "react";
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

const InventoryStockChart = () => {
  const [timeRange, setTimeRange] = useState("6m");
  const [chartType, setChartType] = useState("area");

  // Dummy data for inventory stock over time
  const inventoryData = {
    "1m": {
      dates: Array.from({ length: 30 }, (_, i) => `Day ${i + 1}`),
      stock: {
        "Product A": Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 300 + 700)
        ),
        "Product B": Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 200 + 500)
        ),
        "Product C": Array.from({ length: 30 }, () =>
          Math.floor(Math.random() * 150 + 300)
        ),
      },
      reorderPoint: Array.from({ length: 30 }, () => 300),
      maxCapacity: Array.from({ length: 30 }, () => 1200),
    },
    "3m": {
      dates: Array.from({ length: 12 }, (_, i) => `Week ${i + 1}`),
      stock: {
        "Product A": Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 300 + 700)
        ),
        "Product B": Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 200 + 500)
        ),
        "Product C": Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 150 + 300)
        ),
      },
      reorderPoint: Array.from({ length: 12 }, () => 300),
      maxCapacity: Array.from({ length: 12 }, () => 1200),
    },
    "6m": {
      dates: Array.from({ length: 6 }, (_, i) => `Month ${i + 1}`),
      stock: {
        "Product A": Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 300 + 700)
        ),
        "Product B": Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 200 + 500)
        ),
        "Product C": Array.from({ length: 6 }, () =>
          Math.floor(Math.random() * 150 + 300)
        ),
      },
      reorderPoint: Array.from({ length: 6 }, () => 300),
      maxCapacity: Array.from({ length: 6 }, () => 1200),
    },
    "1y": {
      dates: Array.from({ length: 12 }, (_, i) => {
        const months = [
          "Jan",
          "Feb",
          "Mar",
          "Apr",
          "May",
          "Jun",
          "Jul",
          "Aug",
          "Sep",
          "Oct",
          "Nov",
          "Dec",
        ];
        return months[i];
      }),
      stock: {
        "Product A": Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 300 + 700)
        ),
        "Product B": Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 200 + 500)
        ),
        "Product C": Array.from({ length: 12 }, () =>
          Math.floor(Math.random() * 150 + 300)
        ),
      },
      reorderPoint: Array.from({ length: 12 }, () => 300),
      maxCapacity: Array.from({ length: 12 }, () => 1200),
    },
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const handleChartTypeChange = (event, newType) => {
    if (newType) {
      setChartType(newType);
    }
  };

  const chartOptions = {
    chart: {
      height: 350,
      type: chartType,
      background: designTokens.palette.background.paper,
      stacked: chartType === "bar",
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
    colors: [
      designTokens.palette.primary.main,
      designTokens.palette.secondary.main,
      designTokens.palette.secondary.light,
      "#EF4444", // Red for reorder point
      "#A78BFA", // Purple for max capacity
    ],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: chartType === "area" ? 2 : 0,
      curve: "smooth",
      dashArray: [0, 0, 0, 3, 3], // Make reorder point and max capacity lines dashed
    },
    fill: {
      type: chartType === "area" ? "gradient" : "solid",
      opacity: chartType === "area" ? [0.7, 0.7, 0.7, 0.1, 0.1] : 1,
      gradient: {
        shade: "dark",
        type: "vertical",
        shadeIntensity: 0.5,
        opacityFrom: 0.7,
        opacityTo: 0.9,
        stops: [0, 90, 100],
      },
    },
    title: {
      text: "", // Remove the title
      align: "left",
      style: {
        color: designTokens.palette.text.primary,
      },
    },
    subtitle: {
      text: "Inventory Stock Quantities Over Time",
      align: "center",
      offsetY: 190, // Position right below the x-axis
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
      show: false,
      position: "top",
      horizontalAlign: "right",
      labels: {
        colors: designTokens.palette.text.primary,
      },
    },
    markers: {
      size: 0,
      hover: {
        sizeOffset: 6,
      },
    },
    xaxis: {
      categories: inventoryData[timeRange].dates,
      labels: {
        style: {
          colors: designTokens.palette.text.secondary,
        },
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
        text: "Quantity",
        style: {
          color: designTokens.palette.text.secondary,
        },
      },
      labels: {
        style: {
          colors: designTokens.palette.text.secondary,
        },
      },
      min: 0,
      max: 1400,
    },
    tooltip: {
      shared: true,
      intersect: false,
      theme: designTokens.palette.mode,
      y: {
        formatter: function (val) {
          return val + " units";
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
    annotations: {
      yaxis: [
        {
          y: 300,
          borderColor: "#EF4444",
          label: {
            borderColor: "#EF4444",
            style: {
              color: "#fff",
              background: "#EF4444",
            },
            text: "Reorder Point",
          },
        },
        {
          y: 1200,
          borderColor: "#A78BFA",
          label: {
            borderColor: "#A78BFA",
            style: {
              color: "#fff",
              background: "#A78BFA",
            },
            text: "Max Capacity",
          },
        },
      ],
    },
  };

  const chartSeries = [
    {
      name: "Product A",
      data: inventoryData[timeRange].stock["Product A"],
    },
    {
      name: "Product B",
      data: inventoryData[timeRange].stock["Product B"],
    },
    {
      name: "Product C",
      data: inventoryData[timeRange].stock["Product C"],
    },
    // Only show these threshold lines for line chart
    ...(chartType !== "bar"
      ? [
          {
            name: "Reorder Point",
            data: inventoryData[timeRange].reorderPoint,
          },
          {
            name: "Max Capacity",
            data: inventoryData[timeRange].maxCapacity,
          },
        ]
      : []),
  ];

  return (
    <Card
      sx={{
        backgroundColor: designTokens.palette.background.paper,
        boxShadow: designTokens.shadows[4],
        overflow: "hidden",
      }}
    >
      <CardContent sx={{ padding: "8px" }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Box sx={{ display: "flex", gap: 2 }}>
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
              <ToggleButton value="area" aria-label="area chart">
                Area
              </ToggleButton>
              <ToggleButton value="line" aria-label="line chart">
                Line
              </ToggleButton>
              <ToggleButton value="bar" aria-label="bar chart">
                Bar
              </ToggleButton>
            </ToggleButtonGroup>

            <FormControl variant="outlined" size="small" sx={{ minWidth: 120 }}>
              <Select
                value={timeRange}
                onChange={handleTimeRangeChange}
                sx={{
                  color: designTokens.palette.text.primary,
                  "& .MuiOutlinedInput-notchedOutline": {
                    borderColor: designTokens.palette.divider,
                  },
                }}
              >
                <MenuItem value="1m">1 Month</MenuItem>
                <MenuItem value="3m">3 Months</MenuItem>
                <MenuItem value="6m">6 Months</MenuItem>
                <MenuItem value="1y">1 Year</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </Box>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type={chartType}
          height={250}
        />
      </CardContent>
    </Card>
  );
};

export default InventoryStockChart;
