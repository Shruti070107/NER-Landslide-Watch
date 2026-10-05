import React, { useState, useEffect } from 'react';
import {
  Camera,
  MapPin,
  AlertTriangle,
  Upload,
  Phone,
  Shield,
  Wifi,
  WifiOff,
  Send,
  MessageSquare,
  CheckCircle,
  Clock,
  Calendar,
  CloudRain,
  ChevronRight,
  HelpCircle,
  Volume2,
  X,
} from 'lucide-react';

import {
  GeoTaggedReport,
  HazardType,
  RiskZone,
  SupportedLanguage,
  LandslidePrediction30Day,
  OpenMeteoForecast,
  RoboticCallCampaign,
} from '../types';

import { offlineSyncService } from '../services/offlineSyncService';
import { roboticCallService } from '../services/roboticCallService';
import { generate30DayPrediction } from '../services/predictiveEngine';
import { fetchOpenMeteoWeather } from '../services/openMeteoService';

import { CustomLocationPredictor } from './CustomLocationPredictor';

interface PublicPortalProps {
  zones: RiskZone[];
  selectedZone: RiskZone | null;
  onSelectZone: (code: string) => void;
  language: SupportedLanguage;
  onChangeLanguage: (lang: SupportedLanguage) => void;
  onOpenSos: () => void;
}

