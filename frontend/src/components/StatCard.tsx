import React from 'react';
import {  type LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: string;
  color?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  trend,
  color = 'blue',
}: StatCardProps) {
  const colorClasses = {
    blue: 'from-blue-500 to-blue-600',
    purple: 'from-purple-500 to-purple-600',
    green: 'from-green-500 to-green-600',
    orange: 'from-orange-500 to-orange-600',
  }[color];

  return (
    <div className="bg-white rounded-xl p-6 border border-gray-200 hover:shadow-lg transition-shadow">
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <p className="text-gray-600 mb-2">{title}</p>
          <p className="text-3xl mb-2">{value}</p>
          {trend && <p className="text-sm text-gray-500">{trend}</p>}
        </div>
        <div
          className={`p-3 rounded-xl bg-gradient-to-br ${colorClasses} text-white`}
        >
          <Icon className="size-6" />
        </div>
      </div>
    </div>
  );
}
