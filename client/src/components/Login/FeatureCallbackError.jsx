import { Grid, Paper, Box, Typography, Alert } from "@mui/material";
import { BlockRounded, LockClockOutlined, LockPerson } from "@mui/icons-material";
import React from "react";

const FeatureCallbackError = () => {
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
                        padding: 2,
                        color: "#585252",
                        border: "1px solid #e0e0e0",
                        borderRadius: 2,
                    }}
                >
                    <Box
                        sx={{
                            textAlign: "center",
                            fontSize: "3rem",
                            padding: 0,
                            color: "#d32f2f",
                        }}
                    >
                        <LockPerson fontSize="inherit" />
                    </Box>
                    <Box sx={{ textAlign: "center", padding: 2 }}>

                        <Typography sx={{ color: '#E2e2e2', marginBottom: 1 }}>
                            You don't have permission to access this feature!
                        </Typography>
                        <Typography sx={{ color: "#C2c2c2" }}>
                            To request access, please contact your administrator.
                        </Typography>
                    </Box>
                </Paper>
            </Grid>
        </Grid>
    );
};

export default FeatureCallbackError;