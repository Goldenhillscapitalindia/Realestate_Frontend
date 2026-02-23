import React, { useEffect } from "react";
import { useMap } from "react-leaflet";
import type { LatLngBoundsExpression, LatLngExpression } from "leaflet";

type MapViewUpdaterProps = {
  center: LatLngExpression;
  bounds: LatLngBoundsExpression | null;
};

const MapViewUpdater: React.FC<MapViewUpdaterProps> = ({ center, bounds }) => {
  const map = useMap();

  useEffect(() => {
    if (bounds) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else {
      map.setView(center, 4);
    }
  }, [bounds, center, map]);

  return null;
};

export default MapViewUpdater;
