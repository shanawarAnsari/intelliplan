import React, { useState } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  Typography,
  Avatar,
  useTheme,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
} from "@mui/material";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import Logo from "../../assets/Intelliplan-logo.png";
import { Link } from "react-router-dom";
import { useUserStore } from "../../store/userStore";
import { useNavigate } from "react-router-dom"
const domains = [
  { id: "demand", title: "Demand Planning" }
];

const TopNavbar = ({ onToggleHelp }) => {
  const theme = useTheme();
  const [selectedDomain, setSelectedDomain] = useState(domains[0]);
  const { user } = useUserStore();
  const navigate = useNavigate();
  return (
    <Box
      sx={{
        position: "sticky",
        top: 0,
        zIndex: 1100,
        pt: "4px",
        px: '8px',
        borderBottom: `1px solid ${theme.palette.divider}`,
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        backgroundColor: '#182026',
        boxShadow: "0px 2px 8px rgba(0,0,0,0.07)",
        width: "100%",
      }}
    >
      <Box sx={{ display: "flex", alignItems: "center", width: "100%" }}>
        <Box onClick={() => navigate('/')}>
          <img
            src={Logo}
            alt="InteliPlan Logo"
            height="38"
            style={{ marginRight: theme.spacing(2), borderRadius: 8 }}
            className="hover-lift"
          />
        </Box>
        <Box sx={{ flex: 1 }} />
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 0,
            mr: 4,
          }}
        >
          <Link
            to="/"
            style={{
              textDecoration: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: ".85rem",
              padding: "6px 18px",
              borderRadius: "6px",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = theme.palette.primary.light)
            }
            onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
          >
            Home
          </Link>
          <Link
            to="/runrate"
            style={{
              textWrap: 'nowrap',
              textDecoration: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: ".85rem",
              padding: "6px 18px",
              borderRadius: "6px",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = theme.palette.primary.light)
            }
            onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
          >
            Run Rate
          </Link>
          <Link
            to="/ask-ai"
            style={{
              textWrap: 'nowrap',
              textDecoration: "none",
              color: "#fff",
              fontWeight: 600,
              fontSize: ".85rem",
              padding: "6px 18px",
              borderRadius: "6px",
              transition: "color 0.2s",
            }}
            onMouseOver={(e) =>
              (e.currentTarget.style.color = theme.palette.primary.light)
            }
            onMouseOut={(e) => (e.currentTarget.style.color = "#fff")}
          >
            Ask Intelliplan
          </Link>
        </Box>
      </Box>
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          gap: 1,
          color: theme.palette.text.secondary,
        }}
      >
        <FormControl
          variant="outlined"
          size="small"
          sx={{
            width: 180,
            mr: 1,
            "& .MuiOutlinedInput-root": {
              borderRadius: "4px",
              fontSize: "0.875rem",
            },
          }}
        >
          <InputLabel id="domain-select-label">Domain</InputLabel>
          <Select
            labelId="domain-select-label"
            id="domain-select"
            value={selectedDomain.id}
            onChange={(e) => {
              const selected = domains.find(
                (domain) => domain.id === e.target.value
              );
              setSelectedDomain(selected);
            }}
            label="Domain"
            sx={{
              minWidth: 100,
              height: 28,
              '.MuiSelect-select': {
                fontSize: '0.75rem',   // smaller text inside the box
                padding: '4px 8px',    // inner padding
              },
            }}
          >
            {domains.map((domain) => (
              <MenuItem
                key={domain.id}
                value={domain.id}
                sx={{ fontSize: '0.75rem' }} // smaller text in dropdown items
              >
                {domain.title}
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        <Tooltip title="Help & FAQ">
          <IconButton
            onClick={onToggleHelp}
            sx={{
              color: theme.palette.text.secondary,
              mr: 1,
              transition: "color 0.2s ease",
              "&:hover": {
                color: theme.palette.primary.main,
              },
            }}
          >
            <HelpOutlineIcon fontSize="small" />
          </IconButton>
        </Tooltip>
        <IconButton sx={{ color: theme.palette.text.secondary }}>
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
            ml: -1,
            fontWeight: "medium",
            color: theme.palette.text.primary,
            fontSize: "0.85rem",
            textWrap: 'nowrap'
          }}
        >
          {user?.name}
        </Typography>
      </Box>
    </Box>
  );
};

export default TopNavbar;
