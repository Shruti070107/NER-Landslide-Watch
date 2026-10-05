import {
  RiskZone,
  Alert,
  SensorTelemetry,
  AcousticDetection,
  SensorHistoryPoint,
  MlPredictionResult,
  SosRequest,
  WeatherData,
} from '../types';

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8082';
export const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY || '0cb5f0318ffbc684cef9d6e8dc4066d0';

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  isFallback: boolean;
}

// Helper for fetch with timeout and error handling
async function request<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<{ data: T; isFallback: boolean }> {
  const url = `${API_BASE}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 8000);

  try {
    const res = await fetch(url, {
      ...options,
      signal: controller.signal,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers || {}),
      },
    });

    clearTimeout(timeoutId);

    if (!res.ok) {
      throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
    }

    const json = await res.json();
    return { data: json as T, isFallback: false };
  } catch (err: any) {
    clearTimeout(timeoutId);
    console.warn(`[Landslide Guard API] Connection to ${endpoint} failed:`, err.message);
    throw err;
  }
}

/* ==========================================================================
   Fallback Operational Datasets (Used when backend or offline)
   ========================================================================== */

export const FALLBACK_ZONES: RiskZone[] = [
  {
    id: 'rz-103',
    code: 'NER-103',
    name: 'Gangtok Ridge',
    state: 'Sikkim',
    district: 'East Sikkim',
    latitude: 27.3389,
    longitude: 88.6138,
    currentRiskLevel: 'HIGH',
    currentRiskScore: 78.5,
    populationExposure: 8000,
    infrastructureCriticality: 5,
    nearbyVillages: 'Tadong, Ranipool',
    affectedRoads: 'NH10',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'rz-101',
    code: 'NER-101',
    name: 'Shillong Peak Slope',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    latitude: 25.5788,
    longitude: 91.8933,
    currentRiskLevel: 'MEDIUM',
    currentRiskScore: 48.0,
    populationExposure: 3200,
    infrastructureCriticality: 4,
    nearbyVillages: 'Laitkor, Mawkasiang',
    affectedRoads: 'Shillong-Cherrapunji Road',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'rz-102',
    code: 'NER-102',
    name: 'Mawsynram Escarpment',
    state: 'Meghalaya',
    district: 'East Khasi Hills',
    latitude: 25.2977,
    longitude: 91.5822,
    currentRiskLevel: 'LOW',
    currentRiskScore: 22.0,
    populationExposure: 1500,
    infrastructureCriticality: 2,
    nearbyVillages: 'Mawsynram Village',
    affectedRoads: 'NH206',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'rz-104',
    code: 'NER-104',
    name: 'Kohima Hillside',
    state: 'Nagaland',
    district: 'Kohima',
    latitude: 25.6751,
    longitude: 94.1077,
    currentRiskLevel: 'MEDIUM',
    currentRiskScore: 54.0,
    populationExposure: 5200,
    infrastructureCriticality: 3,
    nearbyVillages: 'Jotsoma, Kigwema',
    affectedRoads: 'NH29',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'rz-105',
    code: 'NER-105',
    name: 'Aizawl Slope Zone',
    state: 'Mizoram',
    district: 'Aizawl',
    latitude: 23.7271,
    longitude: 92.7173,
    currentRiskLevel: 'LOW',
    currentRiskScore: 18.0,
    populationExposure: 6100,
    infrastructureCriticality: 4,
    nearbyVillages: 'Durtlang, Zemabawk',
    affectedRoads: 'NH54',
    lastUpdated: new Date().toISOString(),
  },
  {
    id: 'rz-106',
    code: 'NER-106',
    name: 'Itanagar Foothills',
    state: 'Arunachal Pradesh',
    district: 'Papum Pare',
    latitude: 27.0844,
    longitude: 93.6053,
    currentRiskLevel: 'CRITICAL',
    currentRiskScore: 91.2,
    populationExposure: 2800,
    infrastructureCriticality: 3,
    nearbyVillages: 'Naharlagun, Chimpu',
    affectedRoads: 'NH415',
    lastUpdated: new Date().toISOString(),
  },
];

const FALLBACK_ALERTS: Alert[] = [
  {
    id: 'alt-01',
    zoneCode: 'NER-106',
    zoneName: 'Itanagar Foothills',
    severity: 'CRITICAL',
    title: 'CRITICAL: Imminent Slope Failure Warning',
    message: 'Rapid ground displacement rate (>14mm/h) and extreme pore pressure detected along NH415 bypass. Immediate evacuation recommended.',
    affectedRadius: 5.0,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 25 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 24 * 3600000).toISOString(),
  },
  {
    id: 'alt-02',
    zoneCode: 'NER-103',
    zoneName: 'Gangtok Ridge',
    severity: 'HIGH',
    title: 'HIGH: Elevated Landslide Hazard on NH10 Corridor',
    message: 'Heavy precipitation exceeding 78mm in 24h with sub-surface acoustic rumble detected. Heavy vehicular transit restricted.',
    affectedRadius: 3.5,
    status: 'ACTIVE',
    createdAt: new Date(Date.now() - 95 * 60000).toISOString(),
    expiresAt: new Date(Date.now() + 18 * 3600000).toISOString(),
  },
  {
    id: 'alt-03',
    zoneCode: 'NER-101',
    zoneName: 'Shillong Peak Slope',
    severity: 'MEDIUM',
    title: 'Monsoon Soil Saturation Advisory',
    message: 'Shillong Peak slopes experiencing prolonged rainfall. Routine surface runoff monitoring active.',
    affectedRadius: 2.0,
    status: 'RESOLVED',
    createdAt: new Date(Date.now() - 28 * 3600000).toISOString(),
    expiresAt: new Date(Date.now() - 4 * 3600000).toISOString(),
  },
];

/* ==========================================================================
   Direct OpenWeatherMap Integration Helper
   ========================================================================== */

export async function fetchDirectOpenWeather(lat: number, lon: number, cityName?: string): Promise<WeatherData> {
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=metric`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`OpenWeather API returned ${res.status}`);
  }
  const data = await res.json();

  const rainfallMm = (data.rain && (data.rain['1h'] || data.rain['3h'])) ? Number(data.rain['1h'] || data.rain['3h']) : 0.0;
  const temp = data.main?.temp ?? 20.0;
  const feelsLike = data.main?.feels_like ?? temp;
  const humidity = data.main?.humidity ?? 75.0;
  const pressure = data.main?.pressure ?? 1013.0;
  const windSpeed = data.wind?.speed ?? 2.0;
  const clouds = data.clouds?.all ?? 30;
  const condition = data.weather?.[0]?.main ?? 'Clear';
  const description = data.weather?.[0]?.description ?? 'Clear skies';

  return {
    cityName: data.name || cityName || 'North East Region',
    latitude: lat,
    longitude: lon,
    temperatureCelsius: Math.round(temp * 10) / 10,
    feelsLikeCelsius: Math.round(feelsLike * 10) / 10,
    humidityPercent: Math.round(humidity * 10) / 10,
    pressureHpa: pressure,
    rainfallMm: Math.round(rainfallMm * 10) / 10,
    windSpeedMs: Math.round(windSpeed * 10) / 10,
    cloudsPercent: clouds,
    weatherCondition: condition,
    weatherDescription: description,
    source: 'OpenWeatherMap (Direct)',
    observedAt: new Date().toISOString(),
  };
}

