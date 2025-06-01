//src/store/authStore.ts
import { create } from 'zustand';
import { User, AuthResponse } from '../types';
import { authService } from '../services/api';
import { supabase } from '../config/supabase';

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  loginWithGoogle: () => Promise<void>;
  loginWithSwarupWorkspace: () => void;
  handleSwarupCallback: (code: string) => Promise<boolean>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<boolean>;
}

const useAuthStore = create<AuthState>((set, get) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  loginWithGoogle: async () => {
    set({ isLoading: true, error: null });
    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback`
        }
      });

      if (error) throw error;
      set({ isLoading: false });
    } catch (error) {
      console.error('Google login error:', error);
      set({ 
        error: 'Failed to sign in with Google. Please try again.',
        isLoading: false,
        isAuthenticated: false
      });
    }
  },

  loginWithSwarupWorkspace: () => {
    set({ isLoading: true, error: null });
    const authUrl = authService.getSwarupWorkspaceAuthUrl();
    window.location.href = authUrl;
  },

  handleSwarupCallback: async (code: string) => {
    set({ isLoading: true, error: null });
    try {
      const authResponse: AuthResponse = await authService.verifySwarupCallback(code);
      // Store session in localStorage
      localStorage.setItem('podcastpro_session', JSON.stringify(authResponse));

      set({ 
        user: authResponse.user,
        isAuthenticated: true,
        isLoading: false
      });
      return true;
    } catch (error) {
      console.error('Swarup auth callback error:', error);
      set({ 
        error: 'Failed to complete authentication with Swarup-Workspace. Please try again.',
        isLoading: false,
        isAuthenticated: false
      });
      return false;
    }
  },

  logout: async () => {
    set({ isLoading: true });
    try {
      const { error } = await supabase.auth.signOut();
      if (error) throw error;
      
      set({ 
        user: null, 
        isAuthenticated: false,
        isLoading: false
      });
    } catch (error) {
      console.error('Logout error:', error);
      set({ 
        error: 'Failed to logout. Please try again.',
        isLoading: false
      });
    }
  },

  checkAuth: async () => {
    set({ isLoading: true });
    try {
      // Check for Swarup session first
      const storedSession = localStorage.getItem('podcastpro_session');
      if (storedSession) {
        const authResponse: AuthResponse = JSON.parse(storedSession);
        set({ 
          user: authResponse.user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      }

      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) throw error;
      
      if (session?.user) {
        const user: User = {
          id: session.user.id,
          name: session.user.user_metadata.full_name || session.user.email?.split('@')[0] || 'User',
          email: session.user.email || '',
          avatar: session.user.user_metadata.avatar_url
        };
        
        set({ 
          user,
          isAuthenticated: true,
          isLoading: false,
          error: null
        });
        return true;
      }
      
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false
      });
      return false;
    } catch (error) {
      console.error('Auth check error:', error);
      set({ 
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: 'Failed to verify authentication status.'
      });
      return false;
    }
  }
}));

export default useAuthStore;
