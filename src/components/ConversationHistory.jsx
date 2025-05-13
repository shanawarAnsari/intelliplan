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
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
} from "@mui/material";

import { useConversation } from "../contexts/ConversationContext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import kimberlyClarkLogo from "../assets/KC_logo_for_dark.png";
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

  // State for deletion confirmation dialog
  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState(null);

  // Function to start a new conversation
  const handleNewConversation = () => {
    createNewConversation("");
  };

  // Open confirmation dialog before deletion
  const confirmDeleteConversation = (conversationId, e) => {
    // Stop the click from bubbling up to the list item
    if (e) e.stopPropagation();

    const conversation = conversations.find((conv) => conv.id === conversationId);
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };
  // Execute the delete after confirmation
  const handleDeleteConversation = () => {
    try {
      if (!conversationToDelete) return;

      const conversationId = conversationToDelete.id;
      console.log("Deleting conversation:", conversationId);

      // Remove from conversations state
      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );

      // Update local state
      setConversations(updatedConversations);

      // Update localStorage directly
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));

      // If deleted conversation was active, create a new one
      if (activeConversation && activeConversation.id === conversationId) {
        handleNewConversation();
      }

      // Close the dialog
      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  // Only display conversations that have messages
  const validConversations = conversations.filter(
    (conv) => conv.messages && conv.messages.length > 0
  );

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
          py: 0.75,
          ml: -1,
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
            ml: 1,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: "#0087f9",
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

      {validConversations && validConversations.length > 0 && (
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
              {validConversations.map((conv, index) => (
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
                        />{" "}
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
                          onClick={(e) => confirmDeleteConversation(conv.id, e)}
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
      {/* Kimberly Clark Logo */}
      <Box
        sx={{
          pt: 2,
          mt: "auto", // Push to the bottom
          ml: 1,
          textAlign: "start",
        }}
      >
        <img
          src={kimberlyClarkLogo}
          alt="Kimberly Clark Logo"
          style={{ maxWidth: "60%", height: "auto" }}
        />
      </Box>
    </Box>
  );
  return (
    <>
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

      {/* Confirmation Dialog */}
      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="alert-dialog-title"
        aria-describedby="alert-dialog-description"
      >
        <DialogTitle id="alert-dialog-title">{"Delete Conversation?"}</DialogTitle>
        <DialogContent>
          <DialogContentText id="alert-dialog-description">
            Are you sure you want to delete this conversation?
            <br />
            {conversationToDelete && <b> "{conversationToDelete.title}"</b>}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDeleteDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button onClick={handleDeleteConversation} color="error" autoFocus>
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConversationHistory;
