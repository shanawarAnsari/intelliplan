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
          p: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          borderBottom: `1px solid ${theme.palette.divider}`,
        }}
      >
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={handleOpenDialog}
          sx={{
            textTransform: "none",
            borderRadius: theme.shape.borderRadius,
            fontWeight: "medium",
            py: 1,
            px: 2,
            backgroundColor: theme.palette.primary.main,
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
            borderRadius: theme.shape.borderRadius,
          },
        }}
      >
        <DialogTitle
          sx={{ fontWeight: "medium", color: theme.palette.text.primary }}
        >
          Create New Conversation
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Conversation Title"
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
              mt: 1,
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
            }}
          />
        </DialogContent>
        <DialogActions sx={{ p: "16px 24px" }}>
          <Button
            onClick={handleCloseDialog}
            sx={{ color: theme.palette.text.secondary }}
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
      <Box sx={{ px: 2, py: 1.5 }}>
        <Typography
          variant="overline"
          color="text.secondary"
          fontWeight="medium"
          sx={{
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
                          fontWeight: "medium",
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
                      onClick={() => {}}
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
