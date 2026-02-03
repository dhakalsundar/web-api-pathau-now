'use client';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  color?: 'amber' | 'blue' | 'green' | 'red' | 'purple';
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendPositive = true,
  color = 'amber'
}: StatCardProps) {
  const colorClasses = {
    amber: 'bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200 text-amber-600',
    blue: 'bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 text-blue-600',
    green: 'bg-gradient-to-br from-green-50 to-green-100 border-green-200 text-green-600',
    red: 'bg-gradient-to-br from-red-50 to-red-100 border-red-200 text-red-600',
    purple: 'bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 text-purple-600'
  };

  return (
    <div className={`${colorClasses[color]} p-6 rounded-lg border transition hover:shadow-lg cursor-pointer`}>
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-gray-600 font-semibold">{label}</p>
          <h3 className="text-3xl font-bold mt-2 text-gray-900">{value}</h3>
          {trend && (
            <p className={`text-xs mt-2 font-semibold ${trendPositive ? 'text-green-600' : 'text-red-600'}`}>
              {trendPositive ? '↑' : '↓'} {trend}
            </p>
          )}
        </div>
        <div className="text-4xl">{icon}</div>
      </div>
    </div>
  );
}
