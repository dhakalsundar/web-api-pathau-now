import axios from '@/lib/api/axios';

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

class DashboardService {
  /**
   * Fetch dashboard statistics
   * Requires admin role
   */
  async getDashboardStats(): Promise<DashboardStats> {
    try {
      const response = await axios.get('/admin/analytics/stats');
      return response.data.data;
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to fetch dashboard statistics');
    }
  }

  /**
   * Format large numbers for display (e.g., 1000 -> 1K)
   */
  formatNumber(num: number | string): string {
    const number = typeof num === 'string' ? parseInt(num) : num;
    if (number >= 1_000_000) {
      return (number / 1_000_000).toFixed(1) + 'M';
    }
    if (number >= 1_000) {
      return (number / 1_000).toFixed(1) + 'K';
    }
    return number.toString();
  }

  /**
   * Calculate percentage change
   */
  calculatePercentage(current: number, previous: number): string {
    if (previous === 0) return '0%';
    const change = ((current - previous) / previous) * 100;
    return (change > 0 ? '+' : '') + change.toFixed(1) + '%';
  }

  /**
   * Get shipment completion rate
   */
  getCompletionRate(stats: DashboardStats): number {
    const { total, delivered } = stats.shipments;
    if (total === 0) return 0;
    return Math.round((delivered / total) * 100);
  }

  /**
   * Get rider availability percentage
   */
  getRiderAvailability(stats: DashboardStats): number {
    const { total, available } = stats.riders;
    if (total === 0) return 0;
    return Math.round((available / total) * 100);
  }
}

export const dashboardService = new DashboardService();
