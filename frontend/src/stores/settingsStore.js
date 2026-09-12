import { create } from 'zustand';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const getAuthHeader = () => {
  const token = localStorage.getItem('token');
  return { Authorization: `Bearer ${token}` };
};

const settingsStore = create((set) => ({
  robotSettings: null,
  isLoading: false,
  error: null,

  fetchSettings: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.get(`${API_URL}/settings/robot`, {
        headers: getAuthHeader(),
      });
      set({ robotSettings: response.data, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch settings', isLoading: false });
    }
  },

  updateSettings: async (settings) => {
    set({ isLoading: true, error: null });
    try {
      const response = await axios.put(`${API_URL}/settings/robot`, settings, {
        headers: getAuthHeader(),
      });
      set({ robotSettings: response.data.settings, isLoading: false });
      return true;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to update settings', isLoading: false });
      return false;
    }
  },
}));

export default settingsStore;
