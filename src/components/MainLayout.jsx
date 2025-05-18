import React, { useRef, useEffect } from "react";
import { Box, useTheme, Typography, IconButton, Tooltip } from "@mui/material";
import TopNavbar from "./TopNavbar";
import ConversationHistory from "./ConversationHistory";
import ChatBox from "./ChatBox";
import LikedMessages from "./LikedMessages";
import HelpFAQ from "./HelpFAQ";
import { DemandForecastChart, InventoryStockChart } from "./charts";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AddIcon from "@mui/icons-material/Add";
import { useConversation } from "../contexts/ConversationContext";

const MainLayout = () => {
  const theme = useTheme();
  const [helpDrawerOpen, setHelpDrawerOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [likedMessagesOpen, setLikedMessagesOpen] = React.useState(false);
  const historyPanelRef = useRef(null);
  const likedMessagesPanelRef = useRef(null);
  const { createNewConversation } = useConversation();

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };

  const toggleHistory = () => {
    setHistoryOpen(!historyOpen);
    if (historyOpen) setLikedMessagesOpen(false);
  };

  const toggleLikedMessages = () => {
    setLikedMessagesOpen(!likedMessagesOpen);
    if (likedMessagesOpen) setHistoryOpen(false);
  };

  // Handle click outside of panels to close them
  useEffect(() => {
    const handleClickOutside = (event) => {
      // Check if history panel is open and click is outside of it
      if (
        historyOpen &&
        historyPanelRef.current &&
        !historyPanelRef.current.contains(event.target) &&
        !event.target.closest('[data-testid="history-toggle"]')
      ) {
        setHistoryOpen(false);
      }

      // Check if liked messages panel is open and click is outside of it
      if (
        likedMessagesOpen &&
        likedMessagesPanelRef.current &&
        !likedMessagesPanelRef.current.contains(event.target) &&
        !event.target.closest('[data-testid="liked-toggle"]')
      ) {
        setLikedMessagesOpen(false);
      }
    };

    // Add the event listener
    document.addEventListener("mousedown", handleClickOutside);

    // Clean up the event listener
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [historyOpen, likedMessagesOpen]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopNavbar onToggleHelp={toggleHelpDrawer} />
      <HelpFAQ open={helpDrawerOpen} onClose={toggleHelpDrawer} />

      <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
        <Box
          sx={{
            width: "45%",
            display: "flex",
            flexDirection: "column",
            borderRight: `1px solid ${theme.palette.divider}`,
          }}
        >
          <Box
            sx={{
              height: "50%",
              borderBottom: `1px solid ${theme.palette.divider}`,
              p: 0.5,
              overflow: "hidden",
            }}
          >
            <InventoryStockChart />
          </Box>
          <Box
            sx={{
              height: "50%",
              p: 0.5,
              overflow: "hidden",
            }}
          >
            <DemandForecastChart />
          </Box>
        </Box>

        <Box
          sx={{
            width: "55%",
            display: "flex",
            flexDirection: "row",
            position: "relative",
          }}
        >
          {/* Slide-out History panel */}
          <Box
            ref={historyPanelRef}
            sx={{
              width: historyOpen ? "300px" : "0px",
              transition: "width 0.3s ease",
              overflow: "hidden",
              borderRight: historyOpen
                ? `1px solid ${theme.palette.divider}`
                : "none",
              height: "100%",
              position: "absolute",
              left: 0,
              zIndex: 100,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {historyOpen && (
              <Box sx={{ p: 1, height: "100%", overflowY: "auto" }}>
                <ConversationHistory />
              </Box>
            )}
          </Box>

          {/* Main ChatBox area */}
          <Box
            sx={{
              flexGrow: 1,
              display: "flex",
              flexDirection: "column",
              height: "100%",
            }}
          >
            {" "}
            {/* Toggle icons for new conversation, history and liked messages */}
            <Box
              sx={{
                display: "flex",
                p: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              {" "}
              <Tooltip title="New conversation" arrow>
                <IconButton
                  onClick={() => {
                    // Close any open panels first
                    setHistoryOpen(false);
                    setLikedMessagesOpen(false);
                    // Create a new conversation via context
                    if (createNewConversation) {
                      createNewConversation("");
                    }
                  }}
                  color="primary"
                  sx={{ mr: 1 }}
                  size="small"
                  data-testid="new-conversation-toggle"
                >
                  <AddIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Conversation history" arrow>
                <IconButton
                  onClick={toggleHistory}
                  color={historyOpen ? "primary" : "default"}
                  sx={{ mr: 1 }}
                  size="small"
                  data-testid="history-toggle"
                >
                  <HistoryIcon />
                </IconButton>
              </Tooltip>
              <Tooltip title="Liked messages" arrow>
                <IconButton
                  onClick={toggleLikedMessages}
                  color={likedMessagesOpen ? "primary" : "default"}
                  size="small"
                  data-testid="liked-toggle"
                >
                  <FavoriteIcon />
                </IconButton>
              </Tooltip>
            </Box>
            {/* ChatBox component */}
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <ChatBox onIsLoadingChange={() => {}} />
            </Box>
          </Box>

          {/* Slide-out Liked Messages panel */}
          <Box
            ref={likedMessagesPanelRef}
            sx={{
              width: likedMessagesOpen ? "300px" : "0px",
              transition: "width 0.3s ease",
              overflow: "hidden",
              borderLeft: likedMessagesOpen
                ? `1px solid ${theme.palette.divider}`
                : "none",
              height: "100%",
              position: "absolute",
              right: 0,
              zIndex: 10,
              backgroundColor: theme.palette.background.paper,
            }}
          >
            {likedMessagesOpen && (
              <Box sx={{ p: 1, height: "100%", overflowY: "auto" }}>
                <LikedMessages />
              </Box>
            )}
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
