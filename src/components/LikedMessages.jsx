import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  useTheme,
  IconButton,
  Tooltip,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const LikedMessages = () => {
  const theme = useTheme();
  const [likedMessages, setLikedMessages] = useState([]);

  useEffect(() => {
    // Load liked messages from local storage
    const storedLikedMessages = localStorage.getItem("likedMessages");
    if (storedLikedMessages) {
      setLikedMessages(JSON.parse(storedLikedMessages));
    }
  }, []);

  const handleUnlikeMessage = (messageId) => {
    const updatedMessages = likedMessages.filter((msg) => msg.id !== messageId);
    setLikedMessages(updatedMessages);
    localStorage.setItem("likedMessages", JSON.stringify(updatedMessages));
  };

  // This function would be called from ChatMessage when a message is liked
  // For now, it's a placeholder. You'll need to implement a way to communicate
  // liked messages from ChatMessage to this component (e.g., via context or props drilling)
  // or have ChatMessage directly update localStorage and this component just reads from it.
  const addLikedMessage = (message) => {
    const newLikedMessages = [...likedMessages, message];
    setLikedMessages(newLikedMessages);
    localStorage.setItem("likedMessages", JSON.stringify(newLikedMessages));
  };

  return (
    <Box
      sx={{
        p: 2,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        backgroundColor: theme.palette.background.default,
      }}
    >
      <Typography variant="h6" sx={{ mb: 2, color: theme.palette.text.primary }}>
        Liked Messages
      </Typography>
      {likedMessages.length === 0 ? (
        <Typography
          variant="body2"
          color="text.secondary"
          sx={{ textAlign: "center", mt: 3 }}
        >
          You haven't liked any messages yet.
        </Typography>
      ) : (
        likedMessages.map((msg, index) => (
          <Accordion
            key={msg.id || index}
            sx={{
              mb: 1,
              backgroundColor: theme.palette.background.default,
              "&:before": {
                display: "none", // Removes the default top border of Accordion
              },
              boxShadow: theme.shadows[1],
            }}
          >
            <AccordionSummary
              expandIcon={
                <ExpandMoreIcon sx={{ color: theme.palette.text.secondary }} />
              }
              aria-controls={`panel${index}-content`}
              id={`panel${index}-header`}
              sx={{
                "& .MuiAccordionSummary-content": {
                  justifyContent: "space-between",
                  alignItems: "center",
                },
              }}
            >
              <Typography
                variant="subtitle2"
                sx={{ flexGrow: 1, mr: 1, color: theme.palette.text.primary }}
                noWrap
              >
                {msg.text
                  ? msg.text.substring(0, 50) + (msg.text.length > 50 ? "..." : "")
                  : "Liked Content"}
              </Typography>
              <Tooltip title="Unlike message">
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation(); // Prevent Accordion from toggling
                    handleUnlikeMessage(msg.id);
                  }}
                  sx={{
                    color: theme.palette.text.secondary,
                    "&:hover": { color: theme.palette.error.main },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </Tooltip>
            </AccordionSummary>
            <AccordionDetails
              sx={{
                backgroundColor: theme.palette.background.secondary,
                borderTop: `1px solid ${theme.palette.divider}`,
              }}
            >
              <Typography
                variant="body2"
                sx={{ whiteSpace: "pre-wrap", color: theme.palette.text.secondary }}
              >
                {msg.text || "No text content"}
              </Typography>
              {/* You could add more details here, like timestamp or source */}
            </AccordionDetails>
          </Accordion>
        ))
      )}
    </Box>
  );
};

export default LikedMessages;
