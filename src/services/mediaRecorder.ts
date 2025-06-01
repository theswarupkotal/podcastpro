//src/services/mediaRecorder.ts
import { v4 as uuidv4 } from 'uuid';

export interface MediaConfig {
  audio: boolean;
  video: boolean;
  videoConstraints?: MediaTrackConstraints;
  audioConstraints?: MediaTrackConstraints;
}

export interface RecordingData {
  id: string;
  blob: Blob;
  url: string;
  type: string;
  startTime: number;
  endTime: number;
  duration: number;
}

class MediaRecorderService {
  private stream: MediaStream | null = null;
  private recorder: MediaRecorder | null = null;
  private chunks: Blob[] = [];
  private startTime: number = 0;
  private recordingActive: boolean = false;
  private videoTrack: MediaStreamTrack | null = null;
  private audioTrack: MediaStreamTrack | null = null;

  // Default config for high-quality podcast recording
  private defaultConfig: MediaConfig = {
    audio: true,
    video: true,
    audioConstraints: {
      echoCancellation: true,
      noiseSuppression: true,
      autoGainControl: false,
      sampleRate: 48000,
      channelCount: 2,
    },
    videoConstraints: {
      width: { ideal: 1920 },
      height: { ideal: 1080 },
      frameRate: { ideal: 30 }
    }
  };

  // Initialize media capture
  async init(config: MediaConfig = this.defaultConfig): Promise<MediaStream> {
    try {
      // Stop any existing stream
      if (this.stream) {
        this.stopStream();
      }

      // Get user media with specified constraints
      this.stream = await navigator.mediaDevices.getUserMedia({
        audio: config.audio ? (config.audioConstraints || this.defaultConfig.audioConstraints) : false,
        video: config.video ? (config.videoConstraints || this.defaultConfig.videoConstraints) : false
      });

      // Store tracks for easy access
      if (config.video && this.stream.getVideoTracks().length > 0) {
        this.videoTrack = this.stream.getVideoTracks()[0];
      }
      
      if (config.audio && this.stream.getAudioTracks().length > 0) {
        this.audioTrack = this.stream.getAudioTracks()[0];
      }

      return this.stream;
    } catch (error) {
      console.error('Error initializing media capture:', error);
      throw error;
    }
  }

  // Start recording
  startRecording(mimeType: string = 'video/webm;codecs=vp9,opus'): void {
    if (!this.stream) {
      throw new Error('Stream not initialized. Call init() first.');
    }

    try {
      this.chunks = [];
      this.recorder = new MediaRecorder(this.stream, { mimeType });
      
      this.recorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          this.chunks.push(e.data);
        }
      };

      this.startTime = Date.now();
      this.recordingActive = true;
      this.recorder.start(1000); // Collect data every second
    } catch (error) {
      console.error('Error starting recording:', error);
      throw error;
    }
  }

  // Stop recording and return the recorded data (or null if no recording is active)
  async stopRecording(): Promise<RecordingData | null> {
    // If there’s no active recorder, just bail out quietly instead of throwing.
    if (!this.recorder || !this.recordingActive) {
      console.warn('stopRecording() called, but no active recording exists.');
      return null;
    }

    return new Promise((resolve) => {
      this.recorder!.onstop = () => {
        const endTime = Date.now();
        const blob = new Blob(this.chunks, { type: this.recorder!.mimeType });
        const url = URL.createObjectURL(blob);
        
        const recordingData: RecordingData = {
          id: uuidv4(),
          blob,
          url,
          type: this.recorder!.mimeType,
          startTime: this.startTime,
          endTime,
          duration: (endTime - this.startTime) / 1000 // Duration in seconds
        };

        this.recordingActive = false;
        resolve(recordingData);
      };

      this.recorder!.stop();
    });
  }

  // Pause recording
  pauseRecording(): void {
    if (this.recorder && this.recordingActive && this.recorder.state !== 'inactive') {
      this.recorder.pause();
    }
  }

  // Resume recording
  resumeRecording(): void {
    if (this.recorder && this.recordingActive && this.recorder.state === 'paused') {
      this.recorder.resume();
    }
  }

  // Enable/disable audio
  toggleAudio(enabled: boolean): void {
    if (this.audioTrack) {
      this.audioTrack.enabled = enabled;
    }
  }

  // Enable/disable video
  toggleVideo(enabled: boolean): void {
    if (this.videoTrack) {
      this.videoTrack.enabled = enabled;
    }
  }

  // Get audio level for visualizer
  getAudioLevel(): number {
    if (!this.stream || !this.audioTrack) {
      return 0;
    }
    return 0.5; // Return a dummy value between 0-1
  }

  // Stop and clean up all media
  stopStream(): void {
    if (this.recorder && this.recordingActive) {
      this.recorder.stop();
      this.recordingActive = false;
    }

    if (this.stream) {
      this.stream.getTracks().forEach(track => track.stop());
      this.stream = null;
    }

    this.videoTrack = null;
    this.audioTrack = null;
  }

  // Check if browser supports required media APIs
  checkBrowserSupport(): { supported: boolean; errorMessage?: string } {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      return { 
        supported: false, 
        errorMessage: 'Your browser does not support media capture. Please use a modern browser like Chrome, Firefox, or Edge.' 
      };
    }

    if (!window.MediaRecorder) {
      return { 
        supported: false, 
        errorMessage: 'Your browser does not support MediaRecorder API. Please use a modern browser like Chrome, Firefox, or Edge.' 
      };
    }

    return { supported: true };
  }
}

const mediaRecorderService = new MediaRecorderService();
export default mediaRecorderService;
