import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authStore from '../stores/authStore';
import settingsStore from '../stores/settingsStore';
import toast from 'react-hot-toast';
import { Save } from 'lucide-react';

const RobotSettings = () => {
  const navigate = useNavigate();
  const { user } = authStore();
  const { robotSettings, fetchSettings, updateSettings, isLoading } = settingsStore();
  const [formData, setFormData] = useState({});

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    fetchSettings();
  }, [user, navigate, fetchSettings]);

  useEffect(() => {
    if (robotSettings) {
      setFormData(robotSettings);
    }
  }, [robotSettings]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : type === 'number' ? parseFloat(value) : value,
    }));
  };

  const handleTPChange = (index, value) => {
    const newTPs = [...(formData.tp_percentages || [])];
    newTPs[index] = parseFloat(value);
    setFormData((prev) => ({
      ...prev,
      tp_percentages: newTPs,
    }));
  };

  const handleChannelToggle = (channel) => {
    const channels = formData.channels || [];
    const newChannels = channels.includes(channel)
      ? channels.filter((c) => c !== channel)
      : [...channels, channel];
    setFormData((prev) => ({
      ...prev,
      channels: newChannels,
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const success = await updateSettings(formData);
    if (success) {
      toast.success('Settings updated successfully!');
    } else {
      toast.error('Failed to update settings');
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-white mb-8">Robot Settings</h1>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Basic Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Basic Configuration</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Trade Notional (USDT)
                </label>
                <input
                  type="number"
                  name="trade_notional"
                  value={formData.trade_notional || ''}
                  onChange={handleChange}
                  step="0.1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Default Leverage
                </label>
                <input
                  type="number"
                  name="default_leverage"
                  value={formData.default_leverage || ''}
                  onChange={handleChange}
                  min="1"
                  max="125"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Simultaneous Trades
                </label>
                <input
                  type="number"
                  name="max_simultaneous_trades"
                  value={formData.max_simultaneous_trades || ''}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Max Hold Hours
                </label>
                <input
                  type="number"
                  name="max_hold_hours"
                  value={formData.max_hold_hours || ''}
                  onChange={handleChange}
                  min="1"
                  className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                />
              </div>
            </div>
          </div>

          {/* Take Profit Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Take Profit Distribution</h2>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {(formData.tp_percentages || []).map((tp, index) => (
                <div key={index}>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    TP{index + 1} %
                  </label>
                  <input
                    type="number"
                    value={tp}
                    onChange={(e) => handleTPChange(index, e.target.value)}
                    step="0.1"
                    min="0"
                    className="w-full bg-gray-700 border border-gray-600 rounded-lg px-4 py-2 text-white"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Advanced Settings */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Advanced Settings</h2>
            <div className="space-y-4">
              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="trailing_stop_enabled"
                  checked={formData.trailing_stop_enabled || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-300">Enable Trailing Stop</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="breakeven_after_tp1"
                  checked={formData.breakeven_after_tp1 || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-300">Breakeven After TP1</span>
              </label>

              <label className="flex items-center">
                <input
                  type="checkbox"
                  name="compounding_enabled"
                  checked={formData.compounding_enabled || false}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded"
                />
                <span className="ml-3 text-gray-300">Enable Compounding</span>
              </label>
            </div>
          </div>

          {/* Channel Selection */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h2 className="text-xl font-bold text-white mb-4">Active Channels</h2>
            <div className="space-y-3">
              {['BTR', 'ELITE', 'PREMIUM'].map((channel) => (
                <label key={channel} className="flex items-center">
                  <input
                    type="checkbox"
                    checked={(formData.channels || []).includes(channel)}
                    onChange={() => handleChannelToggle(channel)}
                    className="w-4 h-4 text-blue-600 rounded"
                  />
                  <span className="ml-3 text-gray-300">{channel}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-600 text-white font-bold py-3 rounded-lg transition flex items-center justify-center gap-2"
          >
            <Save className="w-5 h-5" />
            {isLoading ? 'Saving...' : 'Save Settings'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RobotSettings;
