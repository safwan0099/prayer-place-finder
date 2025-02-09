
import { supabase } from '@/integrations/supabase/client';
import { Mosque, formatOperatingHours } from '@/types/mosque';

interface OSMNode {
  id: number;
  lat: number;
  lon: number;
  tags: {
    name?: string;
    'opening_hours'?: string;
    'contact:website'?: string;
    description?: string;
  };
}

interface OSMResponse {
  elements: OSMNode[];
}

export const fetchOSMMosques = async () => {
  try {
    const query = `
      [out:json];
      area["name"="United Kingdom"];
      node["amenity"="place_of_worship"]["religion"="muslim"](area);
      out body;
    `;

    const response = await fetch('https://overpass-api.de/api/interpreter', {
      method: 'POST',
      body: query,
    });

    if (!response.ok) {
      throw new Error('Failed to fetch OSM data');
    }

    const data: OSMResponse = await response.json();
    
    // Transform OSM data to our Mosque format and store in Supabase
    for (const node of data.elements) {
      const mosque: Mosque = {
        name: node.tags.name || `Mosque ${node.id}`,
        description: node.tags.description || null,
        website_url: node.tags['contact:website'] || null,
        latitude: node.lat,
        longitude: node.lon,
        is_restricted: false,
        operating_hours: [], // Default empty array
        source: 'osm',
        osm_id: node.id.toString(),
      };

      // Check if mosque already exists
      const { data: existingMosque } = await supabase
        .from('mosques')
        .select('id')
        .eq('osm_id', mosque.osm_id)
        .single();

      if (!existingMosque) {
        // Insert new mosque with properly formatted operating_hours
        const { error } = await supabase
          .from('mosques')
          .insert([{
            ...mosque,
            operating_hours: formatOperatingHours(mosque.operating_hours)
          }]);

        if (error) {
          console.error('Error inserting mosque:', error);
        }
      }
    }

    return true;
  } catch (error) {
    console.error('Error fetching OSM data:', error);
    return false;
  }
};
