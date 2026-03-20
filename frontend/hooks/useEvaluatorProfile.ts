import { useState, useEffect } from 'react';
import { evaluatorProfileService } from '@/services/evaluatorProfileService';
import type { EvaluatorProfile, EvaluatorProfileRequest } from '@/types/evaluator';
import { toast } from 'react-toastify';

export const useEvaluatorProfile = (userId: number) => {
  const [profile, setProfile] = useState<EvaluatorProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetch = async () => {
      try {
        const data = await evaluatorProfileService.get(userId);
        setProfile(data);
      } catch (err: any) {
        if (err.response?.status !== 404) {
          setError(err.response?.data?.message || 'Failed to load profile');
        }
      } finally {
        setLoading(false);
      }
    };
    if (userId) fetch();
  }, [userId]);

  const save = async (data: EvaluatorProfileRequest) => {
    try {
      const saved = await evaluatorProfileService.save(userId, data);
      setProfile(saved);
      toast.success('Profile saved successfully!');
      return saved;
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to save profile');
      throw err;
    }
  };

  return { profile, loading, error, save };
};