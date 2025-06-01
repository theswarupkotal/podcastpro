import { create } from 'zustand';
import { Recording } from '../types';
import { recordingService } from '../services/api';
import mediaRecorderService, { RecordingData } from '../services/mediaRecorder';

interface RecordingState {
  recordings: Recording[];
  currentRecordings: RecordingData[];
  isRecording: boolean;
  isPaused: boolean;
  isUploading: boolean;
  error: string | null;
  
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<RecordingData>;
  pauseRecording: () => void;
  resumeRecording: () => void;
  addLocalRecording: (recording: RecordingData) => void;
  uploadRecording: (sessionId: string, recording: RecordingData) => Promise<void>;
  fetchSessionRecordings: (sessionId: string) => Promise<void>;
  deleteRecording: (id: string) => Promise<void>;
}

const useRecordingStore = create<RecordingState>((set, get) => ({
  recordings: [],
  currentRecordings: [],
  isRecording: false,
  isPaused: false,
  isUploading: false,
  error: null,

  startRecording: async () => {
    set({ error: null });
    try {
      await mediaRecorderService.init();
      mediaRecorderService.startRecording();
      set({ isRecording: true, isPaused: false });
    } catch (error) {
      console.error('Error starting recording:', error);
      set({ 
        error: 'Failed to start recording. Please check your camera and microphone permissions.',
        isRecording: false
      });
      throw error;
    }
  },

  stopRecording: async () => {
    if (!get().isRecording) {
      throw new Error('No active recording to stop');
    }

    try {
      const recordingData = await mediaRecorderService.stopRecording();
      set(state => ({ 
        isRecording: false,
        isPaused: false,
        currentRecordings: [...state.currentRecordings, recordingData]
      }));
      return recordingData;
    } catch (error) {
      console.error('Error stopping recording:', error);
      set({ 
        error: 'Failed to stop recording properly.',
        isRecording: false,
        isPaused: false
      });
      throw error;
    }
  },

  pauseRecording: () => {
    if (!get().isRecording || get().isPaused) return;
    
    try {
      mediaRecorderService.pauseRecording();
      set({ isPaused: true });
    } catch (error) {
      console.error('Error pausing recording:', error);
      set({ error: 'Failed to pause recording.' });
    }
  },

  resumeRecording: () => {
    if (!get().isRecording || !get().isPaused) return;
    
    try {
      mediaRecorderService.resumeRecording();
      set({ isPaused: false });
    } catch (error) {
      console.error('Error resuming recording:', error);
      set({ error: 'Failed to resume recording.' });
    }
  },

  addLocalRecording: (recording: RecordingData) => {
    set(state => ({ 
      currentRecordings: [...state.currentRecordings, recording]
    }));
  },

  uploadRecording: async (sessionId: string, recording: RecordingData) => {
    set({ isUploading: true, error: null });
    try {
      const file = new File(
        [recording.blob], 
        `recording-${recording.id}.${recording.type.split('/')[1] || 'webm'}`, 
        { type: recording.type }
      );
      
      const metadata = {
        duration: recording.duration,
        startTime: recording.startTime,
        endTime: recording.endTime
      };
      
      await recordingService.uploadRecording(
        sessionId, 
        file, 
        recording.type.includes('video') ? 'video' : 'audio',
        metadata
      );
      
      set({ isUploading: false });
    } catch (error) {
      console.error('Error uploading recording:', error);
      set({ 
        error: 'Failed to upload recording. Please try again.',
        isUploading: false
      });
      throw error;
    }
  },

  fetchSessionRecordings: async (sessionId: string) => {
    set({ error: null });
    try {
      const recordings = await recordingService.getSessionRecordings(sessionId);
      set({ recordings });
    } catch (error) {
      console.error('Error fetching session recordings:', error);
      set({ error: 'Failed to load recordings for this session.' });
    }
  },

  deleteRecording: async (id: string) => {
    set({ error: null });
    try {
      await recordingService.deleteRecording(id);
      set(state => ({
        recordings: state.recordings.filter(r => r.id !== id),
        currentRecordings: state.currentRecordings.filter(r => r.id !== id)
      }));
    } catch (error) {
      console.error('Error deleting recording:', error);
      set({ error: 'Failed to delete recording.' });
      throw error;
    }
  }
}));

export default useRecordingStore;