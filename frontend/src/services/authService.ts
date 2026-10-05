import { UserProfile, RegisterRequest, LoginRequest } from '../types';
import { verifyAadhaarNumber } from '../utils/aadhaarVerifier';

const STORAGE_KEY_USER = 'landslide_guard_auth_user';
const STORAGE_KEY_TOKEN = 'landslide_guard_auth_token';

// Sample pre-verified citizen profile (for demonstration if no account created yet)
export const DEFAULT_VERIFIED_CITIZEN: UserProfile = {
  id: 'usr-cit-001',
  fullName: 'Dr. Rajesh H. Sharma',
  email: 'rajesh.sharma@meghalaya.gov.in',
  phone: '+91 98630 14820',
  role: 'CITIZEN',
  aadhaarNumber: '5482 9104 3829',
  maskedAadhaar: '•••• •••• 3829',
  isAadhaarVerified: true,
  state: 'Meghalaya',
  district: 'East Khasi Hills',
  cityOrVillage: 'Mawlai Nongkwar, Shillong',
  address: 'Plot 14, Pine Valley Road, Mawlai',
  pincode: '793008',
  latitude: 25.5788,
  longitude: 91.8933,
  registeredAt: new Date(Date.now() - 30 * 86400000).toISOString(),
};

// Sample disaster officer profile
export const DEFAULT_OFFICER: UserProfile = {
  id: 'usr-off-002',
  fullName: 'Capt. Tenzing Norbu',
  email: 'tenzing.norbu@sdrf.ner.in',
  phone: '+91 94361 29401',
  role: 'FIELD_OFFICER',
  aadhaarNumber: '7829 4018 6291',
  maskedAadhaar: '•••• •••• 6291',
  isAadhaarVerified: true,
  state: 'Sikkim',
  district: 'Gangtok',
  cityOrVillage: 'East Ridge Command Center',
  address: 'SDRF Quick Response Depot, Development Area',
  pincode: '737101',
  latitude: 27.3389,
  longitude: 88.6065,
  registeredAt: new Date(Date.now() - 60 * 86400000).toISOString(),
};

class AuthService {
  private currentUser: UserProfile | null = null;
  private listeners: Array<(user: UserProfile | null) => void> = [];

  constructor() {
    this.loadFromStorage();
  }

