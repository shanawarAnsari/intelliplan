/**
 * Error Boundary Component - Catches errors in message rendering
 */
import React from "react";
import { Box, Typography, Button, useTheme, Alert } from "@mui/material";
import RefreshIcon from "@mui/icons-material/Refresh";

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("Error caught:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <Alert
          severity="error"
          action={
            <Button
              size="small"
              startIcon={<RefreshIcon />}
              onClick={() => this.setState({ hasError: false, error: null })}
            >
              Retry
            </Button>
          }
          sx={{ my: 1 }}
        >
          <Typography variant="body2">
            Something went wrong while rendering this message. Please try again.
          </Typography>
        </Alert>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
