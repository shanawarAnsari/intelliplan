import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSubNavbar from "../shared/DashboardSubNavbar";
import AnalyticsIcon from "@mui/icons-material/BarChart";
import AlertManagementIcon from "@mui/icons-material/ManageSearch";
import AlertsDashboardIcon from "@mui/icons-material/NotificationsActive";

const ACCENT = "#A78BFA";

const tabs = [
  {
    label: "Alerts Management",
    icon: <AlertManagementIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/alert-prioritization/alerts-management",
  },
  {
    label: "Alerts Dashboard",
    icon: <AlertsDashboardIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/alert-prioritization/alerts-dashboard",
  },
  {
    label: "Analytics",
    icon: <AnalyticsIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/alert-prioritization/analytics",
  },

];

const AlertPrioritizationSection = () => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <DashboardSubNavbar
      tabs={tabs}
      domain="Alert Prioritization"
      accentColor={ACCENT}
    />
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Outlet />
    </Box>
  </Box>
);

export default AlertPrioritizationSection;
