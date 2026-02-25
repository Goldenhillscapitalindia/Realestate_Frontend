import type { PortfolioNarrative } from "./portfolio_narratives";

const defaultNarrative: PortfolioNarrative = {
  overview: [
    "Property performance overview is unavailable for this asset.",
  ],
  recommendations: [
    "Review occupancy, revenue trend, and expense trend to identify near-term NOI protection actions.",
  ],
  imageUrl: "",
};

const propertyNarratives: Record<string, PortfolioNarrative> = {
  "charlesbank estates": {
    overview: [
      "Charlesbank Estates is operating at 85.7% occupancy with $3.48M NOI, but NOI is down 35% YoY, driven by revenue softness and expense pressure.",
      "Revenue has declined slightly (-1.6% YoY) while renewal rate stands at 75%, with 24 units expiring and $588K revenue at risk.",
      "Market rent upside (~$228K mark-to-market) exists, but review sentiment (3.7 rating) and operational risks may be limiting pricing power.",
    ],
    recommendations: [
      "Launch a 60-day early renewal campaign targeting the 24 expiring units to protect $588K at-risk revenue.",
      "Capture mark-to-market upside strategically by pushing 3-5% increases on strong unit types while improving value perception.",
      "Improve resident sentiment drivers (maintenance, pest control, amenities) to support leasing velocity and renewal retention.",
      "Audit expense spikes (taxes, utilities, R&M) and implement preventive maintenance to stabilize NOI margin.",
      "Benchmark rents weekly against Waltham submarket to ensure pricing aligns with absorption and vacancy trends.",
    ],
    imageUrl: "",
  },
  "365 western avenue": {
    overview: [
      "365 Western Avenue is fully stabilized at 100% occupancy with strong NOI growth (+80% YoY) and a high 71.8% NOI margin.",
      "Revenue has surged (+90% YoY), though expenses are also rising (+28%), requiring monitoring to protect margin strength.",
      "Negative mark-to-market (-$5.6K) and an August lease concentration create moderate rollover risk despite solid 72% renewals.",
    ],
    recommendations: [
      "Launch a 60-day early renewal strategy for August expirations to protect occupancy and smooth seasonal rollover.",
      "Avoid aggressive rent pushes on renewals given negative mark-to-market; focus on retention over pricing.",
      "Monitor expense growth closely (utilities, services) to maintain the 70%+ NOI margin.",
      "Increase review volume and response rate to strengthen digital credibility and reduce demand volatility.",
      "Benchmark pricing monthly vs. Brighton comps to ensure in-place rents remain competitive.",
    ],
    imageUrl: "",
  },
  "park drive apartments": {
    overview: [
      "Park Drive Apartments is operating strongly at 92.6% occupancy with a healthy 68.2% NOI margin, though NOI is slightly down (-3.5% YoY) due to rising expenses (+7.2%).",
      "Revenue growth (+2.8% YoY) is positive, but renewal rate (68%) and 14 upcoming expirations put $345K revenue at risk.",
      "Heavy May-August lease concentration and mid-tier reviews (3.2 rating) increase seasonal turnover exposure.",
    ],
    recommendations: [
      "Launch a 60-day early renewal push before May to protect peak-season expirations and smooth turnover risk.",
      "Push ~3% renewal increases aligned with Fenway/Longwood submarket growth while avoiding aggressive vacancy risk.",
      "Stagger lease expirations where possible to reduce summer concentration and stabilize cash flow.",
      "Address online reputation drivers (response rate, maintenance turnaround) to improve retention and pricing power.",
      "Control expense growth (utilities & R&M) to defend the 68% NOI margin.",
    ],
    imageUrl: "",
  },
};

const normalizePropertyName = (propertyName: string) =>
  propertyName.trim().toLowerCase().replace(/\s+/g, " ");

export const getPropertyNarrative = (propertyName: string): PortfolioNarrative => {
  const normalizedName = normalizePropertyName(propertyName);

  if (propertyNarratives[normalizedName]) {
    return propertyNarratives[normalizedName];
  }

  if (normalizedName.includes("charlesbank")) {
    return propertyNarratives["charlesbank estates"];
  }

  if (normalizedName.includes("western avenue")) {
    return propertyNarratives["365 western avenue"];
  }

  if (normalizedName.includes("park drive")) {
    return propertyNarratives["park drive apartments"];
  }

  if (normalizedName.includes("park drive aprtments")) {
    return propertyNarratives["park drive apartments"];
  }

  return defaultNarrative;
};
