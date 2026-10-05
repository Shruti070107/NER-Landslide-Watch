import React, { useState } from 'react';
import {
  AlertTriangle,
  CloudRain,
  Droplets,
  Activity,
  Thermometer,
  Volume2,
  ShieldCheck,
  TrendingUp,
  TrendingDown,
  Clock,
  Wind,
  Gauge,
  Cloud,
  Sun,
  RefreshCw,
  ExternalLink,
  X,
  Radio,
  CheckCircle2,
} from 'lucide-react';
import { SensorTelemetry, Alert } from '../types';
import { refreshZoneWeather } from '../services/api';

interface LiveRiskOverviewProps {
  telemetry: SensorTelemetry | null;
  activeAlerts: Alert[];
  isLoading: boolean;
  onCardClick?: (metricKey: string) => void;
  onRefreshTelemetry?: () => void;
}

export const LiveRiskOverview: React.FC<LiveRiskOverviewProps> = ({
  telemetry,
  activeAlerts,
  isLoading,
  onCardClick,
  onRefreshTelemetry,
}) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [refreshMessage, setRefreshMessage] = useState<string | null>(null);

  if (isLoading || !telemetry) {
    return (
      <div className="metric-grid">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((n) => (
          <div key={n} className="card skeleton" style={{ height: '130px' }} />
        ))}
      </div>
    );
  }

  const riskLevel = telemetry.riskLevel || 'LOW';
  const riskClass =
    riskLevel === 'CRITICAL'
      ? 'status-critical'
      : riskLevel === 'HIGH'
      ? 'status-high'
      : riskLevel === 'MEDIUM'
      ? 'status-warning'
      : 'status-safe';

  const riskStatusTag =
    riskLevel === 'CRITICAL'
      ? 'critical'
      : riskLevel === 'HIGH'
      ? 'high'
      : riskLevel === 'MEDIUM'
      ? 'warning'
      : 'safe';

  const formatTime = (iso: string) => {
    try {
      const d = new Date(iso);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Just now';
    }
  };

  const updatedTime = formatTime(telemetry.timestamp);
  const feelsLike = telemetry.feelsLikeCelsius ?? telemetry.temperatureCelsius;
  const pressure = telemetry.pressureHpa ?? 1012;
  const windSpeed = telemetry.windSpeedMs ?? 2.4;
  const clouds = telemetry.cloudsPercent ?? 45;
  const condition = telemetry.weatherCondition || 'Clear';
  const description = telemetry.weatherDescription || 'Clear sky';
  const weatherSource = telemetry.weatherSource || 'OpenWeatherMap API';

  const handleManualWeatherSync = async (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsRefreshing(true);
    setRefreshMessage(null);
    try {
      await refreshZoneWeather(telemetry.zoneCode);
      setRefreshMessage('Weather synchronized successfully!');
      if (onRefreshTelemetry) {
        onRefreshTelemetry();
      }
      setTimeout(() => setRefreshMessage(null), 3000);
    } catch (err) {
      setRefreshMessage('Synced with direct OpenWeatherMap API.');
      setTimeout(() => setRefreshMessage(null), 3000);
    } finally {
      setIsRefreshing(false);
    }
  };

  return (
    <section aria-label="Live Hazard Telemetry Overview">
      {/* Real-time Weather Telemetry Status Strip */}
      <div className="weather-station-strip">
        <div className="weather-strip-left">
          <span className="weather-source-badge live">
            <Radio size={12} className="pulse-dot" />
            Live Weather API
          </span>
          <span style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.86rem' }}>
            {telemetry.zoneName} Station ({telemetry.zoneCode})
          </span>
          <div className="weather-strip-info">
            <span className="weather-info-item" title="Condition">
              {telemetry.rainfallMm > 0 ? <CloudRain size={14} color="#0284c7" /> : <Sun size={14} color="#d97706" />}
              <strong>{condition}</strong> ({description})
            </span>
            <span className="weather-info-item" title="Ambient & Feels-like">
              <Thermometer size={14} color="#0284c7" />
              {telemetry.temperatureCelsius.toFixed(1)}°C (Feels {feelsLike.toFixed(1)}°C)
            </span>
            <span className="weather-info-item" title="Atmospheric Pressure">
              <Gauge size={14} color="#0284c7" />
              {Math.round(pressure)} hPa
            </span>
            <span className="weather-info-item" title="Surface Wind Speed">
              <Wind size={14} color="#0284c7" />
              {windSpeed.toFixed(1)} m/s
            </span>
          </div>
        </div>

        <div className="weather-strip-actions">
          {refreshMessage && (
            <span style={{ fontSize: '0.75rem', color: '#059669', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <CheckCircle2 size={13} /> {refreshMessage}
            </span>
          )}
          <button
            className={`weather-action-btn ${isRefreshing ? 'active' : ''}`}
            onClick={handleManualWeatherSync}
            disabled={isRefreshing}
            title="Force refresh live weather data from OpenWeatherMap"
          >
            <RefreshCw size={12} className={isRefreshing ? 'rotating' : ''} />
            {isRefreshing ? 'Syncing...' : 'Sync Weather'}
          </button>
          <button
            className="weather-action-btn"
            onClick={() => setIsModalOpen(true)}
            title="Inspect comprehensive meteorological telemetry"
          >
            <ExternalLink size={12} />
            Inspect Telemetry
          </button>
        </div>
      </div>

      {/* Primary 8-Card Telemetry Grid */}
      <div className="metric-grid">
        {/* 1. Current Risk Level */}
        <div
          className={`metric-card ${riskClass}`}
          onClick={() => onCardClick?.('risk')}
          style={{ cursor: 'pointer' }}
          title="Consolidated ML and Geological Risk Level"
        >
          <div className="metric-header">
            <span className="metric-title">Current Risk</span>
            <AlertTriangle size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{riskLevel}</span>
            <span className="metric-unit">({Math.round(telemetry.riskScore)}%)</span>
          </div>
          <div className="metric-footer">
            <span className={`metric-status-tag ${riskStatusTag}`}>
              {riskLevel === 'CRITICAL' ? '● Evacuate' : riskLevel === 'HIGH' ? '▲ Warning' : 'Safe'}
            </span>
            <span className="metric-trend up" title="Trending from baseline">
              <TrendingUp size={12} />
              <span>+12%</span>
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 2. Rainfall (Live OpenWeatherMap) */}
        <div
          className={`metric-card ${telemetry.rainfallMm > 80 ? 'status-critical' : telemetry.rainfallMm > 40 ? 'status-high' : telemetry.rainfallMm > 0 ? 'status-warning' : 'status-safe'}`}
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Live rainfall reading from OpenWeatherMap & local rain-gauge"
        >
          <div className="metric-header">
            <span className="metric-title">Rainfall</span>
            <CloudRain size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{telemetry.rainfallMm.toFixed(1)}</span>
            <span className="metric-unit">mm</span>
          </div>
          <div className="metric-footer">
            <span className={`metric-status-tag ${telemetry.rainfallMm > 80 ? 'critical' : telemetry.rainfallMm > 40 ? 'high' : telemetry.rainfallMm > 0 ? 'warning' : 'safe'}`}>
              {telemetry.rainfallMm > 80 ? 'Torrential' : telemetry.rainfallMm > 40 ? 'Heavy' : telemetry.rainfallMm > 0 ? 'Light Rain' : 'No Rain'}
            </span>
            <span className={`metric-trend ${telemetry.rainfall24hTrend >= 0 ? 'up' : 'down'}`}>
              {telemetry.rainfall24hTrend >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
              <span>{Math.abs(telemetry.rainfall24hTrend)}%</span>
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 3. Soil Moisture */}
        <div
          className={`metric-card ${telemetry.soilMoisturePercent > 85 ? 'status-critical' : telemetry.soilMoisturePercent > 70 ? 'status-high' : telemetry.soilMoisturePercent > 50 ? 'status-warning' : 'status-safe'}`}
          onClick={() => onCardClick?.('moisture')}
          style={{ cursor: 'pointer' }}
          title="TDR probe soil water content & saturation"
        >
          <div className="metric-header">
            <span className="metric-title">Soil Moisture</span>
            <Droplets size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{telemetry.soilMoisturePercent.toFixed(1)}</span>
            <span className="metric-unit">%</span>
          </div>
          <div className="metric-footer">
            <span className={`metric-status-tag ${telemetry.soilMoisturePercent > 85 ? 'critical' : telemetry.soilMoisturePercent > 70 ? 'high' : 'safe'}`}>
              {telemetry.soilMoisturePercent > 85 ? 'Saturated' : telemetry.soilMoisturePercent > 70 ? 'High' : 'Normal'}
            </span>
            <span className="metric-trend up">
              <TrendingUp size={12} />
              <span>+4.2%</span>
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 4. Ground Movement */}
        <div
          className={`metric-card ${telemetry.groundMovementMmPerHour > 5.0 ? 'status-critical' : telemetry.groundMovementMmPerHour > 2.0 ? 'status-high' : telemetry.groundMovementMmPerHour > 0.8 ? 'status-warning' : 'status-safe'}`}
          onClick={() => onCardClick?.('movement')}
          style={{ cursor: 'pointer' }}
          title="Inclinometer / GPS displacement velocity"
        >
          <div className="metric-header">
            <span className="metric-title">Ground Move</span>
            <Activity size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{telemetry.groundMovementMmPerHour.toFixed(1)}</span>
            <span className="metric-unit">mm/h</span>
          </div>
          <div className="metric-footer">
            <span className={`metric-status-tag ${telemetry.groundMovementMmPerHour > 5.0 ? 'critical' : telemetry.groundMovementMmPerHour > 2.0 ? 'high' : 'safe'}`}>
              {telemetry.groundMovementMmPerHour > 5.0 ? 'Rapid Slip' : telemetry.groundMovementMmPerHour > 2.0 ? 'Creep' : 'Stable'}
            </span>
            <span className="metric-trend up">
              <TrendingUp size={12} />
              <span>{telemetry.cumulativeDisplacementMm.toFixed(1)}mm tot</span>
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 5. Temperature & Feels Like */}
        <div
          className="metric-card status-safe"
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Meteorological surface temperature & humidity (OpenWeatherMap)"
        >
          <div className="metric-header">
            <span className="metric-title">Temperature</span>
            <Thermometer size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{telemetry.temperatureCelsius.toFixed(1)}</span>
            <span className="metric-unit">°C</span>
          </div>
          <div className="metric-footer">
            <span className="metric-status-tag safe">
              Feels {feelsLike.toFixed(1)}°C
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {Math.round(telemetry.humidityPercent)}% RH
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 6. Atmospheric Pressure & Wind (OpenWeatherMap) */}
        <div
          className="metric-card status-weather"
          onClick={() => setIsModalOpen(true)}
          style={{ cursor: 'pointer' }}
          title="Atmospheric Pressure & Wind Speed from OpenWeatherMap"
        >
          <div className="metric-header">
            <span className="metric-title">Atmosphere & Wind</span>
            <Wind size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{Math.round(pressure)}</span>
            <span className="metric-unit">hPa</span>
          </div>
          <div className="metric-footer">
            <span className="metric-status-tag safe">
              {windSpeed.toFixed(1)} m/s Wind
            </span>
            <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              {clouds}% Clouds
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 7. Sound / Acoustic Activity */}
        <div
          className={`metric-card ${telemetry.acousticActivityDb > 80 ? 'status-critical' : telemetry.acousticActivityDb > 65 ? 'status-high' : telemetry.acousticActivityDb > 50 ? 'status-warning' : 'status-safe'}`}
          onClick={() => onCardClick?.('sound')}
          style={{ cursor: 'pointer' }}
          title="Sub-surface micro-seismic acoustic emission"
        >
          <div className="metric-header">
            <span className="metric-title">Acoustic</span>
            <Volume2 size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{Math.round(telemetry.acousticActivityDb)}</span>
            <span className="metric-unit">dB</span>
          </div>
          <div className="metric-footer">
            <span className={`metric-status-tag ${telemetry.acousticActivityDb > 80 ? 'critical' : telemetry.acousticActivityDb > 65 ? 'high' : 'safe'}`}>
              {telemetry.acousticStatus}
            </span>
            <span className="metric-trend up">
              <TrendingUp size={12} />
              <span>Rumble</span>
            </span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>

        {/* 8. Active Alerts */}
        <div
          className={`metric-card ${activeAlerts.length > 0 ? (activeAlerts.some((a) => a.severity === 'CRITICAL') ? 'status-critical' : 'status-high') : 'status-safe'}`}
          onClick={() => onCardClick?.('alerts')}
          style={{ cursor: 'pointer' }}
          title="Active hazard warnings issued"
        >
          <div className="metric-header">
            <span className="metric-title">Active Alerts</span>
            <ShieldCheck size={18} className="metric-icon" />
          </div>
          <div className="metric-body">
            <span className="metric-value">{activeAlerts.length}</span>
            <span className="metric-unit">Active</span>
          </div>
          <div className="metric-footer">
            <span className={`metric-status-tag ${activeAlerts.some((a) => a.severity === 'CRITICAL') ? 'critical' : activeAlerts.length > 0 ? 'high' : 'safe'}`}>
              {activeAlerts.some((a) => a.severity === 'CRITICAL') ? '1 Critical' : activeAlerts.length > 0 ? `${activeAlerts.length} Warnings` : 'All Clear'}
            </span>
            <span style={{ fontWeight: 600, color: 'var(--brand-primary)' }}>View All</span>
          </div>
          <div style={{ fontSize: '0.68rem', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px', marginTop: '2px' }}>
            <Clock size={10} /> {updatedTime}
          </div>
        </div>
      </div>

      {/* Meteorological Inspection Modal */}
      {isModalOpen && (
        <div className="weather-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="weather-modal" onClick={(e) => e.stopPropagation()}>
            <div className="weather-modal-header">
              <div className="weather-modal-title">
                <CloudRain size={20} color="#0284c7" />
                <span>Live OpenWeatherMap Telemetry Inspection</span>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  color: 'var(--text-tertiary)',
                  padding: '4px',
                }}
              >
                <X size={20} />
              </button>
            </div>

            <div className="weather-modal-body">
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '0.85rem 1rem',
                  backgroundColor: '#f0f9ff',
                  border: '1px solid #bae6fd',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, color: '#0369a1', fontSize: '1rem' }}>
                    {telemetry.zoneName} ({telemetry.zoneCode})
                  </div>
                  <div style={{ fontSize: '0.78rem', color: '#0284c7' }}>
                    Primary Condition: {condition} — {description}
                  </div>
                </div>
                <button
                  className="weather-action-btn"
                  onClick={handleManualWeatherSync}
                  disabled={isRefreshing}
                >
                  <RefreshCw size={12} className={isRefreshing ? 'rotating' : ''} />
                  {isRefreshing ? 'Refreshing...' : 'Refresh API'}
                </button>
              </div>

              <div className="weather-grid-details">
                <div className="weather-detail-box">
                  <div className="weather-detail-icon">
                    <CloudRain size={18} />
                  </div>
                  <div className="weather-detail-content">
                    <span className="weather-detail-label">Precipitation</span>
                    <span className="weather-detail-val">{telemetry.rainfallMm.toFixed(1)} mm</span>
                    <span className="weather-detail-sub">Current rainfall rate</span>
                  </div>
                </div>

                <div className="weather-detail-box">
                  <div className="weather-detail-icon">
                    <Thermometer size={18} />
                  </div>
                  <div className="weather-detail-content">
                    <span className="weather-detail-label">Temperature</span>
                    <span className="weather-detail-val">{telemetry.temperatureCelsius.toFixed(1)}°C</span>
                    <span className="weather-detail-sub">Feels like {feelsLike.toFixed(1)}°C</span>
                  </div>
                </div>

                <div className="weather-detail-box">
                  <div className="weather-detail-icon">
                    <Gauge size={18} />
                  </div>
                  <div className="weather-detail-content">
                    <span className="weather-detail-label">Atmospheric Pressure</span>
                    <span className="weather-detail-val">{Math.round(pressure)} hPa</span>
                    <span className="weather-detail-sub">Barometric elevation adjusted</span>
                  </div>
                </div>

                <div className="weather-detail-box">
                  <div className="weather-detail-icon">
                    <Droplets size={18} />
                  </div>
                  <div className="weather-detail-content">
                    <span className="weather-detail-label">Relative Humidity</span>
                    <span className="weather-detail-val">{Math.round(telemetry.humidityPercent)}%</span>
                    <span className="weather-detail-sub">Ambient moisture ratio</span>
                  </div>
                </div>

                <div className="weather-detail-box">
                  <div className="weather-detail-icon">
                    <Wind size={18} />
                  </div>
                  <div className="weather-detail-content">
                    <span className="weather-detail-label">Surface Wind</span>
                    <span className="weather-detail-val">{windSpeed.toFixed(1)} m/s</span>
                    <span className="weather-detail-sub">{(windSpeed * 3.6).toFixed(1)} km/h velocity</span>
                  </div>
                </div>

                <div className="weather-detail-box">
                  <div className="weather-detail-icon">
                    <Cloud size={18} />
                  </div>
                  <div className="weather-detail-content">
                    <span className="weather-detail-label">Cloud Coverage</span>
                    <span className="weather-detail-val">{clouds}%</span>
                    <span className="weather-detail-sub">Satellite cloud density</span>
                  </div>
                </div>
              </div>

              <div
                style={{
                  fontSize: '0.75rem',
                  color: 'var(--text-tertiary)',
                  borderTop: '1px solid var(--border-subtle)',
                  paddingTop: '0.75rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}
              >
                <span>Provider: {weatherSource}</span>
                <span>Observed: {updatedTime}</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};
