import { Grid, Paper, Box, Typography, Alert } from "@mui/material";
import { LockRounded } from "@mui/icons-material";
import React from "react";

const LoginCallbackError = () => {
  return (
    <Grid
      container
      justifyContent="center"
      alignItems="center"
      padding={2}
      className="login-callback-error"
      sx={{ minHeight: "100vh" }}
    >
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper
          elevation={3}
          sx={{
            padding: 4,
            color: "#585252",
            border: "1px solid #e0e0e0",
            borderRadius: 2,
          }}
        >
          <Box
            sx={{
              textAlign: "center",
              fontSize: "3rem",
              padding: 2,
              color: "#d32f2f",
            }}
          >
            <LockRounded fontSize="inherit" /> { }
          </Box>
          <Box sx={{ padding: 2 }}>
            <Alert
              severity="error"
              sx={{ backgroundColor: "#ffebee", color: "#c62828", justifyContent: "center", alignItems: 'center', marginTop: 1 }}
            >
              <Typography
                variant="h5"
                component="div"
                sx={{ fontWeight: "bold" }}
              >
                App Access Locked
              </Typography>
            </Alert>
          </Box>
          <Box sx={{ textAlign: "center", padding: 2 }}>

            <Typography variant="body1" sx={{ marginBottom: 1 }}>
              You are not allowed to access this app due to a policy set by the
              administrator.
            </Typography>
            <Typography variant="body2" sx={{ color: "#757575" }}>
              To request access, please contact your administrator.
            </Typography>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default LoginCallbackError;