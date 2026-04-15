import React from "react";
import { Box } from "@mui/material";
import { Routes, Route, Navigate } from "react-router-dom";
import BarChartRoundedIcon from "@mui/icons-material/BarChartRounded";
import PsychologyRoundedIcon from "@mui/icons-material/PsychologyRounded";

import DashboardSidebar from "../shared/DashboardSidebar";
import SalesForecastTable from "../runrate";
import AskIntelliplan from "../askIntelliplan";

const ACCENT = "#6AE3FF";

const sidebarItems = [
  {
    label: "Run Rate Simulator",
    icon: BarChartRoundedIcon,
    path: "/demand-planning/runrate",
  },
  {
    label: "Ask Intelliplan AI",
    icon: PsychologyRoundedIcon,
    path: "/demand-planning/ask-ai",
  },
];

const DemandPlanningDashboard = () => {
  return (
    <Box sx={{ minHeight: "calc(100vh - 56px)", bgcolor: "#04111e", color: "#fff" }}>
      <Box sx={{ display: "flex" }}>
        <DashboardSidebar
          items={sidebarItems}
          accentColor={ACCENT}
          domain="Demand Planning"
          topOffset={56}
        />

        {/* Main content */}
        <Box sx={{ flex: 1, minWidth: 0, overflow: "auto" }}>
          <Routes>
            <Route index element={<Navigate to="runrate" replace />} />
            <Route path="runrate" element={<SalesForecastTable />} />
            <Route path="ask-ai" element={<AskIntelliplan />} />
            <Route path="*" element={<Navigate to="runrate" replace />} />
          </Routes>
        </Box>
      </Box>
    </Box>
  );
};

export default DemandPlanningDashboard;
