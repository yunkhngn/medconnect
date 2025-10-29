"use client";

import { useEffect, useRef } from "react";

export default function RouteMap({ originAddress, destinationAddress, apiKey }) {
  const containerRef = useRef(null);

  useEffect(() => {
    if (!originAddress || !destinationAddress || !apiKey) return;
    let mapInstance;
    let aborted = false;
    let LRef = null;

    const geocode = async (text) => {
      try {
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(
          text
        )}&limit=1&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const f = data?.features?.[0];
        if (!f?.geometry?.coordinates) return null;
        const [lon, lat] = f.geometry.coordinates;
        return { lat, lon };
      } catch {
        return null;
      }
    };

    const init = async () => {
      // Lazy-load Leaflet only on client to avoid bundling issues
      // Always load Leaflet from CDN to avoid module resolution warnings
      const mod = await import(/* webpackIgnore: true */ "https://unpkg.com/leaflet@1.9.4/dist/leaflet-src.esm.js");
      LRef = mod.default || mod;
      const id = "leaflet-cdn-css";
      if (!document.getElementById(id)) {
        const link = document.createElement("link");
        link.id = id;
        link.rel = "stylesheet";
        link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
        link.crossOrigin = "";
        document.head.appendChild(link);
      }
      const from = await geocode(originAddress);
      const to = await geocode(destinationAddress);
      if (aborted || !from || !to || !containerRef.current || !LRef) return;

      mapInstance = LRef.map(containerRef.current).setView([from.lat, from.lon], 13);
      LRef.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        { attribution: "© OpenStreetMap contributors" }
      ).addTo(mapInstance);

      LRef.marker([from.lat, from.lon]).addTo(mapInstance);
      LRef.marker([to.lat, to.lon]).addTo(mapInstance);

      try {
        const routeUrl = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lon}|${to.lat},${to.lon}&mode=drive&apiKey=${apiKey}`;
        const res = await fetch(routeUrl);
        if (res.ok) {
          const json = await res.json();
          const geom = json?.features?.[0]?.geometry;
          let coords = [];
          if (geom?.type === "LineString") coords = geom.coordinates;
          else if (geom?.type === "MultiLineString") coords = geom.coordinates.flat();
          if (coords.length) {
            const latlngs = coords.map(([lon, lat]) => [lat, lon]);
            const poly = LRef.polyline(latlngs, { color: "#2563EB", weight: 5 }).addTo(mapInstance);
            mapInstance.fitBounds(poly.getBounds(), { padding: [20, 20] });
          } else {
            mapInstance.fitBounds(
              LRef.latLngBounds([
                [from.lat, from.lon],
                [to.lat, to.lon],
              ])
            );
          }
        }
      } catch {
        // ignore
      }
    };

    init();
    return () => {
      aborted = true;
      if (mapInstance) mapInstance.remove();
    };
  }, [originAddress, destinationAddress, apiKey]);

  return <div ref={containerRef} className="w-full h-96 rounded-xl overflow-hidden" />;
}


