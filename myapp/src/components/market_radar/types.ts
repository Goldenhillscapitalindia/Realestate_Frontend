export type RawMarketRadarItem = {
  region?: string;
  sub_market_name?: string;
  sub_market_namename?: string;
  sub_market_name?: string;
  market_pulse?: string;
  marketPulse?: string;
  pulse?: string;
  latitude?: number | string;
  longitude?: number | string;
  lat?: number | string;
  lng?: number | string;
  market_radar_resp?: {
    answer?: Array<{
      header?: {
        status_tag?: string;
      };
    }>;
  };
  coordinates?: {
    latitude?: number | string;
    longitude?: number | string;
    lat?: number | string;
    lng?: number | string;
    lattitude?: number | string;
    langitude?: number | string;
  };
};

export type MarketRadarItem = {
  region: string;
  sub_market_name: string;
  marketPulse: string;
  latitude: number;
  longitude: number;
};
