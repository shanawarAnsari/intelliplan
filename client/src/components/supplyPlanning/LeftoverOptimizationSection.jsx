import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSubNavbar from "../shared/DashboardSubNavbar";
import InventoryIcon from "@mui/icons-material/Inventory2";
import SummaryIcon from "@mui/icons-material/AssessmentOutlined";

const ACCENT = "#A78BFA";

const tabs = [
  {
    label: "STO Management",
    icon: <InventoryIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/leftover-optimization/sto-management",
  },
  {
    label: "Executive Summary",
    icon: <SummaryIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/leftover-optimization/executive-summary",
  },
];

const LeftoverOptimizationSection = () => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <DashboardSubNavbar
      tabs={tabs}
      domain="Leftover Optimization"
      accentColor={ACCENT}
    />
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Outlet />
    </Box>
  </Box>
);

export default LeftoverOptimizationSection;
