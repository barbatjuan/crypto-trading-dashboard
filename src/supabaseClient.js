// src/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

// TODO: Reemplaza estos valores con los de tu proyecto Supabase
const supabaseUrl = 'https://ymbbxpvfidlbfvuydejy.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltYmJ4cHZmaWRsYmZ2dXlkZWp5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDUzOTY3OTgsImV4cCI6MjA2MDk3Mjc5OH0.04xCAcIsYHs7COKzIdmyEUpjhWb0ElV04Svu19FpXPE';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
