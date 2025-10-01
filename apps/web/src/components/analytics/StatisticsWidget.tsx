'use client';

import React from 'react';
import { motion } from 'framer-motion';

interface StatItem {
  title: string;
  value: string;
  change?: string;
  icon: string;
  color: string;
}

interface StatisticsWidgetProps {
  title: string;
  subtitle?: string;
  stats: StatItem[];
  onRefresh?: () => void;
}

export const StatisticsWidget: React.FC<StatisticsWidgetProps> = ({ 
  title, 
  subtitle, 
  stats,
  onRefresh
}) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
          {subtitle && <p className="text-sm text-gray-600 mt-1">{subtitle}</p>}
        </div>
        {onRefresh && (
          <button 
            onClick={onRefresh}
            className="text-gray-400 hover:text-gray-600 transition-colors"
            title="Обновить данные"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          </button>
        )}
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((stat, index) => (
          <motion.div
            key={index}
            className={`p-4 rounded-lg ${stat.color} border border-gray-100`}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            whileHover={{ y: -5 }}
          >
            <div className="flex items-center">
              <div className="text-2xl mr-3">{stat.icon}</div>
              <div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.title}</div>
                {stat.change && (
                  <div className={`text-xs mt-1 ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change.startsWith('+') ? '↑' : '↓'} {stat.change}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};