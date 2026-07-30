export async function handleGoogleResponse(credential: string) {
  try {
    // Send ID token to backend for verification
    const res = await fetch(`/api/auth/google?credential=${credential}`);
    const data = await res.json();
    if (data.success) {
      // Persist user session in localStorage
      const session = {
        id: data.user.id,
        name: data.user.name,
        email: data.user.email,
        provider: data.user.provider,
        loginAt: new Date().toISOString()
      };
      localStorage.setItem('fbs_customer_session', JSON.stringify(session));
      // Redirect to dashboard/account page
      window.location.href = '/account';
    } else {
      alert('Gagal login dengan Google: ' + (data.message || ''));
    }
  } catch (e) {
    console.error('[Google SignIn Error]', e);
    alert('Terjadi kesalahan saat login dengan Google');
  }
}
