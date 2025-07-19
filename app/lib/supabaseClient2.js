// lib/supabaseClient2.js
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://zixyjbmacqzsitxubcbp.supabase.co';
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InppeHlqYm1hY3pxc2l0eHViY2JwIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTA5NTIwNjEsImV4cCI6MjA2NjUyODA2MX0.u4NXFIyuxcCtgN925VfQwYgaPNzdNzfwMkrUkj0CyfI';

export const supabase = createClient(supabaseUrl, supabaseKey);

// Obtener usuario autenticado
export async function getCurrentUser() {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    console.error('Error al obtener el usuario:', error);
    return null;
  }
  return data.user;
}

// Guardar la auditoría
export async function saveAuditToSupabase({ gmail, contend1, user_id }) {
  const { data, error } = await supabase
    .from('Auditorias')
    .insert([{ gmail, contend1, user_id }])
    .select();

  return { data, error };
}
