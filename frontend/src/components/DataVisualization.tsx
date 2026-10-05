import React, { useState } from 'react';
import {
  LineChart,
  CloudRain,
  Droplets,
  Activity,
  Volume2,
  TrendingUp,
  Calendar,
} from 'lucide-react';
import { SensorHistoryPoint } from '../types';

interface DataVisualizationProps {
  historyData: SensorHistoryPoint[];
  isLoading: boolean;
  timeframe: string;
  onChangeTimeframe: (tf: string) => void;
  zoneName?: string;
}

export const DataVisualization: React.FC<DataVisualizationProps> = ({
  historyData,
  isLoading,
  timeframe,
  onChangeTimeframe,
  zoneName = 'Monitored Sector',
}) => {
  const [hoverIndex, setHoverIndex] = useState<number | null>(null);

  if (isLoading || historyData.length === 0) {
    return (
      <div className="card">
        <div className="card-header">
          <div className="skeleton" style={{ width: '200px', height: '24px' }} />
        </div>
        <div className="charts-grid">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="card skeleton" style={{ height: '260px' }} />
          ))}
        </div>
      </div>
    );
  }

  // Helper to render interactive SVG Area/Line charts
  const renderChart = (
    title: string,
    icon: React.ReactNode,
    dataKey: keyof SensorHistoryPoint,
    unit: string,
    strokeColor: string,
    fillGradientId: string,
    fillStartColor: string,
    thresholdValue?: number,
    thresholdLabel?: string
  ) => {
    const values = historyData.map((d) => (typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0));
    const minVal = Math.min(...values);
    const maxVal = Math.max(...values, (thresholdValue || 0) * 1.05);
    const range = maxVal - minVal || 1;

    const width = 500;
    const height = 180;
    const padding = { top: 20, right: 20, bottom: 30, left: 35 };
    const chartW = width - padding.left - padding.right;
    const chartH = height - padding.top - padding.bottom;

    const points = historyData.map((d, i) => {
      const val = typeof d[dataKey] === 'number' ? (d[dataKey] as number) : 0;
      const x = padding.left + (i / (historyData.length - 1)) * chartW;
      const y = padding.top + chartH - ((val - minVal) / range) * chartH;
      return { x, y, val, time: d.timestamp };
    });

    const pathD = points.reduce((acc, p, i) => `${acc} ${i === 0 ? 'M' : 'L'} ${p.x.toFixed(1)},${p.y.toFixed(1)}`, '');
    const areaD = `${pathD} L ${points[points.length - 1].x},${padding.top + chartH} L ${points[0].x},${padding.top + chartH} Z`;

    const activePoint = hoverIndex !== null && points[hoverIndex] ? points[hoverIndex] : points[points.length - 1];

    const thresholdY =
      thresholdValue !== undefined
        ? padding.top + chartH - ((thresholdValue - minVal) / range) * chartH
        : null;

    return (
      <div className="card chart-card">
        <div className="card-header" style={{ marginBottom: '0.5rem' }}>
          <span className="card-title" style={{ fontSize: '0.95rem' }}>
            {icon}
            {title}
          </span>
          <div style={{ textAlign: 'right' }}>
            <span style={{ fontSize: '1.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: strokeColor }}>
              {activePoint ? activePoint.val : '--'}
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', marginLeft: '4px' }}>{unit}</span>
          </div>
        </div>

        <div className="chart-svg-container" onMouseLeave={() => setHoverIndex(null)}>
          <svg viewBox={`0 0 ${width} ${height}`} style={{ width: '100%', height: '100%', overflow: 'visible' }}>
            <defs>
              <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={fillStartColor} stopOpacity="0.32" />
                <stop offset="100%" stopColor={fillStartColor} stopOpacity="0.0" />
              </linearGradient>
            </defs>

            {/* Grid lines */}
            {[0, 0.5, 1].map((pct, idx) => {
              const y = padding.top + chartH * pct;
              const labelVal = maxVal - pct * range;
              return (
                <g key={idx}>
                  <line x1={padding.left} y1={y} x2={width - padding.right} y2={y} stroke="var(--border-subtle)" strokeDasharray="3 3" />
                  <text x={padding.left - 6} y={y + 3} fill="var(--text-muted)" fontSize="9" textAnchor="end">
                    {Math.round(labelVal)}
                  </text>
                </g>
              );
            })}

            {/* Warning threshold line */}
            {thresholdY !== null && thresholdY >= padding.top && thresholdY <= padding.top + chartH && (
              <g>
                <line x1={padding.left} y1={thresholdY} x2={width - padding.right} y2={thresholdY} stroke="#ef4444" strokeWidth="1" strokeDasharray="4 2" />
                <text x={width - padding.right} y={thresholdY - 4} fill="#dc2626" fontSize="8.5" textAnchor="end" fontWeight="600">
                  {thresholdLabel || 'Hazard Threshold'}
                </text>
              </g>
            )}

            {/* Area and Line */}
            <path d={areaD} fill={`url(#${fillGradientId})`} />
            <path d={pathD} fill="none" stroke={strokeColor} strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" />

            {/* Hover Crosshair & Marker */}
            {activePoint && (
              <g>
                <line x1={activePoint.x} y1={padding.top} x2={activePoint.x} y2={padding.top + chartH} stroke="var(--text-secondary)" strokeDasharray="2 2" opacity="0.6" />
                <circle cx={activePoint.x} cy={activePoint.y} r="4.5" fill="#ffffff" stroke={strokeColor} strokeWidth="2.5" />
              </g>
            )}

            {/* Transparent hover capture rects */}
            {points.map((p, idx) => {
              const colW = chartW / points.length;
              return (
                <rect
                  key={idx}
                  x={p.x - colW / 2}
                  y={padding.top}
                  width={colW}
                  height={chartH}
                  fill="transparent"
                  style={{ cursor: 'crosshair' }}
                  onMouseEnter={() => setHoverIndex(idx)}
                />
              );
            })}

            {/* Bottom X-axis label */}
            <text x={padding.left} y={height - 8} fill="var(--text-muted)" fontSize="9">
              {new Date(historyData[0].timestamp).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </text>
            <text x={width - padding.right} y={height - 8} fill="var(--text-muted)" fontSize="9" textAnchor="end">
              Latest: {new Date(historyData[historyData.length - 1].timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </text>
          </svg>
        </div>
      </div>
    );
  };

  return (
    <section aria-label="Historical Sensor Analytics" className="card" style={{ gap: '1.25rem' }}>
      <div className="card-header" style={{ marginBottom: 0 }}>
        <div>
          <h2 className="card-title">
            <LineChart size={20} color="var(--brand-primary)" />
            Sensor Telemetry & Susceptibility Analytics
          </h2>
          <p className="card-subtitle">
            Historical time-series trend analysis for {zoneName} • Multi-parametric anomaly detection
          </p>
        </div>

        {/* Timeframe selector */}
        <div className="timeframe-selector">
          <button
            className={`timeframe-btn ${timeframe === '24h' ? 'active' : ''}`}
            onClick={() => onChangeTimeframe('24h')}
          >
            Last 24 Hours
          </button>
          <button
            className={`timeframe-btn ${timeframe === '7d' ? 'active' : ''}`}
            onClick={() => onChangeTimeframe('7d')}
          >
            7 Days
          </button>
          <button
            className={`timeframe-btn ${timeframe === '30d' ? 'active' : ''}`}
            onClick={() => onChangeTimeframe('30d')}
          >
            30 Days
          </button>
        </div>
      </div>

      {/* Grid of 5 Time-series Charts */}
      <div className="charts-grid">
        {/* 1. Rainfall */}
        {renderChart(
          'Rainfall Intensity',
          <CloudRain size={16} color="#0284c7" />,
          'rainfallMm',
          'mm',
          '#0284c7',
          'grad-rain',
          '#0284c7',
          65.0,
          'Critical Saturation (65mm)'
        )}

        {/* 2. Soil Moisture */}
        {renderChart(
          'Soil Moisture Content',
          <Droplets size={16} color="#0d9488" />,
          'soilMoisturePercent',
          '%',
          '#0d9488',
          'grad-moist',
          '#0d9488',
          80.0,
          'Liquefaction Limit (80%)'
        )}

        {/* 3. Ground Movement */}
        {renderChart(
          'Ground Displacement & Creep',
          <Activity size={16} color="#e11d48" />,
          'groundMovementMm',
          'mm',
          '#e11d48',
          'grad-move',
          '#e11d48',
          4.0,
          'Warning Creep Rate (>4mm)'
        )}

        {/* 4. Acoustic Activity */}
        {renderChart(
          'Acoustic Emission Level',
          <Volume2 size={16} color="#8b5cf6" />,
          'acousticDb',
          'dB',
          '#8b5cf6',
          'grad-sound',
          '#8b5cf6',
          75.0,
          'Rumble / Shear Threshold (75dB)'
        )}

        {/* 5. Predicted Risk Score */}
        <div style={{ gridColumn: '1 / -1' }}>
          {renderChart(
            'Landslide Risk Probability Evolution',
            <TrendingUp size={16} color="#ea580c" />,
            'predictedRiskScore',
            '%',
            '#ea580c',
            'grad-risk',
            '#ea580c',
            70.0,
            'High Hazard Threshold (70%)'
          )}
        </div>
      </div>
    </section>
  );
};
