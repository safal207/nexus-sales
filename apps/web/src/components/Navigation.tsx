'use client';

import React from 'react';
import Link from 'next/link';

export function Navigation() {
  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              ConsciousFunnels
            </Link>
          </div>

          <div className="flex items-center space-x-4">
            <Link
              href="/testing-dashboard"
              className="text-gray-600 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              🧪 QA Dashboard
            </Link>
            <Link
              href="/register"
              className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Регистрация
            </Link>
            <Link
              href="/login"
              className="border border-indigo-200 hover:border-indigo-300 text-indigo-600 px-4 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Войти
            </Link>
          </div>
        </div>
      </div>
    </nav>
  );
}
