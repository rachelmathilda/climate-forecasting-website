"use client";

import React, { useState, useEffect, useRef } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, useMapEvents } from "react-leaflet";
import { Icon } from "leaflet";
import L from "leaflet";
import Navbar from "@/components/navbar";
import {
  Search,
  Thermometer,
  Droplets,
  CloudRain,
  Wind,
  MapPin,
  LocateFixed
} from "lucide-react";
import { Inter } from "next/font/google";
import "leaflet/dist/leaflet.css";
import "leaflet.heat";

const inter = Inter({ subsets: ["latin"] });

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
  iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
  shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png"
});

const t = {
  title: "Interactive Weather Map",
  searchPlaceholder: "Search place, address, landmark...",
  temperature: "Temperature",
  humidity: "Humidity",
  precipitation1h: "Rain (1h)",
  pm25: "PM2.5",
  dataSource: "Data from Open-Meteo • Location via MapTiler"
};

const HeatLayer = ({ points, intensity, colorGradient }: any) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    if (points.length > 0) {
      heatLayerRef.current = (L as any)
        .heatLayer(points, {
          radius: 30,
          blur: 20,
          maxZoom: 17,
          gradient: colorGradient,
          minOpacity: 0.4,
          max: intensity
        })
        .addTo(map);
    }
    return () => {
      if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);
    };
  }, [points, intensity, colorGradient, map]);

  return null;
};

function MapAutoCenter({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom(), { animate: true });
  }, [center, map]);
  return null;
}

function ClickHandler({ onSelect }: { onSelect: (lat: number, lon: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    }
  });
  return null;
}

