import React from "react";
import { Card, CardContent, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";

const RTextBlock: React.FC<{ content: string }> = ({ content }) => {
  return (
    <Card
      sx={{
        backgroundColor: "#173347", // dark card background
        borderRadius: 3,
        boxShadow: "0 6px 18px rgba(0,0,0,0.5)",
        border: "1px solid #163042", // subtle border for depth
        color: "#e0e0e0", // light text for contrast
        p: 2,
        transition: "transform 0.3s ease, box-shadow 0.3s ease",
        "&:hover": {
          transform: "scale(1.02)",
          boxShadow: "0 12px 28px rgba(0,0,0,0.7)",
        },
      }}
    >
      <CardContent sx={{ paddingBottom: "16px !important" }}>
        <Typography
          variant="body1"
          component="div"
          sx={{ lineHeight: 1.6, fontSize: "0.95rem", color: "#e0e0e0" }}
        >
          <ReactMarkdown>{content}</ReactMarkdown>
        </Typography>
      </CardContent>
    </Card>
  );
};

export default RTextBlock;
