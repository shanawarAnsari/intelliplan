
import React, { useState } from "react";
import { Box } from "@mui/material";
import ChatBox from "./ChatBox";
import ConversationHistory from "./ConversationHistory";
import { ConversationProvider } from "../../contexts/ConversationContext";
const AskIntelliplan = () => {
    const [drawerOpen, setDrawerOpen] = useState(false);

    const handleToggleDrawer = () => {
        setDrawerOpen(!drawerOpen);
    };

    return (
        <ConversationProvider>
            <Box sx={{ display: "flex" }}>
                <ConversationHistory
                    open={drawerOpen}
                    onToggleDrawer={handleToggleDrawer}
                />
                <ChatBox drawerOpen={drawerOpen} onToggleDrawer={handleToggleDrawer} />
            </Box>
        </ConversationProvider>
    )
}
export default AskIntelliplan;