import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  InputAdornment,
  Typography,
  Box,
  Divider,
} from "@mui/material";

// Utility function to calculate totals for numeric columns
const calculateTotals = (data, columns) => {
  const totals = {};
  columns.forEach((col) => {
    if (col.id === "COUNTRY") {
      totals[col.id] = "TOTAL";
    } else if (
      col.id === "CATEGORY" ||
      col.id === "SUB_CATEGORY" ||
      col.id === "BUSINESS_UNIT"
    ) {
      totals[col.id] = "";
    } else if (col.isUserInput) {
      totals[col.id] = "";
    } else if (col.id === "RUN_RATE_VS_FORECAST_MO") {
      totals[col.id] = (totals["RUN_RATE_FORECAST"] / totals["TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH"]) * 100
    }
    else {
      const sum = data.reduce((acc, row) => {
        const value = parseFloat(row[col.id]) || 0;
        return acc + value;
      }, 0);
      totals[col.id] = sum;
    }
  });
  return totals;
};

const DataTable = ({
  columns,
  data,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  userInputs,
  onUserInputChange,
}) => {
  // Calculate totals for all data (not just current page)
  const totals = calculateTotals(data, columns);

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
                    fontSize: "0.75rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    minWidth: col.minWidth,
                    position: "sticky",
                    top: 0,
                    zIndex: 10,
                    py: 1,
                    px: 3,
                    height: "36px",
                  }}
                >
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Totals Row */}
            <TableRow
              sx={{
                backgroundColor: "#f1f5f9",
                borderBottom: "2px solid #3b82f6",
                "& .MuiTableCell-root": {
                  fontWeight: 700,
                  color: "#1e293b",
                  fontSize: "0.875rem",
                },
              }}
            >
              {columns.map((col) => (
                <TableCell
                  key={`total-${col.id}`}
                  align={col.align}
                  sx={{
                    py: 1,
                    px: 3,
                    height: "40px",
                    verticalAlign: "middle",
                    backgroundColor: "#f1f5f9",
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
                    {col.isUserInput
                      ? "" // Don't show anything for user input columns in totals
                      : col.format && typeof totals[col.id] === "number"
                        ? col.format(totals[col.id])
                        : totals[col.id] || ""}
                  </Box>
                </TableCell>
              ))}
            </TableRow>

            {/* Data Rows */}
            {data
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, idx) => (
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
                        fontSize: "0.875rem",
                        fontWeight:
                          col.id === "COUNTRY" ||
                            col.id === "BUSINESS_UNIT" ||
                            col.id === "CATEGORY" ||
                            col.id === "SUB_CATEGORY"
                            ? 600
                            : 400,
                        color:
                          col.id === "BUSINESS_UNIT" ||
                            col.id === "COUNTRY" ||
                            col.id === "CATEGORY" ||
                            col.id === "SUB_CATEGORY"
                            ? "#1e293b"
                            : "#475569",
                        backgroundColor: col.headerColor ? "#fef2f2" : "transparent",
                        borderBottom: "1px solid #e2e8f0",
                        py: 1,
                        px: 3,
                        height: "36px",
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
                            placeholder="0"
                            value={
                              userInputs[`${page * rowsPerPage + idx}-${col.id}`] ||
                              ""
                            }
                            onChange={(e) => {
                              const value = e.target.value;
                              // Allow empty string, minus sign, or valid numbers
                              if (
                                value === "" ||
                                value === "-" ||
                                (!isNaN(value) && value >= -1000 && value <= 1000)
                              ) {
                                onUserInputChange(
                                  page * rowsPerPage + idx,
                                  col.id,
                                  value
                                );
                              }
                            }}
                            onBlur={(e) => {
                              const value = parseFloat(e.target.value);
                              if (!isNaN(value)) {
                                // Ensure value is within bounds
                                const clampedValue = Math.max(
                                  -1000,
                                  Math.min(1000, value)
                                );
                                onUserInputChange(
                                  page * rowsPerPage + idx,
                                  col.id,
                                  clampedValue.toString()
                                );
                              }
                            }}
                            sx={{
                              minWidth: 100,
                              "& .MuiOutlinedInput-root": {
                                height: "36px",
                                fontSize: "0.875rem",
                                backgroundColor: "#ffffff",
                                borderRadius: 1,
                                border: "1px solid #d1d5db",
                                "&:hover": {
                                  borderColor: "#9ca3af",
                                },
                                "&.Mui-focused": {
                                  borderColor: "#3b82f6",
                                  boxShadow: "0 0 0 3px rgba(59, 130, 246, 0.1)",
                                },
                              },
                              "& .MuiOutlinedInput-input": {
                                padding: "8px 12px",
                                textAlign: "right",
                                color: "#1f2937",
                                "&::placeholder": {
                                  color: "#9ca3af",
                                  opacity: 1,
                                },
                              },
                            }}
                            type="number"
                            inputProps={{
                              min: -1000,
                              max: 1000,
                              step: 0.01,
                            }}
                          />
                        ) : col.format ? (
                          col.format(row[col.id])
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

      <Divider sx={{ mt: 2 }} />

      <TablePagination
        component="div"
        count={data.length}
        page={page}
        onPageChange={onPageChange}
        rowsPerPage={rowsPerPage}
        onRowsPerPageChange={onRowsPerPageChange}
        rowsPerPageOptions={[5, 10, 25, 50, 100]}
        sx={{
          backgroundColor: "transparent",
          "& .MuiTablePagination-toolbar": {
            color: "#FFF",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            color: "#FFF",
            fontWeight: 500,
          },
        }}
      />
    </>
  );
};

export default DataTable;
