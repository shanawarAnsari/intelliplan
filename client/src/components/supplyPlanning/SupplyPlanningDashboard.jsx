import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import NotificationsActiveRoundedIcon from "@mui/icons-material/NotificationsActiveRounded";
import InventoryRoundedIcon from "@mui/icons-material/InventoryRounded";
import CancelRoundedIcon from "@mui/icons-material/CancelRounded";

import DashboardSubNavbar from "../shared/DashboardSubNavbar";
import DashboardSidebar from "../shared/DashboardSidebar";
import AlertsDashboard from "./alertPrioritization/AlertsDashboard";
import AlertsManagement from "./alertPrioritization/AlertsManagement";
import ExecuteOverview from "./leftoverOptimization/ExecuteOverview";
import STOManagement from "./leftoverOptimization/STOManagement";
import STOActionsDashboard from "./stoCancelPush/STOActionsDashboard";
import STOActions from "./stoCancelPush/STOActions";

const ACCENT = "#A78BFA";
const BASE = "/supply-planning";

// Flat sidebar — 3 top-level items only, each links to its group's first page
const SIDEBAR_ITEMS = [
  {
    label: "Alert Prioritization",
    icon: NotificationsActiveRoundedIcon,
    path: `${BASE}/alerts-dashboard`,
  },
  {
    label: "Leftover Optimization",
    icon: InventoryRoundedIcon,
    path: `${BASE}/execute-overview`,
  },
  {
    label: "STO Cancel / Push",
    icon: CancelRoundedIcon,
    path: `${BASE}/sto-actions-dashboard`,
  },
];

// Sub-tabs per group — keyed by active group
const GROUP_TABS = {
  alerts: [
    { label: "Alerts Dashboard", path: `${BASE}/alerts-dashboard` },
    { label: "Alerts Management", path: `${BASE}/alerts-management` },
  ],
  leftover: [
    { label: "Executive Overview", path: `${BASE}/execute-overview` },
    { label: "STO Management", path: `${BASE}/sto-management` },
  ],
  sto: [
    { label: "STO Actions Dashboard", path: `${BASE}/sto-actions-dashboard` },
    { label: "STO Actions", path: `${BASE}/sto-actions` },
  ],
};

const getActiveGroup = (pathname) => {
  if (pathname.includes("alerts")) return "alerts";
  if (pathname.includes("execute-overview") || pathname.includes("sto-management"))
    return "leftover";
  if (pathname.includes("sto-actions")) return "sto";
  return "alerts";
};

const getActiveGroupLabel = (group) => {
  if (group === "alerts") return "Alert Prioritization";
  if (group === "leftover") return "Leftover Optimization";
  return "STO Cancel / Push";
};

const SupplyPlanningDashboard = () => {
  const location = useLocation();
  const activeGroup = getActiveGroup(location.pathname);
  const activeTabs = GROUP_TABS[activeGroup];
  const groupLabel = getActiveGroupLabel(activeGroup);

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        bgcolor: "#04111e",
        minHeight: "calc(100vh - 56px)",
      }}
    >
      <DashboardSubNavbar
        tabs={activeTabs}
        domain={groupLabel}
        accentColor={ACCENT}
      />
      <Box sx={{ display: "flex", flex: 1, overflow: "hidden" }}>
        <DashboardSidebar
          items={SIDEBAR_ITEMS}
          accentColor={ACCENT}
          domain="Supply Planning"
        />
        <Box
          component="main"
          sx={{ flex: 1, overflowY: "auto", minHeight: "calc(100vh - 110px)" }}
        >
          <Routes>
            <Route path="/" element={<Navigate to="alerts-dashboard" replace />} />
            <Route path="alerts-dashboard" element={<AlertsDashboard />} />
            <Route path="alerts-management" element={<AlertsManagement />} />
            <Route path="execute-overview" element={<ExecuteOverview />} />
            <Route path="sto-management" element={<STOManagement />} />
            <Route path="sto-actions-dashboard" element={<STOActionsDashboard />} />
            <Route path="sto-actions" element={<STOActions />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default SupplyPlanningDashboard;
