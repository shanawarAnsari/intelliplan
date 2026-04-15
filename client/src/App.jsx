import React, { useEffect } from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import SalesForecastTable from "./components/runrate";
import AuthGuard from "./components/Login/AuthGuard";
import LoginCallback from "./components/Login/callback";
import LoginCallbackError from "./components/Login/LoginCallbackError";
import LandingPage from "./components/LandingPage";
import AskIntelliplan from "./components/askIntelliplan";
import FeatureGuard from "./components/Login/FeatureGuard";
import {
  checkRunRateAccess,
  checkAskIntelliplanAccess,
} from "../src/components/Login/featureAccessUtils";
import { ensureAgentToken } from "./utils/agentToken";
import DemandPlanningDashboard from "./components/demandPlanning";
import SupplyPlanningDashboard from "./components/supplyPlanning";
import AlertDashboard from "./components/supplyPlanning/AlertDashboard";
import ExecutiveOverview from "./components/supplyPlanning/ExecutiveOverview";

// NEW: public login starter that triggers oktaAuth.signInWithRedirect()
import LoginStart from "./components/Login/LoginStart";

import "./styles/global.css";

const App = () => {
  useEffect(() => {
    ensureAgentToken();
  }, []);

  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>
          {/* PUBLIC ROUTES */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginStart />} />
          <Route path="/login/callback" element={<LoginCallback />} />
          <Route path="/login/callbackError" element={<LoginCallbackError />} />

          {/* DEMAND PLANNING DASHBOARD */}
          <Route
            path="/demand-planning"
            element={
              <AuthGuard>
                <DemandPlanningDashboard />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="runrate" replace />} />
            <Route
              path="runrate"
              element={
                <FeatureGuard checkFn={checkRunRateAccess}>
                  <SalesForecastTable />
                </FeatureGuard>
              }
            />
            <Route
              path="ask-ai"
              element={
                <FeatureGuard checkFn={checkAskIntelliplanAccess}>
                  <AskIntelliplan />
                </FeatureGuard>
              }
            />
          </Route>

          {/* SUPPLY PLANNING DASHBOARD */}
          <Route
            path="/supply-planning"
            element={
              <AuthGuard>
                <SupplyPlanningDashboard />
              </AuthGuard>
            }
          >
            <Route index element={<Navigate to="alert-dashboard" replace />} />
            <Route path="alert-dashboard" element={<AlertDashboard />} />
            <Route path="executive-overview" element={<ExecutiveOverview />} />
          </Route>

          {/* FALLBACK */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;
