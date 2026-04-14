import React from "react";
import {
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Checkbox,
  ListItemText,
  Box,
} from "@mui/material";

const AVAILABLE_LEVELS = [
  { id: "REGION", label: "Region" },
  { id: "COUNTRY", label: "Country" },
  { id: "BUSINESS_UNIT", label: "Business Unit" },
  { id: "CATEGORY", label: "Category" },
  { id: "SUB_CATEGORY", label: "Sub Category" },
];

const LevelSelector = ({ selectedLevels, onLevelsChange }) => {
  const handleLevelToggle = (levelId) => {
    const newLevels = selectedLevels.includes(levelId)
      ? selectedLevels.filter((l) => l !== levelId)
      : [...selectedLevels, levelId];

    onLevelsChange(newLevels);
  };

  return (
    <FormControl
      size="small"
      sx={{
        minWidth: 220,
        "& .MuiOutlinedInput-root": {
          borderRadius: 1.5,
          fontSize: "0.85rem",
          height: "32px",
        },
        "& .MuiInputLabel-root": {
          fontSize: "0.85rem",
        },
      }}
    >
      <InputLabel id="level-select-label">Aggregation Levels</InputLabel>
      <Select
        labelId="level-select-label"
        id="level-select"
        multiple
        value={selectedLevels}
        label="Aggregation Levels"
        onChange={(e) => onLevelsChange(e.target.value)}
        renderValue={(selected) =>
          selected.length === 0
            ? "Select levels..."
            : `${selected.length} level${selected.length !== 1 ? "s" : ""} selected`
        }
        MenuProps={{
          PaperProps: {
            sx: { fontSize: "0.85rem" },
          },
        }}
      >
        {AVAILABLE_LEVELS.map((level) => (
          <MenuItem key={level.id} value={level.id}>
            <Checkbox checked={selectedLevels.includes(level.id)} size="small" />
            <ListItemText
              primary={level.label}
              sx={{ ml: 1, fontSize: "0.85rem" }}
            />
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  );
};

export default LevelSelector;
export { AVAILABLE_LEVELS };