export default function WeatherPage() {
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([-6.2088, 106.8456]);
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const debounceRef = useRef<any>(null);
  const mapTilerKey = process.env.NEXT_PUBLIC_MAPTILER_KEY;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          fetchData(latitude, longitude);
        },
        () => {
          setMapCenter(position);
          fetchData(position[0], position[1]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      setMapCenter(position);
      fetchData(position[0], position[1]);
    }
  }, []);

  const fetchData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,precipitation,weather_code&hourly=temperature_2m,relative_humidity_2m,precipitation&timezone=auto&forecast_days=2`;
      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm2_5&timezone=auto`;
      const aqRes = await fetch(aqUrl);
      const aqData = await aqRes.json();
      setAirQuality(aqData);
    } finally {
      setLoading(false);
    }
  };

  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }
    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(
      text
    )}.json?key=${mapTilerKey}&autocomplete=true&limit=6`;
    const res = await fetch(url);
    const data = await res.json();
    setSuggestions(data.features || []);
    setHighlightIndex(0);
  };

  const onQueryChange = (value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 250);
  };

  const selectSuggestion = (feature: any) => {
    const [lon, lat] = feature.center;
    setPosition([lat, lon]);
    setMapCenter([lat, lon]);
    fetchData(lat, lon);
    setQuery(feature.place_name);
    setSuggestions([]);
  };

  const useMyLocation = () => {
    if (!navigator.geolocation) return;
    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        setPosition([latitude, longitude]);
        setMapCenter([latitude, longitude]);
        fetchData(latitude, longitude);
        setLoading(false);
      },
      () => setLoading(false),
      { enableHighAccuracy: true, timeout: 5000 }
    );
  };

  const onMapSelect = (lat: number, lon: number) => {
    setPosition([lat, lon]);
    setMapCenter([lat, lon]);
    fetchData(lat, lon);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!suggestions.length) return;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((i) => Math.min(i + 1, suggestions.length - 1));
    }
    if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((i) => Math.max(i - 1, 0));
    }
    if (e.key === "Enter") {
      e.preventDefault();
      selectSuggestion(suggestions[highlightIndex]);
    }
  };

  return (
    <div className={inter.className} style={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Navbar />

      <div
        style={{
          position: "absolute",
          right: 24,
          top: 110,
          zIndex: 900,
          display: "flex",
          alignItems: "center",
          gap: 10
        }}
      >
        <div
          style={{
            display: "flex",
            background: "white",
            borderRadius: 50,
            boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
            overflow: "hidden",
            width: 260
          }}
        >
          <input
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t.searchPlaceholder}
            style={{
              padding: "12px 16px",
              border: "none",
              outline: "none",
              width: "100%"
            }}
          />
          <div
            style={{
              background: "#6499E9",
              color: "white",
              padding: "0 18px",
              display: "flex",
              alignItems: "center"
            }}
          >
            <Search size={18} />
          </div>
        </div>

        <div
          onClick={useMyLocation}
          style={{
            width: 44,
            height: 44,
            borderRadius: 22,
            background: "white",
            boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer"
          }}
          title="Use my location"
        >
          <LocateFixed size={20} color="#6499E9" />
        </div>

        {suggestions.length > 0 && (
          <div
            style={{
              position: "absolute",
              top: 60,
              right: 54,
              background: "white",
              borderRadius: 12,
              boxShadow: "0 6px 16px rgba(0,0,0,0.15)",
              overflow: "hidden",
              width: 260,
              zIndex: 900
            }}
          >
            {suggestions.map((s, i) => (
              <div
                key={i}
                onClick={() => selectSuggestion(s)}
                style={{
                  padding: "10px 14px",
                  cursor: "pointer",
                  background: i === highlightIndex ? "#eef4ff" : "white",
                  borderBottom: i !== suggestions.length - 1 ? "1px solid #eee" : "none"
                }}
              >
                {s.place_name}
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={{ flex: 1, position: "relative" }}>
        <MapContainer center={mapCenter} zoom={10} style={{ height: "100%", width: "100%", zIndex: 1 }}>
          <MapAutoCenter center={mapCenter} />
          <ClickHandler onSelect={onMapSelect} />

          <TileLayer
            url={`https://api.maptiler.com/maps/base-v4/{z}/{x}/{y}.png?key=${mapTilerKey}`}
            attribution="© MapTiler © OpenStreetMap"
          />

          <Marker position={position}>
            <Popup>
              <div style={{ minWidth: 220 }}>
                <h3>{t.title}</h3>
                {weather?.current && (
                  <>
                    <p><strong>Temperature:</strong> {weather.current.temperature_2m} °C</p>
                    <p><strong>Latitude:</strong> {position[0].toFixed(4)}</p>
                    <p><strong>Longitude:</strong> {position[1].toFixed(4)}</p>
                  </>
                )}
              </div>
            </Popup>
          </Marker>
        </MapContainer>

        <div
          style={{
            position: "sticky",
            bottom: 0,
            width: "100%",
            background: "white",
            color: "#111",
            display: "flex",
            justifyContent: "space-around",
            padding: "14px 12px",
            zIndex: 1100,
            boxShadow: "0 -4px 12px rgba(0,0,0,0.1)"
          }}
        >
          <div title={t.temperature} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Thermometer size={22} />
            <div>{weather?.current?.temperature_2m ?? "--"} °C</div>
          </div>

          <div title={t.humidity} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Droplets size={22} />
            <div>{weather?.current?.relative_humidity_2m ?? "--"} %</div>
          </div>

          <div title={t.precipitation1h} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <CloudRain size={22} />
            <div>{weather?.current?.precipitation ?? "--"} mm</div>
          </div>

          <div title={t.pm25} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Wind size={22} />
            <div>{airQuality?.hourly?.pm2_5?.[0]?.toFixed(1) ?? "--"}</div>
          </div>

          <div title="Location" style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <MapPin size={22} />
            <div>{position[0].toFixed(2)}, {position[1].toFixed(2)}</div>
          </div>
        </div>

        {loading && (
          <div
            style={{
              position: "absolute",
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
              background: "rgba(0,0,0,0.7)",
              color: "white",
              padding: "16px 32px",
              zIndex: 950
            }}
          >
            Loading data...
          </div>
        )}
      </div>
    </div>
  );
}
