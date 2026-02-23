// src/components/GENAIRenderer.tsx
import React, { useEffect, useState } from "react";
import { Box, CardContent } from "@mui/material";
import { motion } from "framer-motion";

import GENAITextBlock from "./RTextBlock";
import GENAICardBlock from "./RCardBlock";
import GENAIChartBlock from "./RChartBlock";
import GENAITableBlock from "./RTableBlock";
import RInfoCard from "./RInfoCard";
import RHeatmapBlock from "./RHeatmapBlock";
import {
  Block,
  BlockType,
  TextBlock,
  TableBlock,
  CardBlock,
  ChartBlock,
  InfoCardBlock,
  HeatmapBlock
} from "../Realestate_components/Utils/RComponentsUtils";
import { useTheme } from "../ThemeContext";

const BLOCK_RENDERERS: Record<BlockType, (block: any) => JSX.Element> = {
  text: (block: TextBlock) => <GENAITextBlock content={block.content} />,
  table: (block: TableBlock) => (
    <GENAITableBlock
      headers={block.headers}
      rows={block.rows.map(row => row.map(cell => String(cell)))}
    />
  ),
  card: (block: CardBlock) => <GENAICardBlock {...block} />,
  chart: (block: ChartBlock) => (
    <GENAIChartBlock chartType={block.chartType} title={block.title} data={block.data} />
  ),
  info_card: (block: InfoCardBlock) => (
    <RInfoCard
      title={block.title}
      value={block.value}
      description={block.description}
    />
  ),
  heatmap: (block: HeatmapBlock) => (
    <RHeatmapBlock
      title={block.title}
      data={block.data}
      xlabels={block.xlabels}
      ylabels={block.ylabels}
    />
  ),
};


const RRenderer: React.FC<{ blocks: Block[] }> = ({ blocks }) => {
  const [visibleBlocks, setVisibleBlocks] = useState<Block[]>([]);
  const { theme } = useTheme();

useEffect(() => {
  if (!blocks || blocks.length === 0) return;
setVisibleBlocks([]); // Start with no blocks visible
  let idx = -1;
  const interval = setInterval(() => {
    if (idx >= blocks.length) {
      clearInterval(interval);
      return;
    }
    setVisibleBlocks((prev) => [...prev, blocks[idx]]);
    idx++;
  }, 500);

  return () => clearInterval(interval);
}, [blocks]);


  const grouped: Record<number, Block[]> = {};
  visibleBlocks.forEach((block) => {
    if (!block || !block.type || !(block.type in BLOCK_RENDERERS)) return;
    const row = Number(block?.row ?? 0);
    if (!grouped[row]) grouped[row] = [];
    grouped[row].push(block);
  });

  const sortedRows = Object.entries(grouped).sort(([a], [b]) => Number(a) - Number(b));

  return (
    <CardContent
      sx={{
        paddingBottom: 0,
        // bgcolor: theme === "dark" ? "grey.900" : "grey.100",
        color: theme === "dark" ? "white" : "black",
        minHeight: "100vh",
        transition: "background-color 0.3s ease",
      }}
    >
      {sortedRows.map(([rowKey, rowBlocksRaw]) => {
        const rowBlocks = [...rowBlocksRaw].sort(
          (a, b) => (a.column ?? 1) - (b.column ?? 1)
        );
        const rowTotalColumns = Math.max(...rowBlocks.map((b) => b.total_columns ?? 1), 1);

        return (
          <Box
            key={`row-${rowKey}`}
            sx={{
              mb: 2,
              display: "grid",
              gridTemplateColumns: { xs: "repeat(1, 1fr)", sm: "repeat(12, 1fr)" },
              gap: 2,
            }}
          >
            {rowBlocks.map((block, idx) => {
              const Renderer = BLOCK_RENDERERS[block.type];
              if (!Renderer) return null;

              const col = Math.max(1, Number(block.column ?? 1));
              const baseSpan = Math.floor(12 / rowTotalColumns) || 1;
              const start = (col - 1) * baseSpan + 1;
              const end = col === rowTotalColumns ? 13 : start + baseSpan;
              const gridColumnValue = { xs: "1 / -1", sm: `${start} / ${end}` };

              return (
                <Box
                  key={`${rowKey}-${block.type}-${col}-${idx}`}
                  sx={{
                    gridColumn: gridColumnValue,
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05, duration: 0.3, ease: "easeOut" }}
                    style={{ flexGrow: 1, display: "flex", minHeight: 100 }}
                  >
                    <Box sx={{ width: "100%" }}>{Renderer(block as any)}</Box>
                  </motion.div>
                </Box>
              );
            })}
          </Box>
        );
      })}
    </CardContent>
  );
};

export default RRenderer;
