'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';

interface EmotionData {
  emotion: string;
  value: number;
  color: string;
}

interface EmotionalAnalyticsProps {
  title: string;
  data: EmotionData[];
  period: string;
  onPeriodChange: (period: string) => void;
}

export const EmotionalAnalytics: React.FC<EmotionalAnalyticsProps> = ({ 
  title, 
  data, 
  period,
  onPeriodChange
}) => {
  const [selectedEmotion, setSelectedEmotion] = useState<string | null>(null);
  
  const periods = [
    { value: '24h', label: 'Посл. 24 часа' },
    { value: '7d', label: 'Посл. 7 дней' },
    { value: '30d', label: 'Посл. 30 дней' }
  ];

  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <div className="flex space-x-2">
          {periods.map((p) => (
            <button
              key={p.value}
              onClick={() => onPeriodChange(p.value)}
              className={`px-3 py-1 text-sm rounded-md ${
                period === p.value
                  ? 'bg-blue-100 text-blue-700 font-medium'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {data.map((item, index) => {
          const isSelected = selectedEmotion === item.emotion;
          return (
            <motion.div
              key={index}
              className={`p-4 rounded-lg border cursor-pointer transition-all ${
                isSelected 
                  ? 'border-blue-300 bg-blue-50' 
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              onClick={() => setSelectedEmotion(isSelected ? null : item.emotion)}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <div className="text-lg mr-3">{item.emotion}</div>
                  <span className="font-medium text-gray-900">{item.value}%</span>
                </div>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2.5">
                <motion.div
                  className="h-2.5 rounded-full"
                  style={{ backgroundColor: item.color }}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.value}%` }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                ></motion.div>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="mt-6 pt-4 border-t border-gray-100">
        <div className="flex justify-between text-sm text-gray-600">
          <span>Всего взаимодействий: 1,234</span>
          <span>Средняя эмоциональная реакция: 78%</span>
        </div>
      </div>
    </div>
  );
};