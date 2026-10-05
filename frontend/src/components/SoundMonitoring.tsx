import React, { useEffect, useRef, useState } from 'react';
import { Volume2, Radio, Activity, CheckCircle2, AlertOctagon, VolumeX, ShieldAlert } from 'lucide-react';
import { AcousticDetection } from '../types';

interface SoundMonitoringProps {
  acousticData: AcousticDetection | null;
  isLoading: boolean;
  onRefresh?: () => void;
}

export const SoundMonitoring: React.FC<SoundMonitoringProps> = ({
  acousticData,
  isLoading,
  onRefresh,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const [isPlayingAudio, setIsPlayingAudio] = useState(false);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Live Canvas Waveform & Frequency Visualizer
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let phase = 0;
    const intensity = acousticData ? acousticData.soundIntensityDb / 100 : 0.4;
    const isCritical = acousticData?.acousticLevel === 'CRITICAL';
    const isHigh = acousticData?.acousticLevel === 'HIGH';

    const render = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Background subtle grid
      ctx.strokeStyle = '#1e293b';
      ctx.lineWidth = 1;
      for (let x = 0; x < canvas.width; x += 40) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, canvas.height);
        ctx.stroke();
      }

      // Center baseline
      const centerY = canvas.height / 2;
      ctx.strokeStyle = '#334155';
      ctx.beginPath();
      ctx.moveTo(0, centerY);
      ctx.lineTo(canvas.width, centerY);
      ctx.stroke();

      // Render Oscillogram Waveform
      ctx.beginPath();
      const waveColor = isCritical ? '#ef4444' : isHigh ? '#f97316' : '#38bdf8';
      ctx.strokeStyle = waveColor;
      ctx.lineWidth = 2.2;
      ctx.shadowColor = waveColor;
      ctx.shadowBlur = 8;

      const bars = 64;
      const barWidth = canvas.width / bars;

      for (let i = 0; i < canvas.width; i += 3) {
        const normalizedX = i / canvas.width;
        // Combine harmonic sines with pseudo-random geophone micro-jitter
        const wave1 = Math.sin(normalizedX * 12 + phase) * 28 * intensity;
        const wave2 = Math.sin(normalizedX * 36 - phase * 1.5) * 12 * intensity;
        const jitter = (Math.random() - 0.5) * 8 * (isHigh || isCritical ? 2.2 : 0.8);
        const y = centerY + wave1 + wave2 + jitter;

        if (i === 0) {
          ctx.moveTo(i, y);
        } else {
          ctx.lineTo(i, y);
        }
      }
      ctx.stroke();
      ctx.shadowBlur = 0;

      // Frequency Spectrum Bar overlay in lower section
      if (acousticData?.frequencySpectrum) {
        const spec = acousticData.frequencySpectrum;
        const colW = canvas.width / spec.length;
        ctx.fillStyle = isCritical ? 'rgba(239, 68, 68, 0.25)' : 'rgba(56, 189, 248, 0.2)';

        spec.forEach((val, idx) => {
          const barH = (val / 100) * 45;
          ctx.fillRect(idx * colW + 2, canvas.height - barH, colW - 4, barH);
        });
      }

      phase += isCritical ? 0.12 : isHigh ? 0.08 : 0.04;
      animationFrameRef.current = requestAnimationFrame(render);
    };

    render();

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [acousticData]);

  // Audio tone test using Web Audio API
  const toggleAudioMonitor = () => {
    if (isPlayingAudio) {
      if (audioContextRef.current) {
        audioContextRef.current.close();
        audioContextRef.current = null;
      }
      setIsPlayingAudio(false);
    } else {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        const ctx = new AudioCtx();
        audioContextRef.current = ctx;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        // Low rumble frequency matching acoustic shear
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(
          acousticData?.acousticLevel === 'CRITICAL' ? 85 : 45,
          ctx.currentTime
        );

        gain.gain.setValueAtTime(0.06, ctx.currentTime);

        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();

        setIsPlayingAudio(true);
      } catch (err) {
        console.warn('Audio monitor error:', err);
      }
    }
  };

  if (isLoading || !acousticData) {
    return (
      <div className="card">
        <div className="skeleton" style={{ height: '320px' }} />
      </div>
    );
  }

  const isCritical = acousticData.acousticLevel === 'CRITICAL';
  const isHigh = acousticData.acousticLevel === 'HIGH';
  const isElevated = acousticData.acousticLevel === 'ELEVATED';

  return (
    <section aria-label="Acoustic and Sound Monitoring" className="card sound-monitoring-card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Volume2 size={20} color="var(--brand-primary)" />
            Sub-Surface Acoustic & Sound Emission Monitoring
          </h2>
          <p className="card-subtitle">
            Continuous micro-seismic acoustic geophone stream from sensor station {acousticData.sensorStation}
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <button
            className={`btn-outline ${isPlayingAudio ? 'active' : ''}`}
            onClick={toggleAudioMonitor}
            title="Listen to synthesized low-frequency geophone vibration feed"
            style={{ fontSize: '0.8rem', padding: '0.35rem 0.75rem' }}
          >
            {isPlayingAudio ? <Volume2 size={14} color="#dc2626" /> : <VolumeX size={14} />}
            <span>{isPlayingAudio ? 'Mute Geophone Audio' : 'Audio Stream Monitor'}</span>
          </button>

          <span
            className={`metric-status-tag ${
              isCritical ? 'critical' : isHigh ? 'high' : isElevated ? 'warning' : 'safe'
            }`}
          >
            ● {acousticData.acousticLevel}
          </span>
        </div>
      </div>

      <div className="sound-grid">
        {/* Real-time Oscillogram Canvas */}
        <div className="waveform-box">
          <div className="waveform-header">
            <span style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 600 }}>
              <Radio size={14} color={isCritical ? '#ef4444' : '#38bdf8'} />
              REAL-TIME GEOPHONE OSCILLOGRAM (CH-1 ACOUSTIC)
            </span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.72rem', color: '#64748b' }}>
              SAMPLING: 2400 Hz | 24-BIT ADC
            </span>
          </div>

          <canvas ref={canvasRef} width={640} height={150} className="waveform-canvas" />

          <div className="waveform-stats-bar">
            <span>Peak Amplitude: {Math.round(acousticData.soundIntensityDb)} dB</span>
            <span>Spectral Bandwidth: 10 Hz – 1.2 kHz</span>
            <span>Signal-to-Noise: 34.2 dB</span>
            <span style={{ color: isCritical ? '#ef4444' : isHigh ? '#f97316' : '#10b981', fontWeight: 600 }}>
              {isCritical ? 'EXCESSIVE SHEAR EMISSION' : isHigh ? 'MICRO-CRACK ACTIVITY' : 'AMBIENT BASELINE'}
            </span>
          </div>
        </div>

        {/* Acoustic Detection Metadata Panel */}
        <div className="sound-meta-panel">
          <div className="sound-stat-row">
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Detected Acoustic Event
              </div>
              <strong style={{ fontSize: '0.95rem', color: isCritical || isHigh ? 'var(--status-critical)' : 'var(--text-primary)' }}>
                {acousticData.detectedEvent}
              </strong>
            </div>
            {isCritical || isHigh ? (
              <AlertOctagon size={22} color="var(--status-critical)" />
            ) : (
              <CheckCircle2 size={22} color="var(--status-safe)" />
            )}
          </div>

          <div className="sound-stat-row">
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Detection Confidence
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--brand-primary)' }}>
                {acousticData.confidencePercent}%
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
              ML Acoustic Classifier
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>SIH26-GeoAudio v1.2</div>
            </div>
          </div>

          <div className="sound-stat-row">
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Sound Intensity
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 700, fontFamily: 'var(--font-display)' }}>
                {acousticData.soundIntensityDb.toFixed(1)} <span style={{ fontSize: '0.8rem', fontWeight: 500 }}>dB SPL</span>
              </div>
            </div>
            <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', textAlign: 'right' }}>
              Reference 0 dB = 20 µPa
              <div style={{ fontSize: '0.7rem', color: 'var(--text-muted)' }}>Hydrophone / Geophone array</div>
            </div>
          </div>

          <div className="sound-stat-row">
            <div>
              <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)', textTransform: 'uppercase' }}>
                Sensor Location
              </div>
              <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>
                {acousticData.zoneName} ({acousticData.sensorStation})
              </div>
            </div>
            <div style={{ fontSize: '0.7rem', color: 'var(--text-tertiary)' }}>
              {new Date(acousticData.timestamp).toLocaleTimeString()}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
