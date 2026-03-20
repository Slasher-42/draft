'use client';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { useStartupProfile } from '@/hooks/useStartupProfile';
import { DashboardHeader } from '@/components/layout/DashboardHeader';
import { StartupProfileForm } from '@/components/startup/StartupProfileForm';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LoadingSpinner } from '@/components/common/LoadingSpinner';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function StartupProfileEditPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { profile, loading, save } = useStartupProfile(user?.id ?? 0);

  if (loading) return <LoadingSpinner size="md" message="Loading..." className="mt-20" />;

  const handleSave = async (data: any) => {
    await save(data);
    router.push('/startup/profile');
  };

  return (
    <motion.div
      className="flex flex-col gap-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.4 }}
    >
      <DashboardHeader
        title={profile ? 'Edit Profile' : 'Create Profile'}
        subtitle="Fill in your startup details to get your investment readiness score"
        actions={
          <Link href="/startup/profile">
            <Button variant="secondary" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
        }
      />

      <Card>
        <CardHeader>
          <CardTitle>Startup Information</CardTitle>
        </CardHeader>
        <CardContent>
          <StartupProfileForm
            existing={profile}
            onSave={handleSave}
          />
        </CardContent>
      </Card>
    </motion.div>
  );
}