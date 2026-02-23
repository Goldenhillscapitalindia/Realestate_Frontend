import React from "react";
import { Paper, Box, Typography } from "@mui/material";
import PsychologyAltIcon from "@mui/icons-material/PsychologyAlt";

const AIThinkingLoader: React.FC<{ message?: string }> = ({ message }) => {
  return (
    <Paper
      elevation={4}
      sx={{
        p: 4,
        borderRadius: 4,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        minHeight: "30vh",
        gap: 2,
        animation: "pulse 2s infinite",
        "@keyframes pulse": {
          "0%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(106, 27, 154, 0.4)" },
          "70%": { transform: "scale(1.01)", boxShadow: "0 0 8px 8px rgba(106, 27, 154, 0)" },
          "100%": { transform: "scale(1)", boxShadow: "0 0 0 0 rgba(106, 27, 154, 0)" },
        },
      }}
    >
      <PsychologyAltIcon sx={{ fontSize: 48, color: "#6A1B9A" }} />
      <Box
        component="img"
        src="/images/thinking.gif"
        alt="AI Thinking"
        sx={{ width: 120, height: 120 }}
      />
      <Typography
        variant="h6"
        sx={{ color: "#6A1B9A", fontWeight: 600, letterSpacing: 0.5, mt: 1 }}
      >
        {message || "AI is thinking… please hold on"}
      </Typography>
    </Paper>
  );
};

export default AIThinkingLoader;
