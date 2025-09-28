import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  Typography,
  Box
} from "@mui/material";

// Currency formatter
const formatCurrency = (value, currency = "USD") => {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 2,
  }).format(value || 0);
};

const DataTable = ({
  columns,
  data,
  userInputs,
  onUserInputChange,
}) => {
  // Calculate totals
  const calculateTotals = () => {
    let totalForecast = 0;
    let lowSide = 0;
    let highSide = 0;

    data.forEach((row) => {
      totalForecast += row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH || 0;
      lowSide += row.LOW_SIDE_GS || 0;
      highSide += row.HIGH_SIDE_GS || 0;
    });

    const highSidePercent = totalForecast ? (highSide / totalForecast) * 100 : 0;
    const lowSidePercent = totalForecast ? (lowSide / totalForecast) * 100 : 0;

    return {
      TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH: totalForecast,
      LOW_SIDE_GS: lowSide,
      HIGH_SIDE_GS: highSide,
      HIGH_SIDE_PERCENT: highSidePercent,
      LOW_SIDE_PERCENT: lowSidePercent,
    };
  };

  const totals = calculateTotals();

  return (
    <>
      <TableContainer
        sx={{
          borderRadius: 1,
          backgroundColor: "#ffffff",
          border: "1px solid #e2e8f0",
          boxShadow:
            "0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)",
          overflowX: "auto",
          maxWidth: "100%",
        }}
      >
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{
                    fontWeight: 600,
                    backgroundColor: col.headerColor || "#1e293b",
                    color: col.headerColor ? "#1e293b" : "#ffffff",
                    borderBottom: col.headerColor
                      ? "3px solid #ff9999"
                      : "3px solid #0f172a",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    minWidth: col.minWidth,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    py: 0.5,
                    px: 2,
                    height: "36px",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>

          <TableBody>
            {/* Total Row */}
            <TableRow>
              {columns.map((col) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  sx={{
                    fontSize: "0.775rem",
                    fontWeight: col.id === "category" ? 600 : 500,
                    color: "#1e293b",
                    borderBottom: "1px solid #e2e8f0",
                    py: 1,
                    px: 2,
                    verticalAlign: "middle",
                  }}
                >
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent:
                        col.align === "right" ? "flex-end" : "flex-start",
                    }}
                  >
                    {(() => {
                      switch (col.id) {
                        case "TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH":
                          return formatCurrency(totals.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH);
                        case "LOW_SIDE_GS":
                          return formatCurrency(totals.LOW_SIDE_GS);
                        case "HIGH_SIDE_GS":
                          return formatCurrency(totals.HIGH_SIDE_GS);
                        case "HIGH_SIDE_PERCENT":
                          return `${totals.HIGH_SIDE_PERCENT.toFixed(2)}%`;
                        case "LOW_SIDE_PERCENT":
                          return `${totals.LOW_SIDE_PERCENT.toFixed(2)}%`;
                        case "category":
                          return "Total";
                        default:
                          return "";
                      }
                    })()}
                  </Box>
                </TableCell>
              ))}
            </TableRow>

            {/* Data Rows */}
            {data.map((row, idx) => (
              <TableRow
                key={idx}
                sx={{
                  backgroundColor: "#ffffff",
                  "&:nth-of-type(even)": {
                    backgroundColor: "#f8fafc",
                  },
                  "&:hover": {
                    backgroundColor: "#e2e8f0",
                    transform: "translateY(-1px)",
                    boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",
                  },
                  transition: "all 0.2s ease",
                  cursor: "pointer",
                }}
              >
                {columns.map((col) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    sx={{
                      fontSize: "0.775rem",
                      fontWeight: col.id === "category" ? 600 : 400,
                      color: col.id === "category" ? "#1e293b" : "#475569",
                      backgroundColor: col.headerColor ? "#fef2f2" : "transparent",
                      borderBottom: "1px solid #e2e8f0",
                      py: 1,
                      px: 2,
                      verticalAlign: "middle",
                    }}
                  >
                    <Box
                      sx={{
                        display: "flex",
                        alignItems: "center",
                        justifyContent:
                          col.align === "right" ? "flex-end" : "flex-start",
                      }}
                    >
                      {col.isUserInput ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder=""
                          value={userInputs[`${idx}-${col.id}`] || ""}
                          onChange={(e) =>
                            onUserInputChange(idx, col.id, e.target.value)
                          }
                          sx={{
                            minWidth: 80,
                            "& .MuiOutlinedInput-root": {
                              height: "32px",
                              fontSize: "0.875rem",
                              backgroundColor: "#ffffff",
                              borderRadius: 1,
                              color: "#000",
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "6px 8px",
                              textAlign: "right",
                            },
                          }}
                          type="number"
                          InputProps={{
                            endAdornment: (
                              <InputAdornment position="end">
                                <Typography
                                  variant="caption"
                                  sx={{ color: "#6b7280" }}
                                >
                                  %
                                </Typography>
                              </InputAdornment>
                            ),
                          }}
                        />
                      ) : col.id === "HIGH_SIDE_PERCENT" || col.id === "LOW_SIDE_PERCENT" ? (
                        `${row[col.id]?.toFixed(2)}%`
                      ) : typeof row[col.id] === "number" ? (
                        formatCurrency(row[col.id])
                      ) : (
                        row[col.id] || ""
                      )}
                    </Box>
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </>
  );
};

export default DataTable;