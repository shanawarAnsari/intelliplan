import React, { useState } from "react";
import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Typography,
  IconButton,
  Tooltip,
  useTheme,
  Drawer,
  Divider,
  Fade,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from "@mui/material";

import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import AddIcon from "@mui/icons-material/Add";
import CloseIcon from "@mui/icons-material/Close";

const drawerWidth = 280;

const ConversationHistory = ({
  history,
  onSelectConversation,
  onNewConversation,
  open,
  onToggleDrawer,
}) => {
  const theme = useTheme();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [newConversationTitle, setNewConversationTitle] = useState("");

  const handleOpenDialog = () => {
    setDialogOpen(true);
    setNewConversationTitle(""); // Reset title on open
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleCreateConversation = () => {
    if (newConversationTitle.trim()) {
      onNewConversation(newConversationTitle.trim());
      handleCloseDialog();
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
          p: 0.7125,
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
          onClick={handleOpenDialog}
          sx={{
            textTransform: "none",
            borderRadius: theme.shape.borderRadius,
            fontWeight: "medium",
            py: 1,
            px: 2,
            mx: 3,
            backgroundColor: theme.palette.primary.hover,
            color: theme.palette.primary.contrastText,
            "&:hover": {
              backgroundColor: theme.palette.primary.dark,
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

      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        PaperProps={{
          sx: {
            bgcolor: theme.palette.background.paper,
            borderRadius: 2,
            width: "450px", // Set fixed width for better layout
            maxWidth: "90vw", // Responsive constraint
          },
        }}
      >
        <DialogTitle
          sx={{
            fontWeight: "medium",
            color: theme.palette.text.primary,
            p: 2.5, // More generous padding
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: `1px solid ${theme.palette.divider}`,
          }}
        >
          Create New Conversation
          <IconButton
            aria-label="close"
            onClick={handleCloseDialog}
            size="small"
            sx={{
              color: theme.palette.text.secondary,
              "&:hover": {
                backgroundColor: theme.palette.action.hover,
                color: theme.palette.text.primary,
              },
            }}
          >
            <CloseIcon fontSize="small" />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ p: 3 }}>
          <TextField
            autoFocus
            margin="dense"
            type="text"
            fullWidth
            variant="outlined"
            value={newConversationTitle}
            onChange={(e) => setNewConversationTitle(e.target.value)}
            placeholder="e.g., Q4 Marketing Strategy"
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleCreateConversation();
              }
            }}
            sx={{
              mt: 3,
              "& .MuiOutlinedInput-root": {
                "& fieldset": {
                  borderColor: theme.palette.divider,
                },
                "&:hover fieldset": {
                  borderColor: theme.palette.primary.main,
                },
                "&.Mui-focused fieldset": {
                  borderColor: theme.palette.primary.main,
                },
              },
              "& .MuiInputLabel-root": {
                color: theme.palette.text.secondary,
              },
              "& .MuiInputBase-input": {
                py: 1.5, // More vertical space in the input
              },
            }}
          />
          <Typography
            variant="body2"
            color="text.secondary"
            sx={{ mt: 2, fontSize: "0.85rem" }}
          >
            Give your conversation a descriptive name to easily find it later.
          </Typography>
        </DialogContent>
        <DialogActions
          sx={{ p: "16px 24px", borderTop: `1px solid ${theme.palette.divider}` }}
        >
          <Button
            onClick={handleCloseDialog}
            sx={{
              color: theme.palette.text.secondary,
              textTransform: "none",
              fontWeight: "medium",
              mr: 1,
            }}
          >
            Cancel
          </Button>
          <Button
            onClick={handleCreateConversation}
            color="primary"
            variant="contained"
            disabled={!newConversationTitle.trim()}
            sx={{
              backgroundColor: theme.palette.primary.main,
              color: theme.palette.primary.contrastText,
              textTransform: "none",
              fontWeight: "medium",
              px: 2.5,
              "&:hover": {
                backgroundColor: theme.palette.primary.dark,
              },
            }}
          >
            Create
          </Button>
        </DialogActions>
      </Dialog>

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

      <Box sx={{ flexGrow: 1, overflowY: "auto", px: 1 }}>
        <List>
          {history && history.length > 0
            ? history.map((conv, index) => (
              <Fade
                in={true}
                key={index}
                timeout={300}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => onSelectConversation(conv.id)}
                    sx={{
                      borderRadius: theme.shape.borderRadius,
                      mx: 1,
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
                    />
                  </ListItemButton>
                </ListItem>
              </Fade>
            ))
            : [
              { id: "dummy1", title: "Q3 Sales Analysis" },
              { id: "dummy2", title: "Product Demand Forecast 2023" },
              { id: "dummy3", title: "Regional Sales Performance" },
              { id: "dummy4", title: "Customer Demand Patterns" },
              { id: "dummy5", title: "Sales Pipeline Review" },
              { id: "dummy6", title: "Market Demand Trends" },
              { id: "dummy7", title: "Sales Team Efficiency" },
              { id: "dummy8", title: "Supply vs Demand Analysis" },
            ].map((dummyConv, index) => (
              <Fade
                in={true}
                key={`dummy-${index}`}
                timeout={300}
                style={{ transitionDelay: `${index * 50}ms` }}
              >
                <ListItem disablePadding>
                  <ListItemButton
                    onClick={() => { }}
                    sx={{
                      borderRadius: theme.shape.borderRadius,
                      mx: 1,
                      mb: 0.5,
                      py: 0.75,
                      "&:hover": {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <ListItemText
                      primary={dummyConv.title}
                      primaryTypographyProps={{
                        variant: "body2",
                        noWrap: true,
                        fontWeight: "medium",
                        color: theme.palette.text.secondary,
                        sx: {
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          display: "block",
                        },
                      }}
                    />
                  </ListItemButton>
                </ListItem>
              </Fade>
            ))}
        </List>
      </Box>
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
