import React from "react";
import DashboardLayout from "../shared/DashboardLayout";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AssessmentIcon from "@mui/icons-material/Assessment";

const navItems = [
  {
    label: "Alert Dashboard",
    icon: <NotificationsActiveIcon sx={{ fontSize: 19 }} />,
    path: "alert-dashboard",
  },
  {
    label: "Executive Overview",
    icon: <AssessmentIcon sx={{ fontSize: 19 }} />,
    path: "executive-overview",
  },
];

const SupplyPlanningDashboard = () => (
  <DashboardLayout
    title="Supply Planning"
    navItems={navItems}
    basePath="supply-planning"
  />
);

export default SupplyPlanningDashboard;
