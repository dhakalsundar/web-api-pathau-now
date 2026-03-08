'use client';

import React from 'react';

interface StatCardProps {
  icon: string;
  label: string;
  value: string | number;
  trend?: string;
  trendPositive?: boolean;
  color?: 'amber' | 'blue' | 'green' | 'red' | 'purple' | 'indigo' | 'emerald';
  onClick?: () => void;
  loading?: boolean;
}

export default function StatCard({
  icon,
  label,
  value,
  trend,
  trendPositive = true,
  color = 'amber',
  onClick,
  loading = false
}: StatCardProps) {
  const colorClasses = {
    amber: {
      bg: 'bg-gradient-to-br from-amber-50 to-amber-100',
      border: 'border-amber-200',
      text: 'text-amber-600',
      badge: 'bg-amber-200'
    },
    blue: {
      bg: 'bg-gradient-to-br from-blue-50 to-blue-100',
      border: 'border-blue-200',
      text: 'text-blue-600',
      badge: 'bg-blue-200'
    },
    green: {
      bg: 'bg-gradient-to-br from-green-50 to-green-100',
      border: 'border-green-200',
      text: 'text-green-600',
      badge: 'bg-green-200'
    },
    red: {
      bg: 'bg-gradient-to-br from-red-50 to-red-100',
      border: 'border-red-200',
      text: 'text-red-600',
      badge: 'bg-red-200'
    },
    purple: {
      bg: 'bg-gradient-to-br from-purple-50 to-purple-100',
      border: 'border-purple-200',
      text: 'text-purple-600',
      badge: 'bg-purple-200'
    },
    indigo: {
      bg: 'bg-gradient-to-br from-indigo-50 to-indigo-100',
      border: 'border-indigo-200',
      text: 'text-indigo-600',
      badge: 'bg-indigo-200'
    },
    emerald: {
      bg: 'bg-gradient-to-br from-emerald-50 to-emerald-100',
      border: 'border-emerald-200',
      text: 'text-emerald-600',
      badge: 'bg-emerald-200'
    }
  };

  const colorSet = colorClasses[color];

  if (loading) {
    return (
      <div className={`${colorSet.bg} ${colorSet.border} p-6 rounded-lg border animate-pulse h-32`} />
    );
  }

  return (
    <div
      className={`
        ${colorSet.bg} ${colorSet.border}
        p-6 rounded-lg border
        transition-all duration-300 ease-out
        hover:shadow-xl hover:-translate-y-1 
        ${onClick ? 'cursor-pointer' : ''}
        group
      `}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-sm text-gray-600 font-semibold group-hover:text-gray-800 transition-colors">
            {label}
          </p>
          <h3 className="text-3xl md:text-4xl font-bold mt-3 text-gray-900 group-hover:scale-105 transition-transform origin-left">
            {typeof value === 'number' ? value.toLocaleString() : value}
          </h3>
          
          {trend && (
            <div className={`
              text-xs mt-3 font-semibold 
              px-2 py-1 rounded inline-block
              ${colorSet.badge}
              ${trendPositive ? 'text-green-700' : 'text-red-700'}
            `}>
              {trendPositive ? '' : ''} {trend}
            </div>
          )}
        </div>
        
        <div className="text-5xl group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
      </div>
      
      {/* Subtle animated border effect */}
      <div className="absolute inset-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
        style={{
          background: 'radial-gradient(circle at top-right, rgba(255,255,255,0.3), transparent)',
        }}
      />
    </div>
  );
}
