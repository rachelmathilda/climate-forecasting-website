# Biosfera Data Schema

> Climate monitoring and weather forecast web application with satellite map integration

---

## Entities

### User

| Field | Type | Description |
|---|---|---|
| `user_id` | UUID | Primary key |
| `name` | string | Full name |
| `email` | string | Unique email |
| `password_hash` | string | |
| `created_at` | datetime | |

---

### Location

| Field | Type | Description |
|---|---|---|
| `location_id` | UUID | Primary key |
| `name` | string | e.g. `"Jakarta"`, `"Surabaya"` |
| `country` | string | |
| `province` | string | |
| `latitude` | float | |
| `longitude` | float | |
| `timezone` | string | e.g. `"Asia/Jakarta"` |

---

### WeatherObservation

| Field | Type | Description |
|---|---|---|
| `observation_id` | UUID | Primary key |
| `location_id` | UUID (FK → Location) | |
| `timestamp` | datetime | |
| `temperature_c` | float | |
| `humidity_pct` | float | |
| `wind_speed_kmh` | float | |
| `wind_direction` | string | e.g. `"NE"` |
| `rainfall_mm` | float | |
| `uv_index` | float | |
| `visibility_km` | float | |
| `condition` | enum | `sunny`, `cloudy`, `rainy`, `stormy`, `foggy` |

---

### WeatherForecast

| Field | Type | Description |
|---|---|---|
| `forecast_id` | UUID | Primary key |
| `location_id` | UUID (FK → Location) | |
| `forecast_date` | date | |
| `forecast_type` | enum | `daily`, `weekly` |
| `temperature_min_c` | float | |
| `temperature_max_c` | float | |
| `humidity_pct` | float | |
| `rainfall_probability_pct` | float | |
| `wind_speed_kmh` | float | |
| `condition` | enum | `sunny`, `cloudy`, `rainy`, `stormy`, `foggy` |
| `generated_at` | datetime | |

---

### ClimateData

| Field | Type | Description |
|---|---|---|
| `climate_id` | UUID | Primary key |
| `location_id` | UUID (FK → Location) | |
| `month` | integer | 1–12 |
| `year` | integer | |
| `avg_temperature_c` | float | |
| `total_rainfall_mm` | float | |
| `avg_humidity_pct` | float | |
| `avg_wind_speed_kmh` | float | |

---

### SatelliteImage

| Field | Type | Description |
|---|---|---|
| `image_id` | UUID | Primary key |
| `location_id` | UUID (FK → Location) | |
| `image_url` | string (URL) | |
| `map_type` | enum | `satellite`, `terrain`, `hybrid` |
| `zoom_level` | integer | |
| `captured_at` | datetime | |
| `bounding_box` | JSON | `{"north": -6.0, "south": -6.5, "east": 107.0, "west": 106.5}` |

---

### DisasterEvent

| Field | Type | Description |
|---|---|---|
| `event_id` | UUID | Primary key |
| `location_id` | UUID (FK → Location) | |
| `event_type` | enum | `flood`, `drought`, `earthquake`, `volcano`, `landslide`, `storm` |
| `severity` | enum | `low`, `moderate`, `high`, `extreme` |
| `title` | string | |
| `description` | text | |
| `start_date` | datetime | |
| `end_date` | datetime | Nullable if ongoing |
| `source` | string | e.g. `"BMKG"`, `"BNPB"` |
| `created_at` | datetime | |

---

### WeatherAlert

| Field | Type | Description |
|---|---|---|
| `alert_id` | UUID | Primary key |
| `location_id` | UUID (FK → Location) | |
| `alert_type` | enum | `heat_wave`, `heavy_rain`, `strong_wind`, `flood_watch`, `air_quality` |
| `severity` | enum | `low`, `moderate`, `high`, `extreme` |
| `message` | text | |
| `valid_from` | datetime | |
| `valid_until` | datetime | |
| `issued_at` | datetime | |

---

### UserSavedLocation

| Field | Type | Description |
|---|---|---|
| `saved_id` | UUID | Primary key |
| `user_id` | UUID (FK → User) | |
| `location_id` | UUID (FK → Location) | |
| `label` | string | e.g. `"Home"`, `"Office"` |
| `added_at` | datetime | |

---

### UserAlertSubscription

| Field | Type | Description |
|---|---|---|
| `subscription_id` | UUID | Primary key |
| `user_id` | UUID (FK → User) | |
| `location_id` | UUID (FK → Location) | |
| `alert_types` | list\<enum\> | Alert types to be notified |
| `notify_via` | enum | `email`, `push`, `both` |
| `created_at` | datetime | |

---

## Sample Data

### Location

```json
{
  "location_id": "loc-001",
  "name": "Jakarta",
  "country": "Indonesia",
  "province": "DKI Jakarta",
  "latitude": -6.2088,
  "longitude": 106.8456,
  "timezone": "Asia/Jakarta"
}
```

### WeatherObservation

```json
{
  "observation_id": "obs-0091",
  "location_id": "loc-001",
  "timestamp": "2025-04-01T08:00:00Z",
  "temperature_c": 29.5,
  "humidity_pct": 78.0,
  "wind_speed_kmh": 14.0,
  "wind_direction": "NW",
  "rainfall_mm": 0.0,
  "uv_index": 7.2,
  "visibility_km": 8.5,
  "condition": "cloudy"
}
```

### WeatherForecast

```json
{
  "forecast_id": "frc-0021",
  "location_id": "loc-001",
  "forecast_date": "2025-04-02",
  "forecast_type": "daily",
  "temperature_min_c": 24.0,
  "temperature_max_c": 32.5,
  "humidity_pct": 80.0,
  "rainfall_probability_pct": 65.0,
  "wind_speed_kmh": 18.0,
  "condition": "rainy",
  "generated_at": "2025-04-01T00:00:00Z"
}
```

### DisasterEvent

```json
{
  "event_id": "evt-0011",
  "location_id": "loc-001",
  "event_type": "flood",
  "severity": "high",
  "title": "Banjir Jakarta Selatan",
  "description": "Banjir akibat hujan lebat selama 3 hari berturut-turut di kawasan Jakarta Selatan.",
  "start_date": "2025-02-05T06:00:00Z",
  "end_date": "2025-02-07T18:00:00Z",
  "source": "BNPB",
  "created_at": "2025-02-05T07:00:00Z"
}
```
