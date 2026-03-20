'use client';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { UserPlus } from 'lucide-react';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { UserTable } from '@/components/admin/UserTable';
import { UserStatsCard } from '@/components/admin/UserStatsCard';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { ErrorMessage } from '@/components/common/ErrorMessage';
import { Button } from '@/components/ui/button';
import { useUsers } from '@/hooks/useUsers';

export default function AdminUsersPage() {
  const { users, loading, error, deleteUser, toggleUserStatus } = useUsers();

  if (loading) return <LoadingSpinner size="md" message="Loading users..." className="mt-20" />;
  if (error)   return <ErrorMessage message={error} />;

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title="User Management"
        subtitle="View, activate, deactivate and manage all registered users"
        actions={
          <Link href="/admin/users/create">
            <Button variant="primary">
              <UserPlus className="h-4 w-4 mr-2" />
              Create User
            </Button>
          </Link>
        }
      />

      <UserStatsCard users={users} />

      <UserTable
        users={users}
        onDelete={deleteUser}
        onToggleStatus={toggleUserStatus}
      />
    </motion.div>
  );
}