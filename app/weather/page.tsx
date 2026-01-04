'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet.heat';

delete (Icon.Default.prototype as any)._getIconUrl;
Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const translations: Record<string, Record<string, string>> = {
  id: {
    title: 'Peta Cuaca Interaktif',
    searchPlaceholder: 'Cari kota (misal: Surabaya, Tokyo, Paris)',
    searchButton: 'Cari',
    layerNone: 'None',
    layerTemp: 'Suhu',
    layerRain: 'Hujan',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Data Cuaca & Udara',
    temperature: 'Suhu',
    humidity: 'Kelembapan',
    precipitation1h: 'Curah hujan (1 jam terakhir)',
    precipitation24h: 'Akumulasi hujan ~24 jam',
    pm25: 'PM2.5 (terbaru)',
    co: 'Karbon Monoksida (terbaru)',
    dataSource: 'Data dari Open-Meteo • Lokasi otomatis atau klik map',
    languageLabel: 'Bahasa:',
  },
  en: {
    title: 'Interactive Weather Map',
    searchPlaceholder: 'Search city (e.g. Surabaya, Tokyo, Paris)',
    searchButton: 'Search',
    layerNone: 'None',
    layerTemp: 'Temperature',
    layerRain: 'Rain',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Weather & Air Data',
    temperature: 'Temperature',
    humidity: 'Humidity',
    precipitation1h: 'Precipitation (last 1 hour)',
    precipitation24h: '24h Accumulation',
    pm25: 'PM2.5 (latest)',
    co: 'Carbon Monoxide (latest)',
    dataSource: 'Data from Open-Meteo • Auto location or click map',
    languageLabel: 'Language:',
  },
  de: {
    title: 'Interaktive Wetterkarte',
    searchPlaceholder: 'Stadt suchen (z.B. Surabaya, Tokyo, Paris)',
    searchButton: 'Suchen',
    layerNone: 'Keine',
    layerTemp: 'Temperatur',
    layerRain: 'Regen',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Wetter & Luftdaten',
    temperature: 'Temperatur',
    humidity: 'Feuchtigkeit',
    precipitation1h: 'Niederschlag (letzte Stunde)',
    precipitation24h: '24h Akkumulation',
    pm25: 'PM2.5 (neueste)',
    co: 'Kohlenmonoxid (neueste)',
    dataSource: 'Daten von Open-Meteo • Automatische Position oder Klick',
    languageLabel: 'Sprache:',
  },
  fr: {
    title: 'Carte Météo Interactive',
    searchPlaceholder: 'Rechercher une ville (ex: Surabaya, Tokyo, Paris)',
    searchButton: 'Rechercher',
    layerNone: 'Aucun',
    layerTemp: 'Température',
    layerRain: 'Pluie',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Données Météo & Air',
    temperature: 'Température',
    humidity: 'Humidité',
    precipitation1h: 'Précipitations (dernière heure)',
    precipitation24h: 'Accumulation 24h',
    pm25: 'PM2.5 (dernière)',
    co: 'Monoxyde de carbone (dernière)',
    dataSource: 'Données Open-Meteo • Position auto ou clic carte',
    languageLabel: 'Langue :',
  },
  es: {
    title: 'Mapa del Tiempo Interactivo',
    searchPlaceholder: 'Buscar ciudad (ej: Surabaya, Tokyo, París)',
    searchButton: 'Buscar',
    layerNone: 'Ninguno',
    layerTemp: 'Temperatura',
    layerRain: 'Lluvia',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Datos del Tiempo y Aire',
    temperature: 'Temperatura',
    humidity: 'Humedad',
    precipitation1h: 'Precipitación (última hora)',
    precipitation24h: 'Acumulación 24h',
    pm25: 'PM2.5 (último)',
    co: 'Monóxido de carbono (último)',
    dataSource: 'Datos de Open-Meteo • Ubicación auto o clic en mapa',
    languageLabel: 'Idioma:',
  },
  ja: {
    title: 'インタラクティブ天気マップ',
    searchPlaceholder: '都市を検索（例：スラバヤ、東京、パリ）',
    searchButton: '検索',
    layerNone: 'なし',
    layerTemp: '気温',
    layerRain: '雨',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: '天気と空気データ',
    temperature: '気温',
    humidity: '湿度',
    precipitation1h: '降水量（直近1時間）',
    precipitation24h: '24時間累積',
    pm25: 'PM2.5（最新）',
    co: '一酸化炭素（最新）',
    dataSource: 'Open-Meteoデータ • 自動位置またはマップクリック',
    languageLabel: '言語:',
  },
  pt: {
    title: 'Mapa do Tempo Interativo',
    searchPlaceholder: 'Pesquisar cidade (ex: Surabaya, Tóquio, Paris)',
    searchButton: 'Pesquisar',
    layerNone: 'Nenhum',
    layerTemp: 'Temperatura',
    layerRain: 'Chuva',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Dados Meteorológicos e do Ar',
    temperature: 'Temperatura',
    humidity: 'Umidade',
    precipitation1h: 'Precipitação (última hora)',
    precipitation24h: 'Acumulação 24h',
    pm25: 'PM2.5 (mais recente)',
    co: 'Monóxido de Carbono (mais recente)',
    dataSource: 'Dados do Open-Meteo • Localização automática ou clique no mapa',
    languageLabel: 'Idioma:',
  },
  ru: {
    title: 'Интерактивная Карта Погоды',
    searchPlaceholder: 'Поиск города (напр.: Сурабая, Токио, Париж)',
    searchButton: 'Поиск',
    layerNone: 'Нет',
    layerTemp: 'Температура',
    layerRain: 'Дождь',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: 'Данные о Погоде и Воздухе',
    temperature: 'Температура',
    humidity: 'Влажность',
    precipitation1h: 'Осадки (последний час)',
    precipitation24h: 'Накопление за 24ч',
    pm25: 'PM2.5 (последнее)',
    co: 'Угарный газ (последнее)',
    dataSource: 'Данные Open-Meteo • Автоопределение или клик по карте',
    languageLabel: 'Язык:',
  },
  zh: {
    title: '互动天气地图',
    searchPlaceholder: '搜索城市（例如：泗水、東京、巴黎）',
    searchButton: '搜索',
    layerNone: '无',
    layerTemp: '温度',
    layerRain: '降雨',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: '天气与空气数据',
    temperature: '温度',
    humidity: '湿度',
    precipitation1h: '降水量（最近1小时）',
    precipitation24h: '24小时累计',
    pm25: 'PM2.5（最新）',
    co: '一氧化碳（最新）',
    dataSource: '数据来源 Open-Meteo • 自动定位或点击地图',
    languageLabel: '语言：',
  },
  ko: {
    title: '인터랙티브 날씨 지도',
    searchPlaceholder: '도시 검색 (예: 수라바야, 도쿄, 파리)',
    searchButton: '검색',
    layerNone: '없음',
    layerTemp: '온도',
    layerRain: '강우',
    layerPM25: 'PM2.5',
    layerCO: 'CO',
    popupTitle: '날씨 및 대기 데이터',
    temperature: '온도',
    humidity: '습도',
    precipitation1h: '강수량 (최근 1시간)',
    precipitation24h: '24시간 누적',
    pm25: 'PM2.5 (최신)',
    co: '일산화탄소 (최신)',
    dataSource: 'Open-Meteo 데이터 • 자동 위치 또는 지도 클릭',
    languageLabel: '언어:',
  },
};

