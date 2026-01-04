"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const TOTAL = 19;
const INTERVAL = 5000;
const FADE_DURATION = 1200;

export default function Home() {
  const router = useRouter();
  const [current, setCurrent] = useState(1);
  const [prev, setPrev] = useState<number | null>(null);

  useEffect(() => {
    const timer = setInterval(() => {
      setPrev(current);
      setCurrent((c) => (c % TOTAL) + 1);
    }, INTERVAL);

    return () => clearInterval(timer);
  }, [current]);

  return (
    <section className="relative h-screen w-full overflow-hidden">
      {/* BACKGROUND */}
      <div className="absolute inset-0 z-0">
        {/* PREVIOUS IMAGE */}
        {prev && (
          <Image
            src={`/start/${prev}.jpg`}
            alt="Previous background"
            fill
            className="object-cover opacity-0 transition-opacity"
            style={{ transitionDuration: `${FADE_DURATION}ms` }}
          />
        )}

        {/* CURRENT IMAGE */}
        <Image
          key={current}
          src={`/start/${current}.jpg`}
          alt="Current background"
          fill
          priority
          className="object-cover opacity-100 transition-opacity"
          style={{ transitionDuration: `${FADE_DURATION}ms` }}
        />

        {/* OVERLAY */}
        <div className="absolute inset-0 bg-black/30" />
      </div>

      {/* HERO CONTENT */}
      <div className="relative z-10 h-full">
        <div className="mx-auto max-w-[1200px] px-[50px] pt-24">
          <h1
            className="mb-6 font-semibold leading-none tracking-tight text-white"
            style={{ fontSize: "96px" }}
          >
            Biosfera
          </h1>

          <button
  onClick={() => router.push("/weather")}
  className="flex items-center gap-3 bg-white px-8 py-4 pr-10 rounded-r-[60px] shadow-xl"
>

            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none">
              <circle cx="11" cy="11" r="7" stroke="url(#g)" strokeWidth="2" />
              <line
                x1="16.65"
                y1="16.65"
                x2="21"
                y2="21"
                stroke="url(#g)"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <defs>
                <linearGradient id="g" x1="0" y1="0" x2="1" y2="1">
                  <stop offset="0%" stopColor="#6499E9" />
                  <stop offset="50%" stopColor="#9EDDFF" />
                  <stop offset="100%" stopColor="#A6F6FF" />
                </linearGradient>
              </defs>
            </svg>

            <span className="text-lg font-semibold bg-gradient-to-r from-[#6499E9] via-[#9EDDFF] to-[#A6F6FF] bg-clip-text text-transparent">
              Start
            </span>
          </button>
        </div>
      </div>

      {/* FOOTER */}
      <footer className="absolute bottom-0 left-0 z-20 flex h-[100px] w-full items-center justify-center gap-6 bg-white px-6">
        <span className="text-sm text-zinc-600">Powered by</span>
        <Image src="/XAI_logo.png" alt="XAI" width={80} height={32} />
        <Image src="/open_meteo_logo.png" alt="Open Meteo" width={100} height={32} />
        <Image src="/map_tiler_logo.png" alt="MapTiler" width={100} height={32} />
      </footer>
    </section>
  );
}
