import { RoboticCallCampaign } from '../types';

export interface CitizenCallResponse {
  id: string;
  campaignId: string;
  zoneCode: string;
  zoneName: string;
  citizenName: string;
  phoneNumber: string;
  responseType: 'SAFE' | 'RESCUE_NEEDED';
  language: string;
  timestamp: string;
  locality: string;
}

/**
 * LandSlide Guard NER - Automated Telephone Robotic Voice Call Alert Dispatcher Service
 * Triggers automated IVR voice calls to all households in high-risk zones,
 * and streams live audio playback to citizens on the public portal.
 */
export class RoboticCallService {
  private activeCampaigns: RoboticCallCampaign[] = [];
  private activeLiveBroadcast: RoboticCallCampaign | null = null;
  private citizenResponses: CitizenCallResponse[] = [];
  
  private listeners: ((campaigns: RoboticCallCampaign[]) => void)[] = [];
  private broadcastListeners: ((broadcast: RoboticCallCampaign | null) => void)[] = [];
  private responseListeners: ((responses: CitizenCallResponse[]) => void)[] = [];

  constructor() {
    this.activeCampaigns = [
      {
        id: 'call-101',
        targetZoneCode: 'NER-103',
        targetZoneName: 'Gangtok Ridge Corridor',
        language: 'nepali',
        messageTemplate: 'Emergency Landslide Warning: Heavy rainfall & slope instability detected. Move to higher ground immediately.',
        totalHouseholds: 2450,
        callsInitiated: 2450,
        callsConnected: 2380,
        acknowledgements: 2110,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 120 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 110 * 60000).toISOString(),
      },
      {
        id: 'call-102',
        targetZoneCode: 'NER-106',
        targetZoneName: 'Itanagar Foothills',
        language: 'hindi',
        messageTemplate: 'Critical Hill Cut Warning: Imminent slope collapse near NH415. Emergency teams dispatched.',
        totalHouseholds: 1820,
        callsInitiated: 1820,
        callsConnected: 1750,
        acknowledgements: 1540,
        status: 'COMPLETED',
        startedAt: new Date(Date.now() - 45 * 60000).toISOString(),
        completedAt: new Date(Date.now() - 38 * 60000).toISOString(),
      },
    ];

