import React, { useMemo } from "react";
import { Box, Typography } from "@mui/material";

export interface InfoCardProps {
  title: string;
  value: string;
  description?: string;
}

// Array of colors to pick from
const valueColors = ["#b39cfaff", "#76d85d", "#039aff", "#ff8503", "#ffff03", "#03ffea"];

const RInfoCard: React.FC<InfoCardProps> = ({ title, value, description }) => {
  // Pick a random color for the value text
  const valueColor = useMemo(() => {
    return valueColors[Math.floor(Math.random() * valueColors.length)];
  }, []);

  return (
    <Box
      sx={{
        backgroundColor: "#173347",
        color: "#FFFFFF",
        borderRadius: 3,
        padding: 2,
        width: "100%",
        minWidth: 0,
        minHeight: 140,
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        gap: 1,
        boxShadow: "0 6px 20px rgba(0, 0, 0, 0.7)",
        transition: "transform 0.3s, box-shadow 0.3s",
        "&:hover": {
          transform: "translateY(-5px)",
          boxShadow: "0 10px 30px rgba(0, 0, 0, 0.8)",
        },
      }}
    >
      <Typography
        variant="subtitle2"
        sx={{
          color: "#ffffffff",
          textTransform: "uppercase",
          textAlign: "center",
          letterSpacing: 1,
          lineHeight: 1.2,
        }}
      >
        {title}
      </Typography>

      <Typography
        variant="h5"
        sx={{
          fontWeight: 700,
          color: valueColor, // random color applied
          textAlign: "center",
          lineHeight: 1.1,
        }}
      >
        {value}
      </Typography>

      {description && (
        <Typography
          variant="body2"
          sx={{
            color: "#c5e2f1ff",
            textAlign: "center",
            lineHeight: 1.3,
          }}
        >
          {description}
        </Typography>
      )}
    </Box>
  );
};

export default RInfoCard;
