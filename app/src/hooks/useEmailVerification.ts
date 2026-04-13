import { useState } from 'react';

interface VerifiedNeighbor {
  email: string;
  verifiedAt: number;
}

const SESSION_KEY = 'qn-verified-neighbor';

function getStoredVerification(): VerifiedNeighbor | null {
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VerifiedNeighbor;
  } catch {
    return null;
  }
}

export function useEmailVerification() {
  const [verified, setVerified] = useState<VerifiedNeighbor | null>(getStoredVerification);

  const markVerified = (email: string) => {
    const state: VerifiedNeighbor = { email, verifiedAt: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(state));
    setVerified(state);
  };

  const clearVerified = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setVerified(null);
  };

  return {
    isVerified: verified !== null,
    verifiedEmail: verified?.email ?? null,
    markVerified,
    clearVerified,
  };
}
