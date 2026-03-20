'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { Bell, LogOut } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ROLE_LABELS } from '@/config/permissions';
import { APP_NAME } from '@/lib/constants';

export function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const roleColors: Record<string, { bg: string; text: string }> = {
    ROLE_STARTUP:   { bg: 'rgba(34,145,99,0.15)',  text: '#44b282' },
    ROLE_INVESTOR:  { bg: 'rgba(245,158,11,0.15)', text: '#fbbf24' },
    ROLE_EVALUATOR: { bg: 'rgba(59,130,246,0.15)', text: '#60a5fa' },
    ROLE_ADMIN:     { bg: 'rgba(239,68,68,0.15)',  text: '#f87171' },
  };
  const roleColor = roleColors[user?.role ?? ''] ?? { bg: 'rgba(74,96,128,0.15)', text: '#4a6080' };

  const initials = user?.fullName
    ?.split(' ').map((n) => n[0]).join('').slice(0, 2).toUpperCase() ?? 'U';

  return (
    <motion.nav
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      style={{
        height: 60, background: '#111f35', borderBottom: '1px solid #1e3352',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 24px', position: 'sticky', top: 0, zIndex: 40,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div style={{
          width: 32, height: 32, background: '#229163', borderRadius: 8,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: 13, color: '#fff',
        }}>RG</div>
        <span style={{ fontFamily: 'var(--font-display)', fontWeight: 600, color: '#fff', fontSize: 15 }}>
          {APP_NAME}
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>

        <button
          className="nav-icon-btn"
          style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #1e3352', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6080', position: 'relative' }}
        >
          <Bell size={14} />
          <span style={{ position: 'absolute', top: 7, right: 7, width: 7, height: 7, background: '#229163', borderRadius: '50%', border: '2px solid #111f35' }} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '4px 10px 4px 4px', borderRadius: 10, border: '1px solid #1e3352', background: '#0a1628' }}>
          <div style={{ width: 28, height: 28, borderRadius: 6, overflow: 'hidden', flexShrink: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'linear-gradient(135deg,#229163,#167550)' }}>
            {user?.profilePictureUrl ? (
              <img
                src={user.profilePictureUrl}
                alt={user.fullName ?? 'Profile'}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
              />
            ) : (
              <span style={{ fontSize: 11, fontWeight: 500, color: '#fff' }}>{initials}</span>
            )}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 12, fontWeight: 500, color: '#fff', lineHeight: 1.2 }}>
              {user?.fullName ?? 'User'}
            </span>
            <span style={{ fontSize: 10, fontWeight: 500, padding: '1px 6px', borderRadius: 4, background: roleColor.bg, color: roleColor.text, marginTop: 2 }}>
              {ROLE_LABELS[user?.role ?? ''] ?? user?.role ?? 'Unknown'}
            </span>
          </div>
        </div>

        <button
          onClick={handleLogout}
          title="Sign out"
          className="nav-icon-btn nav-logout-btn"
          style={{ width: 34, height: 34, borderRadius: 8, border: '1px solid #1e3352', background: '#0a1628', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#4a6080' }}
        >
          <LogOut size={14} />
        </button>
      </div>
    </motion.nav>
  );
}