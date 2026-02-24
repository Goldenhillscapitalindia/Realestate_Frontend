import type { PortfolioAnalyticsTabId } from "./pf_demo_portfolio_analytics";

export type PortfolioNarrative = {
  overview: string[];
  recommendations: string[];
  imageUrl: string;
};

export const portfolioNarratives: Record<PortfolioAnalyticsTabId, PortfolioNarrative> = {
  snapshot: {
    overview: [
      "The portfolio consists of 3 active properties totaling 328 units.",
      "Trailing NOI margin stands at a strong 60.21%, supported by controlled operating expenses (43.3% ratio).",
      "However, vacancy loss remains elevated at 11.64%, resulting in average occupancy of 88.3%.",
      "Gross Potential Rent is $9.57M (+10% YoY), generating $5.76M in NOI.",
      "Revenue per unit ($29,186) significantly exceeds expense per unit ($12,467), indicating healthy unit economics.",
    ],
    recommendations: [
      "Vacancy remains the key opportunity area, with 88.3% occupancy and 11.64% vacancy loss pressuring NOI; improving occupancy toward stabilized levels could meaningfully enhance earnings.",
      "Strong 10% YoY GPR growth supports selective rent optimization, particularly for below-market units.",
      "Operating expenses are well controlled at a 43.3% ratio, sustaining a healthy NOI margin while concessions should be reduced as leasing momentum improves.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=1600&q=80",
  },
  performance_drivers: {
    overview: [
      "Revenue increased 10% period-over-period while expenses declined 31%, driving meaningful margin expansion.",
      "NOI shows an overall upward trend despite some monthly volatility.",
      "Operational performance reflects improving efficiency and stronger profitability.",
    ],
    recommendations: [
      "Sustain revenue momentum through strategic rent optimization and occupancy focus.",
      "Maintain strict cost controls to preserve recent expense reductions.",
      "Closely monitor seasonal NOI fluctuations to ensure consistent cash flow stability.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&w=1600&q=80",
  },
  revenue_quality_lease_intelligence: {
    overview: [
      "Renewal rate is 60% with 4.0% loss-to-lease, indicating moderate pricing discipline.",
      "34% of units are below market, representing meaningful embedded revenue upside of approximately $404K.",
      "Lease expirations are moderately concentrated, with August 2025 as the peak month (26 expirations).",
    ],
    recommendations: [
      "Capitalize on the $404K mark-to-market opportunity by systematically pushing renewals toward market rents.",
      "Prioritize retention strategies ahead of the August expiration peak to reduce turnover risk.",
      "With average lease term at 4.9 months, proactively manage renewals to smooth future expiration concentration.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1460317442991-0ec209397118?auto=format&fit=crop&w=1600&q=80",
  },
  expenses_dashboard: {
    overview: [
      "Total expenses declined 30% YoY to $4.15M, primarily driven by significant reductions in taxes (-54%) and utilities (-23%).",
      "Payroll and insurance also decreased, contributing to improved cost efficiency.",
      "However, select categories such as renting, grounds, and professional fees showed notable YoY increases.",
    ],
    recommendations: [
      "Sustain structural cost improvements in taxes and utilities while validating whether reductions are recurring or one-time adjustments.",
      "Closely monitor high-growth categories like renting and grounds to prevent margin leakage.",
      "Implement tighter expense benchmarking at the per-unit level to maintain long-term",
    ],
    imageUrl: "https://images.unsplash.com/photo-1472224371017-08207f84aaae?auto=format&fit=crop&w=1600&q=80",
  },
  risk_stability_dashboard: {
    overview: [
      "Portfolio stability score stands at 70/100, indicating moderate risk exposure.",
      "Revenue at risk totals $120K (60-day) and $89K (90-day), with concentration skewed toward Charlesbank Estates.",
      "One asset is flagged as underperforming due to flat NOI growth and elevated risk score.",
    ],
    recommendations: [
      "Prioritize operational review of Charlesbank Estates to address stagnant NOI and elevated risk exposure.",
      "Diversify revenue concentration to reduce dependency on a single asset.",
      "Implement targeted leasing and expense controls to improve portfolio stability and lift the overall risk score.",
    ],
    imageUrl: "https://images.unsplash.com/photo-1494526585095-c41746248156?auto=format&fit=crop&w=1600&q=80",
  },
};
