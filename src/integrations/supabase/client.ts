// This file is automatically generated. Do not edit it directly.
import { createClient } from '@supabase/supabase-js';
import type { Database } from './types';

const SUPABASE_URL = "https://xqhpquybkvyaaruedfkj.supabase.co";
const SUPABASE_PUBLISHABLE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InhxaHBxdXlia3Z5YWFydWVkZmtqIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA0OTcwNzcsImV4cCI6MjA2NjA3MzA3N30.Yi6f5Vekg2jkrpI2thiuGeZTORzODYBnf6z5ke3-X18";

// Import the supabase client like this:
// import { supabase } from "@/integrations/supabase/client";

export const supabase = createClient<Database>(SUPABASE_URL, SUPABASE_PUBLISHABLE_KEY);