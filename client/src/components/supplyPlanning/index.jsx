import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSidebar from "../shared/DashboardSidebar";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import Inventory2Icon from "@mui/icons-material/Inventory2";
import LocalShippingIcon from "@mui/icons-material/LocalShipping";

const ACCENT = "#A78BFA";

const sideItems = [
  {
    label: "Alert Prioritization",
    icon: NotificationsActiveIcon,
    path: "/supply-planning/alert-prioritization",
  },
  {
    label: "Leftover Optimization",
    icon: Inventory2Icon,
    path: "/supply-planning/leftover-optimization",
  },
  {
    label: "STO Actions",
    icon: LocalShippingIcon,
    path: "/supply-planning/sto-actions",
  },
];

const SupplyPlanningDashboard = () => (
  <Box sx={{ display: "flex", minHeight: "calc(100vh - 56px)" }}>
    <DashboardSidebar
      items={sideItems}
      accentColor={ACCENT}
      domain="Supply Planning"
      topOffset={56}
    />
    <Box sx={{ flex: 1, overflow: "auto", bgcolor: "#111827" }}>
      <Outlet />
    </Box>
  </Box>
);

export default SupplyPlanningDashboard;
