import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  useTheme,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../assets/Intelliplan-logo.png";

const TopNavbar = ({ onToggleHelp }) => {
  const theme = useTheme();

  return (
    <Box
      sx={{
        p: "8px 12px",
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: theme.palette.background.paper,
        boxShadow: "0px 1px 3px rgba(0,0,0,0.1)",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center" }}>
        <img src={Logo} alt="InteliPlan Logo" height="35" className="hover-lift" />
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          color: theme.palette.text.secondary,
        }}
      >
        <Tooltip title="Help & FAQ">
          <IconButton
            onClick={onToggleHelp}
            sx={{
              color: theme.palette.text.secondary,
              mr: 1.5,
              transition: "color 0.2s ease",
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton sx={{ color: theme.palette.text.secondary, p: 0.5 }}>
          <Avatar
            sx={{
              width: 28,
              height: 28,
              bgcolor: theme.palette.primary.main,
              transition: "transform 0.2s ease",
              "&:hover": {
                transform: "scale(1.05)",
              },
            }}
          >
            <AccountCircleIcon fontSize="small" />
          </Avatar>
        </IconButton>
        <Typography
          variant="body2"
          sx={{
            ml: 0.5,
            fontWeight: "medium",
            color: theme.palette.text.primary,
            fontSize: "0.85rem",
          }}
        >
          Doe, John
        </Typography>
      </Box>
    </Box>
  );
};

export default TopNavbar;
