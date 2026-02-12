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
          "& .frozen-column": {
            position: "sticky",
            zIndex: 10,
          },
          "& .frozen-column-1": { left: 0 },
          "& .frozen-column-2": { left: "100px" },
          "& .frozen-column-3": { left: "180px" },
          "& .frozen-column-4": { left: "300px" },
          "& .frozen-column-5": {
            left: "420px",
            borderRight: "2px solid #7e7e7e1b",
          },
        }}
      >
        <Table stickyHeader size="small">
          <TableHead>
            <TableRow>
              {columns.map((col, idx) => {
                // Determine width based on column position
                let colWidth = 100; // Default for Region
                if (idx === 1) colWidth = 80; // Country
                if (idx === 2) colWidth = 120; // Business Unit
                if (idx === 3) colWidth = 120; // Category
                if (idx === 4) colWidth = 140; // Sub Category

                return (
                  <TableCell
                    key={col.id}
                    align={col.align}
                    className={
                      idx < 5 ? `frozen-column frozen-column-${idx + 1}` : ""
                    }
                    sx={{
                      fontWeight: 600,
                      backgroundColor: col.headerColor || "#1e293b",
                      color: col.headerColor ? "#1e293b" : "#ffffff",
                      fontSize: "0.7rem",
                      textTransform: "uppercase",
                      minWidth: idx < 5 ? colWidth : col.minWidth || 120,
                      width: idx < 5 ? colWidth : "auto",
                      maxWidth: idx < 5 ? colWidth : "none",
                      position: idx < 5 ? "sticky" : "relative",
                      top: 0,
                      zIndex: idx < 5 ? 15 : 5,
                      borderBottom: "1px solid #d1d5db",
                      py: 0.75,
                      px: idx === 4 ? 1.5 : 0.75,
                      pr: idx === 4 ? 2 : undefined,
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
                let colWidth = 100;
                if (idx === 1) colWidth = 80;
                if (idx === 2) colWidth = 120;
                if (idx === 3) colWidth = 120;
                if (idx === 4) colWidth = 140;

                return (
                  <TableCell
                    key={`total-${col.id}`}
                    align={col.align}
                    className={
                      idx < 5 ? `frozen-column frozen-column-${idx + 1}` : ""
                    }
                    sx={{
                      fontWeight: 600,
                      fontSize: "0.75rem",
                      backgroundColor: "#f1f5f9",
                      color: "#1e293b",
                      borderBottom: "1px solid #000A32",
                      width: idx < 5 ? colWidth : "auto",
                      minWidth: idx < 5 ? colWidth : "auto",
                      maxWidth: idx < 5 ? colWidth : "none",
                      py: 0.75,
                      px: idx === 4 ? 1.5 : 0.75,
                      pr: idx === 4 ? 2 : undefined,
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
                  let colWidth = 100;
                  if (colIdx === 1) colWidth = 80;
                  if (colIdx === 2) colWidth = 120;
                  if (colIdx === 3) colWidth = 120;
                  if (colIdx === 4) colWidth = 140;

                  return (
                    <TableCell
                      key={col.id}
                      align={col.align}
                      className={
                        colIdx < 5 ? `frozen-column frozen-column-${colIdx + 1}` : ""
                      }
                      sx={{
                        fontSize: "0.75rem",
                        color: "#1e293b",
                        fontWeight: colIdx < 5 ? 600 : 400,
                        backgroundColor: col.headerColor
                          ? "#fef2f2"
                          : colIdx < 5
                            ? "#ffffff"
                            : "transparent",
                        borderBottom: "1px solid #D2d2d2",
                        width: colIdx < 5 ? colWidth : "auto",
                        minWidth: colIdx < 5 ? colWidth : "auto",
                        maxWidth: colIdx < 5 ? colWidth : "none",
                        py: 0.75,
                        px: colIdx === 4 ? 1.5 : 0.75,
                        pr: colIdx === 4 ? 2 : undefined,
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
