// app/lib/supabaseClient.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://zixyjbmaczqsitxubcbp.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHlqYm1hY3pxc2l0eHViY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTIwNjEsImV4cCI6MjA2NjUyODA2MX0.u4NXFIyuxcCtgN925VfQwYgaPNzdNzfwMkrUkj0CyfI';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);
