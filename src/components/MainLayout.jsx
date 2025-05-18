import React from "react";
import { Box, useTheme, Typography, IconButton } from "@mui/material";
import TopNavbar from "./TopNavbar";
import ConversationHistory from "./ConversationHistory";
import ChatBox from "./ChatBox";
import LikedMessages from "./LikedMessages";
import HelpFAQ from "./HelpFAQ";
import { DemandForecastChart, InventoryStockChart } from "./charts";
import HistoryIcon from "@mui/icons-material/History";
import FavoriteIcon from "@mui/icons-material/Favorite";

const MainLayout = () => {
  const theme = useTheme();
  const [helpDrawerOpen, setHelpDrawerOpen] = React.useState(false);
  const [historyOpen, setHistoryOpen] = React.useState(false);
  const [likedMessagesOpen, setLikedMessagesOpen] = React.useState(false);

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

  return (
    <Box sx={{ display: "flex", flexDirection: "column", height: "100vh" }}>
      <TopNavbar onToggleHelp={toggleHelpDrawer} />
      <HelpFAQ open={helpDrawerOpen} onClose={toggleHelpDrawer} />

      <Box sx={{ display: "flex", flexDirection: "row", flexGrow: 1 }}>
        {/* Charts column - 50% width */}
        <Box
          sx={{
            width: "50%",
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

        {/* Chatbox column with sliding panels - 50% width */}
        <Box
          sx={{
            width: "50%",
            display: "flex",
            flexDirection: "row",
            position: "relative",
          }}
        >
          {/* Slide-out History panel */}
          <Box
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
              zIndex: 10,
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
            {/* Toggle icons for history and liked messages */}
            <Box
              sx={{
                display: "flex",
                p: 1,
                borderBottom: `1px solid ${theme.palette.divider}`,
              }}
            >
              <IconButton
                onClick={toggleHistory}
                color={historyOpen ? "primary" : "default"}
                sx={{ mr: 1 }}
                size="small"
              >
                <HistoryIcon />
              </IconButton>
              <IconButton
                onClick={toggleLikedMessages}
                color={likedMessagesOpen ? "primary" : "default"}
                size="small"
              >
                <FavoriteIcon />
              </IconButton>
            </Box>

            {/* ChatBox component */}
            <Box sx={{ flexGrow: 1, overflow: "hidden" }}>
              <ChatBox onIsLoadingChange={() => {}} />
            </Box>
          </Box>

          {/* Slide-out Liked Messages panel */}
          <Box
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