const HeatLayer = ({ points, intensity, colorGradient }: { 
  points: [number, number, number][]; 
  intensity: number;
  colorGradient: object;
}) => {
  const map = useMap();
  const heatLayerRef = useRef<any>(null);

  useEffect(() => {
    if (heatLayerRef.current) map.removeLayer(heatLayerRef.current);

    if (points.length > 0) {
      heatLayerRef.current = L.heatLayer(points, {
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

export default function MapPage() {
  const [query, setQuery] = useState('');
  const [position, setPosition] = useState<[number, number]>([-6.2088, 106.8456]);
  const [weather, setWeather] = useState<any>(null);
  const [airQuality, setAirQuality] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [activeLayer, setActiveLayer] = useState<'none' | 'temp' | 'rain' | 'pm25' | 'co'>('none');
  const [lang, setLang] = useState<'id' | 'en'>('id');

  const t = translations[lang] || translations.id;

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const { latitude, longitude } = pos.coords;
          setPosition([latitude, longitude]);
          fetchData(latitude, longitude);
        },
        () => {
          fetchData(position[0], position[1]);
        },
        { enableHighAccuracy: true, timeout: 5000 }
      );
    } else {
      fetchData(position[0], position[1]);
    }
  }, []);

  const fetchData = async (lat: number, lon: number) => {
    setLoading(true);
    try {
      const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}` +
        `&current=temperature_2m,relative_humidity_2m,precipitation,weather_code` +
        `&hourly=temperature_2m,relative_humidity_2m,precipitation` +
        `&timezone=auto&forecast_days=2`;

      const weatherRes = await fetch(weatherUrl);
      const weatherData = await weatherRes.json();
      setWeather(weatherData);

      const aqUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}` +
        `&hourly=pm2_5,carbon_monoxide&timezone=auto`;
      
      const aqRes = await fetch(aqUrl);
      const aqData = await aqRes.json();
      setAirQuality(aqData);
    } catch (err) {
      console.error(err);
      alert('Gagal mengambil data');
    } finally {
      setLoading(false);
    }
  };

  const searchCity = async () => {
    if (!query.trim()) return;
    try {
      const geoUrl = `https://geocoding-api.open-meteo.com/v1/search` +
        `?name=${encodeURIComponent(query)}` +
        `&count=1` +
        `&language=${lang}`;

      const geoRes = await fetch(geoUrl);
      const geoData = await geoRes.json();

      if (geoData.results?.length > 0) {
        const { latitude, longitude } = geoData.results[0];
        setPosition([latitude, longitude]);
        fetchData(latitude, longitude);
        setQuery('');
      } else {
        alert('Kota tidak ditemukan');
      }
    } catch (err) {
      alert('Error pencarian kota');
    }
  };

  const get24hRainAccumulation = () => {
    if (!weather?.hourly?.precipitation) return 0;
    const recent = weather.hourly.precipitation.slice(0, 24);
    return recent.reduce((sum: number, val: number) => sum + (val || 0), 0).toFixed(1);
  };

  const getWeatherDescription = (code: number = 0): string => {
    const descMap: Record<string, Record<number, string>> = {
      id: { 0: 'Cerah', 1: 'Sedikit berawan', 2: 'Berawan', 3: 'Berawan tebal', 45: 'Kabut', 51: 'Gerimis ringan', 61: 'Hujan ringan', 80: 'Hujan lebat' },
      en: { 0: 'Clear sky', 1: 'Mainly clear', 2: 'Partly cloudy', 3: 'Overcast', 45: 'Fog', 51: 'Light drizzle', 61: 'Light rain', 80: 'Heavy rain' },
    };
    return descMap[lang]?.[code] || descMap.en?.[code] || 'Unknown';
  };

  const getHeatPoints = () => {
    if (!weather?.hourly || activeLayer === 'none') return [];

    const points: [number, number, number][] = [];
    for (let i = 0; i < weather.hourly.time.length; i += 2) {
      let val = 0;
      if (activeLayer === 'temp') val = weather.hourly.temperature_2m[i];
      else if (activeLayer === 'rain') val = weather.hourly.precipitation[i];
      else if (activeLayer === 'pm25' && airQuality?.hourly.pm2_5?.[i]) val = airQuality.hourly.pm2_5[i];
      else if (activeLayer === 'co' && airQuality?.hourly.carbon_monoxide?.[i]) val = airQuality.hourly.carbon_monoxide[i];

      if (val > 0) {
        points.push([
          position[0] + (Math.random() - 0.5) * 0.15,
          position[1] + (Math.random() - 0.5) * 0.15,
          val
        ]);
      }
    }
    return points;
  };

  const heatPoints = getHeatPoints();
  const gradients = {
    temp: { 0.2: 'blue', 0.5: 'lime', 0.8: 'yellow', 1: 'red' },
    rain: { 0.1: 'white', 0.4: 'blue', 0.7: 'darkblue', 1: 'purple' },
    pm25: { 0.2: 'green', 0.5: 'yellow', 0.8: 'orange', 1: 'red' },
    co: { 0.2: 'green', 0.5: 'yellow', 0.8: 'orange', 1: 'red' },
  };

  return (
    <div style={{ height: '100vh', display: 'flex', flexDirection: 'column' }}>
      <header style={{ padding: '12px 20px', background: '#1e40af', color: 'white', display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap' }}>
        <h1 style={{ margin: 0, fontSize: '1.4rem' }}>{t.title}</h1>

        <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t.searchPlaceholder}
            style={{ padding: '8px', borderRadius: '6px', border: 'none', flex: 1, minWidth: '220px' }}
            onKeyDown={(e) => e.key === 'Enter' && searchCity()}
          />
          <button onClick={searchCity} style={{ padding: '8px 16px', background: '#3b82f6', border: 'none', color: 'white', borderRadius: '6px' }}>
            {t.searchButton}
          </button>
        </div>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <label style={{ fontSize: '0.9rem' }}>Bahasa:</label>
          <select
            value={lang}
            onChange={(e) => setLang(e.target.value as any)}
            style={{ padding: '6px', borderRadius: '6px', border: 'none' }}
          >
            <option value="id">Indonesia</option>
            <option value="en">English</option>
          </select>
        </div>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {['none', 'temp', 'rain', 'pm25', 'co'].map((layer) => (
            <button
              key={layer}
              onClick={() => setActiveLayer(layer as any)}
              style={{
                padding: '6px 12px',
                background: activeLayer === layer ? '#60a5fa' : '#3b82f6',
                border: 'none',
                color: 'white',
                borderRadius: '6px',
                fontSize: '0.9rem'
              }}
            >
              {t[`layer${layer.charAt(0).toUpperCase() + layer.slice(1)}` as keyof typeof t] || layer}
            </button>
          ))}
        </div>
      </header>

      <div style={{ flex: 1, position: 'relative' }}>
        <MapContainer center={position} zoom={8} style={{ height: '100%', width: '100%' }}>
          <TileLayer
            url="https://api.maptiler.com/maps/streets/{z}/{x}/{y}.png?key=YOUR_MAPTILER_KEY" // GANTI DENGAN API KEY MAPTILER KAMU
            attribution='© <a href="https://www.maptiler.com/">MapTiler</a> © <a href="http://osm.org/copyright">OpenStreetMap</a>'
          />

          <Marker position={position}>
            <Popup>
              <div style={{ minWidth: '260px', fontSize: '0.95em' }}>
                <h3 style={{ margin: '0 0 12px' }}>{t.popupTitle}</h3>

                {weather?.current && (
                  <>
                    <p><strong>{t.temperature}:</strong> {weather.current.temperature_2m} °C</p>
                    <p><strong>{t.humidity}:</strong> {weather.current.relative_humidity_2m} %</p>
                    <p><strong>{t.precipitation1h}:</strong> {weather.current.precipitation} mm</p>
                    <p><strong>{t.precipitation24h}:</strong> {get24hRainAccumulation()} mm</p>
                    <p><strong>Cuaca:</strong> {getWeatherDescription(weather.current.weather_code)}</p>
                  </>
                )}

                {airQuality?.hourly && (
                  <>
                    <p><strong>{t.pm25}:</strong> {airQuality.hourly.pm2_5[0]?.toFixed(1) ?? 'N/A'} µg/m³</p>
                    <p><strong>{t.co}:</strong> {airQuality.hourly.carbon_monoxide[0]?.toFixed(1) ?? 'N/A'} µg/m³</p>
                  </>
                )}

                <small style={{ color: '#666' }}>{t.dataSource}</small>
              </div>
            </Popup>
          </Marker>

          {activeLayer !== 'none' && (
            <HeatLayer 
              points={heatPoints} 
              intensity={activeLayer === 'temp' ? 40 : activeLayer === 'rain' ? 10 : activeLayer === 'pm25' ? 100 : 1000}
              colorGradient={gradients[activeLayer]}
            />
          )}
        </MapContainer>

        {loading && (
          <div style={{
            position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
            background: 'rgba(0,0,0,0.7)', color: 'white', padding: '16px 32px', borderRadius: '12px', zIndex: 1000
          }}>
            Memuat data...
          </div>
        )}
      </div>
    </div>
  );
}