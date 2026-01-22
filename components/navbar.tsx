"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { Inter } from "next/font/google";

const interBold = Inter({ subsets: ["latin"], weight: ["900"] });
const interLight = Inter({ subsets: ["latin"], weight: ["300"] });
const interMedium = Inter({ subsets: ["latin"], weight: ["500"] });

const routes = [
  { name: "Weather", path: "/weather" },
  { name: "Prediction", path: "/prediction" },
  { name: "Learn", path: "/learn" },
  { name: "Notification", path: "/notification" }
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav style={{
      width: "100%",
      padding: "14px 24px",
      background: "white",
      color: "#111",
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      position: "sticky",
      top: 0,
      zIndex: 1000,
      borderBottom: "1px solid #e5e7eb"
    }}>
      <div className={interBold.className} style={{ fontSize: "1.6rem", color: "#6499E9" }}>
        Biosfera
      </div>

      <div style={{ display: "flex", gap: "20px" }}>
        {routes.map(r => {
          const active = pathname === r.path;
          return (
            <Link
              key={r.path}
              href={r.path}
              className={(active ? interMedium : interLight).className}
              style={{
                color: "#111",
                textDecoration: "none",
                fontSize: "0.95rem",
                opacity: active ? 1 : 0.6
              }}
            >
              {r.name}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}