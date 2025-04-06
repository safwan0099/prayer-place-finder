
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.48.1'
import { load } from 'https://esm.sh/cheerio@1.0.0-rc.12'

// CORS headers for browser requests
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Configuration for the Supabase project
const supabaseUrl = 'https://tvwofhbebafpdbqxrngb.supabase.co'
const supabaseKey = Deno.env.get('SUPABASE_ANON_KEY') || ''
const supabase = createClient(supabaseUrl, supabaseKey)

// Define sources for prayer times
const sources = [
  {
    name: "Manchester Central Mosque",
    url: "https://www.manchestercentralmosque.org/prayer-times/",
    osm_id: "2028166730",
    scraper: async () => {
      try {
        const today = new Date()
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        const response = await fetch("https://www.manchestercentralmosque.org/prayer-times/")
        const html = await response.text()
        const $ = load(html)
        
        const times = []
        
        // Example scraping logic - this would need to be customized for each site
        const rowSelector = 'table tr'
        
        // Find today's row based on date
        let todayRow = null
        $(rowSelector).each((i, row) => {
          const dateText = $(row).find('td:first-child').text().trim()
          // Check if this row matches today's date (format would need to match the site)
          if (dateText.includes(formattedDate)) {
            todayRow = row
            return false // Break the loop
          }
        })
        
        if (todayRow) {
          // Extract prayer times from the row
          const fajr = $(todayRow).find('td:nth-child(2)').text().trim()
          const dhuhr = $(todayRow).find('td:nth-child(3)').text().trim()
          const asr = $(todayRow).find('td:nth-child(4)').text().trim()
          const maghrib = $(todayRow).find('td:nth-child(5)').text().trim()
          const isha = $(todayRow).find('td:nth-child(6)').text().trim()
          const jummah = "13:30" // Often fixed, but could be scraped too
          
          return {
            date: formattedDate,
            fajr,
            dhuhr,
            asr,
            maghrib,
            isha,
            jummah,
            source_url: "https://www.manchestercentralmosque.org/prayer-times/"
          }
        }
        
        return null
      } catch (error) {
        console.error("Error scraping Manchester Central Mosque:", error)
        return null
      }
    }
  },
  {
    name: "Didsbury Mosque",
    url: "https://www.didsburymosque.com/prayer-times/",
    osm_id: "305477399",
    scraper: async () => {
      try {
        const today = new Date()
        const formattedDate = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
        
        // Example scraping logic for Didsbury Mosque
        return {
          date: formattedDate,
          fajr: "05:30",
          dhuhr: "13:15",
          asr: "16:30",
          maghrib: "20:15",
          isha: "21:45",
          jummah: "13:30",
          source_url: "https://www.didsburymosque.com/prayer-times/"
        }
      } catch (error) {
        console.error("Error scraping Didsbury Mosque:", error)
        return null
      }
    }
  }
]

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }
  
  // Only accept POST requests
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Only POST requests allowed' }), { 
      status: 405,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
  
  try {
    // Get mosque data from database
    const { data: mosques, error: mosquesError } = await supabase
      .from('mosques')
      .select('id, name, osm_id');
    
    if (mosquesError) throw mosquesError;
    
    const results = []
    const errors = []
    
    // Match mosques with available scrapers
    for (const source of sources) {
      try {
        const matchingMosque = mosques.find(mosque => 
          mosque.osm_id === source.osm_id ||
          mosque.name.toLowerCase().includes(source.name.toLowerCase())
        );
        
        if (matchingMosque) {
          console.log(`Scraping for ${source.name}, matched with ${matchingMosque.name}`);
          
          const prayerTimes = await source.scraper();
          
          if (prayerTimes) {
            // Store in database
            const { data, error } = await supabase
              .from('prayer_times')
              .upsert({
                mosque_id: matchingMosque.id,
                date: prayerTimes.date,
                fajr: prayerTimes.fajr,
                dhuhr: prayerTimes.dhuhr,
                asr: prayerTimes.asr,
                maghrib: prayerTimes.maghrib,
                isha: prayerTimes.isha,
                jummah: prayerTimes.jummah,
                source_url: prayerTimes.source_url
              }, { onConflict: 'mosque_id,date' });
            
            if (error) {
              errors.push({ mosque: matchingMosque.name, error: error.message });
            } else {
              results.push({ mosque: matchingMosque.name, success: true });
            }
          }
        }
      } catch (error) {
        console.error(`Error processing ${source.name}:`, error);
        errors.push({ mosque: source.name, error: error.message });
      }
    }
    
    return new Response(JSON.stringify({ results, errors }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error in scrape-prayer-times function:', error);
    
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
})
