import React, { useState, useEffect, useRef } from 'react';
import {
  Shield,
  Globe,
  User,
  ChevronDown,
  Wifi,
  WifiOff,
  LogOut,
  Bell,
  AlertCircle,
} from 'lucide-react';
import { RiskZone, UserProfile, SupportedLanguage } from '../types';
import { emergencyAudio } from '../utils/emergencyAudio';
import { authService } from '../services/authService';

interface HeaderProps {
  zones: RiskZone[];
  selectedZoneCode: string;
  onSelectZone: (code: string) => void;
  activeAlertCount: number;
  onOpenAlerts: () => void;
  isLive: boolean;
  onToggleLive: () => void;
  isBackendConnected: boolean;
  activeRole: 'PUBLIC' | 'OFFICER';
  onChangeActiveRole: (role: 'PUBLIC' | 'OFFICER') => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onOpenSos: () => void;
  currentUser: UserProfile | null;
  onOpenAuth: (portalMode?: 'PUBLIC' | 'OFFICER', tab?: 'login' | 'register') => void;
}

export const Header: React.FC<HeaderProps> = ({
  zones,
  selectedZoneCode,
  onSelectZone,
  activeAlertCount,
  onOpenAlerts,
  isLive,
  onToggleLive,
  isBackendConnected,
  activeRole,
  onChangeActiveRole,
  language,
  onChangeLanguage,
  onOpenSos,
  currentUser,
  onOpenAuth,
}) => {
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const profileMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const unsub = emergencyAudio.subscribe((playing) => setIsSirenPlaying(playing));
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      unsub();
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target as Node)) {
        setShowProfileMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSosClick = () => {
    if (isSirenPlaying) {
      emergencyAudio.stopAlarm();
    } else {
      emergencyAudio.playSosAlarm(15);
    }
    onOpenSos();
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0].toUpperCase())
      .join('');
  };

  const isOfficerRole = activeRole === 'OFFICER';

  return (
    <header
      style={{
        backgroundColor: '#0f172a',
        color: '#f8fafc',
        borderBottom: '1px solid #1e293b',
        padding: '0.75rem 1.5rem',
        boxShadow: '0 2px 10px rgba(0, 0, 0, 0.2)',
        position: 'sticky',
        top: 0,
        zIndex: 100,
      }}
    >
      <div
        style={{
          maxWidth: '1480px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        {/* Brand & Portal Mode Toggle */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '24px' }}>
          {/* Brand Identity */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                backgroundColor: isOfficerRole ? '#0369a1' : '#15803d',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                boxShadow: '0 2px 6px rgba(0, 0, 0, 0.25)',
              }}
            >
              <Shield size={20} />
            </div>

            <div>
              <div style={{ fontWeight: 700, fontSize: '1.15rem', letterSpacing: '-0.3px', lineHeight: 1.2, color: '#ffffff' }}>
                Landslide Gaurd NER
              </div>
              <div style={{ fontSize: '0.72rem', color: '#cbd5e1', fontWeight: 500 }}>
                {isOfficerRole ? 'Disaster Response Command Center' : 'Early Warning & Landslide Risk Monitoring'}
              </div>
            </div>
          </div>

          {/* Strict Role-Based Navigation Badge / Switcher */}
          {currentUser ? (
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '6px 14px',
                borderRadius: '8px',
                backgroundColor: isOfficerRole ? 'rgba(3, 105, 161, 0.2)' : 'rgba(21, 128, 61, 0.2)',
                border: `1px solid ${isOfficerRole ? '#0369a1' : '#15803d'}`,
                color: isOfficerRole ? '#38bdf8' : '#4ade80',
                fontSize: '0.82rem',
                fontWeight: 700,
              }}
            >
              <Shield size={14} />
              <span>{isOfficerRole ? 'Command Center (Active)' : 'Public Citizen Portal (Active)'}</span>
            </div>
          ) : (
            <div
              style={{
                display: 'flex',
                backgroundColor: '#1e293b',
                padding: '3px',
                borderRadius: '8px',
                border: '1px solid #334155',
              }}
            >
              <button
                onClick={() => onChangeActiveRole('PUBLIC')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: !isOfficerRole ? '#15803d' : 'transparent',
                  color: !isOfficerRole ? '#ffffff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Public Portal
              </button>

              <button
                onClick={() => onChangeActiveRole('OFFICER')}
                style={{
                  padding: '6px 16px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: isOfficerRole ? '#0369a1' : 'transparent',
                  color: isOfficerRole ? '#ffffff' : '#94a3b8',
                  fontWeight: 600,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Commander Login
              </button>
            </div>
          )}
        </div>

        {/* Right Actions: Language, Alerts, Network, Profile, Emergency SOS */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Active Alerts Shortcut button */}
          {activeAlertCount > 0 && (
            <button
              onClick={onOpenAlerts}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                backgroundColor: '#7f1d1d',
                color: '#fecaca',
                border: '1px solid #991b1b',
                fontSize: '0.8rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              <Bell size={14} />
              <span>{activeAlertCount} Active Alert{activeAlertCount > 1 ? 's' : ''}</span>
            </button>
          )}

          {/* Multilingual Selector */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              backgroundColor: '#1e293b',
              padding: '5px 10px',
              borderRadius: '6px',
              border: '1px solid #334155',
            }}
          >
            <Globe size={14} color="#94a3b8" />
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as SupportedLanguage)}
              style={{
                backgroundColor: 'transparent',
                border: 'none',
                color: '#f8fafc',
                fontSize: '0.8rem',
                fontWeight: 500,
                outline: 'none',
                cursor: 'pointer',
              }}
            >
              <option value="en" style={{ backgroundColor: '#1e293b' }}>English</option>
              <option value="as" style={{ backgroundColor: '#1e293b' }}>অসমীয়া (Assamese)</option>
              <option value="bn" style={{ backgroundColor: '#1e293b' }}>বাংলা (Bengali)</option>
              <option value="hi" style={{ backgroundColor: '#1e293b' }}>हिंदी (Hindi)</option>
              <option value="ne" style={{ backgroundColor: '#1e293b' }}>नेपाली (Nepali)</option>
              <option value="kha" style={{ backgroundColor: '#1e293b' }}>Khasi</option>
              <option value="mzo" style={{ backgroundColor: '#1e293b' }}>Mizo</option>
              <option value="mni" style={{ backgroundColor: '#1e293b' }}>Manipuri</option>
            </select>
          </div>

          {/* Connection Status Badge */}
          <div
            style={{
              fontSize: '0.75rem',
              fontWeight: 500,
              padding: '5px 10px',
              borderRadius: '6px',
              backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: isOnline ? '#4ade80' : '#f87171',
              border: `1px solid ${isOnline ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}`,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            {isOnline ? <Wifi size={13} /> : <WifiOff size={13} />}
            <span>{isOnline ? 'Live' : 'Offline'}</span>
          </div>

          {/* User Auth Profile Action */}
          {currentUser ? (
            <div className="user-profile-menu-container" ref={profileMenuRef} style={{ position: 'relative' }}>
              <button
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '5px 10px',
                  borderRadius: '6px',
                  border: '1px solid #334155',
                  backgroundColor: '#1e293b',
                  color: '#f8fafc',
                  cursor: 'pointer',
                  fontSize: '0.8rem',
                }}
              >
                <div
                  style={{
                    width: '24px',
                    height: '24px',
                    borderRadius: '50%',
                    backgroundColor: isOfficerRole ? '#0369a1' : '#15803d',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                  }}
                >
                  {getInitials(currentUser.fullName || 'User')}
                </div>
                <span style={{ fontWeight: 500 }}>{currentUser.fullName.split(' ')[0]}</span>
                <ChevronDown size={14} color="#94a3b8" />
              </button>

              {showProfileMenu && (
                <div
                  style={{
                    position: 'absolute',
                    right: 0,
                    top: 'calc(100% + 8px)',
                    width: '240px',
                    backgroundColor: '#1e293b',
                    border: '1px solid #334155',
                    borderRadius: '8px',
                    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.3)',
                    zIndex: 1000,
                    padding: '1rem',
                    color: '#f8fafc',
                  }}
                >
                  <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{currentUser.fullName}</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', marginBottom: '8px' }}>{currentUser.email}</div>
                  <div style={{ fontSize: '0.75rem', color: '#38bdf8', marginBottom: '12px', fontWeight: 600 }}>
                    Account Type: {currentUser.role === 'CITIZEN' ? 'Public Citizen' : 'Disaster Commander'}
                  </div>
                  <button
                    onClick={() => {
                      authService.logout();
                      setShowProfileMenu(false);
                    }}
                    style={{
                      width: '100%',
                      padding: '8px',
                      backgroundColor: '#dc2626',
                      color: '#ffffff',
                      border: 'none',
                      borderRadius: '6px',
                      fontWeight: 600,
                      fontSize: '0.8rem',
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '6px',
                    }}
                  >
                    <LogOut size={14} />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth(activeRole, 'login')}
              style={{
                padding: '6px 14px',
                backgroundColor: isOfficerRole ? '#0369a1' : '#16a34a',
                color: '#ffffff',
                border: 'none',
                borderRadius: '6px',
                fontWeight: 600,
                fontSize: '0.82rem',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
              }}
            >
              <User size={14} />
              <span>Sign In</span>
            </button>
          )}

          {/* Emergency SOS Button */}
          <button
            onClick={handleSosClick}
            style={{
              padding: '6px 14px',
              backgroundColor: '#dc2626',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 700,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 2px 6px rgba(220, 38, 38, 0.3)',
            }}
          >
            <AlertCircle size={15} />
            <span>SOS Emergency</span>
          </button>
        </div>
      </div>
    </header>
  );
};
