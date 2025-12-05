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
  // Calculate totals for all data
  const totals = useMemo(() => {
    const totals = {};
    columns?.forEach((col) => {
      if (col.id === "COUNTRY") {
        totals[col.id] = "TOTAL";
      } else if (["CATEGORY", "SUB_CATEGORY", "BUSINESS_UNIT"].includes(col.id)) {
        totals[col.id] = "";
      } else if (col.isUserInput) {
        totals[col.id] = "";
      } else {
        const sum = data?.reduce((acc, row) => {
          const value = parseFloat(row[col.id]) || 0;
          return acc + value;
        }, 0);
        totals[col.id] = sum;
      }
    });
    return totals;
  }, [data, columns]);

  // Get paginated data
  const paginatedData = useMemo(() => {
    if (!data || data.length === 0) return [];
    return data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);
  }, [data, page, rowsPerPage]);

  // Handle user input
  const handleUserInput = (rowIndex, columnId, value) => {
    if (
      value === "" ||
      value === "-" ||
      (!isNaN(value) && value >= -1000 && value <= 1000)
    ) {
      onUserInputChange(page * rowsPerPage + rowIndex, columnId, value);
    }
  };

  // Get user input value
  const getUserInputValue = (rowIndex, columnId) => {
    const globalRowIndex = page * rowsPerPage + rowIndex;
    return userInputs?.[`${globalRowIndex}-${columnId}`] || "";
  };

  if (!data || data.length === 0) {
    return (
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "200px",
          gap: 2,
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
          border: "1px solid #e2e8f0",
          borderRadius: 1,
          backgroundColor: "#ffffff",
          "& .frozen-column": {
            position: "sticky",
            zIndex: 10,
          },
          "& .frozen-column-1": { left: 0 },
          "& .frozen-column-2": { left: "120px" },
          "& .frozen-column-3": { left: "240px" },
          "& .frozen-column-4": {
            left: "360px",
            borderRight: "2px solid #514f4f1d",
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, index) => (
                <TableCell
                  key={col.id}
                  align={col.align}
                  className={
                    index < 4 ? `frozen-column frozen-column-${index + 1}` : ""
                  }
                  sx={{
                    fontWeight: 600,
                    backgroundColor: col.headerColor || "#1e293b",
                    color: col.headerColor ? "#1e293b" : "#ffffff",
                    borderBottom: col.headerColor
                      ? "2px solid #ff9999"
                      : "2px solid #0f172a",
                    fontSize: "0.7rem",
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                    minWidth: index < 4 ? 120 : col.minWidth || 120,
                    width: index < 4 ? 120 : "auto",
                    maxWidth: index < 4 ? 120 : "none",
                    position: index < 4 ? "sticky" : "relative",
                    top: 0,
                    zIndex: index < 4 ? 15 : 5,
                    py: 0.75,
                    px: 1,
                    height: "32px",
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
              sx={{ backgroundColor: "#f1f5f9", borderBottom: "2px solid #3b82f6" }}
            >
              {columns.map((col, index) => (
                <TableCell
                  key={`total-${col.id}`}
                  align={col.align}
                  className={
                    index < 4 ? `frozen-column frozen-column-${index + 1}` : ""
                  }
                  sx={{
                    py: 0.75,
                    px: index < 4 ? 1 : 2,
                    height: "34px",
                    backgroundColor: "#f1f5f9",
                    fontWeight: 600,
                    fontSize: "0.75rem",
                    color: "#1e293b",
                    position: index < 4 ? "sticky" : "relative",
                    zIndex: index < 4 ? 10 : 0,
                    width: index < 4 ? 120 : "auto",
                    minWidth: index < 4 ? 120 : "auto",
                    maxWidth: index < 4 ? 120 : "none",
                  }}
                >
                  {col.isUserInput
                    ? ""
                    : col.format && typeof totals[col.id] === "number"
                    ? col.format(totals[col.id])
                    : totals[col.id] || ""}
                </TableCell>
              ))}
            </TableRow>

            {/* Data Rows */}
            {paginatedData.map((row, idx) => (
              <TableRow
                key={`row-${idx}`}
                sx={{
                  backgroundColor: "#ffffff",
                  "&:nth-of-type(even)": { backgroundColor: "#f8fafc" },
                  "&:hover": { backgroundColor: "#e2e8f0" },
                }}
              >
                {columns.map((col, colIndex) => (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    className={
                      colIndex < 4
                        ? `frozen-column frozen-column-${colIndex + 1}`
                        : ""
                    }
                    sx={{
                      fontSize: "0.75rem",
                      fontWeight: colIndex < 4 ? 600 : 400,
                      color: colIndex < 4 ? "#1e293b" : "#475569",
                      backgroundColor: col.headerColor
                        ? "#fef2f2"
                        : colIndex < 4
                        ? "#ffffff"
                        : "transparent",
                      borderBottom: "1px solid #e2e8f0",
                      py: 0.75,
                      px: colIndex < 4 ? 1 : 2,
                      height: "32px",
                      position: colIndex < 4 ? "sticky" : "relative",
                      zIndex: colIndex < 4 ? 10 : 0,
                      width: colIndex < 4 ? 120 : "auto",
                      minWidth: colIndex < 4 ? 120 : "auto",
                      maxWidth: colIndex < 4 ? 120 : "none",
                    }}
                  >
                    {col.isUserInput ? (
                      <TextField
                        size="small"
                        variant="outlined"
                        placeholder="0"
                        value={getUserInputValue(idx, col.id)}
                        onChange={(e) =>
                          handleUserInput(idx, col.id, e.target.value)
                        }
                        sx={{
                          minWidth: 90,
                          "& .MuiOutlinedInput-root": {
                            height: "28px",
                            fontSize: "0.75rem",
                            backgroundColor: "#ffffff",
                            borderRadius: 0.5,
                            border: "1px solid #d1d5db",
                          },
                          "& .MuiOutlinedInput-input": {
                            padding: "5px 10px",
                            textAlign: "right",
                            color: "#1f2937",
                          },
                        }}
                        type="number"
                        inputProps={{ min: -1000, max: 1000, step: 0.01 }}
                      />
                    ) : col.format ? (
                      col.format(row[col.id])
                    ) : (
                      row[col.id] || ""
                    )}
                  </TableCell>
                ))}
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
            minHeight: "44px",
            padding: "0 12px",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            color: "#FFF",
            fontWeight: 500,
            fontSize: "0.8rem",
            margin: 0,
          },
          "& .MuiTablePagination-select": { fontSize: "0.8rem" },
        }}
      />
    </>
  );
};

export default DataTable;
