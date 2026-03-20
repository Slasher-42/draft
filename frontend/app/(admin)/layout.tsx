'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { getDashboardPath } from '@/lib/utils';
import { Navbar } from '@/components/layout/Navbar';
import { Sidebar } from '@/components/layout/Sidebar';
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
    <div className="min-h-screen bg-surface flex flex-col">
      <Navbar />
      <div className="flex flex-1">
        <Sidebar />
        <main className="flex-1 p-6 overflow-auto">
          {children}
        </main>
      </div>
    </div>
  );
}