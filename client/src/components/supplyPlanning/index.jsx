import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSubNavbar from "../shared/DashboardSubNavbar";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AssessmentIcon from "@mui/icons-material/Assessment";

const ACCENT = "#A78BFA";

const tabs = [
  {
    label: "Alert Dashboard",
    icon: <NotificationsActiveIcon sx={{ fontSize: 15 }} />,
    path: "/supply-planning/alert-dashboard",
  },
  {
    label: "Executive Overview",
    icon: <AssessmentIcon sx={{ fontSize: 15 }} />,
    path: "/supply-planning/executive-overview",
  },
];

const SupplyPlanningDashboard = () => (
  <Box
    sx={{
      display: "flex",
      flexDirection: "column",
      minHeight: "calc(100vh - 56px)",
    }}
  >
    <DashboardSubNavbar tabs={tabs} domain="Supply Planning" accentColor={ACCENT} />
    <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#111827" }}>
      <Outlet />
    </Box>
  </Box>
);

export default SupplyPlanningDashboard;
