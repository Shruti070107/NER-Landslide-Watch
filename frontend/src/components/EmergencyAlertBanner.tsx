import React from 'react';
import { AlertOctagon, CheckCircle2, ShieldAlert, ArrowRight, BellOff, Volume2 } from 'lucide-react';
import { Alert } from '../types';
import { emergencyAudio } from '../utils/emergencyAudio';

interface EmergencyAlertBannerProps {
  alerts: Alert[];
  onAcknowledge: (id: string) => void;
  onResolve: (id: string) => void;
  onOpenSos: () => void;
}

export const EmergencyAlertBanner: React.FC<EmergencyAlertBannerProps> = ({
  alerts,
  onAcknowledge,
  onResolve,
  onOpenSos,
}) => {
  const criticalOrHighAlerts = alerts.filter(
    (a) => a.status === 'ACTIVE' && (a.severity === 'CRITICAL' || a.severity === 'HIGH')
  );

  if (criticalOrHighAlerts.length === 0) {
    return null;
  }

  const primaryAlert = criticalOrHighAlerts[0];
  const isCritical = primaryAlert.severity === 'CRITICAL';

  return (
    <div
      className="emergency-banner"
      style={{
        backgroundColor: isCritical ? 'var(--status-critical-bg)' : 'var(--status-high-bg)',
        borderColor: isCritical ? 'var(--status-critical-border)' : 'var(--status-high-border)',
        borderLeftColor: isCritical ? 'var(--status-critical)' : 'var(--status-high)',
      }}
      role="alert"
    >
      <div className="emergency-banner-content">
        <div className="emergency-icon-wrap" style={{ color: isCritical ? 'var(--status-critical)' : 'var(--status-high)' }}>
          <AlertOctagon size={28} />
        </div>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
            <span
              className={`metric-status-tag ${isCritical ? 'critical' : 'high'}`}
              style={{ fontSize: '0.72rem' }}
            >
              ● {primaryAlert.severity} EARLY WARNING
            </span>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-tertiary)' }}>
              Target Sector: <strong>{primaryAlert.zoneName}</strong> ({primaryAlert.zoneCode})
            </span>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
              Radius: {primaryAlert.affectedRadius} km
            </span>
          </div>

          <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: '0.25rem 0', color: isCritical ? 'var(--status-critical-text)' : 'var(--status-high-text)' }}>
            {primaryAlert.title}
          </h3>

          <p style={{ fontSize: '0.85rem', color: 'var(--text-primary)', maxWidth: '850px' }}>
            {primaryAlert.message}
          </p>

          <div style={{ marginTop: '0.45rem', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            <strong>Recommended Action:</strong> Avoid highway transit in steep cuts; relocate temporary settlements to designated high ground shelters; local NDRF/SDRF teams placed on active standby.
          </div>
        </div>
      </div>

      <div className="emergency-actions-row">
        <button
          className="btn-outline"
          onClick={() => onAcknowledge(primaryAlert.id)}
          title="Acknowledge Alert"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
        >
          <BellOff size={14} />
          <span>Acknowledge</span>
        </button>

        <button
          className="btn-outline"
          onClick={() => onResolve(primaryAlert.id)}
          title="Mark Alert Resolved"
          style={{ fontSize: '0.8rem', padding: '0.45rem 0.75rem' }}
        >
          <CheckCircle2 size={14} color="#059669" />
          <span>Mark Resolved</span>
        </button>

        <button
          className="btn-sos"
          onClick={() => {
            emergencyAudio.playSosAlarm(15);
            onOpenSos();
          }}
          style={{ fontSize: '0.82rem', padding: '0.45rem 0.9rem' }}
          title="Sound Emergency Evacuation Siren and Open Distress Dispatch"
        >
          <span>SOS Emergency Action</span>
        </button>
      </div>
    </div>
  );
};
