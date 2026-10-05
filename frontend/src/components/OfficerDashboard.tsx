import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  MapPin,
  CheckCircle,
  AlertOctagon,
  PhoneCall,
  Users,
  Radio,
  FileText,
  Activity,
  Layers,
  CloudRain,
  Send,
  Eye,
  Truck,
  Volume2,
  Calendar,
  AlertTriangle,
  RefreshCw,
  PhoneIncoming,
  UserCheck,
  LifeBuoy,
} from 'lucide-react';

import {
  GeoTaggedReport,
  RiskZone,
  Alert,
  RoboticCallCampaign,
  LandslidePrediction30Day,
  OpenMeteoForecast,
} from '../types';

import { InteractiveHeatmap } from './InteractiveHeatmap';
import { CustomLocationPredictor } from './CustomLocationPredictor';
import { offlineSyncService } from '../services/offlineSyncService';
import { roboticCallService, CitizenCallResponse } from '../services/roboticCallService';
import { generate30DayPrediction } from '../services/predictiveEngine';
import { fetchOpenMeteoWeather } from '../services/openMeteoService';

interface OfficerDashboardProps {
  zones: RiskZone[];
  selectedZone: RiskZone | null;
  onSelectZone: (code: string) => void;
  activeAlerts: Alert[];
  onDispatchAlert: (alert: Alert) => void;
}

