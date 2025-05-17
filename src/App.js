import React from "react";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import { ConversationProvider } from "./contexts/ConversationContext";
// import ChatBox from "./components/ChatBox"; // Replaced by MainLayout
import MainLayout from "./components/MainLayout"; // Import the new MainLayout
import "./styles/global.css";

function App() {
  // const [isChatBoxLoading, setIsChatBoxLoading] = React.useState(false); // This state might be managed differently or within MainLayout/ChatBox

  return (
    <ThemeProviderWrapper>
      <ConversationProvider>
        {/* Replace ChatBox with MainLayout */}
        {/* <ChatBox onIsLoadingChange={setIsChatBoxLoading} /> */}
        <MainLayout />
      </ConversationProvider>
    </ThemeProviderWrapper>
  );
}

export default App;