const UI_TEXT = {
  en: {
    title: 'Landslide Gaurd NER - Public Portal',
    sub: 'North Eastern Region Real-Time Early Warning & GeoTagged Hazard Reporting',
    uploadHeader: 'Report GeoTagged Hazard (Crack, Mudslide, Road Damage)',
    uploadDesc: 'Help disaster commanders save lives by uploading geotagged photos of hill cracks, rockfalls, or road blockages.',
    pickLocation: 'Current GPS Location',
    hazardCategory: 'Hazard Type',
    description: 'Describe what you see',
    photoLabel: 'Upload / Snap Photo of Hazard',
    submitReport: 'Submit GeoTagged Field Report',
    offlineNotice: 'Offline Mode Active: Report will save locally & sync when network returns.',
    smsFallback: 'Send via Cellular SMS (Zero Internet)',
    localWeatherTitle: '30-Day Open-Meteo Weather & Landslide Early Warning',
    sheltersTitle: 'Emergency Hotline & Designated Relief Shelters',
    myReportsTitle: 'My Submitted GeoTagged Field Reports',
  },
  as: {
    title: 'সুৰক্ষা নাগৰিক সাহায্য প’ৰ্টেল',
    sub: 'উত্তৰ পূৰ্বাঞ্চলৰ আগতীয়া সতৰ্কতা আৰু ভূ-স্খলনৰ তথ্য দাখিল',
    uploadHeader: 'ভূ-চিহ্নিত আপদৰ ফটো আপলোড কৰক',
    uploadDesc: 'পাহাৰৰ ফাট বা পথ বন্ধ হোৱাৰ তথ্য দি প্ৰশাসনক সহায় কৰক।',
    pickLocation: 'জি পি এছ অৱস্থান',
    hazardCategory: 'আপদৰ প্ৰকাৰ',
    description: 'বিৱৰণ',
    photoLabel: 'ফটো আপলোড কৰক',
    submitReport: 'প্ৰতিবেদন দাখিল কৰক',
    offlineNotice: 'অফলাইন মোড: ইন্টাৰনেট নথকালৈ স্থানীয়ভাৱে সংৰক্ষিত হ’ব।',
    smsFallback: 'এছ এম এছ ৰ যোগেদি প্ৰেৰণ কৰক (SMS)',
    localWeatherTitle: '৩০ দিনৰ বতৰ আৰু ভূ-স্খলনৰ পূৰ্বাভাস',
    sheltersTitle: 'জৰুৰীকালীন সাহায্য আৰু আশ্ৰয় শিবিৰ',
    myReportsTitle: 'মোৰ দাখিল কৰা প্ৰতিবেদনসমূহ',
  },
  bn: {
    title: 'সুরক্ষা নাগরিক দুর্যোগ রিপোর্ট পোর্টাল',
    sub: 'উত্তর পূর্বাঞ্চলের অগ্রিম সতর্কতা ও ভূমিধস রিপোর্টিং',
    uploadHeader: 'জিওট্যাগযুক্ত বিপদের ছবি জমা দিন',
    uploadDesc: 'পাহাড়ে ফাটল বা রাস্তা ব্লকেজের ছবি তুলে দুর্যোগ মোকাবিলা বাহিনীকে জানান।',
    pickLocation: 'বর্তমান জিপিএস অবস্থান',
    hazardCategory: 'বিপদের ধরন',
    description: 'বিবরণ দিন',
    photoLabel: 'ছবি তুলুন / আপলোড করুন',
    submitReport: 'রিপোর্ট জমা দিন',
    offlineNotice: 'অফলাইন মোড: ইন্টারনেট এলে স্বয়ংক্রিয়ভাবে সিঙ্ক হবে।',
    smsFallback: 'মোবাইল এসএমএস এর মাধ্যমে পাঠান',
    localWeatherTitle: '৩০ দিনের আবহাওয়া ও ভূমিধসের পূর্বাভাস',
    sheltersTitle: 'জরুরি হেল্পলাইন ও আশ্রয়কেন্দ্র',
    myReportsTitle: 'আমার জমাকৃত রিপোর্টসমূহ',
  },
  hi: {
    title: 'सुरक्षा नागरिक आपदा रिपोर्ट पोर्टल',
    sub: 'पूर्वोत्तर भारत भूस्खलन पूर्व चेतावनी एवं रिपोर्टिंग प्रणाली',
    uploadHeader: 'जियो-टैग की गई खतरे की फोटो अपलोड करें',
    uploadDesc: 'दरारें, मलबे या अवरुद्ध सड़कों की फोटो भेजकर आपदा प्रबंधन में सहयोग करें।',
    pickLocation: 'वर्तमान जीपीएस स्थान',
    hazardCategory: 'खतरे का प्रकार',
    description: 'विवरण लिखें',
    photoLabel: 'फोटो लें या अपलोड करें',
    submitReport: 'रिपोर्ट जमा करें',
    offlineNotice: 'ऑफलाइन मोड: इंटरनेट वापस आने पर स्वतः सिंक हो जाएगा।',
    smsFallback: 'बिना इंटरनेट SMS से भेजें',
    localWeatherTitle: '30-दिवसीय मौसम एवं भूस्खलन चेतावनी',
    sheltersTitle: 'आपातकालीन हेल्पलाइन और राहत शिविर',
    myReportsTitle: 'मेरी भेजी गई रिपोर्ट',
  },
  ne: {
    title: 'सुरक्षा नागरिक पहिरो चेतावनी पोर्टल',
    sub: 'उत्तर पूर्वी क्षेत्र पहिरो पूर्व सूचना तथा रिपोर्टिङ',
    uploadHeader: 'जियो-ट्याग गरिएको फोटो अपलोड गर्नुहोस्',
    uploadDesc: 'पहिरो वा बाटो बन्द भएको फोटो पठाई सहयोग गर्नुहोस्।',
    pickLocation: 'वर्तमान GPS स्थान',
    hazardCategory: 'खतराको प्रकार',
    description: 'विवरण',
    photoLabel: 'फोटो अपलोड गर्नुहोस्',
    submitReport: 'रिपोर्ट पठाउनुहोस्',
    offlineNotice: 'अफलाइन मोड: इन्टरनेट आउँदा आफैँ सिङ्क हुनेछ।',
    smsFallback: 'सेलुलर SMS मार्फत पठाउनुहोस्',
    localWeatherTitle: '३० दिने मौसम र पहिरो पूर्वानुमान',
    sheltersTitle: 'आपतकालीन हेल्पलाइन र राहत शिविर',
    myReportsTitle: 'मेरा रिपोर्टहरू',
  },
  kha: {
    title: 'Suraksha Citizen Portal',
    sub: 'Pyngngam Khubor ha Meghalaya bad North East Region',
    uploadHeader: 'Phah ia ki Dur jong ki Jingma (GeoTagged)',
    uploadDesc: 'Yarap ia ki Bor District da kaba phah ia ki dur jong ki jingbthei phang or jingshisha khyndew.',
    pickLocation: 'Jaka GPS',
    hazardCategory: 'Jait Jingma',
    description: 'Batai ia kaba jah',
    photoLabel: 'Shim / Phah Dur',
    submitReport: 'Phah Report',
    offlineNotice: 'Offline Mode: Kan set shuwa ha phone ryngkat SMS options.',
    smsFallback: 'Phah da SMS (Ja-ka khlem Internet)',
    localWeatherTitle: '30 Sngi weather forecast & warning',
    sheltersTitle: 'Emergency Hotline & Shelter',
    myReportsTitle: 'Ki Report jong nga',
  },
  mzo: {
    title: 'Suraksha mipuite tan Disaster Portal',
    sub: 'North East Leimin venchhuana leh field reporting system',
    uploadHeader: 'Leimin/Kawng ping GeoTagged hmun thlalak thawn rawh',
    uploadDesc: 'Leimin leh kawng ping thlalak thawnin Disaster team-te tanpui rawh.',
    pickLocation: 'GPS Hmun',
    hazardCategory: 'Harsatna Chi',
    description: 'Hrilhfiahna',
    photoLabel: 'Thlalak Thawn',
    submitReport: 'Report Thawn',
    offlineNotice: 'Offline Mode: Net a awm hunah auto-sync a ni ang.',
    smsFallback: 'SMS hmangin thawn rawh',
    localWeatherTitle: 'Ni 30 chhung khawchin leh leimin warning',
    sheltersTitle: 'Emergency Line leh Hmun Him',
    myReportsTitle: 'Ka report thawn tawhte',
  },
  mni: {
    title: 'Suraksha Citizen Reporting Portal',
    sub: 'North East Region Landslide Early Warning System',
    uploadHeader: 'GeoTagged Photo Upload Toubiyu',
    uploadDesc: 'Chingda crack lakpa amadi lambi tinba photo upload toubada mateng pangbiyow.',
    pickLocation: 'Current GPS Location',
    hazardCategory: 'Hazard Category',
    description: 'Description',
    photoLabel: 'Upload Photo',
    submitReport: 'Submit Report',
    offlineNotice: 'Offline Mode: Network lakpada automatically sync tougani.',
    smsFallback: 'Send via SMS',
    localWeatherTitle: '30-Day Weather & Landslide Forecast',
    sheltersTitle: 'Emergency Helpline & Shelters',
    myReportsTitle: 'Submitted Reports',
  },
};

