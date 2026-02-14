'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { riderService } from '@/app/lib/services';

interface PerformanceStats {
  totalDeliveries: number;
  rating: number;
  completedDeliveries: number;
  failedDeliveries: number;
  averageDeliveriesPerDay: number;
  onTimePercentage: number;
  customerSatisfaction: number;
  totalKm?: number;
  totalEarnings?: number;
}

export default function RiderPerformance() {
  const [stats, setStats] = useState<PerformanceStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchPerformanceStats();
  }, []);

  const fetchPerformanceStats = async () => {
    try {
      setLoading(true);
      const res = await riderService.getMyStats();
      setStats(res.data);
      setError('');
    } catch (err: any) {
      console.error('❌ Error fetching stats:', err);
      setError(err.response?.data?.message || 'Failed to load performance stats');
    } finally {
      setLoading(false);
    }
  };

  const getRatingColor = (rating: number) => {
    if (rating >= 4.5) return 'text-green-600 bg-green-100';
    if (rating >= 4) return 'text-blue-600 bg-blue-100';
    if (rating >= 3.5) return 'text-yellow-600 bg-yellow-100';
    return 'text-orange-600 bg-orange-100';
  };

  const getPerformanceLevel = (percentage: number) => {
    if (percentage >= 95) return { label: 'Excellent', color: 'bg-green-100 text-green-800', icon: '🌟' };
    if (percentage >= 85) return { label: 'Very Good', color: 'bg-blue-100 text-blue-800', icon: '⭐' };
    if (percentage >= 75) return { label: 'Good', color: 'bg-yellow-100 text-yellow-800', icon: '👍' };
    return { label: 'Needs Improvement', color: 'bg-orange-100 text-orange-800', icon: '⚠️' };
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <div className="inline-block">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-500 mb-4"></div>
              <p className="text-gray-600">Loading your performance data...</p>
            </div>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-white via-gray-50 to-gray-100 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">📈 My Performance</h1>
            <p className="text-gray-600">Track your delivery performance and achievements</p>
          </div>
          <Link
            href="/rider/dashboard"
            className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition font-semibold"
          >
            ← Back
          </Link>
        </div>

        {/* Error Alert */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded">
            <p className="text-red-700 font-medium">❌ {error}</p>
          </div>
        )}

        {stats && (
          <div className="space-y-8">
            {/* Main Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {/* Total Deliveries */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-t-4 border-green-500">
                <p className="text-gray-600 text-sm font-semibold mb-2">Total Deliveries</p>
                <p className="text-4xl font-bold text-green-600">🎯 {stats.totalDeliveries}</p>
                <p className="text-xs text-green-700 mt-3">All-time record</p>
              </div>

              {/* Rating */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-t-4 border-yellow-500">
                <p className="text-gray-600 text-sm font-semibold mb-2">Customer Rating</p>
                <p className={`text-4xl font-bold pl-2 pr-2 py-1  rounded ${getRatingColor(stats.rating)}`}>
                  ⭐ {stats.rating?.toFixed(1) || '0.0'}/5
                </p>
                <p className="text-xs text-yellow-700 mt-3">Based on {stats.totalDeliveries} deliveries</p>
              </div>

              {/* Completed */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-t-4 border-blue-500">
                <p className="text-gray-600 text-sm font-semibold mb-2">Completed</p>
                <p className="text-4xl font-bold text-blue-600">✅ {stats.completedDeliveries}</p>
                <p className="text-xs text-blue-700 mt-3">
                  {((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)}% success rate
                </p>
              </div>

              {/* On-Time Percentage */}
              <div className="bg-white rounded-lg shadow p-6 hover:shadow-lg transition border-t-4 border-purple-500">
                <p className="text-gray-600 text-sm font-semibold mb-2">On-Time Rate</p>
                <p className="text-4xl font-bold text-purple-600">⏰ {stats.onTimePercentage?.toFixed(1) || '0'}%</p>
                <p className="text-xs text-purple-700 mt-3">Deliveries on schedule</p>
              </div>
            </div>

            {/* Performance Breakdown */}
            <div className="bg-white rounded-lg shadow p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">📊 Performance Breakdown</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  {/* Failed Deliveries */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-700 font-semibold">Failed Deliveries</p>
                      <span className="text-red-600 font-bold">❌ {stats.failedDeliveries}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-red-500 h-full transition-all"
                        style={{
                          width: `${(stats.failedDeliveries / stats.totalDeliveries) * 100}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">
                      {((stats.failedDeliveries / stats.totalDeliveries) * 100).toFixed(1)}% of total
                    </p>
                  </div>

                  {/* Average Per Day */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-700 font-semibold">Avg. Deliveries/Day</p>
                      <span className="text-blue-600 font-bold">📦 {stats.averageDeliveriesPerDay?.toFixed(1) || '0'}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-blue-500 h-full transition-all"
                        style={{
                          width: `${Math.min((stats.averageDeliveriesPerDay / 50) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Target: 50+ deliveries/day</p>
                  </div>

                  {/* Customer Satisfaction */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <p className="text-gray-700 font-semibold">Customer Satisfaction</p>
                      <span className="text-green-600 font-bold">😊 {stats.customerSatisfaction?.toFixed(1) || '0'}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                      <div
                        className="bg-green-500 h-full transition-all"
                        style={{
                          width: `${Math.min(stats.customerSatisfaction || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-600 mt-1">Target: 90%+ satisfaction</p>
                  </div>

                  {/* Total KM */}
                  {stats.totalKm && (
                    <div>
                      <div className="flex justify-between items-center mb-2">
                        <p className="text-gray-700 font-semibold">Total Distance Covered</p>
                        <span className="text-indigo-600 font-bold">🗺️ {stats.totalKm?.toFixed(1)} km</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-4 overflow-hidden">
                        <div
                          className="bg-indigo-500 h-full transition-all"
                          style={{
                            width: `${Math.min((stats.totalKm / 5000) * 100, 100)}%`,
                          }}
                        ></div>
                      </div>
                      <p className="text-xs text-gray-600 mt-1">Goal: 5000+ km/month</p>
                    </div>
                  )}
                </div>

                {/* Right Column - Performance Level */}
                <div className="space-y-6">
                  {/* Performance Levels */}
                  <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-4">🏆 Performance Level</h3>
                    {(() => {
                      const level = getPerformanceLevel(stats.completedDeliveries / stats.totalDeliveries * 100);
                      return (
                        <div className={`p-4 rounded-lg ${level.color} text-center`}>
                          <p className="text-3xl mb-2">{level.icon}</p>
                          <p className="font-bold text-lg">{level.label}</p>
                          <p className="text-sm mt-2 opacity-75">
                            Success Rate: {((stats.completedDeliveries / stats.totalDeliveries) * 100).toFixed(1)}%
                          </p>
                        </div>
                      );
                    })()}
                  </div>

                  {/* Achievements */}
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-lg p-6">
                    <h3 className="font-bold text-gray-900 mb-4">🎖️ Achievements</h3>
                    <div className="space-y-3">
                      {stats.totalDeliveries >= 100 && (
                        <div className="flex items-center gap-2 p-2 bg-yellow-100 rounded">
                          <span className="text-lg">🌟</span>
                          <span className="text-sm font-semibold">Century Rider - 100+ deliveries</span>
                        </div>
                      )}
                      {stats.rating >= 4.8 && (
                        <div className="flex items-center gap-2 p-2 bg-gold-100 rounded">
                          <span className="text-lg">👑</span>
                          <span className="text-sm font-semibold">Top Rated - 4.8+ rating</span>
                        </div>
                      )}
                      {stats.onTimePercentage >= 95 && (
                        <div className="flex items-center gap-2 p-2 bg-blue-100 rounded">
                          <span className="text-lg">⏰</span>
                          <span className="text-sm font-semibold">Punctual Pro - 95%+ on-time</span>
                        </div>
                      )}
                      {stats.customerSatisfaction >= 95 && (
                        <div className="flex items-center gap-2 p-2 bg-green-100 rounded">
                          <span className="text-lg">😊</span>
                          <span className="text-sm font-semibold">Customer Champion - 95%+ satisfaction</span>
                        </div>
                      )}
                      {stats.totalDeliveries < 100 && !stats.rating && !stats.onTimePercentage && (
                        <p className="text-sm text-gray-600">Keep delivering to unlock achievements! 🚀</p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Monthly Comparison */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* This Month */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-green-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4">📅 This Month</h3>
                <div className="space-y-3">
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Deliveries</span>
                    <span className="font-bold text-gray-900">
                      {Math.round((stats.averageDeliveriesPerDay || 0) * 30)} deliveries
                    </span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">Average Rating</span>
                    <span className="font-bold text-yellow-600">⭐ {stats.rating?.toFixed(1)}/5</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-gray-200">
                    <span className="text-gray-600">On-Time Deliveries</span>
                    <span className="font-bold text-blue-600">{stats.onTimePercentage?.toFixed(1) || '0'}%</span>
                  </div>
                </div>
              </div>

              {/* Goals Progress */}
              <div className="bg-white rounded-lg shadow p-6 border-l-4 border-blue-500">
                <h3 className="text-lg font-bold text-gray-900 mb-4">🎯 Your Goals</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target: 50 deliveries/day</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-green-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min((stats.averageDeliveriesPerDay / 50) * 100 || 0, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {((stats.averageDeliveriesPerDay / 50) * 100 || 0).toFixed(1)}% Complete
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Target: 4.8 rating</p>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-yellow-500 h-full rounded-full transition-all"
                        style={{
                          width: `${Math.min(((stats.rating || 0) / 4.8) * 100, 100)}%`,
                        }}
                      ></div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1 text-right">
                      {((stats.rating || 0) / 4.8 * 100).toFixed(1)}% Complete
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Tips & Recommendations */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
              <h3 className="text-lg font-bold text-blue-900 mb-3">💡 Tips to Improve Performance</h3>
              <ul className="text-sm text-blue-800 space-y-2">
                <li>✓ Plan your route efficiently to increase deliveries per day</li>
                <li>✓ Communicate with customers for a better experience</li>
                <li>✓ Deliver on time to maintain your punctuality rating</li>
                <li>✓ Check parcel conditions before delivery</li>
                <li>✓ Always be professional and courteous to customers</li>
                <li>✓ Keep your vehicle well-maintained for reliability</li>
              </ul>
            </div>

            {/* Earnings Info */}
            {stats.totalEarnings && (
              <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-lg shadow p-6 border border-green-200">
                <h3 className="text-lg font-bold text-gray-900 mb-4">💰 Total Earnings</h3>
                <div className="flex items-end gap-4">
                  <div>
                    <p className="text-gray-600 text-sm font-semibold mb-2">All-Time Earnings</p>
                    <p className="text-4xl font-bold text-green-600">৳{stats.totalEarnings?.toLocaleString()}</p>
                  </div>
                  <div className="text-right flex-1">
                    <p className="text-gray-600 text-sm font-semibold mb-2">Average Per Delivery</p>
                    <p className="text-2xl font-bold text-green-600">
                      ৳{(stats.totalEarnings / stats.totalDeliveries).toFixed(0)}
                    </p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </main>
  );
}
