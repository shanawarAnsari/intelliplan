import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSubNavbar from "../shared/DashboardSubNavbar";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const ACCENT = "#1B938A";

const tabs = [
  {
    label: "Run Rate Simulator",
    icon: <LocalShippingIcon sx={{ fontSize: 15 }} />,
    path: "/demand-planning/runrate",
  },
  {
    label: "Ask Intelliplan",
    icon: <AutoAwesomeIcon sx={{ fontSize: 15 }} />,
    path: "/demand-planning/ask-ai",
  },
];

const DemandPlanningDashboard = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "calc(100vh - 56px)",
    }}
  >
    <DashboardSubNavbar tabs={tabs} domain="Demand Planning" accentColor={ACCENT} />
    <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#111827" }}>
      <Outlet />
    </Box>
  </Box>
);

export default DemandPlanningDashboard;