export const PublicPortal: React.FC<PublicPortalProps> = ({
  zones,
  selectedZone,
  onSelectZone,
  language,
  onChangeLanguage,
  onOpenSos,
}) => {
  const texts = UI_TEXT[language] || UI_TEXT.en;

  // Form states for GeoTagged Hazard Upload
  const [hazardType, setHazardType] = useState<HazardType>('SLOPE_CRACK');
  const [description, setDescription] = useState<string>('');
  const [locationName, setLocationName] = useState<string>(selectedZone?.name || 'Gangtok Ridge Road');
  const [latitude, setLatitude] = useState<number>(selectedZone?.latitude || 27.3389);
  const [longitude, setLongitude] = useState<number>(selectedZone?.longitude || 88.6138);
  const [reporterName, setReporterName] = useState<string>('');
  const [reporterPhone, setReporterPhone] = useState<string>('');
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);

  // Statuses
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccessMsg, setSubmitSuccessMsg] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Prediction & Weather Data
  const [prediction30d, setPrediction30d] = useState<LandslidePrediction30Day | null>(null);
  const [openMeteoWeather, setOpenMeteoWeather] = useState<OpenMeteoForecast | null>(null);
  const [myReports, setMyReports] = useState<GeoTaggedReport[]>([]);

  // Live Robotic Voice Call Audio Broadcast state
  const [liveRoboticCall, setLiveRoboticCall] = useState<RoboticCallCampaign | null>(roboticCallService.getLiveBroadcast());
  const [callResponseSent, setCallResponseSent] = useState<string | null>(null);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Subscribe to offline sync updates
    const unsub = offlineSyncService.subscribe((reports) => setMyReports(reports));
    setMyReports(offlineSyncService.getAllReports());

    // Subscribe to live robotic call broadcast events from Officers
    const unsubCalls = roboticCallService.subscribeBroadcast((call) => {
      setLiveRoboticCall(call);
    });

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      unsub();
      unsubCalls();
    };
  }, []);

  // Update location when selectedZone changes
  useEffect(() => {
    if (selectedZone) {
      setLatitude(selectedZone.latitude);
      setLongitude(selectedZone.longitude);
      setLocationName(`${selectedZone.name}, ${selectedZone.district}`);

      // Load Open-Meteo & 30-Day prediction
      generate30DayPrediction(selectedZone.latitude, selectedZone.longitude, selectedZone).then((pred) =>
        setPrediction30d(pred)
      );
      fetchOpenMeteoWeather(selectedZone.latitude, selectedZone.longitude).then((w) => setOpenMeteoWeather(w));
    }
  }, [selectedZone]);

  // Handle Photo File Selection
  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  // Get current device GPS location
  const handleGetLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          setLatitude(parseFloat(pos.coords.latitude.toFixed(4)));
          setLongitude(parseFloat(pos.coords.longitude.toFixed(4)));
          setLocationName(`GPS Location (${pos.coords.latitude.toFixed(3)}°, ${pos.coords.longitude.toFixed(3)}°)`);
        },
        (err) => {
          console.warn('Geolocation error:', err);
          alert('Could not fetch exact GPS coordinates. Using selected district defaults.');
        }
      );
    }
  };

  // Submit GeoTagged Report
  const handleSubmitReport = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newReport: GeoTaggedReport = {
      id: 'rep-' + Date.now(),
      title: `${hazardType.replace('_', ' ')} near ${locationName}`,
      hazardType,
      severity: hazardType === 'MUDSLIDE' || hazardType === 'ROCKFALL' ? 'CRITICAL' : 'HIGH',
      description: description || 'GeoTagged citizen field report submitted via Suraksha App.',
      imageUrl: photoPreview || 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
      latitude,
      longitude,
      locationName,
      district: selectedZone?.district || 'East Sikkim',
      state: selectedZone?.state || 'Sikkim',
      submittedBy: reporterName || 'Anonymous Citizen',
      contactPhone: reporterPhone || '+91 98000 00000',
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      synced: navigator.onLine,
      aiRiskAssessmentScore: Math.floor(Math.random() * 25) + 70,
    };

    offlineSyncService.saveReport(newReport);
    setIsSubmitting(false);

    if (navigator.onLine) {
      setSubmitSuccessMsg('✅ Report transmitted to Disaster Response Officers. Thank you!');
    } else {
      setSubmitSuccessMsg('💾 Report saved locally in Offline Queue. Will sync when network connects.');
    }

    // Reset Form
    setDescription('');
    setPhotoPreview(null);
    setTimeout(() => setSubmitSuccessMsg(null), 6000);
  };

  const handleSmsFallback = () => {
    const dummyReport: GeoTaggedReport = {
      id: 'sms-temp',
      title: 'SMS Report',
      hazardType,
      severity: 'HIGH',
      description,
      latitude,
      longitude,
      locationName,
      district: 'NER',
      state: 'NER',
      submittedBy: reporterName,
      contactPhone: reporterPhone,
      timestamp: new Date().toISOString(),
      status: 'PENDING',
      synced: false,
    };
    offlineSyncService.sendSmsEmergency(dummyReport);
  };

  return (
    <div className="public-portal-container" style={{ padding: '1.25rem', maxWidth: '1280px', margin: '0 auto' }}>
      {/* 1. Header Banner & Location / Network Bar */}
      <div
        className="public-portal-hero"
        style={{
          background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
          color: '#ffffff',
          padding: '1.75rem',
          borderRadius: '16px',
          marginBottom: '1.5rem',
          boxShadow: '0 10px 25px -5px rgba(15, 23, 42, 0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <Shield size={28} color="#38bdf8" />
              <h1 style={{ fontSize: '1.65rem', fontWeight: 800, margin: 0, letterSpacing: '-0.5px', color: '#ffffff' }}>{texts.title}</h1>
            </div>
            <p style={{ color: '#e2e8f0', fontSize: '0.95rem', margin: 0 }}>{texts.sub}</p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flexWrap: 'wrap' }}>
            {/* Network Badge */}
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 14px',
                borderRadius: '20px',
                backgroundColor: isOnline ? 'rgba(34, 197, 94, 0.15)' : 'rgba(239, 68, 68, 0.2)',
                border: `1px solid ${isOnline ? '#22c55e' : '#ef4444'}`,
                color: isOnline ? '#4ade80' : '#f87171',
                fontSize: '0.85rem',
                fontWeight: 600,
              }}
            >
              {isOnline ? <Wifi size={14} /> : <WifiOff size={14} />}
              <span>{isOnline ? 'Network Connected (Online Sync)' : 'Low / No Network (Offline Mode)'}</span>
            </div>

            {/* Emergency SOS Button */}
            <button
              onClick={onOpenSos}
              style={{
                backgroundColor: '#dc2626',
                color: '#ffffff',
                border: 'none',
                padding: '8px 18px',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.9rem',
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                cursor: 'pointer',
                boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
              }}
            >
              <Phone size={16} /> <span>Emergency SOS</span>
            </button>
          </div>
        </div>

        {/* Region & Zone Selection Bar */}
        <div
          style={{
            marginTop: '1.25rem',
            paddingTop: '1rem',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#f8fafc', fontWeight: 600 }}>Select District / Zone:</span>
          <select
            value={selectedZone?.code || 'NER-103'}
            onChange={(e) => onSelectZone(e.target.value)}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              border: '1px solid #475569',
              backgroundColor: '#1e293b',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 600,
              outline: 'none',
              cursor: 'pointer',
            }}
          >
            {zones.map((z) => (
              <option key={z.code} value={z.code}>
                {z.name} ({z.district}, {z.state}) - Risk: {z.currentRiskLevel}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 2. LIVE ROBOTIC VOICE CALL AUDIO PLAYER BANNER FOR CITIZENS */}
      {liveRoboticCall && (
        <div
          style={{
            padding: '1.25rem',
            backgroundColor: '#fef2f2',
            border: '2px solid #ef4444',
            borderRadius: '16px',
            marginBottom: '1.5rem',
            boxShadow: '0 8px 24px -4px rgba(239, 68, 68, 0.3)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <div style={{ padding: '12px', borderRadius: '50%', backgroundColor: '#dc2626', color: '#ffffff' }}>
                <Volume2 size={24} className="pulse-icon" />
              </div>
              <div>
                <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#dc2626', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  📞 LIVE INCOMING AUTOMATED ROBOTIC VOICE CALL
                </span>
                <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#991b1b', margin: '2px 0 4px 0' }}>
                  Emergency Alert: {liveRoboticCall.targetZoneName}
                </h3>
                <p style={{ fontSize: '0.88rem', color: '#7f1d1d', margin: 0, fontWeight: 500 }}>
                  "{liveRoboticCall.messageTemplate}"
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <button
                type="button"
                onClick={() => roboticCallService.speakRoboticVoiceCall(liveRoboticCall.messageTemplate, liveRoboticCall.language)}
                style={{
                  padding: '8px 16px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  boxShadow: '0 4px 12px rgba(220, 38, 38, 0.4)',
                }}
              >
                <Volume2 size={16} /> <span>Hear Live Voice Advisory</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  roboticCallService.recordCitizenResponseDetails(
                    liveRoboticCall.id,
                    liveRoboticCall.targetZoneCode,
                    liveRoboticCall.targetZoneName,
                    'SAFE',
                    reporterName || 'Local Resident',
                    reporterPhone || '+91 98000 12345',
                    locationName || liveRoboticCall.targetZoneName
                  );
                  setCallResponseSent('Press 1 Confirmed: You marked yourself SAFE.');
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#15803d',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Press 1: I am Safe
              </button>

              <button
                type="button"
                onClick={() => {
                  roboticCallService.recordCitizenResponseDetails(
                    liveRoboticCall.id,
                    liveRoboticCall.targetZoneCode,
                    liveRoboticCall.targetZoneName,
                    'RESCUE_NEEDED',
                    reporterName || 'Local Resident',
                    reporterPhone || '+91 98000 12345',
                    locationName || liveRoboticCall.targetZoneName
                  );
                  setCallResponseSent('Press 2 Confirmed: Evacuation Rescue Vehicle Requested!');
                }}
                style={{
                  padding: '8px 14px',
                  backgroundColor: '#78350f',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.82rem',
                  cursor: 'pointer',
                }}
              >
                Press 2: Request Rescue Vehicle
              </button>

              <button
                type="button"
                onClick={() => roboticCallService.dismissLiveBroadcast()}
                style={{ color: '#991b1b', background: 'none', border: 'none', cursor: 'pointer', padding: '4px' }}
                title="Dismiss banner"
              >
                <X size={20} />
              </button>
            </div>
          </div>

          {callResponseSent && (
            <div style={{ marginTop: '10px', fontSize: '0.82rem', fontWeight: 700, color: '#15803d', backgroundColor: '#dcfce7', padding: '6px 12px', borderRadius: '6px' }}>
              ✅ {callResponseSent} (Telemetry updated on Officer Command Center)
            </div>
          )}
        </div>
      )}

      {/* Offline Alert Warning Banner */}
      {!isOnline && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#fff7ed',
            border: '1px solid #fed7aa',
            borderRadius: '12px',
            marginBottom: '1.5rem',
            color: '#c2410c',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
            flexWrap: 'wrap',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <WifiOff size={22} color="#ea580c" />
            <div>
              <strong style={{ fontSize: '0.92rem' }}>{texts.offlineNotice}</strong>
              <p style={{ fontSize: '0.82rem', margin: '2px 0 0 0', color: '#9a3412' }}>
                You can still capture geotagged photos. Reports will automatically transmit to disaster authorities as soon as cellular data returns.
              </p>
            </div>
          </div>
          <button
            onClick={handleSmsFallback}
            style={{
              padding: '6px 14px',
              backgroundColor: '#ea580c',
              color: '#ffffff',
              border: 'none',
              borderRadius: '6px',
              fontWeight: 600,
              fontSize: '0.82rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <MessageSquare size={14} /> {texts.smsFallback}
          </button>
        </div>
      )}

      {/* Success Banner */}
      {submitSuccessMsg && (
        <div
          style={{
            padding: '1rem',
            backgroundColor: '#f0fdf4',
            border: '1px solid #bbf7d0',
            borderRadius: '12px',
            color: '#15803d',
            marginBottom: '1.5rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}
        >
          <CheckCircle size={20} />
          <span>{submitSuccessMsg}</span>
        </div>
      )}

      {/* AI Landslide Predictor by Custom Location / Coordinates */}
      <CustomLocationPredictor />

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '1.5rem' }}>
        {/* LEFT COLUMN: GeoTagged Hazard Photo Upload Form */}
        <div
          style={{
            backgroundColor: '#ffffff',
            borderRadius: '16px',
            padding: '1.5rem',
            boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e2e8f0',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '1.25rem' }}>
            <div style={{ padding: '10px', borderRadius: '10px', backgroundColor: '#eff6ff', color: '#2563eb' }}>
              <Camera size={22} />
            </div>
            <div>
              <h2 style={{ fontSize: '1.15rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{texts.uploadHeader}</h2>
              <p style={{ fontSize: '0.82rem', color: '#64748b', margin: 0 }}>{texts.uploadDesc}</p>
            </div>
          </div>

          <form onSubmit={handleSubmitReport}>
            {/* 1. Hazard Type */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                {texts.hazardCategory} *
              </label>
              <select
                value={hazardType}
                onChange={(e) => setHazardType(e.target.value as HazardType)}
                style={{
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.9rem',
                  backgroundColor: '#f8fafc',
                  outline: 'none',
                }}
              >
                <option value="SLOPE_CRACK">Fracture / Deep Crack on Hillside</option>
                <option value="MUDSLIDE">Active Mudslide / Soil Slump</option>
                <option value="ROCKFALL">Rockfall / Fallen Boulders</option>
                <option value="ROAD_BLOCKAGE">Highway / Road Blockage</option>
                <option value="FLASH_FLOOD">Flash Flood / Culvert Overflow</option>
                <option value="OTHER">Other Hazardous Movement</option>
              </select>
            </div>

            {/* 2. Photo Upload Box */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                {texts.photoLabel} *
              </label>

              <div
                style={{
                  border: '2px dashed #cbd5e1',
                  borderRadius: '12px',
                  padding: '1.25rem',
                  textAlign: 'center',
                  backgroundColor: '#f8fafc',
                  cursor: 'pointer',
                  position: 'relative',
                }}
              >
                {photoPreview ? (
                  <div style={{ position: 'relative' }}>
                    <img
                      src={photoPreview}
                      alt="Hazard preview"
                      style={{ width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '8px' }}
                    />
                    <button
                      type="button"
                      onClick={() => setPhotoPreview(null)}
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: 'rgba(15, 23, 42, 0.75)',
                        color: '#ffffff',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '4px 8px',
                        fontSize: '0.75rem',
                        cursor: 'pointer',
                      }}
                    >
                      Change Photo
                    </button>
                  </div>
                ) : (
                  <label style={{ cursor: 'pointer', display: 'block' }}>
                    <Upload size={32} color="#64748b" style={{ margin: '0 auto 8px auto' }} />
                    <span style={{ fontSize: '0.88rem', fontWeight: 600, color: '#2563eb', display: 'block' }}>
                      Click to Capture / Upload Photo
                    </span>
                    <span style={{ fontSize: '0.75rem', color: '#94a3b8' }}>Supports JPG, PNG, WEBP (Auto GeoTagged)</span>
                    <input type="file" accept="image/*" capture="environment" onChange={handlePhotoChange} style={{ display: 'none' }} />
                  </label>
                )}
              </div>
            </div>

            {/* 3. Location & GPS Coords */}
            <div style={{ marginBottom: '1rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>Location & GPS Coordinates *</label>
                <button
                  type="button"
                  onClick={handleGetLocation}
                  style={{
                    backgroundColor: '#eff6ff',
                    color: '#2563eb',
                    border: '1px solid #bfdbfe',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    fontSize: '0.78rem',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <MapPin size={12} /> {texts.pickLocation}
                </button>
              </div>

              <input
                type="text"
                value={locationName}
                onChange={(e) => setLocationName(e.target.value)}
                placeholder="e.g. Tadong Mile 4, NH10 Corridor"
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  marginBottom: '8px',
                  outline: 'none',
                }}
                required
              />

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div style={{ fontSize: '0.78rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '6px' }}>
                  Lat: <strong>{latitude}° N</strong>
                </div>
                <div style={{ fontSize: '0.78rem', color: '#64748b', backgroundColor: '#f1f5f9', padding: '6px 10px', borderRadius: '6px' }}>
                  Lng: <strong>{longitude}° E</strong>
                </div>
              </div>
            </div>

            {/* 4. Description */}
            <div style={{ marginBottom: '1rem' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#334155', marginBottom: '6px' }}>
                {texts.description}
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Details of crack size, road blockage, water seepage, or rockfall severity..."
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '8px',
                  border: '1px solid #cbd5e1',
                  fontSize: '0.88rem',
                  outline: 'none',
                  resize: 'vertical',
                }}
              />
            </div>

            {/* 5. Contact Phone */}
            <div style={{ marginBottom: '1.25rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Your Name
                </label>
                <input
                  type="text"
                  value={reporterName}
                  onChange={(e) => setReporterName(e.target.value)}
                  placeholder="Full Name"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                  }}
                />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.78rem', fontWeight: 600, color: '#475569', marginBottom: '4px' }}>
                  Contact Phone *
                </label>
                <input
                  type="tel"
                  value={reporterPhone}
                  onChange={(e) => setReporterPhone(e.target.value)}
                  placeholder="+91 98XXX XXXXX"
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '6px',
                    border: '1px solid #cbd5e1',
                    fontSize: '0.82rem',
                  }}
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isSubmitting}
              style={{
                width: '100%',
                padding: '12px',
                backgroundColor: isOnline ? '#2563eb' : '#ea580c',
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
                boxShadow: isOnline ? '0 4px 14px rgba(37, 99, 235, 0.35)' : '0 4px 14px rgba(234, 88, 12, 0.35)',
              }}
            >
              <Send size={18} />
              <span>{isSubmitting ? 'Transmitting...' : texts.submitReport}</span>
            </button>
          </form>
        </div>

        {/* RIGHT COLUMN: 30-Day Open-Meteo Landslide Risk Forecast & Local Shelters */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          {/* 30-Day Open-Meteo Weather & AI Landslide Risk Widget */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <CloudRain size={22} color="#0284c7" />
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{texts.localWeatherTitle}</h3>
              </div>
              <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#0284c7', backgroundColor: '#e0f2fe', padding: '4px 8px', borderRadius: '4px' }}>
                Open-Meteo Live API
              </span>
            </div>

            {/* Weather & Soil Saturation Highlights */}
            {openMeteoWeather && (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(3, 1fr)',
                  gap: '8px',
                  marginBottom: '1rem',
                  textAlign: 'center',
                }}
              >
                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Current Temp</span>
                  <strong style={{ fontSize: '1rem', color: '#0f172a' }}>{openMeteoWeather.currentTempCelsius}°C</strong>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>7-Day Rain</span>
                  <strong style={{ fontSize: '1rem', color: '#0284c7' }}>{openMeteoWeather.cumulativeRainfall7d} mm</strong>
                </div>

                <div style={{ backgroundColor: '#f8fafc', padding: '10px', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                  <span style={{ fontSize: '0.72rem', color: '#64748b', display: 'block' }}>Soil Saturation</span>
                  <strong style={{ fontSize: '1rem', color: openMeteoWeather.soilSaturationIndex > 80 ? '#dc2626' : '#16a34a' }}>
                    {openMeteoWeather.soilSaturationIndex}%
                  </strong>
                </div>
              </div>
            )}

            {/* 30-Day AI Predictive Summary */}
            {prediction30d && (
              <div
                style={{
                  backgroundColor: prediction30d.overallRiskLevel === 'CRITICAL' ? '#fef2f2' : '#f0fdf4',
                  border: `1px solid ${prediction30d.overallRiskLevel === 'CRITICAL' ? '#fecaca' : '#bbf7d0'}`,
                  borderRadius: '12px',
                  padding: '1rem',
                  marginBottom: '1rem',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <AlertTriangle size={16} color={prediction30d.overallRiskLevel === 'CRITICAL' ? '#dc2626' : '#16a34a'} />
                    <strong style={{ fontSize: '0.88rem', color: prediction30d.overallRiskLevel === 'CRITICAL' ? '#991b1b' : '#166534' }}>
                      Peak Risk Forecast: {prediction30d.overallRiskLevel}
                    </strong>
                  </div>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: '#475569' }}>
                    Peak in {prediction30d.daysUntilPeak} days
                  </span>
                </div>

                <p style={{ fontSize: '0.82rem', color: '#334155', margin: '4px 0 8px 0', lineHeight: 1.4 }}>
                  Open-Meteo predictive model forecasts peak precipitation around <strong>{prediction30d.peakHazardDate}</strong> for{' '}
                  {prediction30d.locationName}. High soil moisture saturation expected.
                </p>

                <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>
                  Affected Highways: <span style={{ color: '#0f172a' }}>{prediction30d.affectedRoads.join(', ')}</span>
                </div>
              </div>
            )}

            {/* Mini 30-Day Risk Forecast Timeline */}
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#475569', display: 'block', marginBottom: '8px' }}>
                Next 7-Day Rainfall Forecast (mm):
              </span>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '4px' }}>
                {openMeteoWeather?.dailyForecast.slice(0, 7).map((d, i) => (
                  <div
                    key={i}
                    style={{
                      backgroundColor: d.precipitationSumMm > 30 ? '#fee2e2' : '#f1f5f9',
                      padding: '6px 2px',
                      borderRadius: '6px',
                      textAlign: 'center',
                      fontSize: '0.72rem',
                    }}
                  >
                    <div style={{ color: '#64748b', fontSize: '0.68rem' }}>{d.date.split('-').slice(1).join('/')}</div>
                    <strong style={{ color: d.precipitationSumMm > 30 ? '#dc2626' : '#0f172a', display: 'block', margin: '2px 0' }}>
                      {d.precipitationSumMm}m
                    </strong>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Emergency Telephone Hotline & Relief Shelters */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1rem' }}>
              <Phone size={20} color="#dc2626" />
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{texts.sheltersTitle}</h3>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginBottom: '1rem' }}>
              <a
                href="tel:1070"
                style={{
                  padding: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  borderRadius: '8px',
                  color: '#dc2626',
                  textDecoration: 'none',
                  textAlign: 'center',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '6px',
                }}
              >
                <Phone size={14} /> Call Helpline 1070
              </a>

              <button
                onClick={onOpenSos}
                style={{
                  padding: '10px',
                  backgroundColor: '#dc2626',
                  color: '#ffffff',
                  border: 'none',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.85rem',
                  cursor: 'pointer',
                }}
              >
                Send SOS Signal
              </button>
            </div>

            <div style={{ fontSize: '0.82rem', color: '#475569' }}>
              <strong>Nearest Designated Relief Shelters ({selectedZone?.state}):</strong>
              <ul style={{ paddingLeft: '1.2rem', margin: '6px 0 0 0', lineHeight: 1.5 }}>
                <li>Community Relief Hall, {selectedZone?.district || 'Gangtok'}</li>
                <li>District Disaster Operations Center (DDMA)</li>
                <li>State Highway Patrol Emergency Staging Point</li>
              </ul>
            </div>
          </div>

          {/* My Submitted Hazard Reports */}
          <div
            style={{
              backgroundColor: '#ffffff',
              borderRadius: '16px',
              padding: '1.5rem',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.05)',
              border: '1px solid #e2e8f0',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0, color: '#0f172a' }}>{texts.myReportsTitle}</h3>
              <span style={{ fontSize: '0.78rem', color: '#64748b' }}>{myReports.length} Submitted</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '260px', overflowY: 'auto' }}>
              {myReports.slice(0, 4).map((r) => (
                <div
                  key={r.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '10px',
                    padding: '8px 10px',
                    borderRadius: '8px',
                    backgroundColor: '#f8fafc',
                    border: '1px solid #f1f5f9',
                  }}
                >
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    style={{ width: '48px', height: '48px', objectFit: 'cover', borderRadius: '6px' }}
                  />
                  <div style={{ flex: 1 }}>
                    <strong style={{ fontSize: '0.82rem', color: '#0f172a', display: 'block' }}>{r.title}</strong>
                    <span style={{ fontSize: '0.72rem', color: '#64748b' }}>{r.locationName}</span>
                  </div>
                  <span
                    style={{
                      fontSize: '0.7rem',
                      fontWeight: 700,
                      padding: '3px 8px',
                      borderRadius: '12px',
                      backgroundColor: r.status === 'VERIFIED' ? '#dcfce7' : r.status === 'DISPATCHED' ? '#dbeafe' : '#fef3c7',
                      color: r.status === 'VERIFIED' ? '#15803d' : r.status === 'DISPATCHED' ? '#1d4ed8' : '#b45309',
                    }}
                  >
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
