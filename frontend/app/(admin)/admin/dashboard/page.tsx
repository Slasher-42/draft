'use client';
import { motion } from 'framer-motion';
import { useAuth } from '@/context/AuthContext';
import { useUsers } from '@/hooks/useUsers';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { UserStatsCard } from '@/components/admin/UserStatsCard';
import { QuickActions } from '@/components/dashboard/QuickActions';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Users, Settings } from 'lucide-react';

export default function AdminDashboardPage() {
  const { user } = useAuth();
  const { users, loading } = useUsers();

  if (loading) return <LoadingSpinner size="md" message="Loading dashboard..." className="mt-20" />;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={`Welcome, ${user?.fullName?.split(' ')[0]} 👋`}
        subtitle="Manage users and monitor system activity"
      />

      <UserStatsCard users={users} />

      <QuickActions
        actions={[
          {
            label:       'Manage Users',
            description: 'View, search and delete users',
            href:        '/admin/users',
            icon:        <Users className="h-5 w-5" />,
            variant:     'brand',
          },
          {
            label:       'System Settings',
            description: 'Configure system parameters',
            href:        '/admin/settings',
            icon:        <Settings className="h-5 w-5" />,
            variant:     'gold',
          },
        ]}
      />
    </motion.div>
  );
}