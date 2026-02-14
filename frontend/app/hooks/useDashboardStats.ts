'use client';

import { useEffect, useState } from 'react';
import { dashboardService } from '@/app/lib/dashboard.service';

interface DashboardStats {
  shipments: {
    total: number;
    pending: number;
    pickedUp: number;
    inTransit: number;
    outForDelivery: number;
    delivered: number;
    failed: number;
    cancelled: number;
  };
  riders: {
    total: number;
    available: number;
    busy: number;
    offline: number;
  };
  users: {
    totalCustomers: number;
    totalStaff: number;
    totalAdmins: number;
    totalUsers: number;
  };
  revenue: {
    total: number;
  };
}

interface UseDashboardStatsReturn {
  stats: DashboardStats | null;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

/**
 * Custom hook to fetch and manage dashboard statistics
 * Usage:
 *   const { stats, loading, error, refetch } = useDashboardStats();
 */
export const useDashboardStats = (): UseDashboardStatsReturn => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await dashboardService.getDashboardStats();
      setStats(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load dashboard statistics');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  return { stats, loading, error, refetch: fetchStats };
};
