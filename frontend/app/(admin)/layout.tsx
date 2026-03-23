'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/utils';
import { Sidebar } from '@/components/layout/Sidebar';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    if (!user) { router.replace('/login'); return; }
    const normalizedRole = user.role?.replace('ROLE_', '');
    if (normalizedRole !== 'ADMIN') {
      router.replace(getDashboardPath(user.role));
    }
  }, [user, isLoading, router]);

  if (isLoading) return <LoadingSpinner size="fullscreen" message="Loading..." />;

  const normalizedRole = user?.role?.replace('ROLE_', '');
  if (!user || normalizedRole !== 'ADMIN') return null;

  return (
    <div className="flex h-screen overflow-hidden bg-[var(--bg-primary)]">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <DashboardHeader />
        <main className="flex-1 overflow-y-auto p-5 md:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}