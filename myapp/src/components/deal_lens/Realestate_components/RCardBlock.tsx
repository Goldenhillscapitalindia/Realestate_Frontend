import React from "react";
import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import ReactMarkdown from "react-markdown";
import { motion } from "framer-motion";

// Dark-mode color palettes with your requested colors
const COLOR_PALETTES = [
  {
    titleColor: "#60a5fa",    // bright blue
    textColor: "#e0e0e0",     // light gray
    subtitleColor: "#9ca3af", // cool gray
    borderColor: "#2563eb",   // strong blue accent
    background: "#173347",    // primary card color
  },
  {
    titleColor: "#f87171",    // soft red
    textColor: "#e5e5e5",
    subtitleColor: "#b0b0b0",
    borderColor: "#dc2626",
    background: "#173347",
  },
  {
    titleColor: "#34d399",    // teal/green
    textColor: "#f0f0f0",
    subtitleColor: "#94a3b8",
    borderColor: "#10b981",
    background: "#173347",
  },
  {
    titleColor: "#fbbf24",    // yellow/gold
    textColor: "#f5f5f5",
    subtitleColor: "#d6d6d6",
    borderColor: "#f59e0b",
    background: "#173347",
  },
  {
    titleColor: "#a78bfa",    // violet
    textColor: "#e0e0e0",
    subtitleColor: "#bdbdbd",
    borderColor: "#8b5cf6",
    background: "#173347",
  },
];

const getRandomPalette = () =>
  COLOR_PALETTES[Math.floor(Math.random() * COLOR_PALETTES.length)];

interface GENAICardBlockProps {
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
}

const RCardBlock: React.FC<GENAICardBlockProps> = ({
  title,
  subtitle,
  description,
  icon,
}) => {
  const palette = React.useMemo(() => getRandomPalette(), []);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20, scale: 0.95 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.6, ease: "easeOut" }}
      whileHover={{ scale: 1.03 }}
      style={{ height: "100%", display: "flex" }}
    >
      <Card
        sx={{
          flexGrow: 1,
          bgcolor: palette.background,
          color: palette.textColor,
          borderRadius: 3,
          boxShadow: "0 8px 20px rgba(0,0,0,0.5)",
          borderLeft: `5px solid ${palette.borderColor}`,
          transition: "all 0.3s ease",
          display: "flex",
          flexDirection: "column",
          "&:hover": { boxShadow: "0 12px 28px rgba(0,0,0,0.7)" },
        }}
      >
        <CardHeader
          titleTypographyProps={{ variant: "h6", sx: { color: palette.titleColor } }}
          subheaderTypographyProps={{ sx: { color: palette.subtitleColor } }}
          title={title}
          subheader={subtitle}
          sx={{ pb: 0 }}
        />

        <CardContent sx={{ flexGrow: 1 }}>
          <Typography variant="body2" component="div" sx={{ color: palette.textColor }}>
            <ReactMarkdown>{description}</ReactMarkdown>
          </Typography>
        </CardContent>
      </Card>
    </motion.div>
  );
};

export default RCardBlock;
