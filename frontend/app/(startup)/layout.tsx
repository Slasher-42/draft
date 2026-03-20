'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function StartupLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/login'); return; }
    const normalizedRole = user.role?.replace('ROLE_', '');
    if (normalizedRole !== 'STARTUP') {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, isLoading, router]);

  if (isLoading) return <LoadingSpinner size="fullscreen" message="Loading..." />;

  const normalizedRole = user?.role?.replace('ROLE_', '');
  if (!user || normalizedRole !== 'STARTUP') return null;

  return (
    <div style={{ minHeight: '100vh', background: '#0a1628', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ display: 'flex', flex: 1 }}>
        <Sidebar />
        <main style={{ flex: 1, padding: '28px', overflowAuto: 'auto' } as any}>
          {children}
        </main>
      </div>
    </div>
  );
}