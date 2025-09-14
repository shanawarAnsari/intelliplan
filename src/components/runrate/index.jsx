import React, { useState, useEffect } from 'react';
import {
  Box, Table, TableBody, TableCell, TableContainer, TableHead, TableRow,
  Paper, TextField, Typography, TablePagination, InputAdornment, IconButton,
  MenuItem, Select, FormControl, InputLabel, Button
} from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import DownloadIcon from '@mui/icons-material/Download';
import { saveAs } from 'file-saver';
import rgmData from '../data/rgm_data.json';

const columns = [
  { id: 'category', label: 'Category' },
  { id: 'TOTAL_FORECAST_GROSS_SALES_CURRENT_MONTH', label: 'Forecast Gross Sales' },
  { id: 'AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKENDS', label: 'Weekend Avg Shipments' },
  { id: 'AVG_ACTUAL_SHIPMENTS_13WEEKS_WEEKDAYS', label: 'Weekday Avg Shipments' },
  { id: 'TOTAL_ACTUAL_SHIPMENTS_CURRENT_MONTH', label: 'Actual Shipments' },
];

const SalesForecastTable = () => {
  const [data, setData] = useState(rgmData);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const sources = [...new Set(rgmData.map(row => row.SOURCE))];

  useEffect(() => {
    let filtered = rgmData;

    if (sourceFilter) {
      filtered = filtered.filter(row => row.SOURCE === sourceFilter);
    }

    if (search) {
      filtered = filtered.filter(row =>
        row.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    setData(filtered);
  }, [search, sourceFilter]);

  const handleDownload = () => {
    const csv = [
      columns.map(col => col.label).join(','),
      ...data.map(row =>
        columns.map(col => row[col.id]).join(',')
      ),
    ].join('\n');

    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    saveAs(blob, 'filtered_sales_forecast.csv');
  };

  return (
    <Box sx={{ p: 3, backgroundColor: '#f9f9f9', minHeight: '100vh' }}>
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
        Intelliplan POC – Gross Sales Table
      </Typography>

      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <TextField
          label="Search Category"
          variant="outlined"
          size="small"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{
            endAdornment: (
              <InputAdornment position="end">
                <IconButton>
                  <SearchIcon />
                </IconButton>
              </InputAdornment>
            ),
          }}
        />

        <FormControl size="small" sx={{ minWidth: 200 }}>
          <InputLabel>Source Filter</InputLabel>
          <Select
            value={sourceFilter}
            label="Source Filter"
            onChange={(e) => setSourceFilter(e.target.value)}
          >
            <MenuItem value="">All Sources</MenuItem>
            {sources.map(source => (
              <MenuItem key={source} value={source}>{source}</MenuItem>
            ))}
          </Select>
        </FormControl>

        <Button
          variant="contained"
          startIcon={<DownloadIcon />}
          onClick={handleDownload}
        >
          Download CSV
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table stickyHeader>
          <TableHead>
            <TableRow>
              {columns.map(col => (
                <TableCell key={col.id} sx={{ fontWeight: 'bold' }}>
                  {col.label}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {data.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage).map((row, idx) => (
              <TableRow key={idx}>
                {columns.map(col => (
                  <TableCell key={col.id}>
                    {typeof row[col.id] === 'number'
                      ? row[col.id].toLocaleString(undefined, { maximumFractionDigits: 2 })
                      : row[col.id]}
                  </TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <TablePagination
          component="div"
          count={data.length}
          page={page}
          onPageChange={(e, newPage) => setPage(newPage)}
          rowsPerPage={rowsPerPage}
          onRowsPerPageChange={(e) => {
            setRowsPerPage(parseInt(e.target.value, 10));
            setPage(0);
          }}
        />
      </TableContainer>
    </Box>
  );
};

export default SalesForecastTable;