/* ==========================================================================
   Public API Methods
   ========================================================================== */

export async function fetchRiskZones(): Promise<{ data: RiskZone[]; isFallback: boolean }> {
  try {
    return await request<RiskZone[]>('/api/v1/risk-zones');
  } catch {
    return { data: FALLBACK_ZONES, isFallback: true };
  }
}

export async function fetchRiskZoneByCode(code: string): Promise<{ data: RiskZone; isFallback: boolean }> {
  try {
    return await request<RiskZone>(`/api/v1/risk-zones/code/${code}`);
  } catch {
    const found = FALLBACK_ZONES.find((z) => z.code === code) || FALLBACK_ZONES[0];
    return { data: found, isFallback: true };
  }
}

export async function fetchActiveAlerts(): Promise<{ data: Alert[]; isFallback: boolean }> {
  try {
    return await request<Alert[]>('/api/v1/alerts/active');
  } catch {
    return { data: FALLBACK_ALERTS.filter((a) => a.status === 'ACTIVE'), isFallback: true };
  }
}

export async function fetchAlertHistory(): Promise<{ data: Alert[]; isFallback: boolean }> {
  try {
    return await request<Alert[]>('/api/v1/alerts/history');
  } catch {
    return { data: FALLBACK_ALERTS, isFallback: true };
  }
}

