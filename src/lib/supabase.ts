
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://tvwofhbebafpdbqxrngb.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2d29maGJlYmFmcGRicXhybmdiIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Mzg2MTg2NTYsImV4cCI6MjA1NDE5NDY1Nn0.Owsc11Bbwu7B8fKLwXDW8tLn1k1DMYaMPPtdguOAQwQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
