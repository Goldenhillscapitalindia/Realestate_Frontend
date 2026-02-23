import React from "react";
import { Paper, Typography, Box, Divider } from "@mui/material";
import { Pie, Bar, Line, Scatter, Bubble } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler,
} from "chart.js";
import ReactMarkdown from "react-markdown";

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  PointElement,
  LineElement,
  ArcElement,
  Tooltip,
  Legend,
  Filler
);

type GENAIChartBlockProps = {
  chartType: string;
  data: any;
  title: string;
  fixedHeight?: number;
};

const RChartBlock: React.FC<GENAIChartBlockProps> = ({
  chartType,
  data,
  title,
  fixedHeight = 380,
}) => {
  const type = chartType.toLowerCase();

  const chartMap: Record<string, any> = {
    pie: Pie,
    bar: Bar,
    line: Line,
    area: Line,
    scatter: Scatter,
    bubble: Bubble,
    stackedbar: Bar,
  };

  const ChartComponent = chartMap[type];

  if (!ChartComponent) {
    return (
      <Paper
        sx={{
          p: 2,
          m: 2,
          bgcolor: "#173347",
          width: "100%",
          borderRadius: 2,
          boxShadow: "0 4px 12px rgba(0,0,0,0.5)",
        }}
      >
        <Typography variant="body2" sx={{ color: "#f87171" }}>
          Unsupported chart type: <strong>{chartType}</strong>
        </Typography>
      </Paper>
    );
  }

  let formattedData = data;

  if (["scatter", "bubble"].includes(type)) {
    formattedData = {
      datasets: [
        {
          label: title,
          data,
          backgroundColor: "#60a5fa",
        },
      ],
    };
  }

const chartOptions: any = {
  maintainAspectRatio: false,
  responsive: true,
  plugins: {
    legend: { display: true, position: "bottom", labels: { color: "#e0e0e0" } },
    tooltip: { bodyColor: "#fff", titleColor: "#fff", backgroundColor: "#163042" },
  },
  // Conditionally include scales only for charts that need them
  ...(type !== "pie" && type !== "doughnut"
    ? {
        scales: {
          x: { ticks: { color: "#e0e0e0" }, grid: { color: "#163042" } },
          y: { ticks: { color: "#e0e0e0" }, grid: { color: "#163042" } },
        },
      }
    : {}),
};


  if (type === "area") {
    formattedData = {
      ...data,
      datasets: data.datasets.map((ds: any) => ({
        ...ds,
        fill: true,
        backgroundColor: ds.backgroundColor || "rgba(96,165,250,0.3)",
        borderColor: ds.borderColor || "#60a5fa",
        tension: 0.3,
      })),
    };
  }

  if (type === "stackedbar") {
    chartOptions.scales = {
      x: { stacked: true, ticks: { color: "#e0e0e0" }, grid: { color: "#163042" } },
      y: { stacked: true, ticks: { color: "#e0e0e0" }, grid: { color: "#163042" } },
    };
  }

  return (
    <Paper
      elevation={2}
      sx={{
        p: 2,
        width: "100%",
        height: fixedHeight,
        borderRadius: 3,
        background: "linear-gradient(135deg, #173347, #163042)",
        boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
      }}
    >
      <Typography
        variant="subtitle1"
        fontWeight={600}
        sx={{ color: "#e0e0e0", mb: 1 }}
      >
        <ReactMarkdown>{title}</ReactMarkdown>
      </Typography>

      <Divider sx={{ mb: 1, borderColor: "#163042" }} />

      <Box
        sx={{
          width: "100%",
          height: `calc(${fixedHeight}px - 64px)`,
          position: "relative",
        }}
      >
        <ChartComponent data={formattedData} options={chartOptions} />
      </Box>
    </Paper>
  );
};

export default RChartBlock;
