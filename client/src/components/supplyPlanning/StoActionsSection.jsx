import React from "react";
import { Box } from "@mui/material";
import { Outlet } from "react-router-dom";
import DashboardSubNavbar from "../shared/DashboardSubNavbar";
import CancelIcon from "@mui/icons-material/CancelScheduleSend";
import DashboardIcon from "@mui/icons-material/Dashboard";

const ACCENT = "#A78BFA";

const tabs = [
  {
    label: "STO Cancel/Push",
    icon: <CancelIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/sto-actions/sto-cancel-push",
  },
  {
    label: "STO Dashboard",
    icon: <DashboardIcon sx={{ fontSize: 14 }} />,
    path: "/supply-planning/sto-actions/sto-dashboard",
  },
];

const StoActionsSection = () => (
  <Box sx={{ display: "flex", flexDirection: "column", height: "100%" }}>
    <DashboardSubNavbar tabs={tabs} domain="STO Actions" accentColor={ACCENT} />
    <Box sx={{ flex: 1, overflow: "auto" }}>
      <Outlet />
    </Box>
  </Box>
);

export default StoActionsSection;
