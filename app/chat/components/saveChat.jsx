// app/components/GuardarAuditoria.js
'use client';

import { useEffect } from 'react';
import { getCurrentUser, saveAuditToSupabase } from '../../lib/supabaseClient2';

export default function GuardarAuditoria({ auditContent }) {
  useEffect(() => {
    const saveAudit = async () => {
      try {
        // Get authenticated user
        const user = await getCurrentUser();
        if (!user) {
          console.error('No authenticated user');
          return;
        }

        // Save audit
        const { data, error } = await saveAuditToSupabase({
          audit_content: auditContent,
          user_id: user.id,
        });

        if (error) {
          console.error('Error saving audit:', error.message);
        } else {
          console.log('Audit saved successfully:', data);
        }
      } catch (error) {
        console.error('Unexpected error:', error.message);
      }
    };

    // Only save if auditContent exists
    if (auditContent) {
      saveAudit();
    }
  }, [auditContent]);

  return null; // Component does not render anything
}