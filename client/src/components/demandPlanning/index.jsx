import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../shared/DashboardSidebar";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const ACCENT = "#1B938A";

const sideItems = [
  {
    label: "Run Rate Simulator",
    icon: LocalShippingIcon,
    path: "/demand-planning/runrate",
  },
  {
    label: "Ask Intelliplan",
    icon: AutoAwesomeIcon,
    path: "/demand-planning/ask-ai",
  },
];

const DemandPlanningDashboard = () => (
  <Box sx={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
    <DashboardSidebar
      items={sideItems}
      accentColor={ACCENT}
      domain="Demand Planning"
      topOffset={56}
    />
    <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#111827" }}>
      <Outlet />
    </Box>
  </Box>
);

export default DemandPlanningDashboard;
