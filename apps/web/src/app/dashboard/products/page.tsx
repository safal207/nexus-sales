'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ProductRecord } from '../../../utils/api';

export default function ProductsPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/products');
      if (!response.ok) {
        throw new Error('Failed to fetch products');
      }
      const data = await response.json();
      setProducts(data.products || []);
    } catch (err) {
      setError('Failed to load products');
      console.error('Error fetching products:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-red-500">{error}</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Мои продукты</h1>
          <Link 
            href="/dashboard/products/new"
            className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
          >
            + Добавить продукт
          </Link>
        </div>

        {products.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-5xl mb-4">🛍️</div>
            <h3 className="text-lg font-medium text-gray-900 mb-2">У вас пока нет продуктов</h3>
            <p className="text-gray-500 mb-6">Создайте первый продукт, чтобы начать продавать</p>
            <Link 
              href="/dashboard/products/new"
              className="inline-flex items-center bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              Создать продукт
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map((product) => (
              <div 
                key={product.id} 
                className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
              >
                <div className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{product.name}</h3>
                      <p className="text-sm text-gray-500 mt-1 line-clamp-2">{product.description}</p>
                    </div>
                    <div className="w-16 h-16 rounded-lg bg-gray-100 flex items-center justify-center text-gray-400">
                      🛍️
                    </div>
                  </div>

                  <div className="mt-4 flex justify-between items-center">
                    <div className="text-lg font-bold text-gray-900">
                      {new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB',
                        minimumFractionDigits: 0
                      }).format(product.price / 100)}
                    </div>
                    <div className="text-sm text-gray-500">
                      {/* 2025-09-29 - Claude Code: Removed category field that doesn't exist in ProductRecord */}
                    </div>
                  </div>

                  <div className="mt-4 flex space-x-2">
                    <Link 
                      href={`/dashboard/products/${product.id}`}
                      className="flex-1 text-center bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-medium py-2 px-4 rounded-lg transition-colors"
                    >
                      Редактировать
                    </Link>
                    <button 
                      onClick={() => {
                        if (confirm('Вы уверены, что хотите удалить этот продукт?')) {
                          // Implement delete functionality
                        }
                      }}
                      className="text-red-500 hover:text-red-700"
                    >
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
