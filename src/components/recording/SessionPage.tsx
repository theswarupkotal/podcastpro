import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Mic, MicOff, Video, VideoOff, Phone, Share2, Settings, UserPlus, Copy } from 'lucide-react';
import useSessionStore from '../../store/sessionStore';
import useAuthStore from '../../store/authStore';
import useRecordingStore from '../../store/recordingStore';
import mediaRecorderService from '../../services/mediaRecorder';
import { webRTCService } from '../../services/webrtc';
import ParticipantVideo from './ParticipantVideo';
import AudioVisualizer from './AudioVisualizer';
import RecordingControls from './RecordingControls';

const SessionPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const { currentSession, joinSession, leaveSession, updateParticipant, addParticipant } = useSessionStore();
  const { isRecording, isPaused, startRecording, stopRecording, pauseRecording, resumeRecording } = useRecordingStore();
  
  const [videoEnabled, setVideoEnabled] = useState(true);
  const [audioEnabled, setAudioEnabled] = useState(true);
  const [isCopied, setIsCopied] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isHostEnded, setIsHostEnded] = useState(false);
  
  const localVideoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const [browserSupport] = useState(() => mediaRecorderService.checkBrowserSupport());

  useEffect(() => {
    const setupSession = async () => {
      if (!id || !user) {
        setError('Invalid session ID or user not authenticated');
        setIsLoading(false);
        return;
      }
      
      try {
        setIsLoading(true);
        setError(null);
        
        if (!currentSession || currentSession.id !== id) {
          await joinSession(id);
        }
        
        // Initialize media stream first
        const stream = await mediaRecorderService.init({
          audio: true,
          video: true
        });
        
        streamRef.current = stream;
        
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
          await localVideoRef.current.play();
        }

        // Set up WebRTC handlers
        webRTCService.setOnParticipantStream((userId, stream) => {
          updateParticipant(userId, { stream });
        });

        webRTCService.setOnParticipantJoin((participant, isInitiator) => {
          addParticipant(participant);
        });

        webRTCService.setOnParticipantLeave((userId) => {
          updateParticipant(userId, { isConnected: false });
        });

        // Join WebRTC session with our stream
        webRTCService.joinSession(id, stream, user);
        
        setIsLoading(false);
      } catch (error) {
        console.error('Error joining session:', error);
        setError('Failed to join session. Please check your camera and microphone permissions.');
        setIsLoading(false);
      }
    };
    
    setupSession();
    
    return () => {
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      webRTCService.leaveSession();
      leaveSession();
    };
  }, [id, joinSession, leaveSession, updateParticipant, addParticipant, user]);

  const calculateGridLayout = (participantCount: number) => {
    const totalParticipants = participantCount + 1; // Include local user
    
    if (totalParticipants <= 1) return 'grid-cols-1';
    if (totalParticipants === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (totalParticipants <= 4) return 'grid-cols-2';
    if (totalParticipants <= 6) return 'grid-cols-2 lg:grid-cols-3';
    if (totalParticipants <= 9) return 'grid-cols-3';
    return 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-4';
  };

  const calculateVideoHeight = (participantCount: number) => {
    const totalParticipants = participantCount + 1;
    if (totalParticipants <= 2) return 'h-[60vh]';
    if (totalParticipants <= 4) return 'h-[45vh]';
    if (totalParticipants <= 6) return 'h-[35vh]';
    return 'h-[30vh]';
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-white"></div>
      </div>
    );
  }

  if (error || !currentSession) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center p-4">
        <div className="bg-gray-800 p-6 rounded-lg text-center max-w-md">
          <h2 className="text-xl font-semibold text-white mb-2">
            {error || 'Session Not Found'}
          </h2>
          <p className="text-gray-300 mb-4">
            {error ? error : 'This session may have ended or doesn\'t exist.'}
          </p>
          <button
            onClick={() => navigate('/dashboard')}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const videoHeight = calculateVideoHeight(currentSession.participants.length);

  return (
    <div className="h-screen flex flex-col bg-gray-900 overflow-hidden">
      <header className="bg-gray-800 p-4 text-white flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold">{currentSession.name}</h1>
          <div className="flex items-center text-gray-300 text-sm mt-1">
            <span>Meeting key: </span>
            <code className="bg-gray-700 px-2 py-0.5 rounded ml-1 font-mono">
              {currentSession.meetingKey}
            </code>
            <button 
              onClick={() => {
                navigator.clipboard.writeText(currentSession.meetingKey);
                setIsCopied(true);
                setTimeout(() => setIsCopied(false), 2000);
              }}
              className="ml-2 text-gray-400 hover:text-white"
            >
              <Copy size={16} />
            </button>
            {isCopied && (
              <span className="ml-2 text-green-400 text-xs">Copied!</span>
            )}
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          <button 
            onClick={() => setShowSettings(!showSettings)}
            className="p-2 rounded-full bg-gray-700 hover:bg-gray-600"
          >
            <Settings size={20} />
          </button>
          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
            <UserPlus size={20} />
          </button>
          <button className="p-2 rounded-full bg-gray-700 hover:bg-gray-600">
            <Share2 size={20} />
          </button>
          <button 
            onClick={() => {
              if (isRecording) {
                stopRecording()
                  .then(() => {
                    leaveSession();
                    navigate('/dashboard');
                  })
                  .catch(console.error);
              } else {
                leaveSession();
                navigate('/dashboard');
              }
            }}
            className="p-2 rounded-full bg-red-600 hover:bg-red-700"
          >
            <Phone size={20} />
          </button>
        </div>
      </header>

      <main className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className={`grid gap-4 mb-4 ${calculateGridLayout(currentSession.participants.length)}`}>
          <div className={`relative bg-gray-800 rounded-lg overflow-hidden ${videoHeight}`}>
            <video
              ref={localVideoRef}
              autoPlay
              muted
              playsInline
              className={`w-full h-full object-cover ${!videoEnabled ? 'hidden' : ''}`}
            />
            
            {!videoEnabled && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
                <div className="h-20 w-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-semibold text-white">
                  {user?.name?.charAt(0) || '?'}
                </div>
              </div>
            )}
            
            <div className="absolute bottom-2 left-2 right-2 flex items-center">
              <div className="flex-1">
                {audioEnabled && streamRef.current && (
                  <AudioVisualizer stream={streamRef.current} />
                )}
              </div>
              <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm flex items-center">
                <span className="mr-2">{user?.name || 'You'} (You)</span>
                {!audioEnabled && <MicOff size={16} className="text-red-500" />}
              </div>
            </div>
          </div>
          
          {currentSession.participants
            .filter(p => p.id !== user?.id)
            .map(participant => (
              <ParticipantVideo 
                key={participant.id} 
                participant={participant}
                isHost={participant.id === currentSession.hostId}
              />
            ))}
        </div>

        <div className="mt-auto space-y-4">
          <RecordingControls 
            isRecording={isRecording}
            isPaused={isPaused}
            onStartRecording={startRecording}
            onStopRecording={stopRecording}
            onPauseRecording={pauseRecording}
            onResumeRecording={resumeRecording}
          />
          
          <div className="bg-gray-800 p-4 rounded-lg flex items-center justify-center space-x-4">
            <button
              onClick={() => {
                if (streamRef.current) {
                  mediaRecorderService.toggleAudio(!audioEnabled);
                  setAudioEnabled(!audioEnabled);
                  if (user) {
                    updateParticipant(user.id, { audioEnabled: !audioEnabled });
                  }
                }
              }}
              className={`p-3 rounded-full ${
                audioEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {audioEnabled ? <Mic size={24} /> : <MicOff size={24} />}
            </button>
            
            <button
              onClick={() => {
                if (streamRef.current) {
                  mediaRecorderService.toggleVideo(!videoEnabled);
                  setVideoEnabled(!videoEnabled);
                  if (user) {
                    updateParticipant(user.id, { videoEnabled: !videoEnabled });
                  }
                }
              }}
              className={`p-3 rounded-full ${
                videoEnabled ? 'bg-gray-700 hover:bg-gray-600' : 'bg-red-600 hover:bg-red-700'
              }`}
            >
              {videoEnabled ? <Video size={24} /> : <VideoOff size={24} />}
            </button>

            {currentSession.hostId === user?.id && (
              <button
                onClick={() => {
                  if (isRecording) {
                    stopRecording()
                      .then(() => {
                        webRTCService.endSession();
                        leaveSession();
                        navigate('/dashboard');
                      })
                      .catch(console.error);
                  } else {
                    webRTCService.endSession();
                    leaveSession();
                    navigate('/dashboard');
                  }
                }}
                className="p-3 rounded-full bg-red-600 hover:bg-red-700"
              >
                <Phone size={24} />
              </button>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};

export default SessionPage;