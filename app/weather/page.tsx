"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import { Icon } from "leaflet";
import L from "leaflet";
import Navbar from "@/components/navbar";
import { Search } from "lucide-react";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const inter = Inter({ subsets: ["latin"] });

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
});

const t = {
  title: "Interactive Weather Map",
  searchPlaceholder: "Search city (e.g. Surabaya, Tokyo, Paris)",
  layerNone: "None",
  layerTemp: "Temperature",
  layerRain: "Rain",
  layerPM25: "PM2.5",
  layerCO: "CO",
  popupTitle: "Weather & Air Data",
  temperature: "Temperature",
  humidity: "Humidity",
  precipitation1h: "Precipitation (last 1 hour)",
  precipitation24h: "24h Accumulation",
  pm25: "PM2.5 (latest)",
  co: "Carbon Monoxide (latest)",
  dataSource: "Data from Open-Meteo • Auto location or click map",
};

const HeatLayer = ({ points, intensity, colorGradient }: any) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);

    if (points.length > 0) {
      heatLayerRef.current = (L as any).heatLayer(points, {
        radius: 30,
        blur: 20,
        maxZoom: 17,
        gradient: colorGradient,
        minOpacity: 0.4,
        max: intensity,
      }).addTo(map);
    }

    return () => {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    };
  }, [points, intensity, colorGradient, map]);

  return null;
};

export default function WeatherPage() {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]);
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState<"none" | "temp" | "rain" | "pm25" | "co">("none");

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          fetchData(latitude, longitude);
        },
        () => fetchData(position[0], position[1]),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else fetchData(position[0], position[1]);
  }, []);

  const fetchData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation&timezone=auto&forecast_days=2`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5,carbon_monoxide&timezone=auto`;
      const aqRes = await fetch(aqUrl);
      const aqData = await aqRes.json();
      setAirQuality(aqData);
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!query.trim()) return;
    const geoUrl = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=1&language=en`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (geoData.results?.length > 0) {
      const { latitude, longitude } = geoData.results[0];
      setPosition([latitude, longitude]);
      fetchData(latitude, longitude);
      setQuery("");
    } else alert("City not found");
  };

  const get24hRainAccumulation = () => {
    if (!weather?.hourly?.precipitation) return 0;
    const recent = weather.hourly.precipitation.slice(0, 24);
    return recent.reduce((sum: number, val: number) => sum + (val || 0), 0).toFixed(1);
  };

  const heatPoints = [] as [number, number, number][];

  return (
    <div className={inter.className} style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      {/* Floating Search */}
      <div style={{
        position: "absolute",
        right: 24,
        top: 90,
        zIndex: 1200,
        display: "flex",
        background: "white",
        borderRadius: 50,
        boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
        overflow: "hidden"
      }}>
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          style={{ padding: "12px 16px", border: "none", outline: "none", width: 220 }}
          onKeyDown={(e) => e.key === "Enter" && searchCity()}
        />
        <button
          onClick={searchCity}
          style={{ background: "#1e40af", color: "white", border: "none", padding: "0 18px", cursor: "pointer" }}
        >
          <Search size={18} />
        </button>
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={position} zoom={8} style={{ height: "100%", width: "100%" }}>
          <TileLayer
            url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_MAPTILER_KEY"
            attribution="© MapTiler © OpenStreetMap"
          />

          <Marker position={position}>
            <Popup>
              <div style={{ minWidth: 260 }}>
                <h3>{t.popupTitle}</h3>
                {weather?.current && (
                  <>
                    <p><strong>{t.temperature}:</strong> {weather.current.temperature_2m} °C</p>
                    <p><strong>{t.humidity}:</strong> {weather.current.relative_humidity_2m} %</p>
                    <p><strong>{t.precipitation1h}:</strong> {weather.current.precipitation} mm</p>
                    <p><strong>{t.precipitation24h}:</strong> {get24hRainAccumulation()} mm</p>
                  </>
                )}
                {airQuality?.hourly && (
                  <>
                    <p><strong>{t.pm25}:</strong> {airQuality.hourly.pm2_5[0]?.toFixed(1) ?? "N/A"} µg/m³</p>
                    <p><strong>{t.co}:</strong> {airQuality.hourly.carbon_monoxide[0]?.toFixed(1) ?? "N/A"} µg/m³</p>
                  </>
                )}
                <small>{t.dataSource}</small>
              </div>
            </Popup>
          </Marker>

          {activeLayer !== "none" && (
            <HeatLayer points={heatPoints} intensity={50} colorGradient={{ 0.2: "blue", 1: "red" }} />
          )}
        </MapContainer>

        {/* Bottom Control Panel */}
        <div style={{
          position: "sticky",
          bottom: 0,
          width: "100%",
          background: "#1e40af",
          color: "white",
          display: "flex",
          justifyContent: "center",
          gap: 8,
          padding: "10px 12px",
          zIndex: 1100
        }}>
          {["none", "temp", "rain", "pm25", "co"].map(layer => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer as any)}
              style={{
                padding: "6px 14px",
                background: activeLayer === layer ? "#60a5fa" : "#3b82f6",
                border: "none",
                color: "white",
                fontSize: "0.85rem"
              }}
            >
              {(t as any)[`layer${layer.charAt(0).toUpperCase() + layer.slice(1)}`] || layer}
            </button>
          ))}
        </div>

        {loading && (
          <div style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(0,0,0,0.7)",
            color: "white",
            padding: "16px 32px",
            zIndex: 1300
          }}>
            Loading data...
          </div>
        )}
      </div>
    </div>
  );
}
