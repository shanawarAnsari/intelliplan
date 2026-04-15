import React from "react";
import DashboardLayout from "../shared/DashboardLayout";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";

const navItems = [
  {
    label: "Run Rate Simulator",
    icon: <LocalShippingIcon sx={{ fontSize: 19 }} />,
    path: "runrate",
  },
  {
    label: "Ask Intelliplan",
    icon: <AutoAwesomeIcon sx={{ fontSize: 19 }} />,
    path: "ask-ai",
  },
];

const DemandPlanningDashboard = () => (
  <DashboardLayout
    title="Demand Planning"
    navItems={navItems}
    basePath="demand-planning"
  />
);

export default DemandPlanningDashboard;
