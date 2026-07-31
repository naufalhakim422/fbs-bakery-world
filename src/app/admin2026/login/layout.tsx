'use client';

import React from 'react';

// Login page should NOT use the admin dashboard layout (no sidebar/topbar)
export default function Admin2026LoginLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
