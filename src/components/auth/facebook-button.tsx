'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { signInWithPopup, signInWithRedirect, getRedirectResult, onAuthStateChanged } from 'firebase/auth';
import { auth, facebookProvider } from '@/lib/firebase';

import { useLanguage } from '@/lib/language-context';

export default function FacebookButton() {
  const { language } = useLanguage();
  const [loading, setLoading] = useState(false);
  const [hovered, setHovered] = useState(false);
  const [pressed, setPressed] = useState(false);
  const router = useRouter();

  const handleUserSession = (user: any) => {
    const session = {
      id: `facebook-${user.uid}`,
      name: user.displayName || user.email?.split('@')[0] || 'Pengguna Facebook',
      email: user.email || '',
      phone: user.phoneNumber || '',
      photo: user.photoURL || '',
      provider: 'FACEBOOK',
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
    getRedirectResult(auth)
      .then((result) => {
        if (result?.user && result.providerId === 'facebook.com') {
          handleUserSession(result.user);
        }
      })
      .catch((err) => {
        console.warn('Facebook Redirect Result Warning:', err?.message || err);
      });
  }, []);

  const handleClick = async () => {
    if (loading) return;
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, facebookProvider);
      if (result?.user) {
        handleUserSession(result.user);
      }
    } catch (err: any) {
      console.warn('Facebook Popup Gagal, mencoba Redirect fallback...', err?.code, err?.message);
      try {
        await signInWithRedirect(auth, facebookProvider);
      } catch (redirectErr: any) {
        console.error('Facebook Redirect Error:', redirectErr);
        if (err.code !== 'auth/popup-closed-by-user') {
          alert(`Gagal login Facebook: ${redirectErr.message || redirectErr.code}`);
        }
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      type="button"
      id="facebook-signin-btn"
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
        background: pressed ? '#1558B0' : hovered ? '#1877F2' : '#1877F2',
        border: 'none',
        borderRadius: '12px',
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
        boxShadow: pressed
          ? '0 1px 2px rgba(0,0,0,0.15)'
          : hovered
          ? '0 4px 12px rgba(24,119,242,0.40)'
          : '0 1px 4px rgba(24,119,242,0.25)',
        transition: 'all 0.18s ease',
        transform: pressed ? 'scale(0.98)' : 'scale(1)',
        userSelect: 'none',
        outline: 'none',
      }}
    >
      {loading ? (
        <div style={{
          width: '18px', height: '18px', border: '2px solid rgba(255,255,255,0.4)',
          borderTopColor: '#fff', borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
      ) : (
        <svg width="18" height="18" viewBox="0 0 24 24" fill="white" xmlns="http://www.w3.org/2000/svg" style={{ flexShrink: 0 }}>
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      )}
      <span style={{
        fontSize: '12px',
        fontWeight: 600,
        color: '#FFFFFF',
        fontFamily: "'Inter', sans-serif",
      }}>
        {loading ? (language === 'EN' ? 'Loading...' : language === 'MS' ? 'Memuatkan...' : 'Memuat...') : 'Facebook'}
      </span>
      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </button>
  );
}
