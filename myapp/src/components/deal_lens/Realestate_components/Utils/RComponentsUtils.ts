export type BlockType =
  | "text"
  | "table"
  | "card"
  | "chart"
  |  "heatmap"
  | "info_card";



export interface BaseBlock {
  type: BlockType;
  total_columns?: number;
  row?: number;
  column?: number;
}
// Info card block (new)
export interface InfoCardBlock extends BaseBlock {
  type: "info_card";
  title: string;
  value: string;
  description: string;
}
// Text block
export interface TextBlock extends BaseBlock {
  type: "text";
  content: string;
}

// Table block
export interface TableBlock extends BaseBlock {
  headers: string[];
  rows: (string | number)[][]; // <- allow numbers
}

// Card block
export interface CardBlock extends BaseBlock {
  type: "card";
  title: string;
  subtitle: string;
  description: string;
  icon?: string;
}

// General Chart block fallback (for unknown or other chartTypes)
export interface ChartBlock extends BaseBlock {
  type: "chart";
  chartType: string;
  title: string;
  data: any;
}

export interface HeatmapBlock extends BaseBlock {
  type: "heatmap";
  title: string;
  xlabels: string[];
  ylabels: string[];
  data: number[][];
}




export type Block =
  | TextBlock
  | TableBlock
  | CardBlock
  | ChartBlock
  | InfoCardBlock
  | HeatmapBlock;  // add heatmap block
