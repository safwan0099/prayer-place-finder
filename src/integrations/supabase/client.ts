// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://tvwofhbebafpdbqxrngb.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2d29maGJlYmFmcGRicXhybmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTg2NTYsImV4cCI6MjA1NDE5NDY1Nn0.Owsc11Bbwu7B8fKLwXDW8tLn1k1DMYaMPPtdguOAQwQ";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);