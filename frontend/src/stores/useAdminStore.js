import { create } from 'zustand';
import axios from '../lib/axios';
import toast from 'react-hot-toast';

export const useAdminStore = create((set, get) => ({
  tables: [],
  activeTable: null,
  tableData: { data: [], columns: [] },
  loading: false,
  error: null,

  // Fetch all available tables
  fetchTables: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axios.get('/admin/table');
      set({ tables: response.data.tables, loading: false });
    } catch (error) {
      const message = error.response?.data?.message || 'Failed to fetch tables';
      set({ error: message, loading: false });
      toast.error(message);
      console.error('Error fetching tables:', error);
    }
  },

  // Fetch data for a specific table
  fetchTableData: async (tableName) => {
    set({ loading: true, error: null, activeTable: tableName });
    try {
      const response = await axios.get(`/admin/table/${tableName}`);
      set({ 
        tableData: response.data, 
        loading: false 
      });
    } catch (error) {
      const message = error.response?.data?.message || `Failed to fetch ${tableName} data`;
      set({ error: message, loading: false, tableData: { data: [], columns: [] } });
      toast.error(message);
      console.error(`Error fetching ${tableName}:`, error);
    }
  },

  // Set active table (without fetching)
  setActiveTable: (tableName) => {
    set({ activeTable: tableName });
  },

  // Clear error
  clearError: () => set({ error: null }),

  // Reset store
  reset: () => set({
    tables: [],
    activeTable: null,
    tableData: { data: [], columns: [] },
    loading: false,
    error: null
  })
}));
