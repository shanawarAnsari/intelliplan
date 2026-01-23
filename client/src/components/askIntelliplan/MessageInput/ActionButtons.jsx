/**
 * Action Buttons Component for Message Input
 */
import React from "react";
import { Box, IconButton, Tooltip, useTheme } from "@mui/material";
// import AttachFileIcon from "@mui/icons-material/AttachFile";
// import EmojiEmotionsIcon from "@mui/icons-material/EmojiEmotions";
// import MicIcon from "@mui/icons-material/Mic";
import SendIcon from "@mui/icons-material/Send";

const ActionButtons = ({ disabled, message, onSubmit }) => {
  // const theme = useTheme();

  // const handleAttachFile = () => {
  //   console.log("File upload clicked");
  // };

  // const handleEmojiClick = () => {
  //   console.log("Emoji picker clicked");
  // };

  // const handleVoiceInput = () => {
  //   console.log("Voice input clicked");
  // };

  return (
    <Box
      sx={{
        display: "flex",
        alignItems: "center",
        gap: 0.5,
      }}
    >
      {/* <Tooltip title="Attach file" placement="top">
        <IconButton
          size="small"
          onClick={handleAttachFile}
          disabled={disabled}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.primary.main,
            },
            width: "36px",
            height: "36px",
          }}
          aria-label="Attach file"
        >
          <AttachFileIcon fontSize="small" />
        </IconButton>
      </Tooltip> */}

      {/* <Tooltip title="Add emoji" placement="top">
        <IconButton
          size="small"
          onClick={handleEmojiClick}
          disabled={disabled}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.primary.main,
            },
            width: "36px",
            height: "36px",
          }}
          aria-label="Add emoji"
        >
          <EmojiEmotionsIcon fontSize="small" />
        </IconButton>
      </Tooltip> */}
      {/* 
      <Tooltip title="Voice input" placement="top">
        <IconButton
          size="small"
          onClick={handleVoiceInput}
          disabled={disabled}
          sx={{
            color: theme.palette.text.secondary,
            "&:hover": {
              bgcolor: theme.palette.action.hover,
              color: theme.palette.primary.main,
            },
            width: "36px",
            height: "36px",
          }}
          aria-label="Voice input"
        >
          <MicIcon fontSize="small" />
        </IconButton>
      </Tooltip> */}

      {/* Send Button */}
      <Tooltip
        title={
          !message.trim() || disabled
            ? "Type a message to send"
            : "Send (or press Enter)"
        }
        placement="top"
      >
        <IconButton
          type="submit"
          color="primary"
          disabled={!message.trim() || disabled}
          onClick={onSubmit}
          sx={{
            bgcolor: "primary.main",
            color: "primary.contrastText",
            "&:hover": {
              bgcolor: "primary.dark",
            },
            "&.Mui-disabled": {
              bgcolor: "action.disabledBackground",
              color: "action.disabled",
            },
            width: "40px",
            height: "40px",
            padding: "8px",
            transition: "all 0.2s ease",
            flexShrink: 0,
          }}
          aria-label="Send message"
        >
          <SendIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    </Box>
  );
};

export default ActionButtons;
