/**
 * Search Bar Component for filtering conversations
 */
import React from "react";
import { TextField, InputAdornment, IconButton, Box } from "@mui/material";
import SearchIcon from "@mui/icons-material/Search";
import ClearIcon from "@mui/icons-material/Clear";

const SearchBar = ({ searchQuery, onSearchChange }) => {
  return (
    <Box sx={{ p: 1 }}>
      <TextField
        fullWidth
        size="small"
        placeholder="Search conversations..."
        value={searchQuery}
        onChange={(e) => onSearchChange(e.target.value)}
        InputProps={{
          startAdornment: (
            <InputAdornment position="start">
              <SearchIcon sx={{ fontSize: "1.2rem" }} />
            </InputAdornment>
          ),
          endAdornment: searchQuery && (
            <InputAdornment position="end">
              <IconButton size="small" onClick={() => onSearchChange("")} edge="end">
                <ClearIcon sx={{ fontSize: "1rem" }} />
              </IconButton>
            </InputAdornment>
          ),
        }}
        sx={{
          "& .MuiOutlinedInput-root": {
            borderRadius: 1,
          },
        }}
        inputProps={{
          "aria-label": "Search conversations",
        }}
      />
    </Box>
  );
};

export default SearchBar;
