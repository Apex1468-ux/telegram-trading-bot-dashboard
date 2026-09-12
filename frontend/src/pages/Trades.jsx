import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from '../stores/authStore';
import tradeStore from '../stores/tradeStore';
import { formatDistanceToNow } from 'date-fns';

const Trades = () => {
  const navigate = useNavigate();
  const { user } = authStore();
  const { trades, fetchTrades, closeTrade, isLoading } = tradeStore();
  const [filter, setFilter] = useState('all');
  const [closeModalOpen, setCloseModalOpen] = useState(false);
  const [selectedTrade, setSelectedTrade] = useState(null);
  const [exitPrice, setExitPrice] = useState('');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchTrades(filter);
  }, [user, navigate, fetchTrades, filter]);

  const handleCloseClick = (trade) => {
    setSelectedTrade(trade);
    setExitPrice(trade.exit_price || '');
    setCloseModalOpen(true);
  };

  const handleCloseTrade = async () => {
    if (!selectedTrade || !exitPrice) return;
    try {
      await closeTrade(selectedTrade.id, parseFloat(exitPrice));
      setCloseModalOpen(false);
      setSelectedTrade(null);
      setExitPrice('');
    } catch (error) {
      console.error('Error closing trade:', error);
    }
  };

  const displayTrades = trades.filter((t) => filter === 'all' || t.status === filter);

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-6">Trade History</h1>

        {/* Filters */}
        <div className="mb-6 flex gap-4">
          {['all', 'OPEN', 'CLOSED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg font-semibold transition ${
                filter === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1).toLowerCase()}
            </button>
          ))}
        </div>

        {/* Trades Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          {displayTrades.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-gray-700 border-b border-gray-600">
                    <th className="text-left py-4 px-4 text-gray-300">Symbol</th>
                    <th className="text-left py-4 px-4 text-gray-300">Direction</th>
                    <th className="text-left py-4 px-4 text-gray-300">Entry</th>
                    <th className="text-left py-4 px-4 text-gray-300">Exit</th>
                    <th className="text-left py-4 px-4 text-gray-300">P/L</th>
                    <th className="text-left py-4 px-4 text-gray-300">Status</th>
                    <th className="text-left py-4 px-4 text-gray-300">Time</th>
                    <th className="text-left py-4 px-4 text-gray-300">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {displayTrades.map((trade) => (
                    <tr key={trade.id} className="border-b border-gray-700 hover:bg-gray-750">
                      <td className="py-4 px-4 text-white font-semibold">{trade.symbol}</td>
                      <td
                        className={`py-4 px-4 font-semibold ${
                          trade.direction === 'LONG' ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        {trade.direction}
                      </td>
                      <td className="py-4 px-4 text-gray-300">${trade.entry_price.toFixed(8)}</td>
                      <td className="py-4 px-4 text-gray-300">
                        {trade.exit_price ? `$${trade.exit_price.toFixed(8)}` : '-'}
                      </td>
                      <td
                        className={`py-4 px-4 font-semibold ${
                          trade.pnl >= 0 ? 'text-green-400' : 'text-red-400'
                        }`}
                      >
                        ${trade.pnl.toFixed(2)} ({trade.pnl_percent.toFixed(2)}%)
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-semibold ${
                            trade.status === 'OPEN'
                              ? 'bg-yellow-500 bg-opacity-20 text-yellow-400'
                              : 'bg-green-500 bg-opacity-20 text-green-400'
                          }`}
                        >
                          {trade.status}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-400 text-sm">
                        {formatDistanceToNow(new Date(trade.entry_time), { addSuffix: true })}
                      </td>
                      <td className="py-4 px-4">
                        {trade.status === 'OPEN' && (
                          <button
                            onClick={() => handleCloseClick(trade)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-700 text-white rounded text-sm transition"
                          >
                            Close
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-8 text-center text-gray-400">
              <p>No trades found</p>
            </div>
          )}
        </div>
      </div>

      {/* Close Trade Modal */}
      {closeModalOpen && selectedTrade && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full border border-gray-700">
            <h2 className="text-xl font-bold text-white mb-4">Close Trade</h2>
            <div className="mb-4">
              <p className="text-gray-400 mb-2">
                {selectedTrade.symbol} {selectedTrade.direction}
              </p>
              <label className="block text-sm text-gray-300 mb-2">Exit Price</label>
              <input
                type="number"
                value={exitPrice}
                onChange={(e) => setExitPrice(e.target.value)}
                step="0.00000001"
                className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
              />
            </div>
            <div className="flex gap-4">
              <button
                onClick={() => setCloseModalOpen(false)}
                className="flex-1 bg-gray-700 hover:bg-gray-600 text-white py-2 rounded-lg transition"
              >
                Cancel
              </button>
              <button
                onClick={handleCloseTrade}
                disabled={isLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 text-white py-2 rounded-lg transition"
              >
                {isLoading ? 'Closing...' : 'Close Trade'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Trades;
