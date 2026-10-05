import React, { useState } from 'react';
import { Cpu, Zap, AlertTriangle, Layers, Calendar, Play, CheckCircle2, Sliders } from 'lucide-react';
import { MlPredictionResult, RiskZone } from '../types';
import { queryMlRiskPrediction } from '../services/api';

interface MlPredictionPanelProps {
  prediction: MlPredictionResult | null;
  isLoading: boolean;
  selectedZone: RiskZone | null;
  onNewPrediction?: (pred: MlPredictionResult) => void;
}

export const MlPredictionPanel: React.FC<MlPredictionPanelProps> = ({
  prediction,
  isLoading,
  selectedZone,
  onNewPrediction,
}) => {
  const [isSimulating, setIsSimulating] = useState(false);
  const [customLat, setCustomLat] = useState(selectedZone?.latitude || 25.5788);
  const [customLng, setCustomLng] = useState(selectedZone?.longitude || 91.8933);
  const [customDate, setCustomDate] = useState(new Date().toISOString().split('T')[0]);
  const [simError, setSimError] = useState<string | null>(null);

  const handleRunInference = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSimulating(true);
    setSimError(null);

    try {
      const res = await queryMlRiskPrediction(customLat, customLng, customDate);
      if (res.data) {
        onNewPrediction?.(res.data);
      }
    } catch (err: any) {
      setSimError(err.message || 'Inference call failed');
    } finally {
      setIsSimulating(false);
    }
  };

  if (isLoading || !prediction) {
    return (
      <div className="card">
        <div className="skeleton" style={{ height: '240px' }} />
      </div>
    );
  }

  const isHighOrCrit = prediction.riskLevel === 'HIGH' || prediction.riskLevel === 'CRITICAL';
  const scorePercent = Math.round(prediction.riskProbability * 100);

  return (
    <section aria-label="Machine Learning Risk Prediction" className="card">
      <div className="card-header">
        <div>
          <h2 className="card-title">
            <Cpu size={20} color="var(--brand-primary)" />
            AI/ML Early-Warning Risk Prediction
          </h2>
          <p className="card-subtitle">
            Trained Random Forest / XGBoost ensemble grounded in GSI landslide inventories & IMERG precipitation
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span className="metric-status-tag safe" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            <Zap size={12} /> Model Active (v2.4-Production)
          </span>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
            Updated {new Date(prediction.timestamp).toLocaleTimeString()}
          </span>
        </div>
      </div>

      <div className="ml-prediction-grid">
        {/* Risk Probability Score Gauge */}
        <div className="ml-score-block">
          <div
            className="ml-gauge-circle"
            style={{
              background: `conic-gradient(${
                isHighOrCrit ? '#ea580c' : '#059669'
              } ${scorePercent * 3.6}deg, #e2e8f0 0deg)`,
            }}
          >
            <div
              style={{
                width: '96px',
                height: '96px',
                borderRadius: '50%',
                backgroundColor: 'var(--bg-card)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: 'inset 0 1px 3px rgba(0,0,0,0.08)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: '1.75rem',
                  fontWeight: 800,
                  color: isHighOrCrit ? 'var(--status-critical)' : 'var(--status-safe)',
                  lineHeight: 1,
                }}
              >
                {scorePercent}%
              </span>
              <span style={{ fontSize: '0.68rem', color: 'var(--text-tertiary)', textTransform: 'uppercase', marginTop: '2px' }}>
                Probability
              </span>
            </div>
          </div>

          <div>
            <div style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              Class: {prediction.riskLevel}
            </div>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
              Confidence Rating: <strong>{Math.round(prediction.confidence * 100)}%</strong>
            </div>
          </div>

          <div
            style={{
              fontSize: '0.75rem',
              padding: '0.35rem 0.65rem',
              borderRadius: 'var(--radius-sm)',
              backgroundColor: isHighOrCrit ? 'var(--status-high-bg)' : 'var(--status-safe-bg)',
              color: isHighOrCrit ? 'var(--status-high-text)' : 'var(--status-safe-text)',
              border: `1px solid ${isHighOrCrit ? 'var(--status-high-border)' : 'var(--status-safe-border)'}`,
              width: '100%',
            }}
          >
            {isHighOrCrit
              ? 'High Likelihood of Slope Shear Disruption'
              : 'Slope Condition Geotechnically Stable'}
          </div>
        </div>

        {/* Contributing Factors Breakdown */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.2rem' }}>
              Principal Geological & Hydrological Contributors
            </h3>
            <p style={{ fontSize: '0.78rem', color: 'var(--text-tertiary)' }}>
              SHAP feature importance ranking evaluated against historical rainfall and topography:
            </p>
          </div>

          <div className="factors-list">
            {prediction.topFactors.map((factor, idx) => {
              const pct = Math.round(factor.weight * 100);
              return (
                <div key={idx} className="factor-item">
                  <div className="factor-header">
                    <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: idx === 0 ? '#ea580c' : '#0284c7',
                        }}
                      />
                      {factor.factor}
                    </span>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                      {pct}% Impact
                    </span>
                  </div>
                  <div className="factor-bar-bg">
                    <div
                      className="factor-bar-fill"
                      style={{
                        width: `${pct}%`,
                        backgroundColor: idx === 0 ? '#ea580c' : idx === 1 ? '#0284c7' : '#0d9488',
                      }}
                    />
                  </div>
                  {factor.description && (
                    <span style={{ fontSize: '0.72rem', color: 'var(--text-muted)' }}>
                      {factor.description}
                    </span>
                  )}
                </div>
              );
            })}
          </div>

          {/* Interactive ML Inference Sandbox Trigger */}
          <div
            style={{
              padding: '0.85rem',
              backgroundColor: 'var(--bg-surface)',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-subtle)',
              display: 'flex',
              flexWrap: 'wrap',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '0.75rem',
              marginTop: '0.5rem',
            }}
          >
            <div>
              <strong style={{ fontSize: '0.85rem' }}>Real-time ML Model Query Seam</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)' }}>
                Targeting: {selectedZone ? `${selectedZone.name} (${selectedZone.latitude.toFixed(4)}, ${selectedZone.longitude.toFixed(4)})` : 'NER Regional Grid'}
              </div>
            </div>

            <form onSubmit={handleRunInference} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input
                type="date"
                value={customDate}
                onChange={(e) => setCustomDate(e.target.value)}
                style={{
                  padding: '0.35rem 0.5rem',
                  borderRadius: 'var(--radius-sm)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.8rem',
                  backgroundColor: 'var(--bg-card)',
                }}
              />
              <button
                type="submit"
                disabled={isSimulating}
                className="btn-primary"
                style={{ fontSize: '0.8rem', padding: '0.4rem 0.85rem' }}
              >
                <Play size={14} />
                <span>{isSimulating ? 'Calculating...' : 'Run Live Inference'}</span>
              </button>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
