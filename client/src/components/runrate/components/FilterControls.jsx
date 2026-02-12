import React from "react";
import { Box, FormControl, InputLabel, Select, MenuItem } from "@mui/material";

const FilterControls = ({ runRateOption, setRunRateOption }) => {
  return (
    <Box sx={{ display: "flex", gap: 0.75, flexWrap: "wrap" }}>
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
