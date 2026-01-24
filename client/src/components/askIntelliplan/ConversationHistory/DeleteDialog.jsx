/**
 * Delete Confirmation Dialog Component
 */
import React from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";

const DeleteDialog = ({ open, conversation, onClose, onConfirm, isClearAll }) => {
  return (
    <Dialog
      open={open}
      onClose={onClose}
      aria-labelledby="alert-dialog-title"
      aria-describedby="alert-dialog-description"
    >
      <DialogTitle id="alert-dialog-title">
        {isClearAll ? "Clear All Conversations?" : "Delete Conversation?"}
      </DialogTitle>
      <DialogContent>
        <DialogContentText id="alert-dialog-description">
          {isClearAll
            ? "Are you sure you want to delete all conversations?"
            : "Are you sure you want to delete this conversation?"}
          <br />
          {!isClearAll && conversation && <b> "{conversation.title}"</b>}
          <br />
          <Typography variant="caption" sx={{ color: "text.secondary", mt: 1 }}>
            This action cannot be undone.
          </Typography>
        </DialogContentText>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} color="primary">
          Cancel
        </Button>
        <Button onClick={onConfirm} color="error" variant="contained">
          {isClearAll ? "Clear All" : "Delete"}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default DeleteDialog;
