import React from "react";
import {
  Box,
  IconButton,
  Tooltip,
  useTheme,
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
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import kimberlyClarkLogo from "../assets/KC_logo_for_dark.png";
const drawerWidth = "100%";

const ConversationHistory = ({ isChatBoxLoading }) => {
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
    createNewConversation("");
  };

  const confirmDeleteConversation = (conversationId, e) => {
    if (e) e.stopPropagation();

    const conversation = conversations.find((conv) => conv.id === conversationId);
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConversation = () => {
    try {
      if (!conversationToDelete) return;

      const conversationId = conversationToDelete.id;

      const updatedConversations = conversations.filter(
        (conv) => conv.id !== conversationId
      );

      setConversations(updatedConversations);
      localStorage.setItem("conversations", JSON.stringify(updatedConversations));

      if (activeConversation && activeConversation.id === conversationId) {
        handleNewConversation();
      }

      setDeleteDialogOpen(false);
      setConversationToDelete(null);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

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
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 1,
        }}
      >
        <Button
          variant="contained"
          size="small"
          startIcon={<AddIcon />}
          onClick={handleNewConversation}
          disabled={isChatBoxLoading}
          sx={{
            textTransform: "none",
            borderRadius: theme.shape.borderRadius,
            fontWeight: "medium",
            py: 1,
            px: 2,
            backgroundColor: theme.palette.primary.main,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.hover,
            },
          }}
        >
          New Conversation
        </Button>
      </Box>
      {validConversations && validConversations.length > 0 && (
        <>
          <Divider sx={{ borderColor: theme.palette.divider }} />
          <Box sx={{ px: 2, pt: 1.5 }}>
            <Typography
              variant="overline"
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
                  key={conv.id || index}
                  timeout={300}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <ListItem disablePadding>
                    <ListItemButton
                      selected={activeConversation?.id === conv.id}
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
      <Box
        sx={{
          pt: 2,
          mt: "auto",
          textAlign: "center",
          p: 1,
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
      <Box
        sx={{
          height: "100%",
          display: "flex",
          flexDirection: "column",
          overflowY: "auto",
        }}
      >
        {drawerContent}
      </Box>
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
