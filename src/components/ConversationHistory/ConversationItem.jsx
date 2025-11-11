/**
 * Single Conversation Item Component
 */
import React from "react";
import {
  ListItem,
  ListItemButton,
  ListItemText,
  IconButton,
  Box,
  Typography,
  Fade,
  useTheme,
} from "@mui/material";
import ChatIcon from "@mui/icons-material/Chat";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { getFormattedDate } from "../../utils/formatters";

const ConversationItem = ({ conversation, isActive, onSelect, onDelete, index }) => {
  const theme = useTheme();

  const getConversationPreview = (conv) => {
    if (!conv.messages || conv.messages.length === 0) return "No messages";
    const lastMessage = conv.messages[conv.messages.length - 1];
    return (lastMessage.content || "").substring(0, 40) + "...";
  };

  return (
    <Fade in={true} timeout={300} style={{ transitionDelay: `${index * 30}ms` }}>
      <ListItem disablePadding>
        <ListItemButton
          onClick={() => onSelect(conversation.id)}
          selected={isActive}
          sx={{
            borderRadius: 1,
            mx: 0.5,
            mb: 0.5,
            py: 1,
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
              alignItems: "flex-start",
              width: "100%",
              gap: 1,
            }}
          >
            <ChatIcon
              fontSize="small"
              sx={{
                mt: 0.25,
                color: theme.palette.text.secondary,
                fontSize: "1rem",
                flexShrink: 0,
              }}
            />
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <ListItemText
                primary={conversation.title}
                secondary={getConversationPreview(conversation)}
                primaryTypographyProps={{
                  variant: "body2",
                  noWrap: true,
                  fontWeight: 500,
                  color: theme.palette.text.primary,
                }}
                secondaryTypographyProps={{
                  variant: "caption",
                  noWrap: true,
                  color: theme.palette.text.secondary,
                  sx: { fontSize: "0.7rem" },
                }}
                sx={{ m: 0 }}
              />
              <Typography
                variant="caption"
                sx={{
                  display: "block",
                  mt: 0.5,
                  color: theme.palette.text.secondary,
                  fontSize: "0.65rem",
                }}
              >
                {getFormattedDate(conversation.created)}
              </Typography>
            </Box>
            <IconButton
              size="small"
              sx={{
                opacity: 0.6,
                ml: 0.5,
                flexShrink: 0,
                "&:hover": {
                  opacity: 1,
                  color: theme.palette.error.main,
                },
              }}
              onClick={(e) => {
                e.stopPropagation();
                onDelete(conversation.id);
              }}
              aria-label="Delete conversation"
            >
              <DeleteOutlineIcon sx={{ fontSize: "1rem" }} />
            </IconButton>
          </Box>
        </ListItemButton>
      </ListItem>
    </Fade>
  );
};

export default ConversationItem;
