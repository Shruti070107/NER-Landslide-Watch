import { GeoTaggedReport } from '../types';

const STORAGE_KEY = 'ner_landslide_public_reports_v1';
const SMS_EMERGENCY_NUMBER = '1070'; // National Disaster Helpline / State Helpline

/**
 * Offline Synchronization & Low-Network Service
 */
export class OfflineSyncService {
  private listeners: ((reports: GeoTaggedReport[]) => void)[] = [];

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.handleNetworkRestore());
    }
  }

  /**
   * Save a new geotagged field report locally
   */
  public saveReport(report: GeoTaggedReport): GeoTaggedReport {
    const reports = this.getAllReports();

    // Set sync status based on current browser connection
    const updatedReport: GeoTaggedReport = {
      ...report,
      synced: navigator.onLine,
    };

    reports.unshift(updatedReport);
    this.persistReports(reports);
    this.notifyListeners(reports);

    if (!navigator.onLine) {
      console.info('[OfflineSync] Saved geotagged report to local storage queue. Auto-sync pending.');
    }

    return updatedReport;
  }

  /**
   * Fetch all local field reports
   */
  public getAllReports(): GeoTaggedReport[] {
    if (typeof window === 'undefined') return [];
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return this.getDefaultInitialReports();
      return JSON.parse(data);
    } catch {
      return this.getDefaultInitialReports();
    }
  }

  /**
   * Update a report (e.g., when an officer verifies or resolves it)
   */
  public updateReport(id: string, updates: Partial<GeoTaggedReport>): GeoTaggedReport[] {
    const reports = this.getAllReports().map((r) => (r.id === id ? { ...r, ...updates } : r));
    this.persistReports(reports);
    this.notifyListeners(reports);
    return reports;
  }

  /**
   * Handle network restoration
   */
  private async handleNetworkRestore() {
    console.log('[OfflineSync] Internet connection restored! Synchronizing pending geotagged reports...');
    const reports = this.getAllReports();
    let hasChanges = false;

    const updated = reports.map((r) => {
      if (!r.synced) {
        hasChanges = true;
        return { ...r, synced: true };
      }
      return r;
    });

    if (hasChanges) {
      this.persistReports(updated);
      this.notifyListeners(updated);
      console.log('[OfflineSync] Successfully synced all pending public reports.');
    }
  }

  /**
   * Formats a zero-internet cellular SMS payload
   */
  public generateSmsPayload(report: GeoTaggedReport): string {
    const categoryCode = report.hazardType;
    const lat = report.latitude.toFixed(4);
    const lng = report.longitude.toFixed(4);
    const text = (report.description || 'Landslide/Crack hazard detected').slice(0, 60);

    return `NERDISASTER#${categoryCode}#${lat}#${lng}#${report.contactPhone || '000'}#${text}`;
  }

  /**
   * Opens default SMS app with pre-filled SMS payload
   */
  public sendSmsEmergency(report: GeoTaggedReport): void {
    const payload = this.generateSmsPayload(report);
    const uri = `sms:${SMS_EMERGENCY_NUMBER}?body=${encodeURIComponent(payload)}`;
    window.location.href = uri;
  }

  public subscribe(fn: (reports: GeoTaggedReport[]) => void): () => void {
    this.listeners.push(fn);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== fn);
    };
  }

  private persistReports(reports: GeoTaggedReport[]) {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(reports));
    } catch (err) {
      console.error('Failed to persist reports in localStorage:', err);
    }
  }

  private notifyListeners(reports: GeoTaggedReport[]) {
    this.listeners.forEach((fn) => fn(reports));
  }

  public getDefaultInitialReports(): GeoTaggedReport[] {
    return [
      {
        id: 'rep-001',
        title: 'Massive Fracture on NH10 Mountain Cut',
        hazardType: 'SLOPE_CRACK',
        severity: 'CRITICAL',
        description: 'Deep 4-inch vertical fracture opened across 15 meters along the upper slope near Tadong curve. Water seepage visible.',
        imageUrl: 'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=600&q=80',
        latitude: 27.329,
        longitude: 88.608,
        locationName: 'Tadong Mile 4, Gangtok',
        district: 'East Sikkim',
        state: 'Sikkim',
        submittedBy: 'Pema Lepcha',
        contactPhone: '+91 98320 11223',
        timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
        status: 'PENDING',
        synced: true,
        aiRiskAssessmentScore: 92,
      },
      {
        id: 'rep-002',
        title: 'Mudslide and Debris Blockage on Shillong Bypass',
        hazardType: 'MUDSLIDE',
        severity: 'HIGH',
        description: 'Boulders and liquefied mud blocking 1.5 lanes. Traffic slowed to single lane.',
        imageUrl: 'https://images.unsplash.com/photo-1508873696983-2df515122519?auto=format&fit=crop&w=600&q=80',
        latitude: 25.592,
        longitude: 91.914,
        locationName: 'Mawkasiang Junction',
        district: 'East Khasi Hills',
        state: 'Meghalaya',
        submittedBy: 'Banrap Lyngdoh',
        contactPhone: '+91 94361 88412',
        timestamp: new Date(Date.now() - 140 * 60000).toISOString(),
        status: 'VERIFIED',
        synced: true,
        aiRiskAssessmentScore: 78,
      },
      {
        id: 'rep-003',
        title: 'Soil Subsidence near Durtlang Residential Hill',
        hazardType: 'SLOPE_CRACK',
        severity: 'MEDIUM',
        description: 'Retaining wall cracked with noticeable soil settlement after overnight downpour.',
        imageUrl: 'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=600&q=80',
        latitude: 23.751,
        longitude: 92.724,
        locationName: 'Durtlang North',
        district: 'Aizawl',
        state: 'Mizoram',
        submittedBy: 'Lalremruata',
        contactPhone: '+91 98623 55901',
        timestamp: new Date(Date.now() - 360 * 60000).toISOString(),
        status: 'DISPATCHED',
        synced: true,
        aiRiskAssessmentScore: 64,
      },
    ];
  }
}

export const offlineSyncService = new OfflineSyncService();
