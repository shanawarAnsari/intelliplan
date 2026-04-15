import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import LandingPage from "./components/LandingPage";
import DemandPlanningDashboard from "./components/demandPlanning/DemandPlanningDashboard";
import SupplyPlanningDashboard from "./components/supplyPlanning/SupplyPlanningDashboard";

import "./styles/global.css";

const App = () => {
  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/demand-planning/*" element={<DemandPlanningDashboard />} />
          <Route path="/supply-planning/*" element={<SupplyPlanningDashboard />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper>
  );
};

export default App;
