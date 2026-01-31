
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rgixiokjulkkxujxgsew.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJnaXhpb2tqdWxra3h1anhnc2V3Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk3NzEwNjYsImV4cCI6MjA4NTM0NzA2Nn0.Bu8dGJxVNBqMM-ZRVgLPGc1pTA_L4qMcWP2sUkgW_Zw';

export const supabase = createClient(supabaseUrl, supabaseKey);
