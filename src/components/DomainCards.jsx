import React, { useState } from "react";
import { Box, Paper, Typography, Grid, useTheme } from "@mui/material";

const cardData = [
  { title: "Supply Planning", width: 4, height: "60px" },
  { title: "Demand Planning", width: 4, height: "60px" },
];

const DomainCards = () => {
  const theme = useTheme();
  const [selectedCard, setSelectedCard] = useState("Demand Planning");

  const handleCardClick = (title) => {
    setSelectedCard((prev) => (prev === title ? null : title));
  };

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: theme.palette.background.default,
        borderRadius: "8px",
      }}
    >
      <Grid container spacing={1} justifyContent="center">
        {cardData.map((card, index) => (
          <Grid item xs="auto" sm="auto" md="auto" key={index}>
            <Paper
              onClick={() => handleCardClick(card.title)}
              sx={{
                py: 2,
                px: 4,
                height: card.height,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: theme.palette.text.primary,
                background:
                  selectedCard === card.title
                    ? "linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1))"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))",
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)",
                borderRadius: "20px",
                border:
                  selectedCard === card.title
                    ? "2px solid #1976d2"
                    : "1px solid rgba(255, 255, 255, 0.18)",
                position: "relative",
                overflow: "hidden",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "translateY(-3px)",
                  boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.45)",
                  "&::after": {
                    left: "150%",
                  },
                },
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%",
                  width: "75%",
                  height: "100%",
                  background:
                    "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  transform: "skewX(-25deg)",
                  transition: "left 0.6s ease-in-out",
                  pointerEvents: "none",
                },
                cursor: "pointer",
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{ fontSize: "1rem", fontWeight: "normal" }}
              >
                {card.title}
              </Typography>
            </Paper>
          </Grid>
        ))}
      </Grid>
    </Box>
  );
};

export default DomainCards;
