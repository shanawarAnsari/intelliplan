import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { ConversationProvider } from "./contexts/ConversationContext";
import MainLayout from "./components/chatbot/MainLayout";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNavbar from "./components/navbar/TopNavbar";
import SalesForecastTable from "./components/runrate/index"
import "./styles/global.css";
const App = () => {
  return (
    <ThemeProviderWrapper>
      <ConversationProvider>
        <Router>
          <TopNavbar />
          <Routes>
            <Route path="/chatbot" element={<MainLayout />} />
            <Route path="/runrate" element={<SalesForecastTable />} />
            <Route path="*" element={<SalesForecastTable />} />
          </Routes>
        </Router>
      </ConversationProvider>
    </ThemeProviderWrapper >
  );
}

export default App;
