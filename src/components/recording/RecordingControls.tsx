//src/components/recording/RecordingControls.tsx
import React, { useState } from 'react';
import { Play, Square, Pause, Clock, Download } from 'lucide-react';

interface RecordingControlsProps {
  isRecording: boolean;
  isPaused: boolean;
  onStartRecording: () => Promise<void>;
  onStopRecording: () => Promise<any>;
  onPauseRecording: () => void;
  onResumeRecording: () => void;
}

const RecordingControls: React.FC<RecordingControlsProps> = ({
  isRecording,
  isPaused,
  onStartRecording,
  onStopRecording,
  onPauseRecording,
  onResumeRecording
}) => {
  const [recordingTime, setRecordingTime] = useState(0);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(null);
  
  // Format time display (MM:SS)
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60).toString().padStart(2, '0');
    const secs = (seconds % 60).toString().padStart(2, '0');
    return `${mins}:${secs}`;
  };
  
  // Start recording and timer
  const handleStartRecording = async () => {
    try {
      await onStartRecording();
      
      // Start timer
      const interval = setInterval(() => {
        setRecordingTime(prev => prev + 1);
      }, 1000);
      
      setTimerInterval(interval);
    } catch (error) {
      console.error('Error starting recording:', error);
    }
  };
  
  // Stop recording and timer
  const handleStopRecording = async () => {
    // If there is no active recording, bail out early
    if (!isRecording) {
      return;
    }

    try {
      await onStopRecording();
      
      // Clear timer
      if (timerInterval) {
        clearInterval(timerInterval);
        setTimerInterval(null);
      }
      
      setRecordingTime(0);
    } catch (error) {
      console.error('Error stopping recording:', error);
    }
  };
  
  // Pause recording and timer
  const handlePauseRecording = () => {
    onPauseRecording();
    
    // Pause timer
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };
  
  // Resume recording and timer
  const handleResumeRecording = () => {
    onResumeRecording();
    
    // Resume timer
    const interval = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
    
    setTimerInterval(interval);
  };
  
  return (
    <div className="mb-4 flex items-center justify-center space-x-4">
      {isRecording ? (
        <>
          {/* Recording status */}
          <div className="flex items-center bg-gray-800 text-white px-4 py-2 rounded-lg">
            <div className="animate-pulse w-3 h-3 rounded-full bg-red-500 mr-2"></div>
            <span className="font-medium">Recording</span>
            <div className="mx-2 w-px h-5 bg-gray-600"></div>
            <div className="flex items-center">
              <Clock size={16} className="mr-2" />
              <span>{formatTime(recordingTime)}</span>
            </div>
          </div>
          
          {/* Pause/Resume button */}
          {isPaused ? (
            <button
              onClick={handleResumeRecording}
              className="p-3 rounded-full bg-blue-600 hover:bg-blue-700 text-white"
              title="Resume recording"
            >
              <Play size={24} />
            </button>
          ) : (
            <button
              onClick={handlePauseRecording}
              className="p-3 rounded-full bg-yellow-600 hover:bg-yellow-700 text-white"
              title="Pause recording"
            >
              <Pause size={24} />
            </button>
          )}
          
          {/* Stop button */}
          <button
            onClick={handleStopRecording}
            className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white"
            title="Stop recording"
          >
            <Square size={24} />
          </button>
        </>
      ) : (
        <>
          {/* Start recording button */}
          <button
            onClick={handleStartRecording}
            className="flex items-center space-x-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg"
          >
            <div className="w-3 h-3 rounded-full bg-white"></div>
            <span>Start Recording</span>
          </button>
          
          {/* Download previous recordings (placeholder) */}
          <button
            className="p-2 rounded-lg bg-gray-700 hover:bg-gray-600 text-white"
            title="Download recordings"
          >
            <Download size={20} />
          </button>
        </>
      )}
    </div>
  );
};

export default RecordingControls;
