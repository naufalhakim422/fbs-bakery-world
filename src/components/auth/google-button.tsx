'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth, googleProvider } from '@/lib/firebase';

import { useLanguage } from '@/lib/language-context';

export default function GoogleButton() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handleUserSession = (user: any) => {
    const session = {
      id: `google-${user.uid}`,
      name: user.displayName || user.email?.split('@')[0] || 'Pengguna Google',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photo: user.photoURL || '',
      provider: 'GOOGLE',
      customerType: 'RETAIL',
      address: 'Shah Alam, Selangor',
      city: 'Shah Alam',
      state: 'Selangor',
      postcode: '40000',
      createdAt: new Date().toISOString(),
      loginAt: new Date().toISOString(),
    };

    const existing = JSON.parse(localStorage.getItem('fbs_customers') || '[]');
    const idx = existing.findIndex((c: any) => c.id === session.id || (session.email && c.email === session.email));
    if (idx !== -1) {
      existing[idx] = { ...existing[idx], loginAt: session.loginAt };
    } else {
      existing.unshift(session);
    }
    localStorage.setItem('fbs_customers', JSON.stringify(existing));
    localStorage.setItem('fbs_customer_session', JSON.stringify(session));
    window.dispatchEvent(new Event('storage'));
    router.push('/account');
  };

  useEffect(() => {
    // Check redirect result only when user initiated redirect flow
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user) {
          handleUserSession(result.user);
        }
      })
      .catch((err) => {
        console.warn('Google Redirect Result Warning:', err?.message || err);
      });
  }, []);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      // Mencoba login via popup lebih dulu
      const result = await signInWithPopup(auth, googleProvider);
      if (result?.user) {
        handleUserSession(result.user);
      }
    } catch (err: any) {
      console.warn('Google Popup Gagal/Diblokir, mencoba mode Redirect fallback...', err?.code, err?.message);
      
      // Fallback otomatis ke mode Redirect jika Popup diblokir/gagal
      try {
        await signInWithRedirect(auth, googleProvider);
      } catch (redirectErr: any) {
        console.error('Google Redirect Error:', redirectErr);
        if (err.code !== 'auth/popup-closed-by-user') {
          alert(`Gagal login Google: ${redirectErr.message || redirectErr.code}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      id="google-signin-btn"
      onClick={handleClick}
      disabled={loading}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => { setHovered(false); setPressed(false); }}
      onMouseDown={() => setPressed(true)}
      onMouseUp={() => setPressed(false)}
      style={{
        width: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        padding: '11px 16px',
        background: pressed ? '#F0EBE3' : hovered ? '#FAF7F4' : '#FFFFFF',
        border: `1.5px solid ${hovered ? '#C4A882' : '#E0D6C8'}`,
        borderRadius: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        boxShadow: pressed ? '0 1px 2px rgba(0,0,0,0.08)' : hovered ? '0 4px 12px rgba(0,0,0,0.10)' : '0 1px 4px rgba(0,0,0,0.06)',
        transition: 'all 0.18s ease',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {loading ? (
        <div style={{ width: '18px', height: '18px', border: '2px solid #E0D6C8', borderTopColor: '#4285F4', borderRadius: '50%', animation: 'spin 0.7s linear infinite' }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
        </svg>
      )}
      <span style={{ fontSize: '12px', fontWeight: 600, color: '#3C3C3C', fontFamily: "'Inter', sans-serif" }}>
        {loading ? (language === 'EN' ? 'Loading...' : language === 'MS' ? 'Memuatkan...' : 'Memuat...') : 'Google'}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
