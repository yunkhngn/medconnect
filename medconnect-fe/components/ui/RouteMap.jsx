"use client";

import { useEffect, useRef, useState } from "react";

export default function RouteMap({ originAddress, destinationAddress, apiKey }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);

  // Defer load until map is near viewport
  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          setVisible(true);
          io.disconnect();
        }
      });
    }, { rootMargin: '200px' });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    if (!originAddress || !destinationAddress || !apiKey || !visible) return;
    let mapInstance;
    let aborted = false;
    let LRef = null;

    const geocode = async (text) => {
      try {
        const cacheKey = `geo_${text}`;
        const cached = sessionStorage.getItem(cacheKey);
        if (cached) {
          const v = JSON.parse(cached);
          if (v && typeof v.lat === 'number' && typeof v.lon === 'number') return v;
        }
        const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(text)}&limit=1&apiKey=${apiKey}`;
        const res = await fetch(url);
        if (!res.ok) return null;
        const data = await res.json();
        const f = data?.features?.[0];
        if (!f?.geometry?.coordinates) return null;
        const [lon, lat] = f.geometry.coordinates;
        const out = { lat, lon };
        sessionStorage.setItem(cacheKey, JSON.stringify(out));
        return out;
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
        const rKey = `route_${from.lat},${from.lon}_${to.lat},${to.lon}`;
        let json = null;
        const cached = sessionStorage.getItem(rKey);
        if (cached) {
          json = JSON.parse(cached);
        } else {
          const routeUrl = `https://api.geoapify.com/v1/routing?waypoints=${from.lat},${from.lon}|${to.lat},${to.lon}&mode=drive&apiKey=${apiKey}`;
          const res = await fetch(routeUrl);
          if (res.ok) json = await res.json();
          if (json) sessionStorage.setItem(rKey, JSON.stringify(json));
        }
        if (json) {
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

    if ('requestIdleCallback' in window) {
      window.requestIdleCallback(init);
    } else {
      setTimeout(init, 0);
    }
    return () => {
      aborted = true;
      if (mapInstance) mapInstance.remove();
    };
  }, [originAddress, destinationAddress, apiKey, visible]);

  return <div ref={containerRef} className="w-full h-96 rounded-xl overflow-hidden" />;
}