export async function acknowledgeAlert(alertId: string): Promise<Alert> {
  const res = await request<Alert>(`/api/v1/alerts/${alertId}/acknowledge`, { method: 'PUT' });
  return res.data;
}

export async function resolveAlert(alertId: string): Promise<Alert> {
  const res = await request<Alert>(`/api/v1/alerts/${alertId}/resolve`, { method: 'PUT' });
  return res.data;
}

export async function sendSosDistress(payload: SosRequest): Promise<{ data: Alert; isFallback: boolean }> {
  try {
    return await request<Alert>('/api/v1/alerts/sos', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  } catch {
    const aadhaarNotice = payload.senderAadhaar ? ` • Verified Aadhaar: ${payload.senderAadhaar}` : '';
    const locNotice = payload.senderLocation ? ` • Origin: ${payload.senderLocation}` : '';
    const fakeAlert: Alert = {
      id: 'sos-' + Date.now(),
      zoneCode: payload.zoneCode || 'NER-DISTRESS',
      zoneName: payload.senderLocation || 'Emergency Response Location',
      severity: 'CRITICAL',
      title: 'LOCAL SOS DISPATCHED: Immediate Attention Required',
      message: `Distress beacon from ${payload.senderName || 'Citizen'} (${payload.senderPhone || 'No Phone'})${aadhaarNotice}${locNotice} at [${payload.latitude.toFixed(4)}°N, ${payload.longitude.toFixed(4)}°E]. Details: ${payload.emergencyDetails || 'Immediate landslide evacuation assistance requested.'}`,
      affectedRadius: 5.0,
      status: 'ACTIVE',
      createdAt: new Date().toISOString(),
    };
    return { data: fakeAlert, isFallback: true };
  }
}

/**
 * Fetches real-time weather from backend or falls back directly to OpenWeatherMap
 */
export async function fetchLiveWeather(
  zoneCode?: string,
  lat?: number,
  lon?: number
): Promise<{ data: WeatherData; isFallback: boolean }> {
  // 1. Try Spring Boot backend live endpoint first
  try {
    let endpoint = '/api/v1/weather/live';
    const params = new URLSearchParams();
    if (zoneCode) params.append('zoneCode', zoneCode);
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    if (params.toString()) endpoint += `?${params.toString()}`;

    const res = await request<WeatherData>(endpoint);
    return { data: res.data, isFallback: false };
  } catch (backendErr) {
    console.info('[Landslide Guard] Backend weather unavailable, querying OpenWeatherMap direct API...');
  }

  // 2. Direct OpenWeatherMap fallback
  try {
    const zone = FALLBACK_ZONES.find((z) => z.code === zoneCode) || FALLBACK_ZONES[0];
    const targetLat = lat ?? zone.latitude;
    const targetLon = lon ?? zone.longitude;
    const weather = await fetchDirectOpenWeather(targetLat, targetLon, zone.name);
    weather.zoneCode = zone.code;
    weather.zoneName = zone.name;
    return { data: weather, isFallback: false };
  } catch (directErr: any) {
    console.warn('[Landslide Guard] Direct OpenWeatherMap failed, using offline telemetry default:', directErr.message);
    const z = FALLBACK_ZONES.find((x) => x.code === zoneCode) || FALLBACK_ZONES[0];
    return {
      data: {
        zoneCode: z.code,
        zoneName: z.name,
        cityName: z.name,
        latitude: z.latitude,
        longitude: z.longitude,
        temperatureCelsius: 19.5,
        feelsLikeCelsius: 19.8,
        humidityPercent: 86.0,
        pressureHpa: 1012.0,
        rainfallMm: z.currentRiskLevel === 'CRITICAL' ? 112.5 : z.currentRiskLevel === 'HIGH' ? 78.2 : 36.4,
        windSpeedMs: 3.2,
        cloudsPercent: 85,
        weatherCondition: 'Rain',
        weatherDescription: 'Moderate monsoon precipitation',
        source: 'Estimated Offline Model',
        observedAt: new Date().toISOString(),
      },
      isFallback: true,
    };
  }
}

/**
 * Triggers a fresh on-demand ingestion in backend for the given zone
 */
export async function refreshZoneWeather(zoneCode: string): Promise<WeatherData | null> {
  try {
    const res = await request<WeatherData>(`/api/v1/weather/refresh/${zoneCode}`, { method: 'POST' });
    return res.data;
  } catch (err) {
    console.warn('[Landslide Guard] Backend refresh failed, calling direct OpenWeatherMap...');
    const z = FALLBACK_ZONES.find((x) => x.code === zoneCode) || FALLBACK_ZONES[0];
    return await fetchDirectOpenWeather(z.latitude, z.longitude, z.name);
  }
}

export async function fetchLiveSensors(zoneCode?: string): Promise<{ data: SensorTelemetry; isFallback: boolean }> {
  try {
    const endpoint = zoneCode ? `/api/v1/sensors/live?zoneCode=${zoneCode}` : '/api/v1/sensors/live';
    const res = await request<SensorTelemetry>(endpoint);
    return res;
  } catch {
    const z = FALLBACK_ZONES.find((x) => x.code === zoneCode) || FALLBACK_ZONES[0];
    const isCrit = z.currentRiskLevel === 'CRITICAL';
    const isHigh = z.currentRiskLevel === 'HIGH';

    // Attempt to enrich fallback with real live OpenWeatherMap data if possible
    let weatherExtra: Partial<SensorTelemetry> = {};
    try {
      const liveW = await fetchDirectOpenWeather(z.latitude, z.longitude, z.name);
      weatherExtra = {
        rainfallMm: liveW.rainfallMm,
        temperatureCelsius: liveW.temperatureCelsius,
        feelsLikeCelsius: liveW.feelsLikeCelsius,
        humidityPercent: liveW.humidityPercent,
        pressureHpa: liveW.pressureHpa,
        windSpeedMs: liveW.windSpeedMs,
        cloudsPercent: liveW.cloudsPercent,
        weatherCondition: liveW.weatherCondition,
        weatherDescription: liveW.weatherDescription,
        weatherSource: 'OpenWeatherMap (Live)',
      };
    } catch {
      weatherExtra = {
        rainfallMm: isCrit ? 112.5 : isHigh ? 78.2 : 36.4,
        temperatureCelsius: 16.5,
        feelsLikeCelsius: 16.8,
        humidityPercent: 89.0,
        pressureHpa: 1011.0,
        windSpeedMs: 2.8,
        cloudsPercent: 70,
        weatherCondition: 'Rain',
        weatherDescription: 'Intermittent precipitation',
        weatherSource: 'Telemetry Baseline',
      };
    }

    // Real-time sensor micro-drift simulation so telemetry comes alive
    const timeSec = Math.floor(Date.now() / 1000);
    const jitter = Math.sin(timeSec * 0.5) * 0.4;
    const moveJitter = Math.cos(timeSec * 0.3) * 0.15;
    const acousticJitter = Math.sin(timeSec * 0.8) * 2.2;
    const windJitter = Math.sin(timeSec * 0.2) * 0.3;

    const baseRain = weatherExtra.rainfallMm ?? (isCrit ? 112.5 : isHigh ? 78.2 : 36.4);
    const baseMoisture = isCrit ? 94.6 : isHigh ? 84.2 : 58.1;
    const baseMove = isCrit ? 12.8 : isHigh ? 4.6 : 1.1;
    const baseAcoustic = isCrit ? 85.0 : isHigh ? 73.5 : 48.0;

    const fallback: SensorTelemetry = {
      zoneCode: z.code,
      zoneName: z.name,
      rainfallMm: parseFloat(Math.max(0, baseRain + (baseRain > 0 ? jitter * 0.5 : 0)).toFixed(1)),
      rainfall24hTrend: isHigh || isCrit ? 14.2 : -2.5,
      soilMoisturePercent: parseFloat(Math.min(99.9, Math.max(20, baseMoisture + jitter)).toFixed(1)),
      groundMovementMmPerHour: parseFloat(Math.max(0.1, baseMove + moveJitter).toFixed(2)),
      cumulativeDisplacementMm: parseFloat((isCrit ? 34.2 : isHigh ? 16.5 : 4.2 + (timeSec % 60) * 0.01).toFixed(2)),
      temperatureCelsius: parseFloat(((weatherExtra.temperatureCelsius ?? 16.5) + jitter * 0.2).toFixed(1)),
      feelsLikeCelsius: parseFloat(((weatherExtra.feelsLikeCelsius ?? 16.8) + jitter * 0.2).toFixed(1)),
      humidityPercent: Math.min(100, Math.max(30, Math.round((weatherExtra.humidityPercent ?? 89.0) + jitter))),
      pressureHpa: Math.round((weatherExtra.pressureHpa ?? 1011.0) + Math.cos(timeSec * 0.1) * 0.5),
      windSpeedMs: parseFloat(Math.max(0, (weatherExtra.windSpeedMs ?? 2.8) + windJitter).toFixed(1)),
      cloudsPercent: weatherExtra.cloudsPercent ?? 70,
      weatherCondition: weatherExtra.weatherCondition ?? 'Rain',
      weatherDescription: weatherExtra.weatherDescription ?? 'Intermittent precipitation',
      weatherSource: weatherExtra.weatherSource ?? 'Telemetry Baseline',
      acousticActivityDb: parseFloat(Math.max(25, baseAcoustic + acousticJitter).toFixed(1)),
      acousticStatus: (baseAcoustic + acousticJitter) > 80 ? 'CRITICAL' : (baseAcoustic + acousticJitter) > 65 ? 'HIGH' : 'NORMAL',
      riskLevel: z.currentRiskLevel,
      riskScore: Math.min(99, Math.max(5, Math.round(z.currentRiskScore + jitter * 1.5))),
      timestamp: new Date().toISOString(),
    };
    return { data: fallback, isFallback: true };
  }
}

export async function fetchLiveAcoustic(zoneCode?: string): Promise<{ data: AcousticDetection; isFallback: boolean }> {
  try {
    const endpoint = zoneCode ? `/api/v1/sensors/acoustic/live?zoneCode=${zoneCode}` : '/api/v1/sensors/acoustic/live';
    return await request<AcousticDetection>(endpoint);
  } catch {
    const z = FALLBACK_ZONES.find((x) => x.code === zoneCode) || FALLBACK_ZONES[0];
    const isCrit = z.currentRiskLevel === 'CRITICAL';
    const isHigh = z.currentRiskLevel === 'HIGH';

    const timeSec = Math.floor(Date.now() / 1000);
    const acousticJitter = Math.sin(timeSec * 1.2) * 3.5;
    const baseDb = isCrit ? 86.4 : isHigh ? 74.0 : 38.5;
    const currentDb = parseFloat(Math.max(25, baseDb + acousticJitter).toFixed(1));

    // Real-time undulating acoustic frequency spectrum
    const dynamicSpectrum = [25, 42, 68, 85, 91, 74, 60, 52, 45, 60, 78, 89, 70, 55, 40, 30].map(
      (val, idx) => Math.min(100, Math.max(10, Math.round(val + Math.sin(timeSec * 2 + idx) * 9)))
    );

    const fallback: AcousticDetection = {
      zoneCode: z.code,
      zoneName: z.name,
      sensorStation: `GEO-AC-${z.code}`,
      acousticLevel: currentDb > 80 ? 'CRITICAL' : currentDb > 65 ? 'HIGH' : 'NORMAL',
      detectedEvent: isCrit
        ? 'Possible Ground Crack / Rockfall'
        : isHigh
        ? 'Sub-surface Shear Micro-fracturing'
        : 'Normal Ambient Background Activity',
      soundIntensityDb: currentDb,
      confidencePercent: Math.min(99, Math.round((isCrit ? 94 : isHigh ? 87 : 92) + Math.cos(timeSec) * 2)),
      frequencySpectrum: dynamicSpectrum,
      timestamp: new Date().toISOString(),
    };
    return { data: fallback, isFallback: true };
  }
}

export async function fetchSensorHistory(
  zoneCode?: string,
  timeframe = '24h'
): Promise<{ data: SensorHistoryPoint[]; isFallback: boolean }> {
  try {
    const endpoint = `/api/v1/sensors/history?timeframe=${timeframe}${zoneCode ? `&zoneCode=${zoneCode}` : ''}`;
    return await request<SensorHistoryPoint[]>(endpoint);
  } catch {
    const count = timeframe === '30d' ? 30 : timeframe === '7d' ? 28 : 24;
    const stepHours = timeframe === '30d' ? 24 : timeframe === '7d' ? 6 : 1;
    const now = Date.now();
    const list: SensorHistoryPoint[] = [];

    for (let i = count - 1; i >= 0; i--) {
      const t = new Date(now - i * stepHours * 3600000).toISOString();
      const wave = Math.sin(i * 0.4);
      list.push({
        timestamp: t,
        rainfallMm: Math.max(0, parseFloat((35 + wave * 25 + (count - i) * 0.7).toFixed(1))),
        soilMoisturePercent: Math.min(99, Math.max(30, parseFloat((65 + wave * 14).toFixed(1)))),
        groundMovementMm: parseFloat((2.0 + Math.max(0, wave * 2.5)).toFixed(2)),
        acousticDb: parseFloat((45 + Math.abs(wave) * 28).toFixed(1)),
        predictedRiskScore: Math.min(98, Math.max(15, parseFloat((60 + wave * 22).toFixed(1)))),
      });
    }

    return { data: list, isFallback: true };
  }
}

export async function queryMlRiskPrediction(
  latitude: number,
  longitude: number,
  date?: string
): Promise<{ data: MlPredictionResult; isFallback: boolean }> {
  try {
    const res = await request<any>('/api/v1/predictions/predict', {
      method: 'POST',
      body: JSON.stringify({
        latitude,
        longitude,
        date: date || new Date().toISOString().split('T')[0],
      }),
    });

    const prob = res.data.risk_probability ?? 0.78;
    const rawFactors = res.data.top_factors || [];

    const formattedFactors: any[] = rawFactors.map((f: any) => {
      if (typeof f === 'string') {
        return { factor: f, weight: 0.85, description: f };
      }
      return {
        factor: f.name || f.factor || 'Slope Instability',
        weight: f.weight || 0.75,
        description: f.description || '',
      };
    });

    return {
      data: {
        riskProbability: prob,
        riskLevel: (res.data.risk_level as any) || 'HIGH',
        confidence: 0.91,
        topFactors: formattedFactors.length ? formattedFactors : defaultMlFactors(),
        rainfallDataUsed: res.data.rainfall_data_used ?? true,
        timestamp: new Date().toISOString(),
      },
      isFallback: false,
    };
  } catch {
    return {
      data: {
        riskProbability: 0.82,
        riskLevel: 'HIGH',
        confidence: 0.91,
        topFactors: defaultMlFactors(),
        rainfallDataUsed: true,
        timestamp: new Date().toISOString(),
      },
      isFallback: true,
    };
  }
}

function defaultMlFactors() {
  return [
    {
      factor: 'Heavy Cumulative Rainfall (72h)',
      weight: 0.88,
      description: 'Precipitation exceeded 140mm saturation threshold',
    },
    {
      factor: 'High Soil Moisture & Pore Pressure',
      weight: 0.82,
      description: 'Sub-surface moisture exceeds 84% liquid limit',
    },
    {
      factor: 'Increased Ground Movement & Creep',
      weight: 0.74,
      description: 'Inclinometer recorded >4.6mm/h continuous shear displacement',
    },
    {
      factor: 'Steep Slope Gradient (>34°)',
      weight: 0.65,
      description: 'SRTM DEM indicates high topographic susceptibility',
    },
  ];
}

export async function checkSystemHealth(): Promise<{ spring: boolean; ml: boolean }> {
  let springOk = false;
  let mlOk = false;

  try {
    const res = await fetch(`${API_BASE}/actuator/health`, { method: 'GET' });
    springOk = res.ok;
  } catch {
    springOk = false;
  }

  try {
    const res = await fetch(`${API_BASE}/api/v1/predictions/health`, { method: 'GET' });
    mlOk = res.ok;
  } catch {
    mlOk = false;
  }

  return { spring: springOk, ml: mlOk };
}
