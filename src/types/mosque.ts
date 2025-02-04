export interface Mosque {
  id?: string;
  name: string;
  description?: string;
  website?: string;
  accessType: 'public' | 'restricted';
  latitude: number;
  longitude: number;
  operatingHours: OperatingHours[];
  createdAt?: string;
}

export interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
}

export interface MosqueFormData {
  name: string;
  description: string;
  website: string;
  accessType: 'public' | 'restricted';
  latitude: number | null;
  longitude: number | null;
  operatingHours: OperatingHours[];
}