import React, { useState } from "react";
import { Box } from "@mui/material";
import { ThemeProviderWrapper } from "./contexts/ThemeContext";
import ChatBox from "./components/ChatBox";
import ConversationHistory from "./components/ConversationHistory";
import { ConversationProvider } from "./contexts/ConversationContext";

function App() {
  const [drawerOpen, setDrawerOpen] = useState(true);

  const handleToggleDrawer = () => {
    setDrawerOpen(!drawerOpen);
  };

  return (
    <ThemeProviderWrapper>
      <ConversationProvider>
        <Box sx={{ display: "flex" }}>
          <ConversationHistory
            open={drawerOpen}
            onToggleDrawer={handleToggleDrawer}
          />
          <ChatBox drawerOpen={drawerOpen} onToggleDrawer={handleToggleDrawer} />
        </Box>
      </ConversationProvider>
    </ThemeProviderWrapper>
  );
}

export default App;
