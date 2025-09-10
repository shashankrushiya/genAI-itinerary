import React, { useEffect, useRef } from 'react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithCredential } from 'firebase/auth';
import { createUser } from '../lib/api';

// One Tap sign-in overlay. Requires REACT_APP_GOOGLE_CLIENT_ID
const GoogleOneTap = ({ enabled = true, onAuthSuccess }) => {
  const initialized = useRef(false);
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID;

  useEffect(() => {
    if (!enabled || initialized.current) return;
    if (!clientId) return; // not configured
    const gsi = window.google?.accounts?.id;
    if (!gsi) return; // script not yet loaded

    initialized.current = true;

    gsi.initialize({
      client_id: clientId,
      callback: async (response) => {
        try {
          const credential = GoogleAuthProvider.credential(response.credential);
          const result = await signInWithCredential(auth, credential);
          const user = result.user;
          try { await createUser({ email: user.email, name: user.displayName || 'User' }); } catch (_) {}
          onAuthSuccess && onAuthSuccess(user);
        } catch (_) {
          // silently ignore — user can still use other methods
        }
      },
      auto_select: true,
      cancel_on_tap_outside: false,
      context: 'signin',
    });

    gsi.prompt();
  }, [enabled, clientId, onAuthSuccess]);

  return null;
};

export default GoogleOneTap;

