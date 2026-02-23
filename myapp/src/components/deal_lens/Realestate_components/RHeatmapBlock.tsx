import React, { useMemo } from "react";
import { Paper, Typography, Box } from "@mui/material";
import { Chart } from "react-chartjs-2";
import "chartjs-chart-matrix";
import { Chart as ChartJS, LinearScale, Tooltip, Legend, CategoryScale } from "chart.js";
import { MatrixController, MatrixElement } from "chartjs-chart-matrix";

ChartJS.register(
  LinearScale,
  CategoryScale,   // needed for x/y category axes
  Tooltip,
  Legend,
  MatrixController,
  MatrixElement   // needed to render the matrix cells
);

export interface RHeatmapBlockProps {
  title: string;
  data: number[][];
  xlabels: string[];
  ylabels: string[];
}

// Predefined gradient pairs (start = low, end = high)
const gradients: Array<{ start: string; end: string }> = [
  { start: "#ffffffff", end: "#B75BCF" }, // Gradient 1
  { start: "#ffffffff", end: "#76D85D" }, // Gradient 2
  { start: "#ffffffff", end: "#039AFF" }, // Gradient 3
  { start: "#ffffffff", end: "#FF03AB" }, // Gradient 4
  { start: "#ffffffff", end: "#FFFF03" }, // Gradient 5
  { start: "#ffffffff", end: "#FF4203" }, // Gradient 6
];

const RHeatmapBlock: React.FC<RHeatmapBlockProps> = ({
  title,
  data,
  xlabels,
  ylabels,
}) => {
  const allValues = data.flat();
  const minValue = Math.min(...allValues);
  const maxValue = Math.max(...allValues);

  // Pick one gradient per render
  const { start: startColor, end: endColor } = useMemo(() => {
    return gradients[Math.floor(Math.random() * gradients.length)];
  }, []);

  const interpolateColor = (value: number) => {
    const ratio = (value - minValue) / (maxValue - minValue || 1);

    const parseHex = (hex: string) => [
      parseInt(hex.slice(1, 3), 16),
      parseInt(hex.slice(3, 5), 16),
      parseInt(hex.slice(5, 7), 16),
    ];

    const [r1, g1, b1] = parseHex(startColor);
    const [r2, g2, b2] = parseHex(endColor);

    const r = Math.round(r1 + ratio * (r2 - r1));
    const g = Math.round(g1 + ratio * (g2 - g1));
    const b = Math.round(b1 + ratio * (b2 - b1));

    return `rgb(${r},${g},${b})`;
  };

const formattedData = {
  datasets: [
    {
      label: title,
      data: data.flatMap((row, i) =>
        row.map((value, j) => ({
          x: xlabels[j],   // use label string instead of index
          y: ylabels[i],   // use label string instead of index
          v: value,
        }))
      ),
      backgroundColor: (ctx: any) => {
        const value = ctx.dataset.data[ctx.dataIndex].v;
        return interpolateColor(value);
      },
      width: ({ chart }: any) =>
        chart.chartArea ? chart.chartArea.width / xlabels.length  : 1,
      height: ({ chart }: any) =>
        chart.chartArea ? chart.chartArea.height / ylabels.length : 1,
    },
  ],
};

  const options: any = {
    maintainAspectRatio: false,
    responsive: true,
    scales: {
      x: {
        type: "category",
        labels: xlabels,
        offset: true,
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
      y: {
        type: "category",
        labels: ylabels,
        offset: true,
        ticks: {
          color: "#ffffff",
        },
        grid: {
          color: "rgba(255,255,255,0.1)",
        },
      },
    },
    plugins: {
      legend: { display: false },
      tooltip: {
        callbacks: {
          label: (ctx: any) => `Value: ${ctx.raw.v}`,
        },
      },
    },
  };

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: "100%",
        borderRadius: 3,
        background: "#173347",
        boxShadow: 3,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ color: "#e5e7eb", mb: 1, textAlign: "center" }}
      >
        {title}
      </Typography>

      <Box sx={{ flexGrow: 1 }}>
        <Chart type="matrix" data={formattedData} options={options} />
      </Box>

      {/* Gradient legend */}
      <Box sx={{ display: "flex", alignItems: "center", mt: 2, px: 2 }}>
        <Typography variant="caption" sx={{ color: "#e5e7eb", mr: 1 }}>
          {minValue}
        </Typography>
        <Box
          sx={{
            flexGrow: 1,
            height: 10,
            borderRadius: 5,
            background: `linear-gradient(to right, ${startColor}, ${endColor})`,
          }}
        />
        <Typography variant="caption" sx={{ color: "#e5e7eb", ml: 1 }}>
          {maxValue}
        </Typography>
      </Box>
    </Paper>
  );
};

export default RHeatmapBlock;