    // Seed realistic initial citizen telephony responses for officers
    this.citizenResponses = [
      {
        id: 'resp-1',
        campaignId: 'call-101',
        zoneCode: 'NER-103',
        zoneName: 'Gangtok Ridge Corridor',
        citizenName: 'Biren Chettri',
        phoneNumber: '+91 98321 44521',
        responseType: 'SAFE',
        language: 'nepali',
        timestamp: new Date(Date.now() - 35 * 60000).toISOString(),
        locality: 'Tadong Mile 5, Gangtok',
      },
      {
        id: 'resp-2',
        campaignId: 'call-101',
        zoneCode: 'NER-103',
        zoneName: 'Gangtok Ridge Corridor',
        citizenName: 'Sunita Sharma',
        phoneNumber: '+91 97750 88214',
        responseType: 'RESCUE_NEEDED',
        language: 'nepali',
        timestamp: new Date(Date.now() - 28 * 60000).toISOString(),
        locality: 'Upper Burtuk Hill, Near Slope Crack',
      },
      {
        id: 'resp-3',
        campaignId: 'call-102',
        zoneCode: 'NER-106',
        zoneName: 'Itanagar Foothills',
        citizenName: 'Tashi Norbu',
        phoneNumber: '+91 94360 11982',
        responseType: 'SAFE',
        language: 'hindi',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        locality: 'Ganga Market Sector, Itanagar',
      },
      {
        id: 'resp-4',
        campaignId: 'call-102',
        zoneCode: 'NER-106',
        zoneName: 'Itanagar Foothills',
        citizenName: 'Pema Khandu',
        phoneNumber: '+91 94362 77410',
        responseType: 'RESCUE_NEEDED',
        language: 'hindi',
        timestamp: new Date(Date.now() - 8 * 60000).toISOString(),
        locality: 'NH415 Bypass, Banderdewa Blockade',
      },
    ];
  }

  public getCampaigns(): RoboticCallCampaign[] {
    return [...this.activeCampaigns];
  }

  public getLiveBroadcast(): RoboticCallCampaign | null {
    return this.activeLiveBroadcast;
  }

  public getCitizenResponses(): CitizenCallResponse[] {
    return [...this.citizenResponses];
  }

  public triggerRoboticCallCampaign(
    zoneCode: string,
    zoneName: string,
    language: 'assamese' | 'bengali' | 'english' | 'hindi' | 'khasi' | 'mizo' | 'nepali',
    householdsCount = 1850,
    customMessage?: string
  ): RoboticCallCampaign {
    const campaignId = 'call-' + Date.now();
    const defaultMsg = getLocalizedVoiceScript(language, zoneName);

    const newCampaign: RoboticCallCampaign = {
      id: campaignId,
      targetZoneCode: zoneCode,
      targetZoneName: zoneName,
      language,
      messageTemplate: customMessage || defaultMsg,
      totalHouseholds: householdsCount,
      callsInitiated: 0,
      callsConnected: 0,
      acknowledgements: 0,
      status: 'CALLING',
      startedAt: new Date().toISOString(),
    };

    this.activeCampaigns.unshift(newCampaign);
    this.activeLiveBroadcast = newCampaign;
    this.notifyListeners();
    this.notifyBroadcastListeners();

    // Auto speak audio broadcast if supported
    this.speakRoboticVoiceCall(newCampaign.messageTemplate, language);

    // Simulate real-time automated voice calling progress
    let current = 0;
    const interval = setInterval(() => {
      current += Math.floor(Math.random() * 220) + 140;
      if (current >= householdsCount) {
        current = householdsCount;
        clearInterval(interval);
      }

      this.activeCampaigns = this.activeCampaigns.map((c) => {
        if (c.id === campaignId) {
          const connected = Math.floor(current * 0.94);
          const ack = Math.floor(connected * 0.88);
          const isDone = current >= householdsCount;
          const updated = {
            ...c,
            callsInitiated: current,
            callsConnected: connected,
            acknowledgements: ack,
            status: isDone ? ('COMPLETED' as const) : ('CALLING' as const),
            completedAt: isDone ? new Date().toISOString() : undefined,
          };
          return updated;
        }
        return c;
      });

      this.notifyListeners();
    }, 800);

    return newCampaign;
  }

  /**
   * Multilingual Text-to-Speech audio playback using Web Speech API
   * Supports Assamese, Bengali, Hindi, Nepali, Khasi, Mizo, Manipuri, and English.
   */
  public speakRoboticVoiceCall(text: string, language: string) {
    if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
      console.warn('Speech synthesis API not supported on this browser.');
      return;
    }

    try {
      window.speechSynthesis.cancel(); // Stop any active speech

      const scriptText = text || getLocalizedVoiceScript(language, 'North East Region');
      const utterance = new SpeechSynthesisUtterance(scriptText);
      utterance.rate = 0.90; // Slower rate for emergency clarity
      utterance.pitch = 1.0;

      // Select voice matching language if available
      const voices = window.speechSynthesis.getVoices();
      const langCodeMap: Record<string, string> = {
        english: 'en-IN',
        hindi: 'hi-IN',
        bengali: 'bn-IN',
        assamese: 'as-IN',
        nepali: 'ne-NP',
        khasi: 'en-IN',
        mizo: 'en-IN',
      };

      const targetLang = langCodeMap[language] || 'en-IN';
      utterance.lang = targetLang;

      // Find matching voice by lang tag or country code
      const matchedVoice = voices.find(
        (v) => v.lang.toLowerCase().replace('_', '-').startsWith(targetLang.toLowerCase()) ||
               (targetLang === 'as-IN' && v.lang.includes('bn')) ||
               (targetLang === 'ne-NP' && v.lang.includes('hi')) ||
               v.lang.includes('IN')
      );

      if (matchedVoice) {
        utterance.voice = matchedVoice;
      }

      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('Speech synthesis playback error:', err);
    }
  }

  /**
   * Citizen Response Handler - Records detailed telemetry for Officers
   */
  public recordCitizenResponseDetails(
    campaignId: string,
    zoneCode: string,
    zoneName: string,
    responseType: 'SAFE' | 'RESCUE_NEEDED',
    citizenName = 'Local Resident',
    phoneNumber = '+91 98000 00000',
    locality = 'North East Settlement'
  ) {
    // 1. Increment acknowledgement count in campaign
    this.activeCampaigns = this.activeCampaigns.map((c) => {
      if (c.id === campaignId || c.targetZoneCode === zoneCode) {
        return {
          ...c,
          acknowledgements: c.acknowledgements + 1,
        };
      }
      return c;
    });

    // 2. Add detailed response record for Commander feed
    const newResponse: CitizenCallResponse = {
      id: 'resp-' + Date.now(),
      campaignId,
      zoneCode,
      zoneName,
      citizenName,
      phoneNumber,
      responseType,
      language: 'english',
      timestamp: new Date().toISOString(),
      locality,
    };

    this.citizenResponses.unshift(newResponse);

    this.notifyListeners();
    this.notifyResponseListeners();
  }

  public recordCitizenResponse(campaignId: string, responseType: 'SAFE' | 'EVAC_VEHICLE') {
    const campaign = this.activeCampaigns.find((c) => c.id === campaignId);
    this.recordCitizenResponseDetails(
      campaignId,
      campaign?.targetZoneCode || 'NER-103',
      campaign?.targetZoneName || 'Local NER Zone',
      responseType === 'SAFE' ? 'SAFE' : 'RESCUE_NEEDED'
    );
  }

  public dismissLiveBroadcast() {
    this.activeLiveBroadcast = null;
    this.notifyBroadcastListeners();
  }

  public subscribe(fn: (campaigns: RoboticCallCampaign[]) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  public subscribeBroadcast(fn: (broadcast: RoboticCallCampaign | null) => void): () => void {
    this.broadcastListeners.push(fn);
    return () => {
      this.broadcastListeners = this.broadcastListeners.filter((l) => l !== fn);
    };
  }

  public subscribeResponses(fn: (responses: CitizenCallResponse[]) => void): () => void {
    this.responseListeners.push(fn);
    return () => {
      this.responseListeners = this.responseListeners.filter((l) => l !== fn);
    };
  }

  private notifyListeners() {
    this.listeners.forEach((fn) => fn(this.activeCampaigns));
  }

  private notifyBroadcastListeners() {
    this.broadcastListeners.forEach((fn) => fn(this.activeLiveBroadcast));
  }

  private notifyResponseListeners() {
    this.responseListeners.forEach((fn) => fn(this.citizenResponses));
  }
}

