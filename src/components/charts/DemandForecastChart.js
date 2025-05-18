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
} from "@mui/material";
import { designTokens } from "../../styles/theme";

const DemandForecastChart = () => {
  const [timeRange, setTimeRange] = useState("monthly");

  // Dummy data for the chart
  const data = {
    monthly: {
      dates: [
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
      ],
      forecast: [420, 380, 450, 520, 490, 550, 600, 580, 620, 670, 650, 700],
      actual: [410, 370, 430, 500, 480, 530, 590, 570, 590, 650, 630, 680],
    },
    quarterly: {
      dates: ["Q1", "Q2", "Q3", "Q4"],
      forecast: [1250, 1560, 1800, 2020],
      actual: [1210, 1510, 1750, 1960],
    },
    yearly: {
      dates: ["2019", "2020", "2021", "2022", "2023"],
      forecast: [4500, 4800, 5200, 5800, 6300],
      actual: [4450, 4700, 5100, 5650, 6150],
    },
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

  const chartOptions = {
    chart: {
      height: 350,
      type: "line",
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
    colors: [designTokens.palette.primary.main, designTokens.palette.secondary.main],
    dataLabels: {
      enabled: false,
    },
    stroke: {
      width: [3, 3],
      curve: "smooth",
      dashArray: [0, 0],
    },
    title: {
      text: "", // Remove the title
      align: "left",
      style: {
        color: designTokens.palette.text.primary,
      },
    },
    subtitle: {
      text: "Demand Forecast vs Actual",
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
      tooltipHoverFormatter: function (val, opts) {
        return (
          val +
          " - " +
          opts.w.globals.series[opts.seriesIndex][opts.dataPointIndex] +
          " units"
        );
      },
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
      categories: data[timeRange].dates,
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
        text: "Units",
        style: {
          color: designTokens.palette.text.secondary,
        },
      },
      labels: {
        style: {
          colors: designTokens.palette.text.secondary,
        },
      },
    },
    tooltip: {
      y: [
        {
          title: {
            formatter: function (val) {
              return val + " (Forecast)";
            },
          },
        },
        {
          title: {
            formatter: function (val) {
              return val + " (Actual)";
            },
          },
        },
      ],
    },
    theme: {
      mode: designTokens.palette.mode,
    },
  };

  const chartSeries = [
    {
      name: "Forecast",
      data: data[timeRange].forecast,
    },
    {
      name: "Actual",
      data: data[timeRange].actual,
    },
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
          <FormControl
            variant="outlined"
            size="small"
            sx={{ minWidth: 120, marginBottom: -5, zIndex: 1 }}
          >
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
              <MenuItem value="monthly">Monthly</MenuItem>
              <MenuItem value="quarterly">Quarterly</MenuItem>
              <MenuItem value="yearly">Yearly</MenuItem>
            </Select>
          </FormControl>
        </Box>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={250}
        />
      </CardContent>
    </Card>
  );
};

export default DemandForecastChart;
