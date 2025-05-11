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

  const [deleteDialogOpen, setDeleteDialogOpen] = React.useState(false);
  const [conversationToDelete, setConversationToDelete] = React.useState(null);

  const handleNewConversation = () => {
    createNewConversation();
    if (window.innerWidth < theme.breakpoints.values.sm && onToggleDrawer) {
      onToggleDrawer();
    }
  };

  const confirmDeleteConversation = (conversationId, e) => {
    if (e) e.stopPropagation();
    const conversation = conversations.find((conv) => conv.id === conversationId);
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConversation = () => {
    if (!conversationToDelete) return;
    const conversationId = conversationToDelete.id;

    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationId
    );
    setConversations(updatedConversations);
    localStorage.setItem("conversations", JSON.stringify(updatedConversations));

    if (activeConversation && activeConversation.id === conversationId) {
      createNewConversation();
    }
    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const handleSelectConversation = (id) => {
    selectConversation(id);
    if (window.innerWidth < theme.breakpoints.values.sm && onToggleDrawer) {
      onToggleDrawer();
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
          p: 1.5,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          variant="contained"
          color="primary"
          size="medium"
          startIcon={<AddIcon />}
          onClick={handleNewConversation}
          sx={{
            flexGrow: 1,
            mr: 1,
          }}
        >
          New Chat
        </Button>
        <Tooltip title="Hide Sidebar">
          <IconButton
            onClick={onToggleDrawer}
            sx={{
              color: theme.palette.text.secondary,
            }}
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {conversations && conversations.length > 0 && (
        <>
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography variant="overline">Chat History</Typography>
          </Box>

          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
            <List disablePadding>
              {conversations.map((conv, index) => (
                <Fade
                  in={true}
                  key={conv.id || index}
                  timeout={300}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <ListItem disablePadding sx={{ mb: 0.5 }}>
                    <ListItemButton
                      selected={activeConversation?.id === conv.id}
                      onClick={() => handleSelectConversation(conv.id)}
                      sx={{
                        py: 1,
                      }}
                    >
                      <ChatIcon
                        fontSize="small"
                        sx={{
                          mr: 1.5,
                          color:
                            activeConversation?.id === conv.id
                              ? theme.palette.primary.main
                              : theme.palette.text.secondary,
                        }}
                      />
                      <ListItemText
                        primary={conv.title || "Untitled Chat"}
                        primaryTypographyProps={{
                          variant: "body2",
                          noWrap: true,
                          fontWeight:
                            activeConversation?.id === conv.id
                              ? "medium"
                              : "regular",
                          color:
                            activeConversation?.id === conv.id
                              ? theme.palette.primary.main
                              : theme.palette.text.primary,
                        }}
                      />
                      <Tooltip title="Delete Chat">
                        <IconButton
                          size="small"
                          onClick={(e) => confirmDeleteConversation(conv.id, e)}
                          sx={{
                            ml: 1,
                            color: theme.palette.text.secondary,
                            opacity: 0.7,
                            "&:hover": {
                              color: theme.palette.error.main,
                              opacity: 1,
                            },
                          }}
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </ListItemButton>
                  </ListItem>
                </Fade>
              ))}
            </List>
          </Box>
        </>
      )}
      {(!conversations || conversations.length === 0) && (
        <Box
          sx={{
            textAlign: "center",
            p: 3,
            mt: 2,
            color: theme.palette.text.secondary,
          }}
        >
          <ChatIcon sx={{ fontSize: 48, mb: 1 }} />
          <Typography variant="body1">No chat history yet.</Typography>
          <Typography variant="caption">
            Start a new conversation to see it here.
          </Typography>
        </Box>
      )}
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
          "& .MuiDrawer-paper": {
            width: drawerWidth,
            boxSizing: "border-box",
            overflowX: "hidden",
          },
        }}
      >
        {drawerContent}
      </Drawer>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-description"
        PaperProps={{ sx: { borderRadius: "8px" } }}
      >
        <DialogTitle id="delete-dialog-title" sx={{ fontWeight: "medium" }}>
          Delete Conversation?
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="delete-dialog-description">
            Are you sure you want to delete this chat?
            {conversationToDelete && (
              <Typography component="div" sx={{ mt: 1 }}>
                <b>"{conversationToDelete.title || "Untitled Chat"}"</b>
              </Typography>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={() => setDeleteDialogOpen(false)} color="inherit">
            Cancel
          </Button>
          <Button
            onClick={handleDeleteConversation}
            color="error"
            variant="contained"
            autoFocus
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
};

export default ConversationHistory;
