"use client";

import { useEffect, useRef, useState } from "react";

export default function RouteMap({ originAddress, destinationAddress, apiKey, doctorData = null }) {
  const containerRef = useRef(null);
  const [visible, setVisible] = useState(false);
  const [fromOverride, setFromOverride] = useState(null); // {lat, lon} when using current location
  const [isGettingLocation, setIsGettingLocation] = useState(false);

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
    if (!destinationAddress || !apiKey || !visible) return; // origin can be override
    let mapInstance;
    let aborted = false;
    let LRef = null;

    const geocode = async (text, doctorData = null) => {
      try {
        if (!text || !text.trim()) {
          console.warn("[RouteMap] Empty address text");
          return null;
        }
        // Không dùng cache để tránh tọa độ sai, hoặc có thể thêm version key để invalidate cache
        // const cacheKey = `geo_${text}`;
        // const cached = sessionStorage.getItem(cacheKey);
        // if (cached) {
        //   const v = JSON.parse(cached);
        //   if (v && typeof v.lat === 'number' && typeof v.lon === 'number') {
        //     console.log("[RouteMap] Using cached geocode:", text, "->", v);
        //     return v;
        //   }
        // }
        
        // Sử dụng cách geocode giống như trong dat-lich-kham.jsx
        // Thử nhiều candidates với thứ tự ưu tiên
        const candidates = [];
        
        // Nếu có doctorData, thử các địa chỉ từ doctor data
        if (doctorData) {
          if (doctorData.displayAddress) {
            candidates.push(doctorData.displayAddress);
          }
          const parts = [
            doctorData.clinicAddress,
            doctorData.ward_name,
            doctorData.district_name,
            doctorData.province_name,
          ].filter(Boolean);
          if (parts.length > 0) {
            candidates.push(parts.join(", "));
          }
          if (doctorData.province_name) {
            candidates.push(doctorData.province_name);
          }
        }
        
        // Thêm text hiện tại và các biến thể
        candidates.push(text);
        if (text.includes(", Vietnam")) {
          candidates.push(text.replace(/, Vietnam$/, "").trim());
        } else {
          candidates.push(`${text}, Vietnam`);
        }
        
        // Loại bỏ duplicates
        const uniqueCandidates = [...new Set(candidates)].filter(Boolean);
        console.log("[RouteMap] Geocoding candidates:", uniqueCandidates);
        
        let found = null;
        let bestFeature = null;
        for (const addr of uniqueCandidates) {
          const url = `https://api.geoapify.com/v1/geocode/search?text=${encodeURIComponent(addr)}&filter=countrycode:vn&limit=1&lang=vi&apiKey=${apiKey}`;
          console.log("[RouteMap] Trying geocode:", addr);
        const res = await fetch(url);
          if (!res.ok) continue;
        const data = await res.json();
          const feature = data?.features?.[0];
          if (feature?.geometry?.coordinates) {
            found = feature.geometry.coordinates; // [lon, lat]
            bestFeature = feature;
            console.log("[RouteMap] Geocoded successfully:", addr, "->", found, "Location:", feature.properties?.formatted || feature.properties?.name);
            break;
          }
        }
        
        if (!found) {
          console.warn("[RouteMap] No valid coordinates found for any candidate:", uniqueCandidates);
          return null;
        }
        
        const [lon, lat] = found;
        const out = { lat, lon };
        // Cache với key bao gồm cả text gốc để dễ debug
        // sessionStorage.setItem(`geo_${text}`, JSON.stringify(out));
        return out;
      } catch (err) {
        console.error("[RouteMap] Geocoding error:", err);
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
      // Fix default marker icon urls when using CDN ESM (avoid broken icon with 'Mar' text)
      if (LRef?.Icon?.Default) {
        LRef.Icon.Default.mergeOptions({
          iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
          iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
          shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        });
      }
      const to = await geocode(destinationAddress);
      if (aborted || !to || !containerRef.current || !LRef) {
        if (!to) {
          console.error("[RouteMap] Failed to geocode destination:", destinationAddress);
        }
        return;
      }
      console.log("[RouteMap] Destination geocoded successfully:", to);

      // Mặc định chỉ hiển thị marker phòng khám (không có route)
      // Chỉ vẽ route khi có fromOverride (vị trí hiện tại)
      const from = fromOverride || (originAddress ? await geocode(originAddress) : null);
      
      // Set view center: nếu có from thì center giữa 2 điểm, nếu không thì center ở destination
      const centerLat = from ? (from.lat + to.lat) / 2 : to.lat;
      const centerLon = from ? (from.lon + to.lon) / 2 : to.lon;
      const zoom = from ? 13 : 14;
      
      mapInstance = LRef.map(containerRef.current).setView([centerLat, centerLon], zoom);
      LRef.tileLayer(
        `https://maps.geoapify.com/v1/tile/osm-bright/{z}/{x}/{y}.png?apiKey=${apiKey}`,
        { attribution: "© OpenStreetMap contributors" }
      ).addTo(mapInstance);

      // Custom div icons for origin (home) and destination (clinic/office)
      const makeDivIcon = (bg, emoji) =>
        LRef.divIcon({
          className: "",
          html: `<div style="width:28px;height:28px;border-radius:50%;background:${bg};display:flex;align-items:center;justify-content:center;color:#fff;font-size:16px;box-shadow:0 2px 6px rgba(0,0,0,.25);border:2px solid rgba(255,255,255,.9)">${emoji}</div>`,
          iconSize: [28, 28],
          iconAnchor: [14, 28],
          popupAnchor: [0, -28],
        });
      const homeIcon = makeDivIcon('#22c55e', '🏠');
      const officeIcon = makeDivIcon('#0ea5a9', '🏥');

      // Chỉ vẽ origin marker khi có from (từ vị trí hiện tại hoặc originAddress)
      if (from) {
      LRef.marker([from.lat, from.lon], { icon: homeIcon }).addTo(mapInstance);
      }
      // Luôn vẽ destination marker (phòng khám)
      LRef.marker([to.lat, to.lon], { icon: officeIcon }).addTo(mapInstance);

      // Chỉ vẽ route khi có from (đặc biệt là từ vị trí hiện tại)
      if (from) {
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
      } else {
        // Không có route, chỉ fit bounds cho destination marker
        mapInstance.setView([to.lat, to.lon], 14);
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
  }, [originAddress, fromOverride, destinationAddress, apiKey, visible, doctorData]);

  const requestCurrentLocation = () => {
    if (!('geolocation' in navigator)) return;
    if (!confirm('Sử dụng vị trí hiện tại của bạn để tính đường đi?')) return;
    setIsGettingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setFromOverride({ lat: latitude, lon: longitude });
        setIsGettingLocation(false);
      },
      () => setIsGettingLocation(false),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  };

  return (
    <div className="relative w-full h-96 rounded-xl overflow-hidden">
      <div ref={containerRef} className="w-full h-full" />
      <div className="absolute top-2 right-2 flex gap-2 z-[1000]">
        {fromOverride ? (
          <button
            onClick={() => setFromOverride(null)}
            className="px-3 py-1.5 rounded-lg bg-white/90 border text-sm hover:bg-white"
            title="Xem lại vị trí phòng khám"
          >
            Xem vị trí phòng khám
          </button>
        ) : (
          <button
            onClick={requestCurrentLocation}
            className="px-3 py-1.5 rounded-lg bg-white/90 border text-sm hover:bg-white"
            disabled={isGettingLocation}
            title="Sử dụng vị trí hiện tại để tính đường đi"
          >
            {isGettingLocation ? 'Đang lấy vị trí...' : 'Chỉ đường đi'}
          </button>
        )}
      </div>
    </div>
  );
}


