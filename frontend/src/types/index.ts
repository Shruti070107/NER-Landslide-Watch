export type RiskLevel = 'SAFE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

export interface RiskZone {
  id: string;
  code: string;
  name: string;
  state: string;
  district: string;
  latitude: number;
  longitude: number;
  currentRiskLevel: RiskLevel;
  currentRiskScore: number;
  slopeAngleDegrees?: number;
  populationExposure?: number;
  infrastructureCriticality?: number;
  nearbyVillages?: string;
  affectedRoads?: string;
  lastUpdated: string;
}

export interface Alert {
  id: string;
  zoneCode: string;
  zoneName: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  message: string;
  affectedRadius: number;
  status: 'ACTIVE' | 'ACKNOWLEDGED' | 'RESOLVED' | 'EXPIRED';
  createdAt: string;
  expiresAt?: string;
}

export interface WeatherData {
  zoneCode?: string;
  zoneName?: string;
  cityName?: string;
  latitude?: number;
  longitude?: number;
  temperatureCelsius: number;
  feelsLikeCelsius?: number;
  humidityPercent: number;
  pressureHpa?: number;
  rainfallMm: number;
  forecastRainfallMm?: number;
  windSpeedMs?: number;
  cloudsPercent?: number;
  weatherCondition?: string;
  weatherDescription?: string;
  warningLevel?: string;
  source: string;
  observedAt: string;
}

export interface SensorTelemetry {
  zoneCode: string;
  zoneName: string;
  rainfallMm: number;
  rainfall24hTrend: number;
  soilMoisturePercent: number;
  groundMovementMmPerHour: number;
  cumulativeDisplacementMm: number;
  temperatureCelsius: number;
  feelsLikeCelsius?: number;
  humidityPercent: number;
  pressureHpa?: number;
  windSpeedMs?: number;
  cloudsPercent?: number;
  weatherCondition?: string;
  weatherDescription?: string;
  weatherSource?: string;
  acousticActivityDb: number;
  acousticStatus: string;
  riskLevel: string;
  riskScore: number;
  timestamp: string;
}

export interface AcousticDetection {
  zoneCode: string;
  zoneName: string;
  sensorStation: string;
  acousticLevel: string;
  detectedEvent: string;
  soundIntensityDb: number;
  confidencePercent: number;
  frequencySpectrum: number[];
  timestamp: string;
}

export interface SensorHistoryPoint {
  timestamp: string;
  rainfallMm: number;
  soilMoisturePercent: number;
  groundMovementMm: number;
  acousticDb: number;
  predictedRiskScore: number;
}

export interface MlFactor {
  factor: string;
  weight: number;
  description: string;
}

export interface MlPredictionResult {
  riskProbability: number;
  riskLevel: RiskLevel;
  confidence: number;
  topFactors: MlFactor[];
  rainfallDataUsed: boolean;
  timestamp: string;
}

export interface SosRequest {
  zoneCode?: string;
  latitude: number;
  longitude: number;
  senderName?: string;
  senderPhone?: string;
  senderAadhaar?: string;
  senderLocation?: string;
  emergencyDetails?: string;
}

export interface UserProfile {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  role: 'CITIZEN' | 'FIELD_OFFICER' | 'DISTRICT_ADMIN' | 'DISASTER_ADMIN' | 'SUPER_ADMIN';
  aadhaarNumber: string;
  maskedAadhaar: string;
  isAadhaarVerified: boolean;
  state: string;
  district: string;
  cityOrVillage: string;
  address: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
  registeredAt?: string;
}

export interface RegisterRequest {
  fullName: string;
  email: string;
  phone: string;
  password?: string;
  role?: 'CITIZEN' | 'FIELD_OFFICER' | 'DISTRICT_ADMIN' | 'DISASTER_ADMIN';
  aadhaarNumber: string;
  state: string;
  district: string;
  cityOrVillage: string;
  address: string;
  pincode: string;
  latitude?: number;
  longitude?: number;
}

export interface LoginRequest {
  identifier: string; // Email, Phone, or Aadhaar
  password?: string;
  rememberMe?: boolean;
}

export type HazardType = 'SLOPE_CRACK' | 'MUDSLIDE' | 'ROCKFALL' | 'ROAD_BLOCKAGE' | 'FLASH_FLOOD' | 'OTHER';

export interface GeoTaggedReport {
  id: string;
  title: string;
  hazardType: HazardType;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  description: string;
  imageUrl?: string;
  videoUrl?: string;
  latitude: number;
  longitude: number;
  locationName: string;
  district: string;
  state: string;
  submittedBy: string;
  contactPhone: string;
  timestamp: string;
  status: 'PENDING' | 'VERIFIED' | 'DISPATCHED' | 'RESOLVED' | 'REJECTED';
  synced: boolean;
  officerNotes?: string;
  aiRiskAssessmentScore?: number;
}

export interface OpenMeteoForecast {
  latitude: number;
  longitude: number;
  timezone: string;
  elevation: number;
  currentTempCelsius: number;
  currentHumidityPercent: number;
  currentRainfallMm: number;
  soilMoisture0to7cm: number;
  soilMoisture7to28cm: number;
  weatherDescription?: string;
  dailyForecast: {
    date: string;
    precipitationSumMm: number;
    weatherCode: number;
    maxTemp: number;
    minTemp: number;
  }[];
  cumulativeRainfall3d: number;
  cumulativeRainfall7d: number;
  cumulativeRainfall14d: number;
  cumulativeRainfall30d: number;
  soilSaturationIndex: number; // 0-100%
  source: string;
}

export interface DailyRiskPoint {
  date: string;
  riskScore: number;
  riskLevel: RiskLevel;
  predictedRainfallMm: number;
  soilSaturationPercent: number;
}

export interface LandslidePrediction30Day {
  latitude: number;
  longitude: number;
  locationName: string;
  district: string;
  state: string;
  currentRiskScore: number;
  maxPredictedRiskScore30d: number;
  peakHazardDate: string;
  daysUntilPeak: number;
  overallRiskLevel: RiskLevel;
  leadTimeDays: number;
  forecastTimeline: DailyRiskPoint[];
  affectedRoads: string[];
  vulnerableVillages: string[];
  recommendations: string[];
  lastUpdated: string;
}

export interface RoboticCallCampaign {
  id: string;
  targetZoneCode: string;
  targetZoneName: string;
  language: 'assamese' | 'bengali' | 'english' | 'hindi' | 'khasi' | 'mizo' | 'nepali';
  messageTemplate: string;
  totalHouseholds: number;
  callsInitiated: number;
  callsConnected: number;
  acknowledgements: number;
  status: 'IDLE' | 'CALLING' | 'COMPLETED' | 'PAUSED';
  startedAt: string;
  completedAt?: string;
}

export type SupportedLanguage = 'en' | 'as' | 'bn' | 'hi' | 'ne' | 'kha' | 'mzo' | 'mni';