export const OfficerDashboard: React.FC<OfficerDashboardProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  activeAlerts,
  onDispatchAlert,
}) => {
  // Navigation Tabs inside Officer Hub
  const [officerTab, setOfficerTab] = useState<'reports' | 'prediction30d' | 'roboticCalls' | 'gisMap'>('reports');

  // Reports state
  const [reports, setReports] = useState<GeoTaggedReport[]>([]);
  const [selectedReport, setSelectedReport] = useState<GeoTaggedReport | null>(null);

  // Robotic Calls state
  const [campaigns, setCampaigns] = useState<RoboticCallCampaign[]>([]);
  const [citizenResponses, setCitizenResponses] = useState<CitizenCallResponse[]>([]);
  const [callLang, setCallLang] = useState<'assamese' | 'bengali' | 'english' | 'hindi' | 'khasi' | 'mizo' | 'nepali'>('english');
  const [targetHouseholds, setTargetHouseholds] = useState<number>(1850);
  const [callMessage, setCallMessage] = useState<string>('');
  const [dispatchStatusMsg, setDispatchStatusMsg] = useState<string | null>(null);

  // 30-Day Predictive Analytics State
  const [prediction30d, setPrediction30d] = useState<LandslidePrediction30Day | null>(null);
  const [openMeteo, setOpenMeteo] = useState<OpenMeteoForecast | null>(null);
  const [isLoadingPred, setIsLoadingPred] = useState<boolean>(false);

  useEffect(() => {
    const unsubReports = offlineSyncService.subscribe((r) => setReports(r));
    setReports(offlineSyncService.getAllReports());

    const unsubCalls = roboticCallService.subscribe((c) => setCampaigns(c));
    setCampaigns(roboticCallService.getCampaigns());

    const unsubResponses = roboticCallService.subscribeResponses((resp) => setCitizenResponses(resp));
    setCitizenResponses(roboticCallService.getCitizenResponses());

    return () => {
      unsubReports();
      unsubCalls();
      unsubResponses();
    };
  }, []);

  // Fetch Open-Meteo & 30-day prediction when selected zone changes
  useEffect(() => {
    if (selectedZone) {
      setIsLoadingPred(true);
      Promise.all([
        generate30DayPrediction(selectedZone.latitude, selectedZone.longitude, selectedZone),
        fetchOpenMeteoWeather(selectedZone.latitude, selectedZone.longitude),
      ])
        .then(([pred, w]) => {
          setPrediction30d(pred);
          setOpenMeteo(w);
        })
        .finally(() => setIsLoadingPred(false));
    }
  }, [selectedZone]);

  // Handle Verify Field Report
  const handleVerifyReport = (id: string) => {
    const updated = offlineSyncService.updateReport(id, { status: 'VERIFIED' });
    setReports(updated);
  };

  // Handle Dispatch Emergency Team
  const handleDispatchTeam = (id: string) => {
    const updated = offlineSyncService.updateReport(id, { status: 'DISPATCHED' });
    setReports(updated);
  };

  // Dispatch rescue team specifically for a citizen who pressed 2
  const handleDispatchRescueForCitizen = (citizen: CitizenCallResponse) => {
    setDispatchStatusMsg(`Emergency SDRF Rescue Unit dispatched to ${citizen.citizenName} (${citizen.phoneNumber}) at ${citizen.locality}`);
    setTimeout(() => setDispatchStatusMsg(null), 6000);
  };

  // Trigger Robotic Calls to Local Households
  const handleLaunchRoboticCalls = (zoneCode?: string, zoneName?: string) => {
    const targetCode = zoneCode || selectedZone?.code || 'NER-103';
    const targetName = zoneName || selectedZone?.name || 'Gangtok Ridge Corridor';

    roboticCallService.triggerRoboticCallCampaign(targetCode, targetName, callLang, targetHouseholds, callMessage);
    setOfficerTab('roboticCalls');
  };

  return (
    <div className="officer-dashboard-container" style={{ padding: '1.25rem', maxWidth: '1400px', margin: '0 auto' }}>
      {/* 1. Header Command Strip - Forest Green & Earth Brown Palette */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1c2b1a 0%, #15803d 50%, #451a03 100%)',
          color: '#ffffff',
          padding: '1.5rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(28, 43, 26, 0.4)',
          border: '1px solid #78350f',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ padding: '10px', backgroundColor: 'rgba(255, 255, 255, 0.15)', borderRadius: '12px', border: '1px solid #86efac' }}>
              <ShieldAlert size={28} color="#86efac" />
            </div>
            <div>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#ffffff' }}>
                Officer Command Center
              </h1>
              <p style={{ color: '#dcfce7', fontSize: '0.88rem', margin: 0 }}>
                Landslide Gaurd NER - Disaster Response, Live Telephony Feedback & AI Early Warnings
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <select
              value={selectedZone?.code || 'NER-103'}
              onChange={(e) => onSelectZone(e.target.value)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                border: '1px solid #86efac',
                backgroundColor: '#14532d',
                color: '#ffffff',
                fontSize: '0.88rem',
                fontWeight: 600,
                outline: 'none',
              }}
            >
              {zones.map((z) => (
                <option key={z.code} value={z.code}>
                  {z.name} ({z.district}) - Risk: {z.currentRiskLevel}
                </option>
              ))}
            </select>

            <button
              onClick={() => handleLaunchRoboticCalls()}
              style={{
                backgroundColor: '#78350f',
                color: '#ffffff',
                border: '1px solid #fde68a',
                padding: '9px 16px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(120, 53, 15, 0.4)',
              }}
            >
              <PhoneCall size={16} /> <span>Trigger Robotic Voice Calls</span>
            </button>
          </div>
        </div>
      </div>

      {/* 2. Sub-Navigation Tabs inside Officer Command Hub */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          marginBottom: '1.5rem',
          borderBottom: '2px solid #d6e2d3',
          paddingBottom: '8px',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setOfficerTab('reports')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: officerTab === 'reports' ? '#15803d' : '#edf2eb',
            color: officerTab === 'reports' ? '#ffffff' : '#1c2b1a',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <FileText size={16} />
          <span>Received Field Reports ({reports.length})</span>
        </button>

        <button
          onClick={() => setOfficerTab('prediction30d')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: officerTab === 'prediction30d' ? '#15803d' : '#edf2eb',
            color: officerTab === 'prediction30d' ? '#ffffff' : '#1c2b1a',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <CloudRain size={16} />
          <span>30-Day Open-Meteo AI Forecast</span>
        </button>

        <button
          onClick={() => setOfficerTab('roboticCalls')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: officerTab === 'roboticCalls' ? '#78350f' : '#edf2eb',
            color: officerTab === 'roboticCalls' ? '#ffffff' : '#1c2b1a',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <PhoneIncoming size={16} />
          <span>Robotic Calls & Live Citizen Responses ({citizenResponses.length})</span>
        </button>

        <button
          onClick={() => setOfficerTab('gisMap')}
          style={{
            padding: '10px 18px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: officerTab === 'gisMap' ? '#15803d' : '#edf2eb',
            color: officerTab === 'gisMap' ? '#ffffff' : '#1c2b1a',
            fontWeight: 700,
            fontSize: '0.9rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <MapPin size={16} />
          <span>GIS Interactive Heatmap</span>
        </button>
      </div>

      {/* AI Landslide Predictor by Custom Location / Coordinates for Officers */}
      <CustomLocationPredictor />

      {/* Dispatch Status Notification Banner */}
      {dispatchStatusMsg && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff7ed',
            border: '2px solid #f97316',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            color: '#9a3412',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            boxShadow: '0 4px 14px rgba(249, 115, 22, 0.2)',
          }}
        >
          <Truck size={22} color="#ea580c" />
          <span>{dispatchStatusMsg}</span>
        </div>
      )}

      {/* VIEW 1: RECEIVED GEOTAGGED CITIZEN FIELD REPORTS */}
      {officerTab === 'reports' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))', gap: '1.5rem' }}>
          {/* Left Table / List of Reports */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #d6e2d3',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1c2b1a' }}>
                Incoming Public GeoTagged Field Photos
              </h2>
              <span style={{ fontSize: '0.8rem', color: '#5d735a' }}>Showing {reports.length} reports</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', maxHeight: '650px', overflowY: 'auto' }}>
              {reports.map((r) => (
                <div
                  key={r.id}
                  onClick={() => setSelectedReport(r)}
                  style={{
                    padding: '12px',
                    borderRadius: '12px',
                    backgroundColor: selectedReport?.id === r.id ? '#f0fdf4' : '#f4f7f2',
                    border: `1.5px solid ${selectedReport?.id === r.id ? '#15803d' : '#d6e2d3'}`,
                    cursor: 'pointer',
                    display: 'flex',
                    gap: '12px',
                  }}
                >
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    style={{ width: '70px', height: '70px', objectFit: 'cover', borderRadius: '8px' }}
                  />

                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <strong style={{ fontSize: '0.88rem', color: '#1c2b1a' }}>{r.title}</strong>
                      <span
                        style={{
                          fontSize: '0.7rem',
                          fontWeight: 700,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          backgroundColor: r.severity === 'CRITICAL' ? '#fef2f2' : '#fef3c7',
                          color: r.severity === 'CRITICAL' ? '#dc2626' : '#78350f',
                        }}
                      >
                        {r.severity}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.78rem', color: '#3f523c', margin: '4px 0' }}>
                      {r.locationName} ({r.district})
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px' }}>
                      <span style={{ fontSize: '0.72rem', color: '#5d735a' }}>
                        {new Date(r.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          color: r.status === 'VERIFIED' ? '#15803d' : r.status === 'DISPATCHED' ? '#78350f' : '#b45309',
                        }}
                      >
                        {r.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Selected Report Detail Inspector & Officer Actions */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #d6e2d3',
            }}
          >
            {selectedReport ? (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <h3 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#1c2b1a' }}>{selectedReport.title}</h3>
                    <span style={{ fontSize: '0.82rem', color: '#5d735a' }}>
                      Submitted by {selectedReport.submittedBy} ({selectedReport.contactPhone})
                    </span>
                  </div>
                  <span
                    style={{
                      padding: '4px 10px',
                      borderRadius: '6px',
                      fontWeight: 700,
                      fontSize: '0.8rem',
                      backgroundColor: selectedReport.status === 'VERIFIED' ? '#dcfce7' : '#fef3c7',
                      color: selectedReport.status === 'VERIFIED' ? '#15803d' : '#78350f',
                    }}
                  >
                    {selectedReport.status}
                  </span>
                </div>

                {/* Photo View */}
                <div style={{ marginBottom: '1rem' }}>
                  <img
                    src={selectedReport.imageUrl}
                    alt={selectedReport.title}
                    style={{ width: '100%', maxHeight: '280px', objectFit: 'cover', borderRadius: '12px' }}
                  />
                </div>

                {/* Geotagged Info Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '1rem' }}>
                  <div style={{ backgroundColor: '#f4f7f2', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#5d735a', display: 'block' }}>GPS Coordinates</span>
                    <strong style={{ fontSize: '0.85rem', color: '#1c2b1a' }}>
                      {selectedReport.latitude}° N, {selectedReport.longitude}° E
                    </strong>
                  </div>

                  <div style={{ backgroundColor: '#f4f7f2', padding: '10px', borderRadius: '8px' }}>
                    <span style={{ fontSize: '0.72rem', color: '#5d735a', display: 'block' }}>AI Vulnerability Score</span>
                    <strong style={{ fontSize: '0.85rem', color: '#dc2626' }}>
                      {selectedReport.aiRiskAssessmentScore || 88}/100 (Severe Slope Fragility)
                    </strong>
                  </div>
                </div>

                <div style={{ marginBottom: '1.25rem' }}>
                  <strong style={{ fontSize: '0.85rem', color: '#1c2b1a' }}>Citizen Description:</strong>
                  <p style={{ fontSize: '0.88rem', color: '#3f523c', backgroundColor: '#f4f7f2', padding: '10px', borderRadius: '8px', margin: '4px 0 0 0' }}>
                    {selectedReport.description}
                  </p>
                </div>

                {/* Officer Action Buttons */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                  <button
                    onClick={() => handleVerifyReport(selectedReport.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#15803d',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <CheckCircle size={16} /> Verify & Pin on Map
                  </button>

                  <button
                    onClick={() => handleDispatchTeam(selectedReport.id)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#78350f',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <Truck size={16} /> Dispatch Emergency SDRF
                  </button>

                  <button
                    onClick={() => handleLaunchRoboticCalls(selectedZone?.code, selectedReport.locationName)}
                    style={{
                      padding: '10px',
                      backgroundColor: '#92400e',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.85rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                      gridColumn: 'span 2',
                    }}
                  >
                    <PhoneCall size={16} /> Trigger Robotic Voice Calls to Local Households
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '3rem 1rem', color: '#5d735a' }}>
                <Eye size={48} style={{ margin: '0 auto 12px auto' }} />
                <p style={{ fontSize: '0.95rem' }}>Select a report from the left column to inspect geotagged photos and dispatch response teams.</p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* VIEW 2: 30-DAY OPEN-METEO AI PREDICTIVE ANALYTICS */}
      {officerTab === 'prediction30d' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #d6e2d3',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <CloudRain size={24} color="#15803d" />
                <h2 style={{ fontSize: '1.2rem', fontWeight: 800, margin: 0, color: '#1c2b1a' }}>
                  30-Day Open-Meteo Landslide Risk Forecast ({selectedZone?.name})
                </h2>
              </div>
              <span style={{ fontSize: '0.8rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '4px 10px', borderRadius: '6px' }}>
                Lead Time: {prediction30d?.leadTimeDays || 18} Days
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              <div style={{ backgroundColor: '#f4f7f2', padding: '12px', borderRadius: '10px', border: '1px solid #d6e2d3' }}>
                <span style={{ fontSize: '0.78rem', color: '#5d735a', display: 'block' }}>Peak Risk Level</span>
                <strong
                  style={{
                    fontSize: '1.15rem',
                    color: prediction30d?.overallRiskLevel === 'CRITICAL' ? '#dc2626' : '#78350f',
                  }}
                >
                  {prediction30d?.overallRiskLevel || 'HIGH'} ({prediction30d?.maxPredictedRiskScore30d || 88.5}/100)
                </strong>
              </div>

              <div style={{ backgroundColor: '#f4f7f2', padding: '12px', borderRadius: '10px', border: '1px solid #d6e2d3' }}>
                <span style={{ fontSize: '0.78rem', color: '#5d735a', display: 'block' }}>Peak Hazard Date</span>
                <strong style={{ fontSize: '1.15rem', color: '#1c2b1a' }}>{prediction30d?.peakHazardDate || '2026-10-14'}</strong>
              </div>

              <div style={{ backgroundColor: '#f4f4f2', padding: '12px', borderRadius: '10px', border: '1px solid #d6e2d3' }}>
                <span style={{ fontSize: '0.78rem', color: '#5d735a', display: 'block' }}>Open-Meteo 30D Rain</span>
                <strong style={{ fontSize: '1.15rem', color: '#15803d' }}>{openMeteo?.cumulativeRainfall30d || 410.5} mm</strong>
              </div>

              <div style={{ backgroundColor: '#f4f7f2', padding: '12px', borderRadius: '10px', border: '1px solid #d6e2d3' }}>
                <span style={{ fontSize: '0.78rem', color: '#5d735a', display: 'block' }}>Soil Saturation Index</span>
                <strong style={{ fontSize: '1.15rem', color: '#78350f' }}>{openMeteo?.soilSaturationIndex || 84.5}%</strong>
              </div>
            </div>

            {/* 30-Day Daily Risk Chart Visualization */}
            <div style={{ marginBottom: '1.5rem' }}>
              <h4 style={{ fontSize: '0.92rem', fontWeight: 700, color: '#1c2b1a', marginBottom: '10px' }}>
                30-Day Risk Evolution Timeline:
              </h4>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(30, 1fr)', gap: '3px', height: '140px', alignItems: 'flex-end' }}>
                {prediction30d?.forecastTimeline.map((pt, i) => (
                  <div
                    key={i}
                    title={`Date: ${pt.date} | Risk: ${pt.riskScore} | Rain: ${pt.predictedRainfallMm}mm`}
                    style={{
                      height: `${pt.riskScore}%`,
                      backgroundColor: pt.riskScore > 80 ? '#dc2626' : pt.riskScore > 60 ? '#b45309' : '#15803d',
                      borderRadius: '3px',
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Preventive Action Guidelines */}
            <div style={{ backgroundColor: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', padding: '1rem', color: '#78350f' }}>
              <strong style={{ fontSize: '0.9rem', display: 'block', marginBottom: '6px' }}>
                Recommended Officer Protocol ({prediction30d?.overallRiskLevel} Risk):
              </strong>
              <ul style={{ margin: 0, paddingLeft: '1.2rem', fontSize: '0.85rem', lineHeight: 1.5 }}>
                {prediction30d?.recommendations.map((rec, idx) => (
                  <li key={idx}>{rec}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 3: AUTOMATED ROBOTIC VOICE CALLS & LIVE CITIZEN TELEPHONY RESPONSE FEED */}
      {officerTab === 'roboticCalls' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
            {/* Dispatch Control Form */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #d6e2d3',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
                <PhoneCall size={24} color="#78350f" />
                <div>
                  <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#1c2b1a' }}>
                    Launch Robotic Voice Call Alert
                  </h2>
                  <p style={{ fontSize: '0.82rem', color: '#5d735a', margin: 0 }}>
                    Automated IVR call engine for zero-internet / remote landline & mobile households.
                  </p>
                </div>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1c2b1a', marginBottom: '6px' }}>
                  Target Zone / Village Cluster
                </label>
                <input
                  type="text"
                  value={`${selectedZone?.name || 'Gangtok Ridge'}, ${selectedZone?.district}`}
                  readOnly
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    backgroundColor: '#f4f7f2',
                    fontSize: '0.88rem',
                    fontWeight: 600,
                  }}
                />
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1c2b1a', marginBottom: '6px' }}>
                  Voice Call Audio Language
                </label>
                <select
                  value={callLang}
                  onChange={(e: any) => setCallLang(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                >
                  <option value="english">English (Standard Broadcast)</option>
                  <option value="assamese">অসমীয়া (Assamese)</option>
                  <option value="bengali">বাংলা (Bengali)</option>
                  <option value="hindi">हिंदी (Hindi)</option>
                  <option value="nepali">नेपाली (Nepali)</option>
                  <option value="khasi">Khasi (Meghalaya)</option>
                  <option value="mizo">Mizo (Mizoram)</option>
                </select>
              </div>

              <div style={{ marginBottom: '1rem' }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#1c2b1a', marginBottom: '6px' }}>
                  Number of Registered Households
                </label>
                <input
                  type="number"
                  value={targetHouseholds}
                  onChange={(e) => setTargetHouseholds(Number(e.target.value))}
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <button
                onClick={() => handleLaunchRoboticCalls()}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: '#78350f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '10px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(120, 53, 15, 0.4)',
                }}
              >
                <Volume2 size={18} />
                <span>Trigger Robotic Voice Call Dispatch</span>
              </button>
            </div>

            {/* Active Campaigns Monitor */}
            <div
              style={{
                backgroundColor: '#ffffff',
                borderRadius: '16px',
                padding: '1.5rem',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
                border: '1px solid #d6e2d3',
              }}
            >
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 1rem 0', color: '#1c2b1a' }}>
                Active Telephony Call Telemetry
              </h2>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {campaigns.map((c) => (
                  <div
                    key={c.id}
                    style={{
                      padding: '14px',
                      borderRadius: '12px',
                      backgroundColor: '#f4f7f2',
                      border: '1px solid #d6e2d3',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                      <strong style={{ fontSize: '0.92rem', color: '#1c2b1a' }}>{c.targetZoneName}</strong>
                      <span
                        style={{
                          fontSize: '0.72rem',
                          fontWeight: 700,
                          padding: '3px 8px',
                          borderRadius: '10px',
                          backgroundColor: c.status === 'COMPLETED' ? '#dcfce7' : '#fef3c7',
                          color: c.status === 'COMPLETED' ? '#15803d' : '#78350f',
                        }}
                      >
                        {c.status}
                      </span>
                    </div>

                    <div style={{ fontSize: '0.8rem', color: '#5d735a', marginBottom: '8px' }}>
                      Language: <strong style={{ color: '#1c2b1a' }}>{c.language.toUpperCase()}</strong>
                    </div>

                    {/* Progress Bar */}
                    <div style={{ backgroundColor: '#d6e2d3', height: '8px', borderRadius: '4px', overflow: 'hidden', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: `${(c.callsInitiated / c.totalHouseholds) * 100}%`,
                          backgroundColor: '#15803d',
                          height: '100%',
                          transition: 'width 0.5s ease',
                        }}
                      />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '6px', textAlign: 'center', fontSize: '0.78rem' }}>
                      <div>
                        Queued: <strong>{c.callsInitiated}</strong> / {c.totalHouseholds}
                      </div>
                      <div>
                        Connected: <strong style={{ color: '#15803d' }}>{c.callsConnected}</strong>
                      </div>
                      <div>
                        Acknowledged: <strong style={{ color: '#78350f' }}>{c.acknowledgements}</strong>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* LIVE CITIZEN TELEPHONY RESPONSES FEED TABLE */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1.5px solid #15803d',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '8px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <div style={{ padding: '8px', backgroundColor: '#dcfce7', borderRadius: '8px', color: '#15803d' }}>
                  <PhoneIncoming size={20} />
                </div>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 800, margin: 0, color: '#1c2b1a' }}>
                    Live Citizen Telephony Response Feed (Press 1 / Press 2)
                  </h3>
                  <p style={{ fontSize: '0.82rem', color: '#5d735a', margin: 0 }}>
                    Real-time responses received from citizens on robotic IVR calls
                  </p>
                </div>
              </div>

              <span style={{ fontSize: '0.8rem', fontWeight: 700, backgroundColor: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '4px 12px', borderRadius: '20px' }}>
                Live Stream Connected ({citizenResponses.length} Responses)
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.88rem' }}>
                <thead>
                  <tr style={{ backgroundColor: '#f4f7f2', borderBottom: '2px solid #d6e2d3', textAlign: 'left', color: '#1c2b1a' }}>
                    <th style={{ padding: '10px 12px' }}>Timestamp</th>
                    <th style={{ padding: '10px 12px' }}>Citizen Name</th>
                    <th style={{ padding: '10px 12px' }}>Phone Number</th>
                    <th style={{ padding: '10px 12px' }}>Locality / Zone</th>
                    <th style={{ padding: '10px 12px' }}>IVR Response</th>
                    <th style={{ padding: '10px 12px', textAlign: 'right' }}>Officer Action</th>
                  </tr>
                </thead>
                <tbody>
                  {citizenResponses.map((res) => (
                    <tr key={res.id} style={{ borderBottom: '1px solid #e2e8f0' }}>
                      <td style={{ padding: '12px', color: '#5d735a', fontSize: '0.8rem' }}>
                        {new Date(res.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </td>
                      <td style={{ padding: '12px', fontWeight: 700, color: '#1c2b1a' }}>
                        {res.citizenName}
                      </td>
                      <td style={{ padding: '12px', color: '#3f523c' }}>
                        {res.phoneNumber}
                      </td>
                      <td style={{ padding: '12px', color: '#3f523c' }}>
                        {res.locality} ({res.zoneName})
                      </td>
                      <td style={{ padding: '12px' }}>
                        {res.responseType === 'SAFE' ? (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#dcfce7', color: '#15803d', fontWeight: 700, fontSize: '0.78rem' }}>
                            <UserCheck size={14} /> Press 1: Confirmed Safe
                          </span>
                        ) : (
                          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 10px', borderRadius: '12px', backgroundColor: '#fef2f2', color: '#dc2626', fontWeight: 700, fontSize: '0.78rem' }}>
                            <LifeBuoy size={14} /> Press 2: Rescue Needed!
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '12px', textAlign: 'right' }}>
                        {res.responseType === 'RESCUE_NEEDED' ? (
                          <button
                            onClick={() => handleDispatchRescueForCitizen(res)}
                            style={{
                              padding: '6px 12px',
                              backgroundColor: '#dc2626',
                              color: '#ffffff',
                              border: 'none',
                              borderRadius: '6px',
                              fontWeight: 700,
                              fontSize: '0.78rem',
                              cursor: 'pointer',
                              display: 'inline-flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Truck size={14} /> Dispatch SDRF Unit
                          </button>
                        ) : (
                          <span style={{ fontSize: '0.78rem', color: '#15803d', fontWeight: 600 }}>
                            ✅ Acknowledged
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* VIEW 4: GIS INTERACTIVE MAP */}
      {officerTab === 'gisMap' && (
        <InteractiveHeatmap zones={zones} selectedZone={selectedZone} onSelectZone={(z) => onSelectZone(z.code)} telemetry={null} />
      )}
    </div>
  );
};

