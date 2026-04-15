import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import LandingPage from "./components/LandingPage";

// Demand Planning
import DemandPlanningDashboard from "./components/demandPlanning/DemandPlanningDashboard";
import SalesForecastTable from "./components/runrate";
import AskIntelliplan from "./components/askIntelliplan";

// Supply Planning
import SupplyPlanningDashboard from "./components/supplyPlanning/SupplyPlanningDashboard";
import AlertsDashboard from "./components/supplyPlanning/alertPrioritization/AlertsDashboard";
import AlertsManagement from "./components/supplyPlanning/alertPrioritization/AlertsManagement";
import ExecuteOverview from "./components/supplyPlanning/leftoverOptimization/ExecuteOverview";
import STOManagement from "./components/supplyPlanning/leftoverOptimization/STOManagement";
import STOActionsDashboard from "./components/supplyPlanning/stoCancelPush/STOActionsDashboard";
import STOActions from "./components/supplyPlanning/stoCancelPush/STOActions";

import "./styles/global.css";

const App = () => {
  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>
          {/* Landing */}
          <Route path="/" element={<LandingPage />} />

          {/* Demand Planning — layout wraps all child pages via <Outlet> */}
          <Route path="/demand-planning" element={<DemandPlanningDashboard />}>
            <Route index element={<Navigate to="/demand-planning/runrate" replace />} />
            <Route path="runrate" element={<SalesForecastTable />} />
            <Route path="ask-ai" element={<AskIntelliplan />} />
          </Route>

          {/* Supply Planning — layout wraps all child pages via <Outlet> */}
          <Route path="/supply-planning" element={<SupplyPlanningDashboard />}>
            <Route index element={<Navigate to="/supply-planning/alerts-dashboard" replace />} />
            <Route path="alerts-dashboard" element={<AlertsDashboard />} />
            <Route path="alerts-management" element={<AlertsManagement />} />
            <Route path="execute-overview" element={<ExecuteOverview />} />
            <Route path="sto-management" element={<STOManagement />} />
            <Route path="sto-actions-dashboard" element={<STOActionsDashboard />} />
            <Route path="sto-actions" element={<STOActions />} />
          </Route>

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;
