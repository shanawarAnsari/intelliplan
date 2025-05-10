import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  useTheme,
  Drawer,
  Button,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  Divider,
  Fade,
} from "@mui/material";

import { useConversation } from "../contexts/ConversationContext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

const drawerWidth = 280;

const ConversationHistory = ({ open, onToggleDrawer }) => {
  const theme = useTheme();
  const {
    conversations,
    selectConversation,
    createNewConversation,
    setConversations,
    activeConversation,
  } = useConversation();
  // Function to start a new conversation
  const handleNewConversation = () => {
    createNewConversation("");
  };

  // Function to delete a conversation
  const handleDeleteConversation = (conversationId) => {
    // Remove from state and localStorage
    setConversations((prev) => {
      const updatedConversations = prev.filter((conv) => conv.id !== conversationId);
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));
      return updatedConversations;
    });

    // If deleted conversation was active, create a new one
    if (activeConversation && activeConversation.id === conversationId) {
      handleNewConversation();
    }
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: theme.palette.background.default,
      }}
    >
      <Box
        sx={{
          p: 0.975,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleNewConversation}
          sx={{
            textTransform: "none",
            borderRadius: theme.shape.borderRadius,
            fontWeight: "medium",
            py: 1,
            px: 2,
            mx: 3,
            backgroundColor: "#333",
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: "#444",
            },
          }}
        >
          New Conversation
        </Button>
        <Tooltip title="Hide Sidebar">
          <IconButton
            onClick={onToggleDrawer}
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
              },
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {conversations && conversations.length > 0 && (
        <>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Typography
              variant="overline"
              color="text.secondary"
              fontWeight="medium"
              sx={{
                fontWeight: "bold",
                fontSize: "0.75rem",
                letterSpacing: "0.5px",
                color: theme.palette.text.secondary,
              }}
            >
              History
            </Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto" }}>
            <List>
              {conversations.map((conv, index) => (
                <Fade
                  in={true}
                  key={index}
                  timeout={300}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      onClick={() => selectConversation(conv.id)}
                      sx={{
                        borderRadius: theme.shape.borderRadius,
                        mx: 0.25,
                        mb: 0.5,
                        py: 0.75,
                        "&:hover": {
                          backgroundColor: theme.palette.action.hover,
                        },
                        "&.Mui-selected": {
                          backgroundColor: theme.palette.action.selected,
                          "&:hover": {
                            backgroundColor: theme.palette.action.selected,
                          },
                        },
                      }}
                    >
                      {" "}
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          width: "100%",
                        }}
                      >
                        <ChatIcon
                          fontSize="small"
                          sx={{
                            mr: 1.5,
                            fontSize: "1rem",
                            color: theme.palette.text.secondary,
                          }}
                        />
                        <ListItemText
                          primary={conv.title}
                          primaryTypographyProps={{
                            variant: "body2",
                            noWrap: true,
                            fontWeight: 500,
                            color: theme.palette.text.primary,
                            sx: {
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              display: "block",
                            },
                          }}
                          sx={{ flex: 1 }}
                        />
                        <IconButton
                          size="small"
                          sx={{
                            opacity: 0.6,
                            ml: 0.5,
                            "&:hover": {
                              opacity: 1,
                              color: theme.palette.error.main,
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteConversation(conv.id);
                          }}
                        >
                          <DeleteOutlineIcon
                            fontSize="small"
                            sx={{ fontSize: "1rem" }}
                          />
                        </IconButton>
                      </Box>
                    </ListItemButton>
                  </ListItem>
                </Fade>
              ))}
            </List>
          </Box>
        </>
      )}
    </Box>
  );

  return (
    <Drawer
      variant="persistent"
      anchor="left"
      open={open}
      sx={{
        width: open ? drawerWidth : 0,
        flexShrink: 0,
        transition: theme.transitions.create("width", {
          easing: theme.transitions.easing.sharp,
          duration: theme.transitions.duration.enteringScreen,
        }),
        "& .MuiDrawer-paper": {
          width: drawerWidth,
          boxSizing: "border-box",
          borderRight: `1px solid ${theme.palette.divider}`,
          transition: theme.transitions.create(["width", "margin"], {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          boxShadow: "none",
          overflowX: "hidden",
          bgcolor: theme.palette.background.default,
        },
      }}
    >
      {drawerContent}
    </Drawer>
  );
};

export default ConversationHistory;
