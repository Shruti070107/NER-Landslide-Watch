import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { PublicPortal } from './components/PublicPortal';
import { OfficerDashboard } from './components/OfficerDashboard';
import { EmergencyAlertBanner } from './components/EmergencyAlertBanner';
import { EmergencyActionPanel } from './components/EmergencyActionPanel';
import { AuthModal } from './components/AuthModal';
import { AuthPage } from './components/AuthPage';

import { authService } from './services/authService';
import {
  fetchRiskZones,
  fetchActiveAlerts,
  acknowledgeAlert,
  resolveAlert,
} from './services/api';

import {
  RiskZone,
  Alert,
  UserProfile,
  SupportedLanguage,
} from './types';

export const App: React.FC = () => {
  // Main Dual-Role Mode State: PUBLIC vs OFFICER
  const [activeRole, setActiveRole] = useState<'PUBLIC' | 'OFFICER'>('PUBLIC');

  // Full-page Register / Login State
  const [isAuthPageActive, setIsAuthPageActive] = useState<boolean>(false);

  // Multilingual State
  const [language, setLanguage] = useState<SupportedLanguage>('en');

  // Core Data States
  const [zones, setZones] = useState<RiskZone[]>([]);
  const [selectedZoneCode, setSelectedZoneCode] = useState<string>('NER-103');
  const [activeAlerts, setActiveAlerts] = useState<Alert[]>([]);

  // Status & Settings
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [isSosModalOpen, setIsSosModalOpen] = useState<boolean>(false);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  // Registered Profile
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(authService.getCurrentUser());
  const [isAuthModalOpen, setIsAuthModalOpen] = useState<boolean>(false);
  const [authModalTab, setAuthModalTab] = useState<'login' | 'register'>('login');
  const [authPortalMode, setAuthPortalMode] = useState<'PUBLIC' | 'OFFICER'>('PUBLIC');

  useEffect(() => {
    const unsub = authService.subscribe((u) => setCurrentUser(u));
    return unsub;
  }, []);

  // Selected Risk Zone Object
  const selectedZone = zones.find((z) => z.code === selectedZoneCode) || zones[0] || null;

  // Initial Data Fetch
  const loadInitialData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [zonesRes, alertsRes] = await Promise.all([
        fetchRiskZones(),
        fetchActiveAlerts(),
      ]);

      setZones(zonesRes.data);
      setActiveAlerts(alertsRes.data);
      setIsBackendConnected(!zonesRes.isFallback);

      const defaultZone = zonesRes.data.find((z) => z.code === 'NER-103') || zonesRes.data[0];
      if (defaultZone && !selectedZoneCode) {
        setSelectedZoneCode(defaultZone.code);
      }
    } catch (err) {
      console.error('Error loading disaster data:', err);
    } finally {
      setIsLoading(false);
    }
  }, [selectedZoneCode]);

  useEffect(() => {
    loadInitialData();
  }, [loadInitialData]);

  // Alert Handlers
  const handleAcknowledgeAlert = async (id: string) => {
    try {
      await acknowledgeAlert(id);
      setActiveAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)));
    } catch {
      setActiveAlerts((prev) => prev.map((a) => (a.id === id ? { ...a, status: 'ACKNOWLEDGED' } : a)));
    }
  };

  const handleResolveAlert = async (id: string) => {
    try {
      await resolveAlert(id);
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    } catch {
      setActiveAlerts((prev) => prev.filter((a) => a.id !== id));
    }
  };

  const handleNewAlertDispatched = (newAlert: Alert) => {
    setActiveAlerts((prev) => [newAlert, ...prev]);
  };

  const isOfficerUser = useCallback((user: UserProfile | null): boolean => {
    if (!user) return false;
    return (
      user.role === 'FIELD_OFFICER' ||
      user.role === 'DISASTER_ADMIN' ||
      user.role === 'SUPER_ADMIN' ||
      user.fullName.includes('[Commander]')
    );
  }, []);

  useEffect(() => {
    const unsub = authService.subscribe((u) => {
      setCurrentUser(u);
      if (u) {
        if (isOfficerUser(u)) {
          setActiveRole('OFFICER');
        } else {
          setActiveRole('PUBLIC');
        }
      } else {
        setActiveRole('PUBLIC');
      }
    });
    return unsub;
  }, [isOfficerUser]);

  const handleRoleSwitch = (requestedRole: 'PUBLIC' | 'OFFICER') => {
    setIsAuthPageActive(false);

    if (currentUser) {
      // Authenticated users are strictly locked to their authorized portal
      if (isOfficerUser(currentUser)) {
        setActiveRole('OFFICER');
      } else {
        setActiveRole('PUBLIC');
      }
    } else {
      // Unauthenticated guest user
      if (requestedRole === 'OFFICER') {
        setAuthPortalMode('OFFICER');
        setAuthModalTab('login');
        setIsAuthPageActive(true);
      } else {
        setActiveRole('PUBLIC');
      }
    }
  };

  const handleAuthSuccess = (user: UserProfile) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
    setIsAuthPageActive(false);

    if (isOfficerUser(user)) {
      setActiveRole('OFFICER');
    } else {
      setActiveRole('PUBLIC');
    }
  };

  if (isAuthPageActive) {
    return (
      <AuthPage
        initialTab={authModalTab}
        initialPortalMode={authPortalMode}
        onSuccess={handleAuthSuccess}
        onCancel={() => setIsAuthPageActive(false)}
      />
    );
  }

  return (
    <div className="app-container" style={{ minHeight: '100vh', backgroundColor: '#f6f8f4', color: '#1c2b1a' }}>
      {/* 1. Header with Role Switcher & Language Selector */}
      <Header
        zones={zones}
        selectedZoneCode={selectedZoneCode}
        onSelectZone={(code) => setSelectedZoneCode(code)}
        activeAlertCount={activeAlerts.length}
        onOpenAlerts={() => handleRoleSwitch('OFFICER')}
        isLive={isLive}
        onToggleLive={() => setIsLive((v) => !v)}
        isBackendConnected={isBackendConnected}
        activeRole={activeRole}
        onChangeActiveRole={(role) => handleRoleSwitch(role)}
        language={language}
        onChangeLanguage={(lang) => setLanguage(lang)}
        onOpenSos={() => setIsSosModalOpen(true)}
        currentUser={currentUser}
        onOpenAuth={(portalMode, tab) => {
          setAuthPortalMode(portalMode || 'PUBLIC');
          setAuthModalTab(tab || 'login');
          setIsAuthPageActive(true);
        }}
      />

      {/* 2. Emergency Alert Banner */}
      <EmergencyAlertBanner
        alerts={activeAlerts}
        onAcknowledge={handleAcknowledgeAlert}
        onResolve={handleResolveAlert}
        onOpenSos={() => setIsSosModalOpen(true)}
      />

      {/* 3. Main Operational Content - Dedicated View rendering */}
      <main className="main-content">
        {activeRole === 'PUBLIC' ? (
          <PublicPortal
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={(code) => setSelectedZoneCode(code)}
            language={language}
            onChangeLanguage={(lang) => setLanguage(lang)}
            onOpenSos={() => setIsSosModalOpen(true)}
          />
        ) : (
          <OfficerDashboard
            zones={zones}
            selectedZone={selectedZone}
            onSelectZone={(code) => setSelectedZoneCode(code)}
            activeAlerts={activeAlerts}
            onDispatchAlert={handleNewAlertDispatched}
          />
        )}
      </main>

      {/* 4. SOS Distress Modal */}
      {isSosModalOpen && (
        <EmergencyActionPanel
          selectedZone={selectedZone}
          onAlertDispatched={handleNewAlertDispatched}
          isOpenModal={isSosModalOpen}
          onCloseModal={() => setIsSosModalOpen(false)}
          currentUser={currentUser}
        />
      )}

      {/* 5. User Registration & Auth Modal */}
      <AuthModal
        isOpen={isAuthModalOpen}
        initialTab={authModalTab}
        initialPortalMode={authPortalMode}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={handleAuthSuccess}
      />
    </div>
  );
};

export default App;
