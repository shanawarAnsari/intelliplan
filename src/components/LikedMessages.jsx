import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  useTheme,
  IconButton,
  Tooltip,
  Divider,
  Paper,
  Chip,
  Fade,
  alpha,
  Stack,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
} from "@mui/material";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import FavoriteIcon from "@mui/icons-material/Favorite";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import BookmarkIcon from "@mui/icons-material/Bookmark";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";

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
    const updatedMessages =
      typeof messageId === "number"
        ? likedMessages.filter((_, index) => index !== messageId)
        : likedMessages.filter((msg) => msg.id !== messageId);
    setLikedMessages(updatedMessages);
    localStorage.setItem("likedMessages", JSON.stringify(updatedMessages));
  };

  const addLikedMessage = (message) => {
    const newLikedMessages = [...likedMessages, message];
    setLikedMessages(newLikedMessages);
    localStorage.setItem("likedMessages", JSON.stringify(newLikedMessages));
  };

  // Format date for display
  const formatDate = (timestamp) => {
    if (!timestamp) return "";
    const date = new Date(timestamp);
    return date.toLocaleDateString(undefined, {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };
  return (
    <Box
      sx={{
        p: 1,
        height: "100%",
        display: "flex",
        flexDirection: "column",
        overflowY: "auto",
        background:
          theme.palette.mode === "dark"
            ? `linear-gradient(${alpha(
                theme.palette.background.default,
                0.97
              )}, ${alpha(theme.palette.background.default, 0.95)})`
            : `linear-gradient(${alpha(
                theme.palette.background.paper,
                0.95
              )}, ${alpha(theme.palette.background.default, 0.85)})`,
        borderRadius: "6px",
        boxShadow: theme.shadows[1],
        backdropFilter: "blur(8px)",
      }}
    >
      <Box
        sx={{
          display: "flex",
          alignItems: "center",
          mb: 3,
          pb: 2,
          borderBottom: `1px solid ${alpha(theme.palette.divider, 0.6)}`,
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            p: 1,
            borderRadius: "50%",
            backgroundColor: alpha(theme.palette.primary.main, 0.15),
            mr: 1.5,
          }}
        >
          <FavoriteIcon
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
          Liked Messages
        </Typography>
        <Chip
          size="small"
          label={`${likedMessages.length} saved`}
          sx={{
            backgroundColor: alpha(theme.palette.primary.main, 0.12),
            color: theme.palette.primary.main,
            fontWeight: 600,
            borderRadius: "14px",
            px: 0.5,
          }}
        />
      </Box>

      {likedMessages.length === 0 ? (
        <Fade in={true} timeout={800}>
          <Paper
            elevation={0}
            sx={{
              p: 4,
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
              No Liked Messages Yet
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
              When you like messages from your conversations, they'll appear here for
              easy reference.
            </Typography>
            <Box
              sx={{
                width: "100%",
                height: "4px",
                background: alpha(theme.palette.divider, 0.2),
                mt: 2,
                borderRadius: "2px",
                overflow: "hidden",
                position: "relative",
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: 0,
                  height: "100%",
                  width: "30%",
                  background: alpha(theme.palette.primary.main, 0.3),
                  borderRadius: "2px",
                },
              }}
            />
          </Paper>
        </Fade>
      ) : (
        <Stack spacing={1}>
          {likedMessages.map((msg, index) => (
            <Fade in={true} timeout={300 + index * 100} key={msg.id || index}>
              <Accordion
                sx={{
                  backgroundColor:
                    theme.palette.mode === "dark"
                      ? alpha(theme.palette.background.paper, 0.6)
                      : alpha(theme.palette.background.paper, 0.9),
                  boxShadow: theme.shadows[1],
                  borderRadius: "6px !important",
                  transition: "all 0.25s ease-in-out",
                  "&:hover": {
                    boxShadow: theme.shadows[3],
                  },
                  overflow: "hidden",
                  border: `1px solid ${alpha(theme.palette.divider, 0.1)}`,
                  position: "relative",
                  "&.MuiPaper-root": {
                    borderRadius: "6px",
                  },
                  "&.Mui-expanded": {
                    margin: "2px 0",
                  },
                }}
              >
                <AccordionSummary
                  expandIcon={
                    <ExpandMoreIcon sx={{ color: theme.palette.primary.main }} />
                  }
                  sx={{
                    borderRadius: "6px",
                    "&.Mui-expanded": {
                      minHeight: "48px",
                    },
                  }}
                >
                  {" "}
                  <Box
                    sx={{
                      display: "flex",
                      alignItems: "center",
                      position: "relative",
                      width: "100%",
                    }}
                  >
                    <Typography
                      variant="subtitle1"
                      sx={{
                        fontWeight: 600,
                        color: theme.palette.text.primary,
                        flexGrow: 1,
                        letterSpacing: "-0.3px",
                        pl: 0.5,
                      }}
                    >
                      {msg.text
                        ? msg.text.substring(0, 50) +
                          (msg.text.length > 50 ? "..." : "")
                        : "Liked Content"}
                    </Typography>
                  </Box>
                </AccordionSummary>{" "}
                <AccordionDetails sx={{ p: 1 }}>
                  <Box sx={{ pl: 0.5 }}>
                    <Typography
                      variant="body2"
                      sx={{
                        whiteSpace: "pre-wrap",
                        color: theme.palette.text.secondary,
                        mb: 2,
                        lineHeight: 1.6,
                        fontWeight: 400,
                      }}
                    >
                      {msg.text || "No text content"}
                    </Typography>
                  </Box>
                  <Divider
                    sx={{
                      my: 1.5,
                      opacity: 0.6,
                      mx: -1,
                    }}
                  />{" "}
                  <Box
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      mt: 1,
                      pl: 0.5,
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <AccessTimeIcon
                        fontSize="small"
                        sx={{
                          color: alpha(theme.palette.text.secondary, 0.7),
                          fontSize: 16,
                        }}
                      />
                      <Typography
                        variant="caption"
                        sx={{
                          color: theme.palette.text.secondary,
                          fontWeight: 500,
                        }}
                      >
                        {formatDate(msg.timestamp) || "No date"}
                      </Typography>
                    </Stack>
                    <Tooltip title="Remove from favorites" arrow>
                      <IconButton
                        size="small"
                        onClick={(e) => {
                          e.stopPropagation();
                          // Use message ID or index as fallback
                          handleUnlikeMessage(msg.id || index);
                        }}
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
                      >
                        <DeleteOutlineIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </AccordionDetails>
              </Accordion>
            </Fade>
          ))}
        </Stack>
      )}
      {likedMessages.length > 0 && (
        <Box sx={{ mt: "auto", pt: 2, display: "flex", justifyContent: "center" }}>
          <Button
            variant="outlined"
            color="primary"
            size="small"
            onClick={() => {
              if (
                window.confirm("Are you sure you want to clear all liked messages?")
              ) {
                setLikedMessages([]);
                localStorage.setItem("likedMessages", JSON.stringify([]));
              }
            }}
            startIcon={<DeleteOutlineIcon />}
            sx={{
              borderRadius: theme.shape.borderRadius * 2,
              textTransform: "none",
            }}
          >
            Clear All Liked Messages
          </Button>
        </Box>
      )}
    </Box>
  );
};

export default LikedMessages;
