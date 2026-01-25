"use client";

import React, { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import Navbar from "@/components/navbar";
import {
  Wind,
  CloudRain,
  Waves,
  Calendar,
  Share2,
  Navigation,
  ArrowLeft,
  BarChart3,
  Flame,
  Clock,
  Play,
  Search
} from "lucide-react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from "recharts";

const MapContainer = dynamic(() => import("react-leaflet").then(m => m.MapContainer), { ssr: false });
const TileLayer = dynamic(() => import("react-leaflet").then(m => m.TileLayer), { ssr: false });
const Marker = dynamic(() => import("react-leaflet").then(m => m.Marker), { ssr: false });
const useMapEvents = dynamic(() => import("react-leaflet").then(m => m.useMapEvents as any), { ssr: false });

type Disaster = {
  id: number;
  title: string;
  distance: string;
  severity: string;
  time: string;
  window: string;
  wind: string;
  rainfall: string;
  surge: string;
  confidence: number;
};

function ClickHandler({ onPick }: { onPick: (pos: [number, number]) => void }) {
  const MapEvents = useMapEvents as any;
  MapEvents({
    click(e: any) {
      onPick([e.latlng.lat, e.latlng.lng]);
    }
  });
  return null;
}

export default function PredictionPage() {
  const [tab, setTab] = useState<"disasters" | "weekly">("disasters");
  const [selected, setSelected] = useState<Disaster | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);
  const [position, setPosition] = useState<[number, number]>([-6.2, 106.8]);
  const [query, setQuery] = useState("");
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [disasters, setDisasters] = useState<Disaster[]>([]);
  const [loading, setLoading] = useState(false);
  const debounceRef = useRef<any>(null);
  const mapTilerKey = "p7XunQgKBjJzjJSjV5Ze";

  useEffect(() => {
    let aborted = false;
    setLoading(true);

    fetch("https://biosfera-backend-fvctbeexevcpgye0.indonesiacentral-01.azurewebsites.net/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ lat: position[0], lon: position[1] })
    })
      .then(r => {
        if (!r.ok) throw new Error("network");
        return r.json();
      })
      .then(d => {
        if (aborted) return;
        if (d && d.disasters && d.disasters.length > 0) {
          setDisasters(d.disasters);
        } else {
          setDisasters([
            {
              id: 0,
              title: "No disasters predicted",
              distance: "-",
              severity: "Low",
              time: "Next 7 days",
              window: "-",
              wind: "-",
              rainfall: "-",
              surge: "-",
              confidence: 100
            }
          ]);
        }
      })
      .catch(() => {
        if (aborted) return;
        setDisasters([
          {
            id: 0,
            title: "No disasters predicted",
            distance: "-",
            severity: "Low",
            time: "Next 7 days",
            window: "-",
            wind: "-",
            rainfall: "-",
            surge: "-",
            confidence: 100
          }
        ]);
      })
      .finally(() => {
        if (!aborted) setLoading(false);
      });

    return () => {
      aborted = true;
    };
  }, [position]);

  useEffect(() => {
    if (tab === "weekly") {
      fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${position[0]}&longitude=${position[1]}&daily=temperature_2m_max,relative_humidity_2m_max,precipitation_sum&timezone=auto`
      )
        .then(r => r.json())
        .then(d => {
          const days = d.daily.time.map((t: string, i: number) => ({
            day: new Date(t).toLocaleDateString("en-US", { weekday: "short" }),
            temp: d.daily.temperature_2m_max[i],
            humidity: d.daily.relative_humidity_2m_max[i],
            rain: d.daily.precipitation_sum[i]
          }));
          setWeeklyData(days);
        });
    }
  }, [tab, position]);

  const fetchSuggestions = async (text: string) => {
    if (!text.trim()) {
      setSuggestions([]);
      return;
    }

    const url = `https://api.maptiler.com/geocoding/${encodeURIComponent(text)}.json?key=${mapTilerKey}&autocomplete=true&limit=6`;
    const res = await fetch(url);
    const data = await res.json();
    setSuggestions(data.features || []);
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
    setQuery(feature.place_name);
    setSuggestions([]);
  };

  const severityColor = (s: string) => {
    if (s === "Low") return "#7CFC90";
    if (s === "Medium") return "#FFF176";
    if (s === "Moderate") return "#FFB74D";
    if (s === "Severe") return "#FF6B6B";
    return "#F44336";
  };

  return (
    <div style={{ minHeight: "100vh", background: "#6499E9" }}>
      <Navbar />

      <div style={{ padding: 24 }}>
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
          <div style={{ position: "relative", flex: 1 }}>
            <div style={{ display: "flex", background: "white", borderRadius: 999, boxShadow: "0 6px 16px rgba(0,0,0,0.15)", overflow: "hidden" }}>
              <input
                value={query}
                onChange={(e) => onQueryChange(e.target.value)}
                placeholder="Search place, address, landmark..."
                style={{ padding: "10px 14px", border: "none", outline: "none", width: "100%" }}
              />
              <div style={{ background: "#6499E9", color: "white", padding: "0 16px", display: "flex", alignItems: "center" }}>
                <Search size={18} />
              </div>
            </div>

            {suggestions.length > 0 && (
              <div style={{ position: "absolute", top: "110%", left: 0, right: 0, background: "white", borderRadius: 14, boxShadow: "0 6px 16px rgba(0,0,0,0.15)", overflow: "hidden", zIndex: 2000 }}>
                {suggestions.map((s, i) => (
                  <div
                    key={i}
                    onClick={() => selectSuggestion(s)}
                    style={{ padding: "10px 14px", cursor: "pointer", borderBottom: i !== suggestions.length - 1 ? "1px solid #eee" : "none" }}
                  >
                    {s.place_name}
                  </div>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={() => setTab("weekly")}
            style={{ background: tab === "weekly" ? "#6499E9" : "#fff", color: tab === "weekly" ? "#fff" : "#000", border: "none", padding: "10px 18px", borderRadius: 999, fontWeight: 600 }}
          >
            Weekly Climate Visualization
          </button>

          <button
            onClick={() => setTab("disasters")}
            style={{ background: tab === "disasters" ? "#6499E9" : "#fff", color: tab === "disasters" ? "#fff" : "#000", border: "none", padding: "10px 18px", borderRadius: 999, fontWeight: 600 }}
          >
            Upcoming Disasters
          </button>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 20 }}>
          <div style={{ borderRadius: 20, overflow: "hidden", height: 420 }}>
            <MapContainer center={position} zoom={11} style={{ height: "100%", width: "100%" }}>
              <TileLayer url={`https://api.maptiler.com/maps/base-v4/{z}/{x}/{y}.png?key=${mapTilerKey}`} />
              <Marker position={position} />
              <ClickHandler onPick={setPosition} />
            </MapContainer>
          </div>

          {tab === "disasters" && !selected && (
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {loading && (
                <div style={{ background: "white", borderRadius: 18, padding: 16 }}>
                  Loading...
                </div>
              )}

              {!loading && disasters.map((d) => (
                <div
                  key={d.id}
                  onClick={() => setSelected(d)}
                  style={{ background: "white", borderRadius: 18, padding: 16, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center" }}
                >
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 16 }}>{d.title}</div>
                    <div style={{ fontSize: 13, color: "#666" }}>{d.distance}</div>
                  </div>
                  <div style={{ background: severityColor(d.severity), padding: "6px 14px", borderRadius: 999, fontSize: 12, fontWeight: 700 }}>
                    {d.severity}
                  </div>
                </div>
              ))}
            </div>
          )}

          {tab === "disasters" && selected && (
            <div style={{ background: "white", borderRadius: 20, padding: 20 }}>
              <button
                onClick={() => setSelected(null)}
                style={{ background: "none", border: "none", display: "flex", alignItems: "center", gap: 6, marginBottom: 12, cursor: "pointer", fontWeight: 600 }}
              >
                <ArrowLeft size={16} /> Back
              </button>

              <h2 style={{ marginBottom: 6 }}>{selected.title}</h2>
              <div style={{ color: "#666", marginBottom: 16 }}>{selected.distance}</div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Wind size={18} /> {selected.wind}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <CloudRain size={18} /> {selected.rainfall}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Waves size={18} /> {selected.surge}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Clock size={18} /> {selected.time}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Calendar size={18} /> {selected.window}
                </div>
                <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                  <Flame size={18} /> {selected.confidence}%
                </div>
              </div>

              <div style={{ marginTop: 20, display: "flex", gap: 12, flexWrap: "wrap" }}>
                <button style={{ background: "#6499E9", color: "white", border: "none", padding: "10px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Navigation size={18} /> Navigate
                </button>
                <button style={{ background: "#eee", border: "none", padding: "10px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Share2 size={18} /> Share
                </button>
                <button style={{ background: "#eee", border: "none", padding: "10px 16px", borderRadius: 12, display: "flex", alignItems: "center", gap: 8 }}>
                  <Play size={18} /> Simulate
                </button>
              </div>
            </div>
          )}

          {tab === "weekly" && (
            <div style={{ background: "white", borderRadius: 20, padding: 20 }}>
              <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
                <BarChart3 size={18} />
                <h3 style={{ margin: 0 }}>Weekly Climate</h3>
              </div>

              <ResponsiveContainer width="100%" height={260}>
                <LineChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="day" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="temp" stroke="#ff6b6b" />
                  <Line type="monotone" dataKey="humidity" stroke="#4dabf7" />
                  <Line type="monotone" dataKey="rain" stroke="#51cf66" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
