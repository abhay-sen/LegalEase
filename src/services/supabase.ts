import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://lehoppolwhiuszhukcgj.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImxlaG9wcG9sd2hpdXN6aHVrY2dqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDc5MjQwMTYsImV4cCI6MjA2MzUwMDAxNn0.EYkZckwmk1WtT2Rn4EwKdNu18fq3SwgT6wJ9jRcj-JE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

//add to gitignore