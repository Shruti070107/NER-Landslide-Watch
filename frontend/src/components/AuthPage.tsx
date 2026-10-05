import React, { useState } from 'react';
import {
  Shield,
  User,
  Lock,
  Mail,
  Phone,
  MapPin,
  CheckCircle,
  AlertCircle,
  Crosshair,
  ArrowRight,
  ShieldCheck,
  BadgeAlert,
  Building,
  KeyRound,
  FileCheck,
  ChevronLeft,
} from 'lucide-react';
import { UserProfile } from '../types';
import { authService } from '../services/authService';
import { formatAadhaar, verifyAadhaarNumber } from '../utils/aadhaarVerifier';

interface AuthPageProps {
  initialTab?: 'login' | 'register';
  initialPortalMode?: 'PUBLIC' | 'OFFICER';
  onSuccess: (user: UserProfile) => void;
  onCancel?: () => void;
}

export const AuthPage: React.FC<AuthPageProps> = ({
  initialTab = 'login',
  initialPortalMode = 'PUBLIC',
  onSuccess,
  onCancel,
}) => {
  const [activeTab, setActiveTab] = useState<'login' | 'register'>(initialTab);
  const [portalMode, setPortalMode] = useState<'PUBLIC' | 'OFFICER'>(initialPortalMode);

  // Form inputs for Register
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

  // Officer credentials
  const [officerBadgeId, setOfficerBadgeId] = useState('SDRF-NER-2026');
  const [officerDepartment, setOfficerDepartment] = useState('SDRF_COMMAND');

  // Login inputs
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');

  // UI status
  const [isDetectingGps, setIsDetectingGps] = useState(false);
  const [gpsSuccess, setGpsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  const aadhaarValidation = verifyAadhaarNumber(aadhaarInput);

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarInput(formatAadhaar(e.target.value));
  };

  const handleDetectGps = () => {
    setIsDetectingGps(true);
    setGpsSuccess(false);
    setFormError(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(5)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(5)));
          setIsDetectingGps(false);
          setGpsSuccess(true);
        },
        (err) => {
          setIsDetectingGps(false);
          setFormError(`GPS Detection Error: ${err.message}. Default station coordinates applied.`);
        },
        { enableHighAccuracy: true, timeout: 8000 }
      );
    } else {
      setIsDetectingGps(false);
      setFormError('Geolocation is not supported by your browser.');
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
      onSuccess(user);
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Authentication failed. Please verify your credentials.');
    }
  };

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    if (!fullName.trim()) {
      setFormError('Full Name is required.');
      return;
    }
    if (!email.trim() || !email.includes('@')) {
      setFormError('Please provide a valid email address.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Mobile phone number is required.');
      return;
    }
    if (!aadhaarValidation.isValid && portalMode === 'PUBLIC') {
      setFormError(aadhaarValidation.message || 'Valid 12-digit Aadhaar number required for verification.');
      return;
    }
    if (password !== confirmPassword) {
      setFormError('Passwords do not match.');
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
      onSuccess(user);
    } catch (err: any) {
      setIsSubmitting(false);
      setFormError(err.message || 'Registration failed.');
    }
  };

  const handleQuickDemoCitizen = async () => {
    setIsSubmitting(true);
    const user = await authService.login({ identifier: 'rajesh.sharma@meghalaya.gov.in' });
    setIsSubmitting(false);
    onSuccess(user);
  };

  const handleQuickDemoCommander = async () => {
    setIsSubmitting(true);
    const user = await authService.login({ identifier: 'tenzing.norbu@sdrf.ner.in' });
    setIsSubmitting(false);
    onSuccess(user);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem 1rem',
      }}
    >
      <div
        style={{
          maxWidth: '1100px',
          width: '100%',
          backgroundColor: '#1e293b',
          borderRadius: '16px',
          border: '1px solid #334155',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
          overflow: 'hidden',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        }}
      >
        {/* Left Side: Branding & Information Banner */}
        <div
          style={{
            backgroundColor: '#0f172a',
            padding: '3rem 2.5rem',
            borderRight: '1px solid #334155',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
          }}
        >
          <div>
            {onCancel && (
              <button
                onClick={onCancel}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                  color: '#94a3b8',
                  fontSize: '0.85rem',
                  fontWeight: 600,
                  marginBottom: '2rem',
                  cursor: 'pointer',
                  backgroundColor: 'transparent',
                  border: 'none',
                }}
              >
                <ChevronLeft size={16} /> Back to Dashboard
              </button>
            )}

            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '1.5rem' }}>
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '10px',
                  backgroundColor: '#15803d',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#ffffff',
                }}
              >
                <Shield size={24} />
              </div>
              <div>
                <h1 style={{ fontSize: '1.4rem', fontWeight: 800, margin: 0, color: '#ffffff' }}>Landslide Gaurd NER</h1>
                <p style={{ fontSize: '0.78rem', color: '#94a3b8', margin: 0 }}>Early Warning & Landslide Risk System</p>
              </div>
            </div>

            <h2 style={{ fontSize: '1.75rem', fontWeight: 800, color: '#ffffff', lineHeight: 1.3, marginBottom: '1rem' }}>
              {activeTab === 'login' ? 'Welcome Back to Landslide Gaurd NER' : 'Register for Real-Time Safety Alerts'}
            </h2>
            <p style={{ color: '#94a3b8', fontSize: '0.92rem', lineHeight: 1.6, marginBottom: '2rem' }}>
              Access live AI landslide risk monitoring, geotagged hazard reporting, and instant SDRF/NDRF emergency response across North Eastern India.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>24/7 AI Risk Assessment</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>High-resolution DEM terrain & precipitation forecasting</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Verified Emergency Dispatch</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Aadhaar & GPS linked distress signals for SDRF rescue teams</p>
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <CheckCircle size={20} color="#4ade80" style={{ flexShrink: 0, marginTop: '2px' }} />
                <div>
                  <h4 style={{ fontSize: '0.9rem', fontWeight: 700, margin: 0, color: '#f8fafc' }}>Multilingual Support</h4>
                  <p style={{ fontSize: '0.8rem', color: '#94a3b8', margin: 0 }}>Available in English, Assamese, Bengali, Hindi, Khasi, Mizo, Manipuri</p>
                </div>
              </div>
            </div>
          </div>

          {/* Quick Demo Login Cards */}
          <div style={{ marginTop: '2.5rem', paddingTop: '1.5rem', borderTop: '1px solid #334155' }}>
            <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600, display: 'block', marginBottom: '8px' }}>
              QUICK TEST ACCOUNTS
            </span>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={handleQuickDemoCitizen}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #475569',
                  borderRadius: '6px',
                  color: '#cbd5e1',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Demo Citizen
              </button>

              <button
                type="button"
                onClick={handleQuickDemoCommander}
                disabled={isSubmitting}
                style={{
                  flex: 1,
                  padding: '8px 12px',
                  backgroundColor: '#1e293b',
                  border: '1px solid #0369a1',
                  borderRadius: '6px',
                  color: '#38bdf8',
                  fontSize: '0.78rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  textAlign: 'center',
                }}
              >
                Demo Commander
              </button>
            </div>
          </div>
        </div>

        {/* Right Side: Interactive Form */}
        <div style={{ padding: '2.5rem' }}>
          {/* Role Switcher: Citizen vs Commander */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              backgroundColor: '#0f172a',
              padding: '4px',
              borderRadius: '8px',
              border: '1px solid #334155',
              marginBottom: '1.5rem',
            }}
          >
            <button
              type="button"
              onClick={() => {
                setPortalMode('PUBLIC');
                setFormError(null);
              }}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: portalMode === 'PUBLIC' ? '#15803d' : 'transparent',
                color: portalMode === 'PUBLIC' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Public Citizen
            </button>

            <button
              type="button"
              onClick={() => {
                setPortalMode('OFFICER');
                setFormError(null);
              }}
              style={{
                padding: '8px',
                borderRadius: '6px',
                border: 'none',
                backgroundColor: portalMode === 'OFFICER' ? '#0369a1' : 'transparent',
                color: portalMode === 'OFFICER' ? '#ffffff' : '#94a3b8',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
              }}
            >
              Disaster Commander
            </button>
          </div>

          {/* Tab Navigation: Sign In vs Register */}
          <div style={{ display: 'flex', borderBottom: '1px solid #334155', marginBottom: '1.5rem' }}>
            <button
              type="button"
              onClick={() => {
                setActiveTab('login');
                setFormError(null);
              }}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeTab === 'login' ? '2px solid #38bdf8' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === 'login' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Sign In
            </button>

            <button
              type="button"
              onClick={() => {
                setActiveTab('register');
                setFormError(null);
              }}
              style={{
                padding: '10px 16px',
                border: 'none',
                borderBottom: activeTab === 'register' ? '2px solid #38bdf8' : '2px solid transparent',
                backgroundColor: 'transparent',
                color: activeTab === 'register' ? '#ffffff' : '#94a3b8',
                fontWeight: 700,
                fontSize: '0.92rem',
                cursor: 'pointer',
              }}
            >
              Create Account
            </button>
          </div>

          {/* Error Banner */}
          {formError && (
            <div
              style={{
                backgroundColor: '#451a1a',
                border: '1px solid #7f1d1d',
                color: '#fca5a5',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.82rem',
                marginBottom: '1.25rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
              }}
            >
              <AlertCircle size={16} style={{ flexShrink: 0 }} />
              <span>{formError}</span>
            </div>
          )}

          {/* SIGN IN FORM */}
          {activeTab === 'login' ? (
            <form onSubmit={handleLoginSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  {portalMode === 'OFFICER' ? 'Officer Badge ID / Email' : 'Email Address or Phone Number'}
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="text"
                    placeholder={portalMode === 'OFFICER' ? 'e.g. SDRF-NER-2026' : 'e.g. citizen@meghalaya.gov.in'}
                    value={loginIdentifier}
                    onChange={(e) => setLoginIdentifier(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <User size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.82rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '6px' }}>
                  Password
                </label>
                <div style={{ position: 'relative' }}>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={loginPassword}
                    onChange={(e) => setLoginPassword(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '10px 12px 10px 38px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.9rem',
                      outline: 'none',
                    }}
                  />
                  <Lock size={16} color="#94a3b8" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: portalMode === 'OFFICER' ? '#0369a1' : '#15803d',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span>{isSubmitting ? 'Authenticating...' : 'Sign In to Landslide Gaurd NER'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          ) : (
            /* REGISTER FORM */
            <form onSubmit={handleRegisterSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                  Full Name *
                </label>
                <input
                  type="text"
                  placeholder="e.g. Rajesh Sharma"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                  style={{
                    width: '100%',
                    padding: '8px 12px',
                    borderRadius: '8px',
                    border: '1px solid #475569',
                    backgroundColor: '#0f172a',
                    color: '#ffffff',
                    fontSize: '0.88rem',
                    outline: 'none',
                  }}
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Mobile Number *
                  </label>
                  <input
                    type="tel"
                    placeholder="+91 9876543210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Aadhaar Verification Field for Citizens */}
              {portalMode === 'PUBLIC' && (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px' }}>
                    <label style={{ fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1' }}>
                      Aadhaar Number (Verification)
                    </label>
                    {aadhaarInput && (
                      <span style={{ fontSize: '0.72rem', color: aadhaarValidation.isValid ? '#4ade80' : '#f87171', fontWeight: 600 }}>
                        {aadhaarValidation.isValid ? 'Aadhaar Checksum Valid' : 'Invalid Format'}
                      </span>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="1234 5678 9012"
                    maxLength={14}
                    value={aadhaarInput}
                    onChange={handleAadhaarChange}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${aadhaarInput ? (aadhaarValidation.isValid ? '#22c55e' : '#ef4444') : '#475569'}`,
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      letterSpacing: '1px',
                      outline: 'none',
                    }}
                  />
                </div>
              )}

              {/* Location Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    State
                  </label>
                  <select
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  >
                    <option value="Sikkim">Sikkim</option>
                    <option value="Meghalaya">Meghalaya</option>
                    <option value="Assam">Assam</option>
                    <option value="Arunachal Pradesh">Arunachal Pradesh</option>
                    <option value="Mizoram">Mizoram</option>
                    <option value="Nagaland">Nagaland</option>
                    <option value="Manipur">Manipur</option>
                    <option value="Tripura">Tripura</option>
                  </select>
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    District
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. East Sikkim"
                    value={district}
                    onChange={(e) => setDistrict(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              {/* Auto GPS Detection Button */}
              <button
                type="button"
                onClick={handleDetectGps}
                disabled={isDetectingGps}
                style={{
                  padding: '8px 12px',
                  borderRadius: '6px',
                  border: '1px solid #38bdf8',
                  backgroundColor: 'rgba(56, 189, 248, 0.1)',
                  color: '#38bdf8',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Crosshair size={14} />
                <span>{isDetectingGps ? 'Acquiring GPS...' : gpsSuccess ? 'GPS Coordinates Synced' : 'Auto-Sync Current GPS Location'}</span>
              </button>

              {/* Password Fields */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Password *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>

                <div>
                  <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#cbd5e1', marginBottom: '4px' }}>
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    style={{
                      width: '100%',
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: '1px solid #475569',
                      backgroundColor: '#0f172a',
                      color: '#ffffff',
                      fontSize: '0.88rem',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                style={{
                  width: '100%',
                  padding: '12px',
                  borderRadius: '8px',
                  border: 'none',
                  backgroundColor: portalMode === 'OFFICER' ? '#0369a1' : '#15803d',
                  color: '#ffffff',
                  fontWeight: 700,
                  fontSize: '0.92rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  marginTop: '0.5rem',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.3)',
                }}
              >
                <span>{isSubmitting ? 'Creating Profile...' : 'Complete Registration'}</span>
                <ArrowRight size={16} />
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
