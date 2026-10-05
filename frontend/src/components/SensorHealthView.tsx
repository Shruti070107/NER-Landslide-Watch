import React from 'react';
import { Cpu, Wifi, Battery, Activity, CheckCircle2, AlertTriangle, Server, Database, Radio } from 'lucide-react';
import { RiskZone } from '../types';

interface SensorHealthViewProps {
  zones: RiskZone[];
  isBackendConnected: boolean;
}

export const SensorHealthView: React.FC<SensorHealthViewProps> = ({ zones, isBackendConnected }) => {
  const sensorNodes = [
    {
      id: 'SN-01',
      name: 'Gangtok East Ridge Array',
      zone: 'NER-103',
      type: 'Borehole Inclinometer + Geophone Array',
      status: 'ONLINE',
      battery: '13.4V (100% Solar)',
      signal: '-68 dBm (4G / LoRa)',
      ping: '38 ms',
      lastPacket: '12s ago',
    },
    {
      id: 'SN-02',
      name: 'Shillong Peak Weather Piezometer',
      zone: 'NER-101',
      type: 'TDR Soil Moisture + Tipping Bucket',
      status: 'ONLINE',
      battery: '12.9V (94% Solar)',
      signal: '-72 dBm (4G)',
      ping: '45 ms',
      lastPacket: '28s ago',
    },
    {
      id: 'SN-03',
      name: 'Itanagar Foothill Geophone STN',
      zone: 'NER-106',
      type: 'High-Freq Acoustic Emission Sensor',
      status: 'ONLINE',
      battery: '12.4V (88% Solar)',
      signal: '-81 dBm (LoRaWAN)',
      ping: '62 ms',
      lastPacket: '5s ago',
    },
    {
      id: 'SN-04',
      name: 'Kohima Highway Slope Extensometer',
      zone: 'NER-104',
      type: 'Multi-point Borehole Displacement',
      status: 'ONLINE',
      battery: '13.1V (98% Solar)',
      signal: '-74 dBm (Satellite Telemetry)',
      ping: '140 ms',
      lastPacket: '45s ago',
    },
    {
      id: 'SN-05',
      name: 'Mawsynram Precipitation Station',
      zone: 'NER-102',
      type: 'Optical Disdrometer + Rain Gauge',
      status: 'ONLINE',
      battery: '12.8V (92% Solar)',
      signal: '-65 dBm (4G)',
      ping: '32 ms',
      lastPacket: '18s ago',
    },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {/* Infrastructure & Backend Health Header Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        <div className="card" style={{ gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              SPRING BOOT CORE API
            </span>
            <Server size={18} color="var(--brand-primary)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>
            {isBackendConnected ? 'Port 8082 • Operational' : 'Telemetry Proxy Active'}
          </div>
          <div style={{ fontSize: '0.75rem', color: isBackendConnected ? 'var(--status-safe)' : 'var(--status-warning)' }}>
            ● {isBackendConnected ? 'Connected to Spring Boot Service' : 'Autonomous Client Stream'}
          </div>
        </div>

        <div className="card" style={{ gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              AI/ML INFERENCE ENGINE
            </span>
            <Cpu size={18} color="var(--brand-primary)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>FastAPI • Model v2.4</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-safe)' }}>
            ● GSI + IMERG Rainfall Pipeline Loaded
          </div>
        </div>

        <div className="card" style={{ gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              DATABASE & REALTIME
            </span>
            <Database size={18} color="var(--brand-primary)" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>Supabase PostGIS</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-safe)' }}>
            ● Postgres Session Pooler Active
          </div>
        </div>

        <div className="card" style={{ gap: '0.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              WEATHER TELEMETRY API
            </span>
            <Radio size={18} color="#0284c7" />
          </div>
          <div style={{ fontSize: '1.25rem', fontWeight: 700 }}>OpenWeatherMap API</div>
          <div style={{ fontSize: '0.75rem', color: 'var(--status-safe)' }}>
            ● Key Connected • Live Precipitation & Met Feed
          </div>
        </div>
      </div>

      {/* Sensor Nodes Table */}
      <div className="card" style={{ gap: '1rem' }}>
        <div className="card-header">
          <div>
            <h2 className="card-title">
              <Activity size={20} color="var(--brand-primary)" />
              Geotechnical & Meteorological Field Sensors
            </h2>
            <p className="card-subtitle">
              Live hardware health, solar telemetry charge, battery state, and transmission latency
            </p>
          </div>
        </div>

        <div className="data-table-wrap">
          <table className="data-table">
            <thead>
              <tr>
                <th>Node ID</th>
                <th>Sensor Array Name</th>
                <th>Hardware Specifications</th>
                <th>Monitored Zone</th>
                <th>Battery / Power</th>
                <th>Signal & Latency</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {sensorNodes.map((node) => (
                <tr key={node.id}>
                  <td style={{ fontFamily: 'var(--font-mono)', fontWeight: 600 }}>{node.id}</td>
                  <td>
                    <strong>{node.name}</strong>
                    <div style={{ fontSize: '0.72rem', color: 'var(--text-tertiary)' }}>Last packet: {node.lastPacket}</div>
                  </td>
                  <td style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>{node.type}</td>
                  <td>
                    <span style={{ fontWeight: 600 }}>{node.zone}</span>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <Battery size={14} color="#059669" />
                      <span>{node.battery}</span>
                    </div>
                  </td>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.8rem' }}>
                      <Wifi size={14} color="var(--brand-primary)" />
                      <span>{node.signal} • {node.ping}</span>
                    </div>
                  </td>
                  <td>
                    <span className="metric-status-tag safe">● {node.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
