import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TablePagination,
  TextField,
  Typography,
  Box,
} from "@mui/material";

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
  // Essential level columns that should be frozen
  const ESSENTIAL_LEVEL_COLUMNS = [
    "REGION",
    "COUNTRY",
    "BUSINESS_UNIT",
    "CATEGORY",
    "SUB_CATEGORY",
  ];

  // Calculate how many columns should be frozen based on visible essential columns
  const frozenColumnCount = useMemo(() => {
    return (
      columns?.filter((col) => ESSENTIAL_LEVEL_COLUMNS.includes(col.id)).length || 0
    );
  }, [columns]);

  // Calculate cumulative left positions for frozen columns
  const frozenColumnPositions = useMemo(() => {
    const positions = {};
    let cumulativeLeft = 0;

    columns?.forEach((col, idx) => {
      if (!ESSENTIAL_LEVEL_COLUMNS.includes(col.id)) return;

      positions[idx] = cumulativeLeft;
      cumulativeLeft += col.minWidth || 100;
    });

    return positions;
  }, [columns]);

  // Generate dynamic sx for frozen columns based on actual widths
  const frozenColumnSx = useMemo(() => {
    const sx = {
      "& .frozen-column": {
        position: "sticky",
        zIndex: 10,
      },
    };

    // Add dynamic left positions for each frozen column
    Object.entries(frozenColumnPositions).forEach(([idx, leftValue]) => {
      sx[`& .frozen-column-${idx}`] = {
        left: `${leftValue}px`,
        ...(idx === Math.max(...Object.keys(frozenColumnPositions).map(Number))
          ? { borderRight: "2px solid #7e7e7e1b" }
          : {}),
      };
    });

    return sx;
  }, [frozenColumnPositions]);

  const totals = useMemo(() => {
    const t = {};

    columns?.forEach((col) => {
      if (["REGION", "COUNTRY"].includes(col.id)) {
        t[col.id] = col.id === "REGION" ? "TOTAL" : "";
      } else if (
        ["CATEGORY", "SUB_CATEGORY", "BUSINESS_UNIT"].includes(col.id) ||
        col.isUserInput
      ) {
        t[col.id] = "";
      } else if (col.id === "RUN_RATE_VS_FORECAST_MO") {
        // Calculate percentage based on totals of RUN_RATE_FORECAST and TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH
        const totalForecast = data?.reduce(
          (acc, row) =>
            acc + (parseFloat(row.TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH) || 0),
          0,
        );
        const totalRunRate = data?.reduce(
          (acc, row) => acc + (parseFloat(row.RUN_RATE_FORECAST) || 0),
          0,
        );
        t[col.id] = totalForecast > 0 ? (totalRunRate / totalForecast) * 100 : 0;
      } else {
        t[col.id] = data?.reduce(
          (acc, row) => acc + (parseFloat(row[col.id]) || 0),
          0,
        );
      }
    });
    return t;
  }, [data, columns]);

  const paginatedData = useMemo(
    () => data?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage) || [],
    [data, page, rowsPerPage],
  );

  const handleInput = (rowIndex, columnId, value) => {
    if (
      value === "" ||
      value === "-" ||
      (!isNaN(value) && value >= -1000 && value <= 1000)
    ) {
      onUserInputChange(page * rowsPerPage + rowIndex, columnId, value);
    }
  };

  const getValue = (rowIndex, columnId) =>
    userInputs?.[`${page * rowsPerPage + rowIndex}-${columnId}`] || "";

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          minHeight: 200,
          justifyContent: "center",
        }}
      >
        <Typography variant="h6" color="text.secondary">
          No data to display
        </Typography>
        <Typography variant="body2" color="text.secondary">
          Try adjusting your filters
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <TableContainer
        sx={{
          overflowX: "auto",
          border: "1px solid #e5e7eb",
          borderRadius: 1,
          backgroundColor: "#ffffff",
          ...frozenColumnSx,
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => {
                const isFrozen = ESSENTIAL_LEVEL_COLUMNS.includes(col.id);
                const frozenIdx = columns
                  .slice(0, idx)
                  .filter((c) => ESSENTIAL_LEVEL_COLUMNS.includes(c.id)).length;

                return (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    className={isFrozen ? `frozen-column frozen-column-${idx}` : ""}
                    sx={{
                      fontWeight: 600,
                      backgroundColor: col.headerColor || "#1e293b",
                      color: col.headerColor ? "#1e293b" : "#ffffff",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      minWidth: col.minWidth || 120,
                      width: isFrozen ? col.minWidth : "auto",
                      maxWidth: isFrozen ? col.minWidth : "none",
                      position: isFrozen ? "sticky" : "relative",
                      top: 0,
                      zIndex: isFrozen ? 15 : 5,
                      borderBottom: "1px solid #d1d5db",
                      py: 0.75,
                      px: idx === frozenColumnCount - 1 ? 1.5 : 0.75,
                      pr: idx === frozenColumnCount - 1 ? 2 : undefined,
                    }}
                  >
                    {col.label}
                  </TableCell>
                );
              })}
            </TableRow>
          </TableHead>
          <TableBody>
            {/* Totals Row */}
            <TableRow
              sx={{
                backgroundColor: "#f1f5f9",
                borderBottom: "1px solid #d1d5db",
              }}
            >
              {columns.map((col, idx) => {
                const isFrozen = ESSENTIAL_LEVEL_COLUMNS.includes(col.id);

                return (
                  <TableCell
                    key={`total-${col.id}`}
                    align={col.align}
                    className={isFrozen ? `frozen-column frozen-column-${idx}` : ""}
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      backgroundColor: "#f1f5f9",
                      color: "#1e293b",
                      borderBottom: "1px solid #000A32",
                      width: isFrozen ? col.minWidth || 100 : "auto",
                      minWidth: isFrozen ? col.minWidth || 100 : "auto",
                      maxWidth: isFrozen ? col.minWidth || 100 : "none",
                      py: 0.75,
                      px: idx === frozenColumnCount - 1 ? 1.5 : 0.75,
                      pr: idx === frozenColumnCount - 1 ? 2 : undefined,
                    }}
                  >
                    {col.isUserInput || totals[col.id] === ""
                      ? ""
                      : col.format && typeof totals[col.id] === "number"
                        ? col.format(totals[col.id])
                        : totals[col.id] || ""}
                  </TableCell>
                );
              })}
            </TableRow>

            {/* Data Rows */}
            {paginatedData.map((row, idx) => (
              <TableRow
                key={`row-${idx}`}
                sx={{
                  "&:nth-of-type(even)": { backgroundColor: "#f8fafc" },
                  "&:hover": { backgroundColor: "#e2e8f0" },
                }}
              >
                {columns.map((col, colIdx) => {
                  const isFrozen = ESSENTIAL_LEVEL_COLUMNS.includes(col.id);

                  return (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      className={
                        isFrozen ? `frozen-column frozen-column-${colIdx}` : ""
                      }
                      sx={{
                        fontSize: "0.75rem",
                        color: "#1e293b",
                        fontWeight: isFrozen ? 600 : 400,
                        backgroundColor: col.headerColor
                          ? "#fef2f2"
                          : isFrozen
                            ? "#ffffff"
                            : "transparent",
                        borderBottom: "1px solid #D2d2d2",
                        width: isFrozen ? col.minWidth || 100 : "auto",
                        minWidth: isFrozen ? col.minWidth || 100 : "auto",
                        maxWidth: isFrozen ? col.minWidth || 100 : "none",
                        py: 0.75,
                        px: colIdx === frozenColumnCount - 1 ? 1.5 : 0.75,
                        pr: colIdx === frozenColumnCount - 1 ? 2 : undefined,
                      }}
                    >
                      {col.isUserInput ? (
                        <TextField
                          size="small"
                          variant="outlined"
                          placeholder="0"
                          value={getValue(idx, col.id)}
                          onChange={(e) => handleInput(idx, col.id, e.target.value)}
                          type="number"
                          sx={{
                            minWidth: 90,
                            "& .MuiOutlinedInput-root": {
                              backgroundColor: "#ffffff",
                              "& fieldset": {
                                borderColor: "#e5e7eb",
                              },
                            },
                            "& .MuiOutlinedInput-input": {
                              padding: "5px 10px",
                              textAlign: "right",
                              color: "#1e293b",
                            },
                          }}
                        />
                      ) : col.format ? (
                        col.format(row[col.id])
                      ) : (
                        row[col.id] || ""
                      )}
                    </TableCell>
                  );
                })}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

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
        }}
      />
    </>
  );
};

export default DataTable;