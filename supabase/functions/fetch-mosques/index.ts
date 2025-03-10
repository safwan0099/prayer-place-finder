
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || "";
    const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY") || "";
    const GOOGLE_MAPS_API_KEY = Deno.env.get("GOOGLE_MAPS_API_KEY") || "";

    if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !GOOGLE_MAPS_API_KEY) {
      throw new Error("Missing environment variables");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get params from request
    const { lat, lng, radius = 5000 } = await req.json();
    
    if (!lat || !lng) {
      return new Response(
        JSON.stringify({ error: "Latitude and longitude are required" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 400 }
      );
    }

    console.log(`Fetching mosques near ${lat},${lng} with radius ${radius}m`);

    // Call Google Places API to search for mosques
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=${radius}&type=mosque&key=${GOOGLE_MAPS_API_KEY}`
    );
    
    if (!response.ok) {
      throw new Error("Failed to fetch data from Google Places API");
    }

    const data = await response.json();
    
    if (!data.results || !Array.isArray(data.results)) {
      return new Response(
        JSON.stringify({ message: "No mosques found in this area" }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Process the results and prepare for database insertion
    const mosques = data.results.map(place => {
      return {
        name: place.name,
        latitude: place.geometry.location.lat,
        longitude: place.geometry.location.lng,
        description: place.vicinity || null,
        website_url: null, // Google API doesn't provide this in the basic search
        is_restricted: false, // Default value
        operating_hours: JSON.stringify([]), // Default empty operating hours
        source: "google",
        osm_id: place.place_id,
        type: 'mosque' // Default type for Google Places API results
      };
    });

    // Check if places already exist in the database by their osm_id (place_id from Google)
    const { data: existingMosques, error: fetchError } = await supabase
      .from('mosques')
      .select('osm_id')
      .in('osm_id', mosques.map(m => m.osm_id));

    if (fetchError) {
      throw new Error(`Error checking existing mosques: ${fetchError.message}`);
    }

    // Filter out places that already exist in the database
    const existingIds = existingMosques ? existingMosques.map(m => m.osm_id) : [];
    const newMosques = mosques.filter(mosque => !existingIds.includes(mosque.osm_id));

    console.log(`Found ${mosques.length} mosques, ${newMosques.length} are new`);

    // Insert new mosques into the database
    if (newMosques.length > 0) {
      const { data: insertedData, error: insertError } = await supabase
        .from('mosques')
        .insert(newMosques);

      if (insertError) {
        throw new Error(`Error inserting mosques: ${insertError.message}`);
      }

      console.log(`Successfully inserted ${newMosques.length} new mosques`);
    }

    // Return all mosques for the area (including existing ones)
    const { data: allMosques, error: fetchAllError } = await supabase
      .from('mosques')
      .select('*')
      .or(`latitude.gte.${lat-0.05},latitude.lte.${lat+0.05}`)
      .or(`longitude.gte.${lng-0.05},longitude.lte.${lng+0.05}`);

    if (fetchAllError) {
      throw new Error(`Error fetching all mosques: ${fetchAllError.message}`);
    }

    return new Response(
      JSON.stringify({ 
        message: `${newMosques.length} new mosques added to database`,
        mosques: allMosques
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error.message);
    return new Response(
      JSON.stringify({ error: error.message }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" }, status: 500 }
    );
  }
});
