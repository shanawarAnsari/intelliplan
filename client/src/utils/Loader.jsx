import { Box } from "@mui/material"
import React from "react"

export const Loader = () => {
  return (<Box
    sx={{
      display: "flex",
      flexDirection: "column",
      alignItems: "center",
      justifyContent: "center",
      minHeight: 400,
      gap: 3,
    }}
  >
    <Box
      sx={{
        position: "relative",
        width: 40,
        height: 40,
      }}
    >
      {[1, 2, 3].map((i) => (
        <Box
          key={i}
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            width: "100%",
            height: "100%",
            borderRadius: "50%",
            border: "4px solid #1976d2",
            opacity: 0,
            animation: `ring 1.5s ${i * 0.3}s infinite ease-out`,
            "@keyframes ring": {
              "0%": { transform: "scale(0.3)", opacity: 1 },
              "100%": { transform: "scale(1.6)", opacity: 0 },
            },
          }}
        />
      ))}
    </Box>
  </Box>
  )
};