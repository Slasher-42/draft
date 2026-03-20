'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { getDashboardPath } from '@/lib/utils';

interface ProtectedRouteProps {
  children: React.ReactNode;
  allowedRole: string;
}

export function ProtectedRoute({ children, allowedRole }: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace('/login');
        return;
      }
      if (user.role !== allowedRole) {
        router.replace(getDashboardPath(user.role));
      }
    }
  }, [user, isLoading, allowedRole, router]);

  if (isLoading) {
    return (
      <LoadingSpinner
        size="fullscreen"
        message="Verifying access..."
      />
    );
  }

  if (!user || user.role !== allowedRole) {
    return null;
  }

  return <>{children}</>;
}