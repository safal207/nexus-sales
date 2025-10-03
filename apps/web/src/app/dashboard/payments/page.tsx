'use client';

import { useEffect, useState } from 'react';
import { Card } from '@/components/ui/Card';
import { formatAmountForDisplay } from '@/lib/stripe';

interface RevenueStats {
  totalRevenue: number;
  totalTransactions: number;
  successRate: number;
  averageOrderValue: number;
  todayRevenue: number;
  weekRevenue: number;
  monthRevenue: number;
}

export default function PaymentsDashboard() {
  const [stats, setStats] = useState<RevenueStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/analytics/revenue')
      .then((res) => res.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleExportCSV = async () => {
    try {
      const res = await fetch('/api/payments/export');
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `payments-${new Date().toISOString().split('T')[0]}.csv`;
      a.click();
    } catch (error) {
      console.error('Export failed:', error);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <h1 className="text-3xl font-bold mb-6">Payment Analytics</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <Card key={i} className="p-6 animate-pulse">
              <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
              <div className="h-8 bg-gray-200 rounded w-3/4"></div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-gray-900">Payment Analytics</h1>
        <button
          onClick={handleExportCSV}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Export Report
        </button>
      </div>

      {/* Revenue Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Total Revenue</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatAmountForDisplay(stats?.totalRevenue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-600 font-medium">+12.5%</span>
            <span className="text-gray-500 ml-2">from last month</span>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Transactions</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.totalTransactions || 0}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Success Rate</p>
              <p className="text-3xl font-bold text-gray-900">
                {stats?.successRate || 0}%
              </p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600 mb-1">Avg Order Value</p>
              <p className="text-3xl font-bold text-gray-900">
                {formatAmountForDisplay(stats?.averageOrderValue || 0)}
              </p>
            </div>
            <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
              </svg>
            </div>
          </div>
        </Card>
      </div>

      {/* Period Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100">
          <p className="text-sm text-blue-800 mb-2">Today's Revenue</p>
          <p className="text-2xl font-bold text-blue-900">
            {formatAmountForDisplay(stats?.todayRevenue || 0)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100">
          <p className="text-sm text-green-800 mb-2">This Week</p>
          <p className="text-2xl font-bold text-green-900">
            {formatAmountForDisplay(stats?.weekRevenue || 0)}
          </p>
        </Card>

        <Card className="p-6 bg-gradient-to-br from-purple-50 to-purple-100">
          <p className="text-sm text-purple-800 mb-2">This Month</p>
          <p className="text-2xl font-bold text-purple-900">
            {formatAmountForDisplay(stats?.monthRevenue || 0)}
          </p>
        </Card>
      </div>

      {/* Transactions Table */}
      <TransactionsTable />
    </div>
  );
}

// Transactions Table Component
function TransactionsTable() {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [filter, setFilter] = useState<'all' | 'succeeded' | 'failed'>('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/payments/transactions?filter=${filter}`)
      .then((res) => res.json())
      .then((data) => {
        setTransactions(data.transactions);
        setLoading(false);
      });
  }, [filter]);

  const getStatusBadge = (status: string) => {
    const styles: Record<string, string> = {
      succeeded: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      failed: 'bg-red-100 text-red-800',
      refunded: 'bg-gray-100 text-gray-800',
    };

    return (
      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${styles[status] || 'bg-gray-100 text-gray-800'}`}>
        {status}
      </span>
    );
  };

  const handleRefund = async (paymentId: string) => {
    if (!confirm('Are you sure you want to refund this payment?')) {
      return;
    }

    try {
      const res = await fetch('/api/payments/refund', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ paymentId }),
      });

      if (res.ok) {
        alert('Refund processed successfully!');
        // Refresh the table
        setFilter(filter); // Trigger re-fetch
      } else {
        const error = await res.json();
        alert(`Refund failed: ${error.error}`);
      }
    } catch (error) {
      alert('Refund failed. Please try again.');
    }
  };

  return (
    <Card className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold text-gray-900">Recent Transactions</h2>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'succeeded', 'failed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f as any)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                filter === f
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Transaction ID
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Product
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Customer
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Amount
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Status
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Date
              </th>
              <th className="text-left py-3 px-4 text-sm font-semibold text-gray-700">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="text-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
                </td>
              </tr>
            ) : transactions.length === 0 ? (
              <tr>
                <td colSpan={7} className="text-center py-8 text-gray-500">
                  No transactions found
                </td>
              </tr>
            ) : (
              transactions.map((tx) => (
                <tr key={tx.id} className="border-b border-gray-100 hover:bg-gray-50">
                  <td className="py-4 px-4">
                    <span className="font-mono text-sm text-gray-600">
                      {tx.stripePaymentId.slice(0, 12)}...
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">
                      {tx.order.product?.name || 'Unknown'}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-900">{tx.order.email}</span>
                  </td>
                  <td className="py-4 px-4">
                    <span className="text-sm font-semibold text-gray-900">
                      {formatAmountForDisplay(tx.amount)}
                    </span>
                  </td>
                  <td className="py-4 px-4">{getStatusBadge(tx.status)}</td>
                  <td className="py-4 px-4">
                    <span className="text-sm text-gray-600">
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </span>
                  </td>
                  <td className="py-4 px-4">
                    {tx.status === 'succeeded' && (
                      <button
                        onClick={() => handleRefund(tx.id)}
                        className="text-sm text-red-600 hover:text-red-800 font-medium"
                      >
                        Refund
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
