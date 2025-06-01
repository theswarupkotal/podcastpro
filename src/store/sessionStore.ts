import { create } from 'zustand';
import { Session, Participant } from '../types';
import { sessionService } from '../services/api';
import authStore from './authStore';

interface SessionState {
  sessions: Session[];
  currentSession: Session | null;
  isLoading: boolean;
  error: string | null;
  
  // Session management
  fetchUserSessions: () => Promise<void>;
  createSession: (name: string) => Promise<Session>;
  joinSession: (meetingKey: string) => Promise<Session>;
  leaveSession: () => void;
  
  // Participant management within the current session
  updateParticipant: (participantId: string, updates: Partial<Participant>) => void;
  addParticipant: (participant: Participant) => void;
  removeParticipant: (participantId: string) => void;
}

const useSessionStore = create<SessionState>((set, get) => ({
  sessions: [],
  currentSession: null,
  isLoading: false,
  error: null,

  fetchUserSessions: async () => {
    set({ isLoading: true, error: null });
    try {
      const userId = authStore.getState().user?.id;
      if (!userId) throw new Error('User not authenticated');
      
      const sessions = await sessionService.getUserSessions(userId);
      set({ sessions, isLoading: false });
    } catch (error) {
      console.error('Error fetching sessions:', error);
      set({ 
        error: 'Failed to load your sessions. Please try again later.',
        isLoading: false
      });
    }
  },

  createSession: async (name: string) => {
    set({ isLoading: true, error: null });
    try {
      const userId = authStore.getState().user?.id;
      if (!userId) {
        throw new Error('User not authenticated');
      }
      const session = await sessionService.createSession(name, userId);
      
      // Initialize empty participants array if not present
      const sessionWithParticipants = {
        ...session,
        participants: session.participants || []
      };
      
      set(state => ({ 
        sessions: [...state.sessions, sessionWithParticipants],
        currentSession: sessionWithParticipants,
        isLoading: false
      }));
      return sessionWithParticipants;
    } catch (error) {
      console.error('Error creating session:', error);
      set({ 
        error: 'Failed to create a new session. Please try again.',
        isLoading: false
      });
      throw error;
    }
  },

  joinSession: async (meetingKey: string) => {
    set({ isLoading: true, error: null });
    try {
      const session = await sessionService.joinSession(meetingKey);
      
      // Initialize empty participants array if not present
      const sessionWithParticipants = {
        ...session,
        participants: session.participants || []
      };
      
      set({ currentSession: sessionWithParticipants, isLoading: false });
      return sessionWithParticipants;
    } catch (error) {
      console.error('Error joining session:', error);
      set({ 
        error: 'Failed to join the session. Please check the meeting key and try again.',
        isLoading: false
      });
      throw error;
    }
  },

  leaveSession: () => {
    set({ currentSession: null });
  },

  updateParticipant: (participantId: string, updates: Partial<Participant>) => {
    set(state => {
      if (!state.currentSession) return state;
      
      const participants = state.currentSession.participants || [];
      const updatedParticipants = participants.map(p => 
        p.id === participantId ? { ...p, ...updates } : p
      );

      return {
        currentSession: {
          ...state.currentSession,
          participants: updatedParticipants
        }
      };
    });
  },

  addParticipant: (participant: Participant) => {
    set(state => {
      if (!state.currentSession) return state;
      
      const participants = state.currentSession.participants || [];
      const exists = participants.some(p => p.id === participant.id);
      if (exists) return state;

      return {
        currentSession: {
          ...state.currentSession,
          participants: [...participants, participant]
        }
      };
    });
  },

  removeParticipant: (participantId: string) => {
    set(state => {
      if (!state.currentSession) return state;
      
      const participants = state.currentSession.participants || [];
      return {
        currentSession: {
          ...state.currentSession,
          participants: participants.filter(p => p.id !== participantId)
        }
      };
    });
  }
}));

export default useSessionStore;