export function getLocalizedVoiceScript(lang: string, location: string): string {
  switch (lang) {
    case 'assamese':
      return `অসম জৰুৰী সতৰ্কতা: ${location} অঞ্চলত ভূ-স্খলনৰ আশংকা তীব্ৰ হৈ পৰিছে। অনুগ্ৰহ কৰি সুৰক্ষিত স্থানলৈ যান। বোতাম ১ টিপক সুৰক্ষিত ঘোষণা কৰিবলৈ, বোতাম ২ টিপক উদ্ধাৰকাৰী বাহন বিচাৰিবলৈ।`;
    case 'bengali':
      return `জরুরি ভূমিধস সতর্কবার্তা: ${location} এলাকায় ভারী বৃষ্টির কারণে পাহাড় ধসের চরম ঝুঁকি রয়েছে। অবিলম্বে নিরাপদ স্থানে যান। সুরক্ষিত থাকলে ১ চাপুন, উদ্ধার গাড়ি চাইলে ২ চাপুন।`;
    case 'nepali':
      return `आपतकालीन पहिरो चेतावनी: ${location} क्षेत्रमा पहिरोको ठूलो खतरा छ। कृपया तुरुन्तै सुरक्षित स्थानमा जानुहोस्। सुरक्षित हुनुहुन्छ भने १ थिच्नुहोस्, उद्धार गाडी चाहिएमा २ थिच्नुहोस्।`;
    case 'khasi':
      return `Khubor pyngngam: Ha ${location} khie ka jingshisha ba ka khyndew kan hiar. Sngewbha leit sha jaka shngiam. Shon 1 lada shngiam, shon 2 lada donkam kali rescue.`;
    case 'mizo':
      return `Landslide Gaurd Alert: ${location} ah hian leimin a thleng thei. Khawngaihin hmun him lam pan nghal rawh u. Him dinhmuna awm tan 1 hmet la, rescue motor mamawh tan 2 hmet rawh.`;
    case 'hindi':
      return `आपातकालीन भूस्खलन चेतावनी: ${location} क्षेत्र में भारी वर्षा के कारण भूस्खलन का अत्यधिक खतरा है। तुरंत सुरक्षित स्थान पर जाएँ। सुरक्षित होने पर १ दबाएँ, बचाव वाहन हेतु २ दबाएँ।`;
    default:
      return `LANDSLIDE GAURD EMERGENCY ALERT: Imminent hazard detected in ${location}. Evacuate to designated relief shelters immediately. Press 1 to confirm safe, Press 2 to request evacuation vehicle.`;
  }
}

export const roboticCallService = new RoboticCallService();

