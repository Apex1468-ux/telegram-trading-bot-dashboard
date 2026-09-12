import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const tradeStore = create((set, get) => ({
  trades: [],
  openTrades: [],
  closedTrades: [],
  isLoading: false,
  error: null,
  summary: null,

  fetchTrades: async (status = 'all', limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/trades`, {
        params: { status, limit },
        headers: getAuthHeader(),
      });
      const trades = response.data;
      const openTrades = trades.filter((t) => t.status === 'OPEN');
      const closedTrades = trades.filter((t) => t.status === 'CLOSED');
      set({ trades, openTrades, closedTrades, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch trades', isLoading: false });
    }
  },

  fetchSummary: async () => {
    set({ isLoading: true });
    try {
      const response = await axios.get(`${API_URL}/dashboard/summary`, {
        headers: getAuthHeader(),
      });
      set({ summary: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch summary', isLoading: false });
    }
  },

  closeTrade: async (tradeId, exitPrice) => {
    try {
      const response = await axios.post(
        `${API_URL}/trades/${tradeId}/close`,
        { exit_price: exitPrice },
        { headers: getAuthHeader() }
      );
      // Refresh trades
      get().fetchTrades();
      return response.data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to close trade' });
      throw error;
    }
  },
}));

export default tradeStore;
