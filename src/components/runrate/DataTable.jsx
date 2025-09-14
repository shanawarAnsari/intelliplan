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
                        fontWeight: col.id === "category" ? 600 : 400,
                        color: col.id === "category" ? "#1e293b" : "#475569",
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
                            placeholder="Enter %"
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
            color: "#374151",
          },
          "& .MuiTablePagination-selectLabel, & .MuiTablePagination-displayedRows": {
            color: "#6b7280",
            fontWeight: 500,
          },
        }}
      />
    </>
  );
};

export default DataTable;
