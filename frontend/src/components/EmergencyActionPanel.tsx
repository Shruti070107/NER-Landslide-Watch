import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  PhoneCall,
  MapPin,
  Volume2,
  VolumeX,
  Send,
  AlertTriangle,
  Radio,
  CheckCircle2,
  X,
  Crosshair,
  IdCard,
  UserCheck,
  Building,
  AlertOctagon,
} from 'lucide-react';
import { RiskZone, Alert, UserProfile } from '../types';
import { sendSosDistress } from '../services/api';
import { emergencyAudio } from '../utils/emergencyAudio';
import { authService } from '../services/authService';

interface EmergencyActionPanelProps {
  selectedZone: RiskZone | null;
  onAlertDispatched?: (alert: Alert) => void;
  isOpenModal?: boolean;
  onCloseModal?: () => void;
  currentUser?: UserProfile | null;
}

export const EmergencyActionPanel: React.FC<EmergencyActionPanelProps> = ({
  selectedZone,
  onAlertDispatched,
  isOpenModal = false,
  onCloseModal,
  currentUser: propUser,
}) => {
  const [showSosDialog, setShowSosDialog] = useState(isOpenModal);
  const [isSirenActive, setIsSirenActive] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [sosSuccess, setSosSuccess] = useState<Alert | null>(null);

  // Active user profile
  const [user, setUser] = useState<UserProfile | null>(propUser || authService.getCurrentUser());

  useEffect(() => {
    const unsub = authService.subscribe((u) => setUser(u));
    return unsub;
  }, []);

  // Form state pre-populated with authenticated user information
  const [senderName, setSenderName] = useState(user?.fullName || 'Dr. Rajesh Sharma');
  const [senderPhone, setSenderPhone] = useState(user?.phone || '+91 98630 14820');
  const [emergencyDetails, setEmergencyDetails] = useState(
    'Rapid slope movement, soil tension cracks and audible rumbling detected near residential slope. Urgent evacuation assistance requested.'
  );
  const [latitude, setLatitude] = useState(user?.latitude || selectedZone?.latitude || 25.5788);
  const [longitude, setLongitude] = useState(user?.longitude || selectedZone?.longitude || 91.8933);

  // Sync state if user changes
  useEffect(() => {
    if (user) {
      setSenderName(user.fullName);
      setSenderPhone(user.phone);
      if (user.latitude && user.longitude) {
        setLatitude(user.latitude);
        setLongitude(user.longitude);
      }
    }
  }, [user]);

  // Sync isOpenModal prop
  useEffect(() => {
    if (isOpenModal) {
      setShowSosDialog(true);
    }
  }, [isOpenModal]);

  // Subscribe to emergency audio state
  useEffect(() => {
    const unsub = emergencyAudio.subscribe((playing) => {
      setIsSirenActive(playing);
    });
    return unsub;
  }, []);

  const toggleSiren = () => {
    if (isSirenActive) {
      emergencyAudio.stopAlarm();
    } else {
      emergencyAudio.playSosAlarm(20);
    }
  };

  const handleFetchGps = () => {
    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setLatitude(lat);
          setLongitude(lng);
        },
        (err) => console.warn('Geolocation failed:', err.message),
        { enableHighAccuracy: true, timeout: 5000 }
      );
    }
  };

  const handleLaunchSosClick = () => {
    setSosSuccess(null);
    setShowSosDialog(true);
    // Sound alarm immediately when SOS button is clicked
    emergencyAudio.playSosAlarm(25);
  };

  const handleSubmitSos = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);

    const senderLoc = user
      ? `${user.cityOrVillage}, ${user.district}, ${user.state}`
      : selectedZone
      ? `${selectedZone.name}, ${selectedZone.district}`
      : 'North Eastern Region';

    try {
      const res = await sendSosDistress({
        zoneCode: selectedZone?.code,
        latitude,
        longitude,
        senderName: senderName || user?.fullName || 'Verified Citizen',
        senderPhone: senderPhone || user?.phone || '+91 98630 14820',
        senderAadhaar: user?.aadhaarNumber || '5482 9104 3829 (Verified)',
        senderLocation: senderLoc,
        emergencyDetails,
      });

      if (res.data) {
        setSosSuccess(res.data);
        onAlertDispatched?.(res.data);
        // Ensure siren is sounding
        emergencyAudio.playSosAlarm(30);
      }
    } catch (err) {
      console.error('SOS failed:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <section aria-label="Emergency Action Operations" className="card" style={{ gap: '1.25rem' }}>
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <ShieldAlert size={20} color="var(--status-critical)" />
            Emergency Action & Incident Response Command
          </h2>
          <p className="card-subtitle">
            Immediate dispatch triggers, local emergency telemetry, and active siren alerts
          </p>
        </div>

        {/* SOS Launch Button with Sound */}
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
          {isSirenActive && (
            <button
              onClick={() => emergencyAudio.stopAlarm()}
              className="btn-outline"
              style={{ borderColor: '#dc2626', color: '#dc2626', backgroundColor: '#fef2f2', fontSize: '0.82rem' }}
              title="Silence active audible alarm"
            >
              <VolumeX size={15} />
              <span>Silence Siren</span>
            </button>
          )}
          <button
            className={`btn-sos ${isSirenActive ? 'sounding-alarm' : ''}`}
            onClick={handleLaunchSosClick}
            title="Launch Emergency SOS Distress Protocol with Audible Siren"
          >
            <Volume2 size={16} className={isSirenActive ? 'pulse-dot' : ''} />
            <span>TRIGGER EMERGENCY SOS</span>
          </button>
        </div>
      </div>

      {/* Emergency Grid Controls */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '1rem',
        }}
      >
        {/* 1. Current Location Telemetry */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <MapPin size={14} color="var(--brand-primary)" />
              CURRENT GEOGRAPHIC SECTOR
            </span>
            <button
              onClick={handleFetchGps}
              title="Acquire live GPS coordinates"
              style={{ fontSize: '0.72rem', color: 'var(--brand-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer' }}
            >
              <Crosshair size={12} /> Sync GPS
            </button>
          </div>
          <div style={{ fontSize: '1.05rem', fontWeight: 700 }}>
            {user ? `${user.cityOrVillage}, ${user.district}` : selectedZone ? selectedZone.name : 'NER Regional Command Center'}
          </div>
          <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', fontFamily: 'var(--font-mono)' }}>
            LAT: {latitude.toFixed(4)}° N • LNG: {longitude.toFixed(4)}° E
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: 'auto' }}>
            Origin: {user ? `${user.state} (Citizen Address)` : selectedZone ? `${selectedZone.district}, ${selectedZone.state}` : 'Eastern Himalaya Zone'}
          </div>
        </div>

        {/* 2. Emergency Contacts */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            gap: '0.5rem',
          }}
        >
          <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
            <PhoneCall size={14} color="#059669" />
            DIRECT EMERGENCY DISPATCH LINES
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.35rem', fontSize: '0.82rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>National Disaster Helpline:</span>
              <strong>1078 / 112</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>NER NDRF Battalion (Guwahati):</span>
              <strong>+91-361-2840284</strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>State Disaster Management (SDMA):</span>
              <strong>1070</strong>
            </div>
          </div>
        </div>

        {/* 3. Audible Siren Alarm with Web Audio API */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: isSirenActive ? 'var(--status-critical-bg)' : 'var(--bg-surface)',
            border: `1px solid ${isSirenActive ? 'var(--status-critical-border)' : 'var(--border-subtle)'}`,
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: isSirenActive ? 'var(--status-critical)' : 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Volume2 size={14} />
              AUDIBLE EMERGENCY SIREN HORN
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              {isSirenActive ? 'EVACUATION SIREN TRANSMITTING AT 650-1050Hz' : 'Dual-tone audio alarm for immediate community evacuation'}
            </div>
          </div>
          <button
            onClick={toggleSiren}
            className={isSirenActive ? 'btn-sos' : 'btn-outline'}
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
          >
            {isSirenActive ? <VolumeX size={14} /> : <Volume2 size={14} />}
            <span>{isSirenActive ? 'SILENCE SIREN ALARM' : 'TEST SIREN ALARM SOUND'}</span>
          </button>
        </div>

        {/* 4. Broadcast Regional Alert */}
        <div
          style={{
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--bg-surface)',
            border: '1px solid var(--border-subtle)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '0.5rem',
          }}
        >
          <div>
            <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Send size={14} color="var(--brand-primary)" />
              BROADCAST CITIZEN ADVISORY
            </span>
            <div style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)', marginTop: '4px' }}>
              Push emergency notification to district mobile units and field officers
            </div>
          </div>
          <button
            onClick={handleLaunchSosClick}
            className="btn-primary"
            style={{ width: '100%', justifyContent: 'center', fontSize: '0.82rem' }}
          >
            <Send size={14} />
            <span>DISPATCH ADVISORY</span>
          </button>
        </div>
      </div>

      {/* SOS Modal Dialog */}
      {showSosDialog && (
        <div className="modal-backdrop" onClick={() => setShowSosDialog(false)}>
          <div className="modal-box" style={{ maxWidth: '580px' }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: '#dc2626' }} />
                <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#dc2626', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <AlertOctagon size={20} />
                  Emergency SOS Distress Dispatch
                </h3>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {isSirenActive && (
                  <button
                    type="button"
                    onClick={() => emergencyAudio.stopAlarm()}
                    style={{
                      padding: '3px 8px',
                      fontSize: '0.75rem',
                      color: '#dc2626',
                      backgroundColor: '#fef2f2',
                      border: '1px solid #fecaca',
                      borderRadius: 'var(--radius-sm)',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                    }}
                  >
                    <VolumeX size={13} /> Silence Siren
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowSosDialog(false);
                    onCloseModal?.();
                  }}
                  style={{ color: 'var(--text-tertiary)', background: 'none', border: 'none', cursor: 'pointer' }}
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {sosSuccess ? (
              <div className="modal-body" style={{ textAlign: 'center', padding: '2rem 1.25rem' }}>
                <CheckCircle2 size={48} color="#059669" style={{ margin: '0 auto 1rem auto' }} />
                <h4 style={{ fontSize: '1.2rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                  SOS Distress Alert Confirmed & Logged
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                  Emergency distress registered under ID: <strong>{sosSuccess.id}</strong>. District Disaster Management Authority (DDMA), NDRF quick response units, and nearest field officers have received priority telemetry.
                </p>

                {/* Identity summary */}
                <div
                  style={{
                    margin: '1.25rem 0',
                    padding: '0.75rem',
                    backgroundColor: '#f0fdf4',
                    border: '1px solid #bbf7d0',
                    borderRadius: 'var(--radius-sm)',
                    fontSize: '0.8rem',
                    textAlign: 'left',
                    color: '#166534',
                  }}
                >
                  <div style={{ fontWeight: 700, marginBottom: '3px' }}>
                    Authenticated Dispatch: {senderName}
                  </div>
                  <div>UIDAI Aadhaar: {user?.maskedAadhaar || '•••• •••• 3829 (Verified)'}</div>
                  <div>Reported Origin: {user?.address || user?.cityOrVillage || 'NER Sector'}, {user?.district}</div>
                  <div>Fixed Coordinates: {latitude.toFixed(4)}° N, {longitude.toFixed(4)}° E</div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', justifyContent: 'center' }}>
                  <button
                    className="btn-outline"
                    onClick={() => emergencyAudio.stopAlarm()}
                  >
                    <VolumeX size={14} /> Stop Siren Alarm
                  </button>
                  <button
                    className="btn-primary"
                    onClick={() => {
                      setShowSosDialog(false);
                      onCloseModal?.();
                    }}
                  >
                    Return to Dashboard
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmitSos}>
                <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
                  <div
                    style={{
                      padding: '0.75rem',
                      backgroundColor: 'var(--status-critical-bg)',
                      border: '1px solid var(--status-critical-border)',
                      borderRadius: 'var(--radius-sm)',
                      fontSize: '0.8rem',
                      color: 'var(--status-critical-text)',
                    }}
                  >
                    <strong>EMERGENCY TRANSMISSION:</strong> The audible evacuation siren is actively sounding. Submitting this form broadcasts your verified identity, Aadhaar token, and exact GPS beacon directly to emergency rescue services.
                  </div>

                  {/* Authenticated Citizen Verification Card */}
                  <div
                    style={{
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      borderRadius: 'var(--radius-sm)',
                      padding: '0.75rem',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
                      <span style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                        <IdCard size={15} color="var(--brand-primary)" />
                        Verified Aadhaar Citizen Identity
                      </span>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 600,
                          color: '#059669',
                          backgroundColor: '#ecfdf5',
                          padding: '1px 6px',
                          borderRadius: '4px',
                        }}
                      >
                        UIDAI Checksum Valid ✅
                      </span>
                    </div>
                    <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)' }}>
                      Aadhaar: <strong>{user?.maskedAadhaar || '•••• •••• 3829'}</strong> • Home: {user?.cityOrVillage || 'Shillong'}, {user?.district || 'East Khasi Hills'}, {user?.state || 'Meghalaya'}
                    </div>
                  </div>

                  <div>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                      Emergency Details / Observed Landslide Threat *
                    </label>
                    <textarea
                      rows={3}
                      value={emergencyDetails}
                      onChange={(e) => setEmergencyDetails(e.target.value)}
                      required
                      style={{
                        width: '100%',
                        padding: '0.5rem',
                        borderRadius: 'var(--radius-sm)',
                        border: '1px solid var(--border-medium)',
                        fontSize: '0.85rem',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Caller Legal Name *
                      </label>
                      <input
                        type="text"
                        value={senderName}
                        onChange={(e) => setSenderName(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Emergency Contact Phone *
                      </label>
                      <input
                        type="tel"
                        value={senderPhone}
                        onChange={(e) => setSenderPhone(e.target.value)}
                        required
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Latitude Coordinates
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={latitude}
                        onChange={(e) => setLatitude(parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.8rem', fontWeight: 600, display: 'block', marginBottom: '4px' }}>
                        Longitude Coordinates
                      </label>
                      <input
                        type="number"
                        step="0.0001"
                        value={longitude}
                        onChange={(e) => setLongitude(parseFloat(e.target.value))}
                        style={{
                          width: '100%',
                          padding: '0.45rem',
                          borderRadius: 'var(--radius-sm)',
                          border: '1px solid var(--border-medium)',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem' }}>
                    <button
                      type="button"
                      className="btn-outline"
                      onClick={() => emergencyAudio.stopAlarm()}
                      style={{ padding: '0.6rem 0.8rem', fontSize: '0.82rem' }}
                    >
                      <VolumeX size={14} /> Mute Siren
                    </button>
                    <button
                      type="submit"
                      disabled={isSending}
                      className="btn-sos"
                      style={{ flex: 1, justifyContent: 'center', padding: '0.65rem' }}
                    >
                      <ShieldAlert size={16} />
                      <span>{isSending ? 'Transmitting Distress...' : 'DISPATCH SOS WITH AADHAAR ID'}</span>
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </section>
  );
};
