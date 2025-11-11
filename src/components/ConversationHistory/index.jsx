/**
 * Conversation History Drawer Component - Refactored
 */
import React, { useState, useMemo } from "react";
import {
  Box,
  IconButton,
  Tooltip,
  useTheme,
  Drawer,
  Button,
  List,
  Typography,
  Divider,
  Badge,
} from "@mui/material";
import { useConversation } from "../../contexts/ConversationContext";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import kimberlyClarkLogo from "../../assets/KC_logo_for_dark.png";
import { DRAWER_WIDTH, SORT_OPTIONS } from "../../utils/constants";
import { saveConversations } from "../../utils/storage";
import SearchBar from "./SearchBar";
import SortOptions from "./SortOptions";
import ConversationItem from "./ConversationItem";
import DeleteDialog from "./DeleteDialog";

const ConversationHistory = ({ open, onToggleDrawer }) => {
  const theme = useTheme();
  const {
    conversations,
    selectConversation,
    createNewConversation,
    setConversations,
    activeConversation,
  } = useConversation();

  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [conversationToDelete, setConversationToDelete] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState(SORT_OPTIONS.RECENT);

  // Filter and sort conversations
  const filteredConversations = useMemo(() => {
    let filtered = conversations;

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(
        (conv) =>
          conv.title?.toLowerCase().includes(query) ||
          conv.messages?.[0]?.content?.toLowerCase().includes(query)
      );
    }

    // Sort
    if (sortBy === SORT_OPTIONS.ALPHABETICAL) {
      filtered = [...filtered].sort((a, b) =>
        (a.title || "").localeCompare(b.title || "")
      );
    } else {
      filtered = [...filtered].sort(
        (a, b) => new Date(b.created) - new Date(a.created)
      );
    }

    return filtered;
  }, [conversations, searchQuery, sortBy]);

  const handleNewConversation = () => {
    createNewConversation("New Conversation");
  };

  const confirmDeleteConversation = (conversationId) => {
    const conversation = conversations.find((conv) => conv.id === conversationId);
    setConversationToDelete(conversation);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConversation = () => {
    if (!conversationToDelete) return;

    const updatedConversations = conversations.filter(
      (conv) => conv.id !== conversationToDelete.id
    );

    setConversations(updatedConversations);
    saveConversations(updatedConversations);

    if (activeConversation?.id === conversationToDelete.id) {
      handleNewConversation();
    }

    setDeleteDialogOpen(false);
    setConversationToDelete(null);
  };

  const drawerContent = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: "rgba(15, 23, 42, 0.95)",
        backdropFilter: "blur(20px)",
      }}
    >
      {/* Header with gradient accent */}
      <Box
        sx={{
          py: 1.5,
          px: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid rgba(255, 255, 255, 0.06)`,
          gap: 1,
          background:
            "linear-gradient(135deg, rgba(96, 165, 250, 0.05) 0%, rgba(167, 139, 250, 0.05) 100%)",
          position: "relative",
          "&::after": {
            content: '""',
            position: "absolute",
            bottom: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent)",
          },
        }}
      >
        <Button
          variant="contained"
          size="medium"
          startIcon={<AddIcon />}
          onClick={handleNewConversation}
          fullWidth
          sx={{
            textTransform: "none",
            borderRadius: theme.shape.borderRadius,
            fontWeight: 600,
            py: 1.25,
            background: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
            color: theme.palette.primary.contrastText,
            boxShadow: "0 4px 14px rgba(96, 165, 250, 0.3)",
            transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
            "&:hover": {
              background: "linear-gradient(135deg, #3B82F6 0%, #2563EB 100%)",
              boxShadow: "0 6px 20px rgba(96, 165, 250, 0.4)",
              transform: "translateY(-2px)",
            },
            "&:active": {
              transform: "translateY(0)",
            },
          }}
        >
          New Chat
        </Button>
        <Tooltip title="Hide Sidebar">
          <IconButton
            onClick={onToggleDrawer}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
              "&:hover": {
                backgroundColor: "rgba(96, 165, 250, 0.15)",
                color: theme.palette.primary.main,
                transform: "scale(1.1)",
              },
            }}
            aria-label="Hide sidebar"
          >
            <ChevronLeftIcon />
          </IconButton>
        </Tooltip>
      </Box>

      {/* Search Bar */}
      {conversations.length > 0 && (
        <SearchBar searchQuery={searchQuery} onSearchChange={setSearchQuery} />
      )}

      {/* Sort Options and Conversations List */}
      {conversations.length > 0 && (
        <>
          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)" }} />
          <SortOptions sortBy={sortBy} onSortChange={setSortBy} />
          <Divider sx={{ borderColor: "rgba(255, 255, 255, 0.06)" }} />

          {/* History Label with gradient */}
          <Box sx={{ px: 2, pt: 2, pb: 1 }}>
            <Typography
              variant="caption"
              sx={{
                display: "block",
                mb: 1,
                color: theme.palette.text.secondary,
                fontSize: "0.75rem",
                fontWeight: 700,
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                background: "linear-gradient(135deg, #60a5fa 0%, #a78bfa 100%)",
                WebkitBackgroundClip: "text",
                WebkitTextFillColor: "transparent",
                backgroundClip: "text",
              }}
            >
              {searchQuery ? "Search Results" : "History"}
              <Badge
                badgeContent={filteredConversations.length}
                color="primary"
                sx={{
                  ml: 1.5,
                  "& .MuiBadge-badge": {
                    fontSize: "0.65rem",
                    height: "18px",
                    minWidth: "18px",
                    padding: "0 5px",
                    borderRadius: "9px",
                    fontWeight: 700,
                    background: "linear-gradient(135deg, #60a5fa 0%, #3B82F6 100%)",
                    boxShadow: "0 2px 8px rgba(96, 165, 250, 0.3)",
                  },
                }}
              />
            </Typography>
          </Box>

          {/* Conversations */}
          <Box
            sx={{
              flexGrow: 1,
              overflowY: "auto",
              px: 1,
              "&::-webkit-scrollbar": {
                width: "6px",
              },
              "&::-webkit-scrollbar-track": {
                background: "rgba(31, 41, 55, 0.3)",
                borderRadius: "3px",
                margin: "4px",
              },
              "&::-webkit-scrollbar-thumb": {
                background:
                  "linear-gradient(135deg, rgba(96, 165, 250, 0.5), rgba(167, 139, 250, 0.5))",
                borderRadius: "3px",
                "&:hover": {
                  background:
                    "linear-gradient(135deg, rgba(96, 165, 250, 0.8), rgba(167, 139, 250, 0.8))",
                },
              },
            }}
          >
            {filteredConversations.length > 0 ? (
              <List sx={{ p: 0.5 }}>
                {filteredConversations.map((conv, index) => (
                  <ConversationItem
                    key={conv.id}
                    conversation={conv}
                    isActive={activeConversation?.id === conv.id}
                    onSelect={selectConversation}
                    onDelete={confirmDeleteConversation}
                    index={index}
                  />
                ))}
              </List>
            ) : (
              <Box
                sx={{
                  p: 3,
                  textAlign: "center",
                  color: theme.palette.text.secondary,
                }}
              >
                <Typography variant="body2">No conversations found</Typography>
              </Box>
            )}
          </Box>
        </>
      )}

      {/* Empty State */}
      {conversations.length === 0 && (
        <Box
          sx={{
            flexGrow: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 3,
            textAlign: "center",
          }}
        >
          <Typography
            variant="body2"
            sx={{
              color: theme.palette.text.secondary,
              lineHeight: 1.6,
            }}
          >
            No conversations yet. Start a new chat to begin!
          </Typography>
        </Box>
      )}

      {/* Footer Logo with gradient background */}
      <Box
        sx={{
          pt: 2,
          pb: 2,
          mt: "auto",
          textAlign: "center",
          borderTop: `1px solid rgba(255, 255, 255, 0.06)`,
          background:
            "linear-gradient(to top, rgba(96, 165, 250, 0.03) 0%, transparent 100%)",
          position: "relative",
          "&::before": {
            content: '""',
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(96, 165, 250, 0.3), transparent)",
          },
        }}
      >
        <img
          src={kimberlyClarkLogo}
          alt="Kimberly Clark Logo"
          style={{
            maxWidth: "75%",
            height: "auto",
            filter: "drop-shadow(0 2px 8px rgba(96, 165, 250, 0.2))",
            transition: "all 0.3s ease",
          }}
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
          width: open ? DRAWER_WIDTH : 0,
          flexShrink: 0,
          transition: theme.transitions.create("width", {
            easing: theme.transitions.easing.sharp,
            duration: theme.transitions.duration.enteringScreen,
          }),
          "& .MuiDrawer-paper": {
            width: DRAWER_WIDTH,
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

      <DeleteDialog
        open={deleteDialogOpen}
        conversation={conversationToDelete}
        onClose={() => setDeleteDialogOpen(false)}
        onConfirm={handleDeleteConversation}
      />
    </>
  );
};

export default ConversationHistory;
