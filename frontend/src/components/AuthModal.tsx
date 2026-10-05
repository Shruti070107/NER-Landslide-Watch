import React, { useState, useEffect } from 'react';
import {
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  ShieldCheck,
  CheckCircle2,
  AlertCircle,
  X,
  Crosshair,
  KeyRound,
  IdCard,
  Building,
  Home,
  Check,
  ArrowRight,
  ShieldAlert,
  BadgeAlert,
  Award,
} from 'lucide-react';
import { RegisterRequest, LoginRequest, UserProfile } from '../types';
import { authService } from '../services/authService';
import { formatAadhaar, verifyAadhaarNumber } from '../utils/aadhaarVerifier';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'login' | 'register';
  initialPortalMode?: 'PUBLIC' | 'OFFICER';
  onSuccess?: (user: UserProfile) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'login',
  initialPortalMode = 'PUBLIC',
  onSuccess,
}) => {
  // Mode: PUBLIC vs OFFICER
  const [portalMode, setPortalMode] = useState<'PUBLIC' | 'OFFICER'>(initialPortalMode);
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);

  useEffect(() => {
    setPortalMode(initialPortalMode);
    setActiveTab(initialTab);
  }, [initialPortalMode, initialTab]);

  // Citizen Form State
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [aadhaarInput, setAadhaarInput] = useState('');
  const [state, setState] = useState('Sikkim');
  const [district, setDistrict] = useState('East Sikkim');
  const [cityOrVillage, setCityOrVillage] = useState('Gangtok');
  const [address, setAddress] = useState('');
  const [pincode, setPincode] = useState('');
  const [latitude, setLatitude] = useState<number | undefined>(27.3389);
  const [longitude, setLongitude] = useState<number | undefined>(88.6138);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  // Officer / Commander Specific State
  const [officerBadgeId, setOfficerBadgeId] = useState('SDRF-NER-2026');
  const [officerDepartment, setOfficerDepartment] = useState('SDRF_COMMAND');
  const [officerDesignation, setOfficerDesignation] = useState('District Disaster Commander');
  const [securityPasscode, setSecurityPasscode] = useState('');

  // Login Form State
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI States
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const aadhaarValidation = verifyAadhaarNumber(aadhaarInput);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatAadhaar(e.target.value);
    setAadhaarInput(formatted);
  };

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    setGpsSuccess(false);
    setFormError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const lat = parseFloat(pos.coords.latitude.toFixed(5));
          const lng = parseFloat(pos.coords.longitude.toFixed(5));
          setLatitude(lat);
          setLongitude(lng);
          setIsDetectingGps(false);
          setGpsSuccess(true);
        },
        (err) => {
          setIsDetectingGps(false);
          setFormError('GPS Detection: ' + err.message + '. Default NER station coordinates applied.');
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetectingGps(false);
      setFormError('Geolocation is not supported by your browser.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Please enter your Full Name.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please enter a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Please enter your contact mobile number.');
      return;
    }

    if (!aadhaarValidation.isValid && portalMode === 'PUBLIC') {
      setFormError(aadhaarValidation.message || 'Please provide a valid 12-digit Aadhaar number for verification.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await authService.register({
        fullName: portalMode === 'OFFICER' ? `[Commander] ${fullName}` : fullName,
        email,
        phone,
        password,
        role: portalMode === 'OFFICER' ? 'DISASTER_ADMIN' : 'CITIZEN',
        aadhaarNumber: aadhaarInput || '999999999999',
        state,
        district,
        cityOrVillage,
        address,
        pincode,
        latitude,
        longitude,
      });

      setIsSubmitting(false);
      onSuccess?.(user);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Registration failed.');
    }
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!loginIdentifier.trim()) {
      setFormError('Please enter your Email, Phone Number, or Officer Badge ID.');
      return;
    }

    setIsSubmitting(true);
    try {
      const user = await authService.login({
        identifier: loginIdentifier,
        password: loginPassword,
      });

      setIsSubmitting(false);
      onSuccess?.(user);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Login failed.');
    }
  };

  const handleQuickDemoCitizen = async () => {
    setIsSubmitting(true);
    const user = await authService.login({ identifier: 'rajesh.sharma@meghalaya.gov.in' });
    setIsSubmitting(false);
    onSuccess?.(user);
    onClose();
  };

  const handleQuickDemoCommander = async () => {
    setIsSubmitting(true);
    const user = await authService.login({ identifier: 'tenzing.norbu@sdrf.ner.in' });
    setIsSubmitting(false);
    onSuccess?.(user);
    onClose();
  };

  return (
    <div className="weather-modal-backdrop" onClick={onClose} style={{ zIndex: 1100 }}>
      <div
        className="weather-modal"
        style={{ maxWidth: '640px', maxHeight: '90vh', display: 'flex', flexDirection: 'column' }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Header */}
        <div
          className="weather-modal-header"
          style={{
            padding: '1.25rem',
            backgroundColor: portalMode === 'OFFICER' ? '#0f172a' : '#ffffff',
            color: portalMode === 'OFFICER' ? '#ffffff' : '#0f172a',
            borderBottom: '1px solid var(--border-subtle)',
          }}
        >
          <div className="weather-modal-title">
            {portalMode === 'OFFICER' ? <BadgeAlert size={26} color="#f87171" /> : <ShieldCheck size={26} color="#2563eb" />}
            <div>
              <span style={{ fontSize: '1.15rem', fontWeight: 800 }}>
                {portalMode === 'OFFICER' ? 'Commander & Official Security Portal' : 'Public Citizen Portal'}
              </span>
              <div style={{ fontSize: '0.78rem', color: portalMode === 'OFFICER' ? '#94a3b8' : '#64748b', fontWeight: 400 }}>
                {portalMode === 'OFFICER'
                  ? 'Official Emergency Command Clearance (NDRF / SDRF / DDMA Officers)'
                  : 'North Eastern Region Early Warning & Disaster Reporting'}
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: portalMode === 'OFFICER' ? '#94a3b8' : '#64748b',
              padding: '4px',
            }}
          >
            <X size={20} />
          </button>
        </div>

        {/* Portal Mode Switcher (Citizen vs Commander) */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            backgroundColor: '#f1f5f9',
            padding: '6px',
            gap: '6px',
          }}
        >
          <button
            type="button"
            onClick={() => {
              setPortalMode('PUBLIC');
              setFormError(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: portalMode === 'PUBLIC' ? '#2563eb' : 'transparent',
              color: portalMode === 'PUBLIC' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Public Citizen Portal
          </button>

          <button
            type="button"
            onClick={() => {
              setPortalMode('OFFICER');
              setFormError(null);
            }}
            style={{
              padding: '10px',
              borderRadius: '8px',
              border: 'none',
              backgroundColor: portalMode === 'OFFICER' ? '#dc2626' : 'transparent',
              color: portalMode === 'OFFICER' ? '#ffffff' : '#475569',
              fontWeight: 700,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            Commander / Officer Portal
          </button>
        </div>

        {/* Action Tabs: Sign In vs Register */}
        <div style={{ display: 'flex', borderBottom: '1px solid var(--border-subtle)', backgroundColor: '#ffffff', padding: '0 1rem' }}>
          <button
            type="button"
            onClick={() => {
              setActiveTab('login');
              setFormError(null);
            }}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'login' ? `3px solid ${portalMode === 'OFFICER' ? '#dc2626' : '#2563eb'}` : '3px solid transparent',
              fontWeight: activeTab === 'login' ? 700 : 500,
              color: activeTab === 'login' ? (portalMode === 'OFFICER' ? '#dc2626' : '#2563eb') : '#64748b',
              cursor: 'pointer',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <KeyRound size={16} /> Sign In to Portal
          </button>
          <button
            type="button"
            onClick={() => {
              setActiveTab('register');
              setFormError(null);
            }}
            style={{
              padding: '0.75rem 1.25rem',
              background: 'none',
              border: 'none',
              borderBottom: activeTab === 'register' ? `3px solid ${portalMode === 'OFFICER' ? '#dc2626' : '#2563eb'}` : '3px solid transparent',
              fontWeight: activeTab === 'register' ? 700 : 500,
              color: activeTab === 'register' ? (portalMode === 'OFFICER' ? '#dc2626' : '#2563eb') : '#64748b',
              cursor: 'pointer',
              fontSize: '0.88rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <IdCard size={16} /> {portalMode === 'OFFICER' ? 'Officer Verification' : 'Citizen Registration'}
          </button>
        </div>

        {/* Form Body */}
        <div style={{ padding: '1.25rem', overflowY: 'auto', flex: 1, backgroundColor: '#ffffff' }}>
          {formError && (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0.75rem',
                backgroundColor: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '8px',
                color: '#b91c1c',
                fontSize: '0.85rem',
                marginBottom: '1rem',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {/* LOGIN FORM */}
          {activeTab === 'login' && (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#334155' }}>
                  {portalMode === 'OFFICER' ? 'Officer Email / Official Service ID' : 'Mobile Phone / Email / 12-Digit Aadhaar'} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={portalMode === 'OFFICER' ? 'e.g. tenzing.norbu@sdrf.ner.in or SDRF-NER-2026' : 'e.g. +91 98765 43210 or 12-digit Aadhaar'}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <User size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
                </div>
              </div>

              {portalMode === 'OFFICER' && (
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#334155' }}>
                    Official Department / Clearance Level
                  </label>
                  <select
                    value={officerDepartment}
                    onChange={(e) => setOfficerDepartment(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      outline: 'none',
                      backgroundColor: '#f8fafc',
                    }}
                  >
                    <option value="SDRF_COMMAND">State Disaster Response Force (SDRF Commander)</option>
                    <option value="NDRF_BATTALION">National Disaster Response Force (NDRF Commander)</option>
                    <option value="DISTRICT_COLLECTORATE">District Collectorate / Disaster Mgmt Authority</option>
                    <option value="PWD_HIGHWAYS">Public Works Department (PWD Chief Engineer)</option>
                    <option value="METEOROLOGICAL_IMD">India Meteorological Department (IMD Officer)</option>
                  </select>
                </div>
              )}

              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, display: 'block', marginBottom: '6px', color: '#334155' }}>
                  {portalMode === 'OFFICER' ? 'Official Security Passcode / Password' : 'Password'} *
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <Lock size={18} style={{ position: 'absolute', left: '12px', top: '11px', color: '#64748b' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: portalMode === 'OFFICER' ? '#dc2626' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: portalMode === 'OFFICER' ? '0 4px 14px rgba(220, 38, 38, 0.35)' : '0 4px 14px rgba(37, 99, 235, 0.35)',
                }}
              >
                <span>{isSubmitting ? 'Authenticating...' : portalMode === 'OFFICER' ? 'Authorize Command Center Access' : 'Sign In to Citizen Portal'}</span>
                <ArrowRight size={18} />
              </button>

              {/* 1-Click Demo Profile Logins */}
              <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '1rem' }}>
                <span style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
                  1-CLICK DEMO AUTHENTICATION:
                </span>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={handleQuickDemoCitizen}
                    disabled={isSubmitting}
                    style={{
                      padding: '8px',
                      border: '1px solid #bfdbfe',
                      backgroundColor: '#eff6ff',
                      borderRadius: '6px',
                      color: '#1d4ed8',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <User size={14} /> Dr. Rajesh (Citizen)
                  </button>

                  <button
                    type="button"
                    onClick={handleQuickDemoCommander}
                    disabled={isSubmitting}
                    style={{
                      padding: '8px',
                      border: '1px solid #fecaca',
                      backgroundColor: '#fef2f2',
                      borderRadius: '6px',
                      color: '#dc2626',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                    }}
                  >
                    <ShieldAlert size={14} /> Capt. Tenzing (SDRF)
                  </button>
                </div>
              </div>
            </form>
          )}

          {/* REGISTER FORM */}
          {activeTab === 'register' && (
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                  {portalMode === 'OFFICER' ? 'Officer Full Name & Designation *' : 'Citizen Full Name *'}
                </label>
                <input
                  type="text"
                  placeholder={portalMode === 'OFFICER' ? 'Capt. Tenzing Norbu' : 'Full Name'}
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '9px 12px',
                    borderRadius: '8px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.88rem',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="email@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Mobile Phone *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 98XXX XXXXX"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                    }}
                  />
                </div>
              </div>

              {portalMode === 'PUBLIC' && (
                <div>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700, color: '#334155', display: 'block', marginBottom: '6px' }}>
                    Aadhaar Number (12 Digits UIDAI) *
                  </label>
                  <input
                    type="text"
                    maxLength={14}
                    placeholder="XXXX XXXX XXXX"
                    value={aadhaarInput}
                    onChange={handleAadhaarChange}
                    required
                    style={{
                      width: '100%',
                      padding: '9px 12px',
                      borderRadius: '8px',
                      border: '1px solid #cbd5e1',
                      fontSize: '0.88rem',
                      fontFamily: 'monospace',
                    }}
                  />
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  backgroundColor: portalMode === 'OFFICER' ? '#dc2626' : '#2563eb',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.95rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem',
                }}
              >
                <span>{isSubmitting ? 'Registering...' : portalMode === 'OFFICER' ? 'Complete Officer Authorization' : 'Complete Citizen Registration'}</span>
                <ArrowRight size={18} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
