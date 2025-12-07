import { create } from "zustand";
import toast from "react-hot-toast";
import axios from "../lib/axios"; // Adjust the import path as necessary

export const useUserStore = create((set, get) => ({
  user: null,
  loading: false,
  checkingAuth: true,
  tempEmail: null,
  isVerifying: false,
  coolDown: 0,
  isCodeSent: false,
  invalidateProducts: null, 
  errors: [],

  setInvalidateAll: (fn) => {
    set({ invalidateProducts: fn });
  },

  signUp: async (userData) => {
    set({ loading: true });
    if (userData?.password !== userData?.confirmPassword) {
      set({ loading: false });
      const err = new Error("Passwords do not match");
      set((state) => ({ errors: [...state.errors, err] }));
      return toast.error(err.message);
    }
    if (userData?.acceptTerms !== true) {
      set({ loading: false });
      const err = new Error("You must accept the terms and conditions to sign up.");
      set((state) => ({ errors: [...state.errors, err] }));
      return toast.error(err.message);
    }
    const {
      colonyName = "",
      email = "",
      password = "",
      confirmPassword = "",
      role = "buyer",
    } = userData || {};

    try {
      const response = await axios.post(`/auth/signup`, {
        colonyName,
        email,
        password,
        confirmPassword,
        role,
      });
      set({ loading: false, isVerifying: true, tempEmail: email });
      toast.success(response?.data?.message || "Sign up successful! Please verify your email. 🐝");
      await get().checkAuth();
    } catch (error) {
      set({ loading: false });
      set((state) => ({ errors: [...state.errors, error] }));
      console.error("Sign up error:", error);
      toast.error(
        error.response?.data.message || "Sign up failed. Please try again later."
      );
    }
  },

  login: async (email, password) => {
    set({ loading: true });
    try {
      const response = await axios.post(`/auth/login`, {
        email,
        password,
      });

      set({
        user: response.data,
        loading: false,
      });
      toast.success("Welcome to the hive! 🍯");
      await get().checkAuth();
    } catch (error) {
      console.error("Login error:", error);
      set({ loading: false });
      set((state) => ({ errors: [...state.errors, error] }));
      toast.error(
        error.response?.data.message || "Login failed. Please try again later."
      );
    }
  },

  logout: async () => {
    try {
      await axios.post(`/auth/logout`);
      set({ user: null, isinValidateProducts: null });
      toast.success("Logged out successfully");
      get().checkAuth();
    } catch (error) {
      set((state) => ({ errors: [...state.errors, error] }));
      console.error(error);
      toast.error("Logout failed");
    }
  },

  deleteAccount: async () => {
    try {
      await axios.delete(`/auth/delete`);
      set({ user: null, isinValidateProducts: null });
      toast.success("Account deleted successfully");
      
      await get().checkAuth();
      // Brute Force
      setTimeout(() => {
        if (get().invalidateProducts) {
          get().invalidateProducts();
        }
      }, 500);
    } catch (error) {
      set((state) => ({ errors: [...state.errors, error] }));
      console.error(error);
      toast.error("Account deletion failed");
    }
  },

  checkAuth: async () => {
    set({ checkingAuth: true });
    try {
      const response = await axios.get(`/auth/profile`);
      set({ isVerifying: false, user: response.data, checkingAuth: false });
      if (get().invalidateProducts) {
        get().invalidateProducts();
      }
    } catch {
      set({ user: null, checkingAuth: false });
    }
  },

  handleAuthFailure: () => {
    const currentUser = get().user;
    if (currentUser) {
      set({ user: null, loading: false, checkingAuth: false });
  
      toast.error("Session expired. Please log in again.");
  
      // Redirect to login page after a brief delay
      setTimeout(() => {
        window.location.href = "/authenticate";
      }, 2000);
    } else {
      toast.success("Welcome to PastraBeez! Enjoy exploring the hive 🐝");
    }
  },
}));

// Listen for auth failure events OUTSIDE the store creation
if (typeof window !== "undefined") {
  // Set up event listener when module loads
  window.addEventListener("auth-failed", () => {
    // console.log("🔥 Auth-failed event received");
    useUserStore.getState().handleAuthFailure();
  });
  // console.log("✅ Auth-failed event listener registered");
}