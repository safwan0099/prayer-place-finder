import { Json } from "@/integrations/supabase/types";

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
  source?: string;
  osm_id?: string;
  type?: 'mosque' | 'musalla';
  accessType?: 'public' | 'restricted';
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
  type: 'mosque' | 'musalla';
}

// Helper function to ensure mosque type is either 'mosque' or 'musalla'
export const formatMosqueType = (type: string): 'mosque' | 'musalla' => {
  if (!type) return 'mosque';
  
  const normalizedType = type.toLowerCase().trim();
  
  if (normalizedType === 'musalla' || 
      normalizedType.includes('prayer room') || 
      normalizedType.includes('prayer_room') || 
      normalizedType.includes('prayer-room')) {
    return 'musalla';
  }
  
  return 'mosque';
};

// Helper function to transform JSON data to OperatingHours array
export const parseOperatingHours = (hours: Json): OperatingHours[] => {
  if (!hours || !Array.isArray(hours)) return [];
  
  return hours.map(hour => {
    if (typeof hour === 'object' && hour !== null) {
      return {
        day: String((hour as Record<string, unknown>).day || ''),
        openTime: String((hour as Record<string, unknown>).openTime || ''),
        closeTime: String((hour as Record<string, unknown>).closeTime || '')
      };
    }
    return {
      day: '',
      openTime: '',
      closeTime: ''
    };
  });
};

// Helper function to ensure operating hours are in the correct format for Supabase
export const formatOperatingHours = (hours: OperatingHours[]): Json => {
  return hours as unknown as Json;
};
