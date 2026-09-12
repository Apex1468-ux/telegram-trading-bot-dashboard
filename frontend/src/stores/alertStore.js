import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const alertStore = create((set) => ({
  alerts: [],
  unreadCount: 0,
  isLoading: false,
  error: null,

  fetchAlerts: async (unreadOnly = false, limit = 50) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/alerts`, {
        params: { unread: unreadOnly, limit },
        headers: getAuthHeader(),
      });
      const alerts = response.data;
      const unreadCount = alerts.filter((a) => !a.is_read).length;
      set({ alerts, unreadCount, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch alerts', isLoading: false });
    }
  },

  markAsRead: async (alertId) => {
    try {
      await axios.put(`${API_URL}/alerts/${alertId}/read`, {}, {
        headers: getAuthHeader(),
      });
      set((state) => ({
        alerts: state.alerts.map((a) =>
          a.id === alertId ? { ...a, is_read: true } : a
        ),
        unreadCount: Math.max(0, state.unreadCount - 1),
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to mark alert as read' });
    }
  },

  markAllAsRead: async () => {
    try {
      await axios.put(`${API_URL}/alerts/read-all`, {}, {
        headers: getAuthHeader(),
      });
      set((state) => ({
        alerts: state.alerts.map((a) => ({ ...a, is_read: true })),
        unreadCount: 0,
      }));
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to mark alerts as read' });
    }
  },
}));

export default alertStore;
