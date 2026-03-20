'use client';
import { useState } from 'react';
import { motion } from 'framer-motion';
import { Trash2, PowerOff, Power, Search } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ROLE_LABELS } from '@/config/permissions';
import type { UserResponse } from '@/types/user';

interface UserTableProps {
  users: UserResponse[];
  onDelete: (id: number) => Promise<void>;
  onToggleStatus: (id: number) => Promise<void>;
}

const roleVariant = (role: string) => {
  switch (role) {
    case 'STARTUP':   return 'startup';
    case 'INVESTOR':  return 'investor';
    case 'EVALUATOR': return 'evaluator';
    case 'ADMIN':     return 'admin';
    default:          return 'default';
  }
};

export function UserTable({ users, onDelete, onToggleStatus }: UserTableProps) {
  const [search, setSearch] = useState('');
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [togglingId, setTogglingId] = useState<number | null>(null);

  const filtered = users.filter((u) =>
    u.fullName.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase()) ||
    u.role.toLowerCase().includes(search.toLowerCase())
  );

  const handleDelete = async (id: number) => {
    setDeletingId(id);
    try {
      await onDelete(id);
    } finally {
      setDeletingId(null);
    }
  };

  const handleToggle = async (id: number) => {
    setTogglingId(id);
    try {
      await onToggleStatus(id);
    } finally {
      setTogglingId(null);
    }
  };

  return (
    <motion.div
      className="flex flex-col gap-4"
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.2 }}
    >
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-surface-muted" />
        <input
          type="text"
          placeholder="Search by name, email or role..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 rounded-lg bg-surface border border-surface-border text-white text-sm font-body placeholder:text-surface-muted focus:outline-none focus:border-brand-500 transition-colors"
        />
      </div>

      <div className="rounded-xl border border-surface-border overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-surface-border bg-surface-subtle">
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted uppercase tracking-wide font-body">Name</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted uppercase tracking-wide font-body">Email</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted uppercase tracking-wide font-body">Role</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted uppercase tracking-wide font-body">Status</th>
              <th className="text-left px-4 py-3 text-xs font-medium text-surface-muted uppercase tracking-wide font-body">Joined</th>
              <th className="text-right px-4 py-3 text-xs font-medium text-surface-muted uppercase tracking-wide font-body">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-surface-muted font-body text-sm">
                  No users found.
                </td>
              </tr>
            ) : (
              filtered.map((user, index) => (
                <motion.tr
                  key={user.id}
                  className="border-b border-surface-border last:border-0 hover:bg-surface-card/50 transition-colors"
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.03 }}
                >
                  <td className="px-4 py-3 text-sm text-white font-medium font-body">{user.fullName}</td>
                  <td className="px-4 py-3 text-sm text-surface-muted font-body">{user.email}</td>
                  <td className="px-4 py-3">
                    <Badge variant={roleVariant(user.role) as any} className="text-xs">
                      {ROLE_LABELS[`ROLE_${user.role}`] ?? user.role}
                    </Badge>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded-full ${
                      user.enabled
                        ? 'bg-success/10 text-success border border-success/20'
                        : 'bg-danger/10 text-danger border border-danger/20'
                    }`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${user.enabled ? 'bg-success' : 'bg-danger'}`} />
                      {user.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-sm text-surface-muted font-body">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => handleToggle(user.id)}
                        disabled={togglingId === user.id}
                        title={user.enabled ? 'Disable user' : 'Enable user'}
                        className={`h-8 w-8 rounded-lg border flex items-center justify-center transition-colors ${
                          user.enabled
                            ? 'border-warning/30 text-warning hover:bg-warning/10'
                            : 'border-success/30 text-success hover:bg-success/10'
                        } disabled:opacity-50`}
                      >
                        {user.enabled
                          ? <PowerOff className="h-3.5 w-3.5" />
                          : <Power className="h-3.5 w-3.5" />}
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        disabled={deletingId === user.id}
                        title="Delete user"
                        className="h-8 w-8 rounded-lg border border-danger/30 text-danger hover:bg-danger/10 flex items-center justify-center transition-colors disabled:opacity-50"
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </motion.div>
  );
}