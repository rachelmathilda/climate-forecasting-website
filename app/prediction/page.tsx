"use client";

import React, { useEffect, useState } from "react";
import Navbar from "@/components/navbar";
import {
  Search,
  MapPin,
  AlertTriangle,
  Play,
  Wind,
  CloudRain,
  Waves,
  Share2,
  Calendar,
  Mail,
  Clock,
  Navigation
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

type Disaster = {
  id: number;
  title: string;
  distance: string;
  severity: "Low" | "Medium" | "Moderate" | "Severe" | "Extreme";
  time: string;
  window: string;
  wind: string;
  rainfall: string;
  surge: string;
  confidence: number;
};

export default function PredictionPage() {
  const [mode, setMode] = useState<"disasters" | "weekly">("disasters");
  const [selected, setSelected] = useState<Disaster | null>(null);
  const [weeklyData, setWeeklyData] = useState<any[]>([]);

  const disasters: Disaster[] = [
    {
      id: 1,
      title: "Flood",
      distance: "0.7 km from location",
      severity: "Moderate",
      time: "in 2 days",
      window: "12–24 hours",
      wind: "160–190 km/h",
      rainfall: "150–250 mm",
      surge: "Up to 3.5 m",
      confidence: 60
    },
    {
      id: 2,
      title: "Hurricane",
      distance: "0.7 km from location",
      severity: "Severe",
      time: "in 4 days",
      window: "12–24 hours",
      wind: "190–240 km/h",
      rainfall: "200–300 mm",
      surge: "Up to 4.5 m",
      confidence: 80
    },
    {
      id: 3,
      title: "Heatwaves",
      distance: "0.7 km from location",
      severity: "Extreme",
      time: "in 2 days",
      window: "24–48 hours",
      wind: "30–50 km/h",
      rainfall: "0–5 mm",
      surge: "0 m",
      confidence: 70
    }
  ];

  useEffect(() => {
    setSelected(disasters[0]);
  }, []);

  useEffect(() => {
    if (mode === "weekly") {
      fetch(
        "https://api.open-meteo.com/v1/forecast?latitude=-6.2&longitude=106.8&daily=temperature_2m_max,relative_humidity_2m_max,precipitation_sum&timezone=auto"
      )
        .then((r) => r.json())
        .then((d) => {
          const days = d.daily.time.map((t: string, i: number) => ({
            day: new Date(t).toLocaleDateString("en-US", { weekday: "short" }),
            temp: d.daily.temperature_2m_max[i],
            humidity: d.daily.relative_humidity_2m_max[i],
            rain: d.daily.precipitation_sum[i]
          }));
          setWeeklyData(days);
        });
    }
  }, [mode]);

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

      <div
        style={{
          padding: 24,
          display: "grid",
          gridTemplateColumns: "1.1fr 1.6fr",
          gap: 24
        }}
      >
        <div
          style={{
            background: "#7aa9ee",
            borderRadius: 24,
            padding: 20,
            display: "flex",
            flexDirection: "column",
            gap: 20
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: 999,
              display: "flex",
              alignItems: "center",
              padding: "10px 16px",
              gap: 10
            }}
          >
            <Search size={18} />
            <input
              placeholder="Search location"
              style={{
                border: "none",
                outline: "none",
                flex: 1,
                fontSize: 14
              }}
            />
          </div>

          <div
            style={{
              flex: 1,
              borderRadius: 20,
              overflow: "hidden",
              backgroundImage:
                "url(https://api.maptiler.com/maps/satellite/256/{z}/{x}/{y}.jpg?key=JgFjMCBjlfgKtbkhN39r)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              position: "relative"
            }}
          >
            <div
              style={{
                position: "absolute",
                bottom: 16,
                left: "50%",
                transform: "translateX(-50%)",
                display: "flex",
                gap: 12
              }}
            >
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <MapPin size={20} />
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <AlertTriangle size={20} />
              </div>
              <div
                style={{
                  width: 44,
                  height: 44,
                  borderRadius: 22,
                  background: "white",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center"
                }}
              >
                <Play size={20} />
              </div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center"
            }}
          >
            <h2 style={{ color: "white", fontSize: 20 }}>
              {mode === "disasters"
                ? "Upcoming Disasters"
                : "Weekly Climate Visualization"}
            </h2>

            <div style={{ display: "flex", gap: 10 }}>
              <button
                onClick={() => setMode("disasters")}
                style={{
                  background: mode === "disasters" ? "#9fd6ff" : "white",
                  borderRadius: 999,
                  padding: "8px 16px",
                  border: "none"
                }}
              >
                Upcoming Disasters
              </button>
              <button
                onClick={() => setMode("weekly")}
                style={{
                  background: mode === "weekly" ? "#9fd6ff" : "white",
                  borderRadius: 999,
                  padding: "8px 16px",
                  border: "none"
                }}
              >
                Weekly Climate Visualization
              </button>
            </div>
          </div>

          {mode === "disasters" && (
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 16
              }}
            >
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: 12
                }}
              >
                {disasters.map((d) => (
                  <div
                    key={d.id}
                    onClick={() => setSelected(d)}
                    style={{
                      background: "white",
                      borderRadius: 18,
                      padding: 16,
                      cursor: "pointer",
                      border:
                        selected?.id === d.id
                          ? "2px solid #6499E9"
                          : "2px solid transparent"
                    }}
                  >
                    <div style={{ fontWeight: 600 }}>{d.title}</div>
                    <div
                      style={{
                        display: "flex",
                        gap: 10,
                        marginTop: 8,
                        flexWrap: "wrap",
                        fontSize: 12,
                        color: "#555"
                      }}
                    >
                      <div style={{ display: "flex", gap: 6 }}>
                        <MapPin size={14} /> {d.distance}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <AlertTriangle size={14} /> {d.severity}
                      </div>
                      <div style={{ display: "flex", gap: 6 }}>
                        <Clock size={14} /> {d.time}
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {selected && (
                <div
                  style={{
                    background: "white",
                    borderRadius: 28,
                    padding: 24,
                    display: "flex",
                    flexDirection: "column",
                    gap: 20
                  }}
                >
                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(5, 1fr)",
                      gap: 10
                    }}
                  >
                    {["Low", "Medium", "Moderate", "Severe", "Extreme"].map(
                      (s) => (
                        <div
                          key={s}
                          style={{
                            background:
                              selected.severity === s
                                ? severityColor(s)
                                : "#f1f5f9",
                            borderRadius: 999,
                            padding: "8px 0",
                            textAlign: "center",
                            fontSize: 12,
                            fontWeight: 600
                          }}
                        >
                          {s}
                        </div>
                      )
                    )}
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr",
                      gap: 12,
                      background: "#f7f7f7",
                      borderRadius: 18,
                      padding: 16
                    }}
                  >
                    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                      <Navigation size={16} /> {selected.distance}
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                      <AlertTriangle size={16} /> {selected.severity}
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                      <Clock size={16} /> {selected.time}
                    </div>
                    <div style={{ display: "flex", gap: 8, fontSize: 13 }}>
                      <Clock size={16} /> {selected.window}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "grid",
                      gridTemplateColumns: "repeat(4, 1fr)",
                      gap: 12
                    }}
                  >
                    <div
                      style={{
                        background: "#f7f7f7",
                        borderRadius: 16,
                        padding: 14,
                        textAlign: "center"
                      }}
                    >
                      <Wind size={20} />
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        {selected.wind}
                      </div>
                      <div style={{ fontSize: 11, color: "#777" }}>Wind</div>
                    </div>

                    <div
                      style={{
                        background: "#f7f7f7",
                        borderRadius: 16,
                        padding: 14,
                        textAlign: "center"
                      }}
                    >
                      <CloudRain size={20} />
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        {selected.rainfall}
                      </div>
                      <div style={{ fontSize: 11, color: "#777" }}>
                        Rainfall
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f7f7f7",
                        borderRadius: 16,
                        padding: 14,
                        textAlign: "center"
                      }}
                    >
                      <Waves size={20} />
                      <div style={{ fontSize: 13, marginTop: 6 }}>
                        {selected.surge}
                      </div>
                      <div style={{ fontSize: 11, color: "#777" }}>
                        Surge
                      </div>
                    </div>

                    <div
                      style={{
                        background: "#f7f7f7",
                        borderRadius: 16,
                        padding: 14,
                        textAlign: "center"
                      }}
                    >
                      <div style={{ fontSize: 18 }}>
                        {selected.confidence}%
                      </div>
                      <div style={{ fontSize: 11, color: "#777" }}>
                        Confidence
                      </div>
                    </div>
                  </div>

                  <div>
                    <div
                      style={{
                        color: "red",
                        fontSize: 13,
                        display: "flex",
                        gap: 6,
                        alignItems: "center"
                      }}
                    >
                      <AlertTriangle size={14} /> Recommended Actions
                    </div>
                    <ul style={{ fontSize: 13, marginTop: 6 }}>
                      <li>Prepare emergency kit</li>
                      <li>Evacuate low-lying areas</li>
                      <li>Secure property</li>
                    </ul>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginTop: 10
                    }}
                  >
                    <div style={{ display: "flex", gap: 6 }}>
                      <Share2 size={16} /> Share Information
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Calendar size={16} /> Enable Alert to Calendar
                    </div>
                    <div style={{ display: "flex", gap: 6 }}>
                      <Mail size={16} /> Send Update to E-mail
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {mode === "weekly" && (
            <div
              style={{
                background: "white",
                borderRadius: 28,
                padding: 24,
                display: "flex",
                flexDirection: "column",
                gap: 24
              }}
            >
              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="temp" stroke="#ff6b6b" />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line
                      type="monotone"
                      dataKey="humidity"
                      stroke="#6499E9"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={weeklyData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="rain" stroke="#4caf50" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
