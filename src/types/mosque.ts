export interface Mosque {
  id?: string;
  name: string;
  description?: string;
  website_url?: string;
  is_restricted: boolean;
  latitude: number;
  longitude: number;
  operating_hours: OperatingHours[];
  created_at?: string;
}

export interface OperatingHours {
  day: string;
  openTime: string;
  closeTime: string;
}

export interface MosqueFormData {
  name: string;
  description: string;
  website_url: string;
  is_restricted: boolean;
  latitude: number | null;
  longitude: number | null;
  operating_hours: OperatingHours[];
}