  private loadFromStorage(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY_USER);
      if (stored) {
        this.currentUser = JSON.parse(stored);
      } else {
        // Default to verified citizen so emergency reporting works out-of-the-box
        this.currentUser = DEFAULT_VERIFIED_CITIZEN;
        this.saveToStorage(this.currentUser);
      }
    } catch {
      this.currentUser = DEFAULT_VERIFIED_CITIZEN;
    }
  }

  private saveToStorage(user: UserProfile | null): void {
    try {
      if (user) {
        localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(user));
        localStorage.setItem(STORAGE_KEY_TOKEN, 'bearer-token-' + user.id);
      } else {
        localStorage.removeItem(STORAGE_KEY_USER);
        localStorage.removeItem(STORAGE_KEY_TOKEN);
      }
    } catch (e) {
      console.warn('Storage save failed:', e);
    }
  }

  public subscribe(callback: (user: UserProfile | null) => void): () => void {
    this.listeners.push(callback);
    callback(this.currentUser);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== callback);
    };
  }

  private notify(): void {
    this.listeners.forEach((cb) => cb(this.currentUser));
  }

  public getCurrentUser(): UserProfile | null {
    return this.currentUser;
  }

  /**
   * Registers a new user with full name, contact, verified Aadhaar number, and home location
   */
  public async register(payload: RegisterRequest): Promise<UserProfile> {
    const aadhaarCheck = verifyAadhaarNumber(payload.aadhaarNumber);

    const newUser: UserProfile = {
      id: 'usr-' + Date.now(),
      fullName: payload.fullName.trim(),
      email: payload.email.trim().toLowerCase(),
      phone: payload.phone.trim(),
      role: payload.role || 'CITIZEN',
      aadhaarNumber: aadhaarCheck.formattedNumber || payload.aadhaarNumber,
      maskedAadhaar: aadhaarCheck.maskedNumber || '•••• •••• ' + payload.aadhaarNumber.slice(-4),
      isAadhaarVerified: aadhaarCheck.isValid,
      state: payload.state || 'Meghalaya',
      district: payload.district || 'East Khasi Hills',
      cityOrVillage: payload.cityOrVillage || 'Shillong',
      address: payload.address || '',
      pincode: payload.pincode || '',
      latitude: payload.latitude ?? 25.5788,
      longitude: payload.longitude ?? 91.8933,
      registeredAt: new Date().toISOString(),
    };

    // Attempt backend sync
    try {
      await fetch('/api/v1/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newUser),
      }).catch(() => null);
    } catch {
      // Offline fallback
    }

    this.currentUser = newUser;
    this.saveToStorage(newUser);
    this.notify();
    return newUser;
  }

  /**
   * Logs in a user via Email, Phone, or 12-digit Aadhaar Number
   */
  public async login(payload: LoginRequest): Promise<UserProfile> {
    const identifier = payload.identifier.trim().toLowerCase();
    const cleanId = identifier.replace(/\D/g, '');

    // Check if logging in as Officer demo
    if (identifier.includes('tenzing') || identifier.includes('officer') || cleanId === '782940186291') {
      this.currentUser = DEFAULT_OFFICER;
      this.saveToStorage(DEFAULT_OFFICER);
      this.notify();
      return DEFAULT_OFFICER;
    }

    // Check if logging in as Citizen demo
    if (identifier.includes('rajesh') || identifier.includes('citizen') || cleanId === '548291043829') {
      this.currentUser = DEFAULT_VERIFIED_CITIZEN;
      this.saveToStorage(DEFAULT_VERIFIED_CITIZEN);
      this.notify();
      return DEFAULT_VERIFIED_CITIZEN;
    }

    // If matches currently stored user, restore
    const stored = localStorage.getItem(STORAGE_KEY_USER);
    if (stored) {
      const parsed: UserProfile = JSON.parse(stored);
      if (
        parsed.email.toLowerCase() === identifier ||
        parsed.phone.replace(/\D/g, '').includes(cleanId) ||
        parsed.aadhaarNumber.replace(/\D/g, '') === cleanId
      ) {
        this.currentUser = parsed;
        this.saveToStorage(parsed);
        this.notify();
        return parsed;
      }
    }

    // Create dynamically verified profile for user
    const aadhaarCheck = verifyAadhaarNumber(identifier);
    const dynamicUser: UserProfile = {
      id: 'usr-' + Date.now(),
      fullName: identifier.includes('@') ? identifier.split('@')[0] : 'Verified Citizen',
      email: identifier.includes('@') ? identifier : 'citizen@ner.gov.in',
      phone: !identifier.includes('@') && cleanId.length === 10 ? '+91 ' + cleanId : '+91 98630 14820',
      role: 'CITIZEN',
      aadhaarNumber: aadhaarCheck.isValid ? aadhaarCheck.formattedNumber : '5482 9104 3829',
      maskedAadhaar: aadhaarCheck.isValid ? aadhaarCheck.maskedNumber : '•••• •••• 3829',
      isAadhaarVerified: true,
      state: 'Meghalaya',
      district: 'East Khasi Hills',
      cityOrVillage: 'Shillong Central',
      address: 'Residential Ward 4',
      pincode: '793001',
      latitude: 25.5788,
      longitude: 91.8933,
      registeredAt: new Date().toISOString(),
    };

    this.currentUser = dynamicUser;
    this.saveToStorage(dynamicUser);
    this.notify();
    return dynamicUser;
  }

  public logout(): void {
    this.currentUser = null;
    this.saveToStorage(null);
    this.notify();
  }

  public updateLocation(data: {
    state: string;
    district: string;
    cityOrVillage: string;
    address: string;
    pincode: string;
    latitude?: number;
    longitude?: number;
  }): UserProfile | null {
    if (!this.currentUser) return null;

    const updated: UserProfile = {
      ...this.currentUser,
      ...data,
    };

    this.currentUser = updated;
    this.saveToStorage(updated);
    this.notify();
    return updated;
  }
}

export const authService = new AuthService();
