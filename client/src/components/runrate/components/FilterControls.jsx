import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const FilterControls = ({
  countries,
  countryFilter,
  setCountryFilter,
  levelFilter,
  setLevelFilter,
  runRateOption,
  setRunRateOption,
  onLevelChange,
}) => {
  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
      {/* Country Filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: 120,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            fontSize: "0.8rem",
            height: "32px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.8rem",
          },
        }}
      >
        <InputLabel id="country-select-label">Country</InputLabel>
        <Select
          labelId="country-select-label"
          id="country-select"
          multiple
          value={countryFilter || []}
          label="Country"
          onChange={(e) => setCountryFilter(e.target.value)}
          renderValue={(selected) =>
            selected.length === 0 ? "" : `${selected.length} selected`
          }
          MenuProps={{
            PaperProps: {
              sx: { fontSize: "0.8rem" },
            },
          }}
        >
          {countries.map((country) => (
            <MenuItem key={country} value={country} sx={{ fontSize: "0.8rem" }}>
              <input
                type="checkbox"
                checked={countryFilter?.includes(country) || false}
                readOnly
                style={{ marginRight: 8 }}
              />
              {country}
            </MenuItem>
          ))}
        </Select>
      </FormControl>

      {/* Level Filter */}
      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            fontSize: "0.8rem",
            height: "32px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.8rem",
          },
        }}
      >
        <InputLabel id="level-select-label">Aggregation Level</InputLabel>
        <Select
          labelId="level-select-label"
          id="level-select"
          value={levelFilter}
          label="Aggregation Level"
          onChange={onLevelChange}
          MenuProps={{
            PaperProps: {
              sx: { fontSize: "0.8rem" },
            },
          }}
        >
          <MenuItem value="BUSINESS_UNIT" sx={{ fontSize: "0.8rem" }}>
            Business Unit
          </MenuItem>
          <MenuItem value="CATEGORY" sx={{ fontSize: "0.8rem" }}>
            Category
          </MenuItem>
          <MenuItem value="SUB_CATEGORY" sx={{ fontSize: "0.8rem" }}>
            Sub Category
          </MenuItem>
        </Select>
      </FormControl>

      {/* Run Rate Option */}
      <FormControl
        size="small"
        sx={{
          minWidth: 150,
          "& .MuiOutlinedInput-root": {
            borderRadius: 1.5,
            fontSize: "0.8rem",
            height: "32px",
          },
          "& .MuiInputLabel-root": {
            fontSize: "0.8rem",
          },
        }}
      >
        <InputLabel id="runrate-select-label">Run Rate Period</InputLabel>
        <Select
          labelId="runrate-select-label"
          id="runrate-select"
          value={runRateOption}
          label="Run Rate Period"
          onChange={(e) => setRunRateOption(e.target.value)}
          MenuProps={{
            PaperProps: {
              sx: { fontSize: "0.8rem" },
            },
          }}
        >
          <MenuItem value="13weeks" sx={{ fontSize: "0.8rem" }}>
            13 Weeks
          </MenuItem>
          <MenuItem value="8weeks" sx={{ fontSize: "0.8rem" }}>
            8 Weeks
          </MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
};

export default FilterControls;
