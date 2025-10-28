import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import SalesForecastTable from "./components/runrate/index"
import "./styles/global.css";
const App = () => {
  return (
    <ThemeProviderWrapper>
      <Router>
        <TopNavbar />
        <Routes>
          <Route path="/runrate" element={<SalesForecastTable />} />
          <Route path="*" element={<SalesForecastTable />} />
        </Routes>
      </Router>
    </ThemeProviderWrapper >
  );
}

export default App;
