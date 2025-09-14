import React, { useMemo } from "react";
import ReactApexChart from "react-apexcharts";
import { Box, Card, CardContent } from "@mui/material";
import { designTokens } from "../../../styles/theme";
import { shipmentData } from "./shipmentData";

const DemandForecastChart = () => {
  // Process the shipment data
  const processedData = useMemo(() => {
    // Sort data by date
    const sortedData = [...shipmentData].sort(
      (a, b) => new Date(a.WeekDate) - new Date(b.WeekDate)
    );

    // Extract data
    const chartData = {
      dates: [],
      forecast: [],
      actual: [],
    };

    // Extract data for view
    sortedData.forEach((item) => {
      // Format date to be more readable
      const date = new Date(item.WeekDate);
      const formattedDate = `${date.getFullYear()}-${(date.getMonth() + 1)
        .toString()
        .padStart(2, "0")}-${date.getDate().toString().padStart(2, "0")}`;

      chartData.dates.push(formattedDate);

      // Convert string values to numbers
      const forecastValue = item["Sum_S&OPWeeklyForecastGSU_Units"]
        ? parseFloat(item["Sum_S&OPWeeklyForecastGSU_Units"])
        : null;

      const actualValue = item["Sum_ShipmentActualsGSU_Units"]
        ? parseFloat(item["Sum_ShipmentActualsGSU_Units"])
        : null;

      chartData.forecast.push(forecastValue);
      chartData.actual.push(actualValue);
    });

    return chartData;
  }, []);

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
      dashArray: [5, 0], // Dashed line for forecast, solid line for actual
    },
    title: {
      text: "Demand Forecast vs Actual Shipments",
      align: "center",
      style: {
        color: designTokens.palette.text.primary,
        fontSize: "16px",
        fontWeight: 500,
      },
    },
    subtitle: {
      text: "",
      align: "center",
      style: {
        color: designTokens.palette.text.primary,
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
      showForSingleSeries: true,
      showForNullSeries: false,
      showForZeroSeries: true,
      formatter: function (seriesName, opts) {
        // Return just the name without markers or datapoints
        return seriesName;
      },
      labels: {
        colors: designTokens.palette.text.primary,
      },
      markers: {
        width: 0,
        height: 0,
        strokeWidth: 0,
        offsetX: -8,
      },
    },
    markers: {
      size: 0,
      hover: {
        sizeOffset: 6,
      },
    },
    xaxis: {
      categories: processedData.dates,
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
        text: "Units",
        style: {
          color: designTokens.palette.text.secondary,
        },
      },
      labels: {
        style: {
          colors: designTokens.palette.text.secondary,
        },
        formatter: function (val) {
          return val === null || val === undefined ? "0" : val.toFixed(0);
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
    noData: {
      text: "No data available",
      align: "center",
      verticalAlign: "middle",
    },
  };

  const chartSeries = [
    {
      name: "Forecast",
      data: processedData.forecast,
    },
    {
      name: "Actual",
      data: processedData.actual,
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
      <CardContent sx={{ padding: "8px", marginBottom: -4 }}>
        <ReactApexChart
          options={chartOptions}
          series={chartSeries}
          type="line"
          height={300}
        />
      </CardContent>
    </Card>
  );
};

export default DemandForecastChart;
