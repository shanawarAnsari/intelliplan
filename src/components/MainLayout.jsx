import React from "react";
import { Box, useTheme, Typography } from "@mui/material"; // Added Typography
import TopNavbar from "./TopNavbar";
import ConversationHistory from "./ConversationHistory";
import ChatBox from "./ChatBox";
import LikedMessages from "./LikedMessages"; // Import the actual LikedMessages component
import HelpFAQ from "./HelpFAQ"; // Import HelpFAQ

const MainLayout = () => {
  const theme = useTheme();
  const [helpDrawerOpen, setHelpDrawerOpen] = React.useState(false);

  const toggleHelpDrawer = () => {
    setHelpDrawerOpen(!helpDrawerOpen);
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <TopNavbar onToggleHelp={toggleHelpDrawer} />
      <HelpFAQ open={helpDrawerOpen} onClose={toggleHelpDrawer} />

      {/* Top section for charts (30% height) */}
      <Box
        sx={{
          height: "30%",
          display: "flex",
          p: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.paper, // Changed for visibility
        }}
      >
        <Box
          sx={{
            flex: 1,
            borderRight: `1px solid ${theme.palette.divider}`,
            p: 1,
            mr: 1,
          }}
        >
          <Typography variant="h6" textAlign="center">
            Chart 1 Area
          </Typography>
          {/* Placeholder for Chart 1 */}
        </Box>
        <Box sx={{ flex: 1, p: 1, ml: 1 }}>
          <Typography variant="h6" textAlign="center">
            Chart 2 Area
          </Typography>
          {/* Placeholder for Chart 2 */}
        </Box>
      </Box>

      {/* Bottom section (70% height) with 3 vertical columns */}
      <Box sx={{ height: "70%", display: "flex", flexGrow: 1, overflow: "hidden" }}>
        {/* Left Column: Conversation History (approx 20-25%) */}
        <Box
          sx={{
            width: "25%",
            minWidth: "280px",
            borderRight: `1px solid ${theme.palette.divider}`,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <ConversationHistory />
        </Box>

        {/* Middle Column: Chat Box (approx 50-55%) */}
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            backgroundColor: theme.palette.background.default,
          }}
        >
          <ChatBox onIsLoadingChange={() => {}} />
        </Box>

        {/* Right Column: Liked Messages (approx 20-25%) */}
        <Box
          sx={{
            width: "25%",
            minWidth: "280px",
            borderLeft: `1px solid ${theme.palette.divider}`,
            overflowY: "auto",
            display: "flex",
            flexDirection: "column",
            backgroundColor: theme.palette.background.paper,
          }}
        >
          <LikedMessages />
        </Box>
      </Box>
    </Box>
  );
};

export default MainLayout;
