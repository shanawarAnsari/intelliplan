import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { ConversationProvider } from "./contexts/ConversationContext";
// import ChatBox from "./components/ChatBox"; // Replaced by MainLayout
import MainLayout from "./chatbot/MainLayout"; // Import the new MainLayout
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import TopNavbar from "./navbar/TopNavbar";

import RunRatePage from "./runrate/RunRatePage";
import "./styles/global.css";

function App() {
  // const [isChatBoxLoading, setIsChatBoxLoading] = React.useState(false); // This state might be managed differently or within MainLayout/ChatBox

  return (
    <ThemeProviderWrapper>
      <ConversationProvider>
        <Router>
          <TopNavbar />
          <Routes>
            <Route path="/chatbot" element={<MainLayout />} />
            <Route path="/runrate" element={<RunRatePage />} />
            <Route path="*" element={<MainLayout />} />
          </Routes>
        </Router>
      </ConversationProvider>
    </ThemeProviderWrapper>
  );
}

export default App;
