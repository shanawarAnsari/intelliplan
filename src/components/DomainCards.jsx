// filepath: d:\Dev\intelliplan\src\components\DomainCards.jsx
import React, { useState } from "react";
import { Box, Paper, Typography, Grid, useTheme } from "@mui/material";

const cardData = [
  { title: "Supply Planning", width: 4, height: "60px" },
  { title: "Demand Planning", width: 4, height: "60px" },
];

const DomainCards = () => {
  const theme = useTheme();
  const [selectedCard, setSelectedCard] = useState("Demand Planning"); // Default selected card

  const handleCardClick = (title) => {
    setSelectedCard((prev) => (prev === title ? null : title)); // Toggle selection, allowing only one card to be selected
  };

  return (
    <Box
      sx={{
        p: 1,
        backgroundColor: theme.palette.background.default,
        borderRadius: "8px",
        // The component will be compact due to small card heights and paddings.
        // Max width is controlled by its container in ChatBox.jsx (currently 700px)
      }}
    >
      <Grid container spacing={1}>
        {" "}
        {/* Minimal spacing */}
        {cardData.map((card, index) => (
          <Grid item xs={4} sm={card.width} md={card.width} key={index}>
            <Paper
              onClick={() => handleCardClick(card.title)} // Add click handler
              sx={{
                p: 2, // Increased padding
                height: card.height,
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                textAlign: "center",
                color: theme.palette.text.primary,

                // Glass finish styles
                background:
                  selectedCard === card.title
                    ? "linear-gradient(135deg, rgba(25, 118, 210, 0.2), rgba(25, 118, 210, 0.1))"
                    : "linear-gradient(135deg, rgba(255, 255, 255, 0.1), rgba(255, 255, 255, 0))", // Change background for selected card
                backdropFilter: "blur(10px)",
                WebkitBackdropFilter: "blur(10px)", // For Safari
                borderRadius: "20px",
                border:
                  selectedCard === card.title
                    ? "2px solid #1976d2"
                    : "1px solid rgba(255, 255, 255, 0.18)", // Highlight selected card
                // boxShadow: "0 8px 32px 0 rgba(0, 0, 0, 0.37)",

                position: "relative", // For pseudo-element positioning
                overflow: "hidden", // To contain the pseudo-element

                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",

                "&:hover": {
                  transform: "translateY(-3px)", // Bounce effect
                  boxShadow: "0 12px 40px 0 rgba(0, 0, 0, 0.45)", // Enhanced shadow
                  "&::after": {
                    left: "150%", // Animate shimmer to the right
                  },
                },
                // Shimmer pseudo-element
                "&::after": {
                  content: '""',
                  position: "absolute",
                  top: 0,
                  left: "-100%", // Start off-screen to the left
                  width: "75%", // Width of the shine element
                  height: "100%",
                  background:
                    "linear-gradient(to right, transparent 0%, rgba(255,255,255,0.3) 50%, transparent 100%)",
                  transform: "skewX(-25deg)", // Angle the shine
                  transition: "left 0.6s ease-in-out", // Shimmer animation
                  pointerEvents: "none", // Make sure it's not interactive
                },
                cursor: "pointer", // Indicate clickable
              }}
            >
              <Typography
                variant="body2"
                component="div"
                sx={{ fontSize: "1rem", fontWeight: "normal" }} // Increased font size
              >
                {" "}
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
