//src/services/api.ts
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const SWARUP_WORKSPACE_URL = import.meta.env.VITE_SWARUP_WORKSPACE_URL || 'https://swarup-workspace.com/api';

// Create an axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add token to every request
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Auth service
export const authService = {
  // Login with Google (using Firebase in frontend)
  loginWithGoogle: async (idToken: string) => {
    const response = await api.post('/auth/google', { idToken });
    return response.data;
  },

  // Login with Swarup-Workspace
  loginWithSwarupWorkspace: async (swarupToken: string) => {
    const response = await api.post('/auth/swarup-workspace', { token: swarupToken });
    return response.data;
  },

  // Redirect to Swarup-Workspace for login
  getSwarupWorkspaceAuthUrl: () => {
    const redirectUrl = encodeURIComponent(`${window.location.origin}/auth/callback`);
    return `${SWARUP_WORKSPACE_URL}/authorize?redirect_uri=${redirectUrl}`;
  },

  // Verify Swarup-Workspace auth callback
  verifySwarupCallback: async (code: string) => {
    const response = await api.post('/auth/swarup-callback', { code });
    return response.data;
  },

  // Get current user
  getCurrentUser: async () => {
    const response = await api.get('/auth/me');
    return response.data;
  },

  // Logout
  logout: async () => {
    localStorage.removeItem('token');
    return { success: true };
  }
};

// Sessions service
export const sessionService = {
   // Create a new podcast session (now requires both name & userId)
   createSession: async (name: string, userId: string) => {
    const response = await api.post('/sessions', { name, userId });
    return response.data;
  },
  // Join an existing session
  joinSession: async (meetingKey: string) => {
    const response = await api.post(`/sessions/join`, { meetingKey });
    return response.data;
  },

  // Get session by ID
  getSession: async (id: string) => {
    const response = await api.get(`/sessions/${id}`);
    return response.data;
  },

  // Get all user sessions
   getUserSessions: async (userId: string) => {
     const response = await api.get('/sessions', { params: { userId } });
     return response.data;
   },

  // Update session
  updateSession: async (id: string, data: any) => {
    const response = await api.put(`/sessions/${id}`, data);
    return response.data;
  },

  // Delete session
  deleteSession: async (id: string) => {
    const response = await api.delete(`/sessions/${id}`);
    return response.data;
  }
};

// Recordings service
export const recordingService = {
  // Upload a recording
  uploadRecording: async (sessionId: string, file: File, type: 'audio' | 'video', metadata: any) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('sessionId', sessionId);
    formData.append('type', type);
    formData.append('metadata', JSON.stringify(metadata));
    
    const response = await api.post('/recordings', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    
    return response.data;
  },

  // Get recordings for a session
  getSessionRecordings: async (sessionId: string) => {
    const response = await api.get(`/recordings/session/${sessionId}`);
    return response.data;
  },

  // Get recording by ID
  getRecording: async (id: string) => {
    const response = await api.get(`/recordings/${id}`);
    return response.data;
  },

  // Delete recording
  deleteRecording: async (id: string) => {
    const response = await api.delete(`/recordings/${id}`);
    return response.data;
  }
};

export default api;
