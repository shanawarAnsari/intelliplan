import React, { useEffect } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  useTheme,
  Button,
  List,
  Typography,
  Divider,
  Fade,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Paper,
  Card,
  CardContent,
  CardActions,
  Stack,
  Chip,
  alpha,
} from "@mui/material";

import { useConversation } from "../contexts/ConversationContext";
import AddIcon from "@mui/icons-material/Add";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import kimberlyClarkLogo from "../assets/KC_logo_for_dark.png";
import BookmarkIcon from "@mui/icons-material/Bookmark";
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

    if (e) {
      e.stopPropagation();
      e.preventDefault();
    }


    const conversation = conversations.find((conv) => conv.id === conversationId);
    if (!conversation) {
      console.error("Conversation not found for deletion:", conversationId);
      return;
    }


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

      console.log("Successfully deleted conversation:", conversationId);
    } catch (error) {
      console.error("Error deleting conversation:", error);
    }
  };

  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  const validConversations = conversations.filter(
    (conv) =>
      conv.messages &&
      conv.messages.some(
        (msg) => msg.role === "assistant" && !msg.isThinking && !msg.isChunk
      )
  );


  useEffect(() => {
    try {
      const savedConversations = localStorage.getItem("conversations");
      if (savedConversations) {
        const parsedConversations = JSON.parse(savedConversations);
        setConversations(parsedConversations);
      }
    } catch (error) {
      console.error("Error loading conversations from localStorage:", error);
    }
  }, [setConversations]);

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
          display: "flex",
          alignItems: "center",
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${theme.palette.divider}`,
          p: 1,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            borderRadius: "50%",
            backgroundColor:
              theme.palette.mode === "dark"
                ? theme.palette.action.hover
                : theme.palette.background.paper,
            mr: 1.5,
          }}
        >
          <ChatIcon
            sx={{
              color: theme.palette.primary.main,
              fontSize: 22,
            }}
          />
        </Box>
        <Typography
          variant="h5"
          sx={{
            color: theme.palette.text.primary,
            fontWeight: 600,
            flexGrow: 1,
            letterSpacing: "-0.5px",
          }}
        >
          History
        </Typography>{" "}
        <Chip
          size="small"
          label={(() => {

            const totalMessages = validConversations.reduce(
              (total, conv) => total + (conv.messages ? conv.messages.length : 0),
              0
            );
            return `${totalMessages} messages`;
          })()}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            fontWeight: 600,
            borderRadius: "14px",
            px: 0.5,
          }}
        />
      </Box>
      {validConversations && validConversations.length > 0 ? (
        <>
          <Box sx={{ flexGrow: 1, overflowY: "auto", px: 2, py: 1 }}>
            <Stack spacing={1.5}>
              {validConversations.map((conv, index) => (
                <Fade
                  in={true}
                  key={conv.id || index}
                  timeout={300}
                  style={{ transitionDelay: `${index * 50}ms` }}
                >
                  <Card
                    sx={{
                      backgroundColor:
                        activeConversation?.id === conv.id
                          ? alpha(theme.palette.primary.main, 0.08)
                          : theme.palette.mode === "dark"
                            ? alpha(theme.palette.background.paper, 0.6)
                            : alpha(theme.palette.background.paper, 0.9),
                      boxShadow: theme.shadows[1],
                      borderRadius: "6px",
                      transition: "all 0.25s ease-in-out",
                      cursor: "pointer",
                      "&:hover": {
                        boxShadow: theme.shadows[3],
                        backgroundColor:
                          activeConversation?.id === conv.id
                            ? alpha(theme.palette.primary.main, 0.12)
                            : alpha(theme.palette.action.hover, 0.1),
                      },
                      border: `1px solid ${activeConversation?.id === conv.id
                        ? alpha(theme.palette.primary.main, 0.3)
                        : alpha(theme.palette.divider, 0.1)
                        }`,
                      position: "relative",
                      overflow: "hidden",
                    }}
                    onClick={() => selectConversation(conv.id)}
                  >
                    <CardContent sx={{ p: 2, pb: 1, "&:last-child": { pb: 1 } }}>
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <ChatIcon
                          fontSize="small"
                          sx={{
                            mr: 1.5,
                            fontSize: "1.1rem",
                            color:
                              activeConversation?.id === conv.id
                                ? theme.palette.primary.main
                                : theme.palette.text.secondary,
                          }}
                        />
                        <Typography
                          variant="subtitle1"
                          sx={{
                            fontWeight: 600,
                            color: theme.palette.text.primary,
                            flexGrow: 1,
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                        >
                          {conv.title || "Untitled Conversation"}
                        </Typography>
                      </Box>{" "}
                      <Typography
                        variant="body2"
                        sx={{
                          color: theme.palette.text.secondary,
                          mt: 1,
                          ml: 3.5,
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}
                      >
                        {conv.messages && conv.messages.length > 0
                          ? `${conv.messages[0].content.substring(0, 80)}${conv.messages[0].content.length > 80 ? "..." : ""
                          }`
                          : "No messages yet"}
                      </Typography>
                    </CardContent>
                    <CardActions
                      sx={{ p: 2, pt: 0, justifyContent: "space-between" }}
                    >
                      <Box sx={{ display: "flex", alignItems: "center" }}>
                        <AccessTimeIcon
                          fontSize="small"
                          sx={{
                            color: alpha(theme.palette.text.secondary, 0.7),
                            fontSize: 16,
                            mr: 0.5,
                          }}
                        />
                        <Typography
                          variant="caption"
                          sx={{
                            color: theme.palette.text.secondary,
                            fontWeight: 500,
                          }}
                        >
                          {formatDate(conv.created) || "No date"}
                        </Typography>
                      </Box>{" "}
                      <Tooltip title="Delete conversation">
                        <IconButton
                          size="small"
                          sx={{
                            color: theme.palette.error.main,
                            opacity: 0.6,
                            "&:hover": {
                              opacity: 1,
                              backgroundColor: alpha(theme.palette.error.main, 0.1),
                              transform: "scale(1.1)",
                            },
                            transition: "all 0.2s ease",
                          }}
                          onClick={(e) => confirmDeleteConversation(conv.id, e)}
                          aria-label="Delete conversation"
                        >
                          <DeleteOutlineIcon fontSize="small" />
                        </IconButton>
                      </Tooltip>
                    </CardActions>
                  </Card>
                </Fade>
              ))}
            </Stack>
          </Box>
        </>
      ) : (
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
              m: 2,
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              borderRadius: "6px",
              backgroundColor: alpha(theme.palette.background.paper, 0.4),
              border: `1px dashed ${alpha(theme.palette.divider, 0.6)}`,
              my: 2,
              position: "relative",
              overflow: "hidden",
              "&::before": {
                content: '""',
                position: "absolute",
                top: 0,
                left: 0,
                right: 0,
                height: "4px",
                background: `linear-gradient(to right, ${alpha(
                  theme.palette.primary.main,
                  0.7
                )}, ${alpha(theme.palette.secondary.main, 0.7)})`,
                borderTopLeftRadius: "6px",
                borderTopRightRadius: "6px",
              },
            }}
          >
            <BookmarkIcon
              sx={{
                fontSize: 56,
                color: alpha(theme.palette.text.secondary, 0.5),
                mb: 2,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                mb: 1,
                color: theme.palette.text.primary,
                fontWeight: 600,
                letterSpacing: "-0.5px",
              }}
            >
              No Conversations Yet
            </Typography>
            <Typography
              variant="body2"
              color="text.secondary"
              sx={{
                mb: 2,
                maxWidth: "80%",
                lineHeight: 1.6,
              }}
            >
              Start a new conversation to begin chatting.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={handleNewConversation}
              sx={{
                mt: 2,
                borderRadius: theme.shape.borderRadius * 2,
                textTransform: "none",
                px: 3,
              }}
            >
              New Conversation
            </Button>
          </Paper>
        </Fade>
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
