import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from '../stores/authStore';
import tradeStore from '../stores/tradeStore';
import {
  TrendingUp,
  TrendingDown,
  DollarSign,
  Activity,
  Zap,
  AlertCircle,
} from 'lucide-react';

const Dashboard = () => {
  const navigate = useNavigate();
  const { user } = authStore();
  const { summary, fetchSummary } = tradeStore();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSummary().then(() => setLoading(false));
  }, [user, navigate, fetchSummary]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  const stats = [
    {
      label: 'Total P/L',
      value: `$${summary?.total_pnl?.toFixed(2) || '0.00'}`,
      icon: DollarSign,
      color: summary?.total_pnl > 0 ? 'text-green-400' : 'text-red-400',
    },
    {
      label: 'Win Rate',
      value: `${summary?.win_rate?.toFixed(1) || '0'}%`,
      icon: TrendingUp,
      color: 'text-blue-400',
    },
    {
      label: 'Open Trades',
      value: summary?.open_trades || 0,
      icon: Activity,
      color: 'text-yellow-400',
    },
    {
      label: 'Closed Trades',
      value: summary?.closed_trades || 0,
      icon: Zap,
      color: 'text-purple-400',
    },
  ];

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Professional Trading Dashboard</h1>
          <p className="text-gray-400">Welcome back, {user?.username}!</p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <div
                key={index}
                className="bg-gray-800 rounded-lg p-6 border border-gray-700 hover:border-blue-500 transition"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-400 text-sm mb-1">{stat.label}</p>
                    <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
                  </div>
                  <Icon className={`w-12 h-12 ${stat.color} opacity-20`} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Active Trades */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
          <h2 className="text-xl font-bold text-white mb-4 flex items-center">
            <AlertCircle className="w-5 h-5 mr-2 text-blue-400" />
            Active Trades
          </h2>
          {summary?.open_trades_data && summary.open_trades_data.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-700">
                    <th className="text-left py-3 px-4 text-gray-400">Symbol</th>
                    <th className="text-left py-3 px-4 text-gray-400">Direction</th>
                    <th className="text-left py-3 px-4 text-gray-400">Entry Price</th>
                    <th className="text-left py-3 px-4 text-gray-400">Quantity</th>
                    <th className="text-left py-3 px-4 text-gray-400">Leverage</th>
                    <th className="text-left py-3 px-4 text-gray-400">Channel</th>
                  </tr>
                </thead>
                <tbody>
                  {summary.open_trades_data.map((trade, idx) => (
                    <tr key={idx} className="border-b border-gray-700 hover:bg-gray-700">
                      <td className="py-3 px-4 text-white font-semibold">{trade.symbol}</td>
                      <td className={`py-3 px-4 font-semibold ${trade.direction === 'LONG' ? 'text-green-400' : 'text-red-400'}`}>
                        {trade.direction}
                      </td>
                      <td className="py-3 px-4 text-gray-300">${trade.entry_price.toFixed(8)}</td>
                      <td className="py-3 px-4 text-gray-300">{trade.quantity.toFixed(4)}</td>
                      <td className="py-3 px-4 text-gray-300">{trade.leverage}x</td>
                      <td className="py-3 px-4 text-gray-300">{trade.channel}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-gray-400">No active trades</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
