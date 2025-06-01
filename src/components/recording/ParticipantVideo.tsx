import React, { useRef, useEffect } from 'react';
import { MicOff, VideoOff } from 'lucide-react';
import { Participant } from '../../types';
import AudioVisualizer from './AudioVisualizer';

interface ParticipantVideoProps {
  participant: Participant;
  stream?: MediaStream;
  isHost?: boolean;
}

const ParticipantVideo: React.FC<ParticipantVideoProps> = ({ participant, stream, isHost }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play().catch(err => console.error('Error playing remote video:', err));
    }
  }, [stream]);

  return (
    <div className="relative bg-gray-800 rounded-lg overflow-hidden aspect-video">
      {participant.videoEnabled && stream ? (
        <video
          ref={videoRef}
          autoPlay
          playsInline
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-700">
          <div className="h-20 w-20 rounded-full bg-gray-600 flex items-center justify-center text-2xl font-semibold text-white">
            {participant.name?.charAt(0) || '?'}
          </div>
        </div>
      )}
      
      <div className="absolute bottom-2 left-2 right-2 flex items-center">
        <div className="flex-1">
          {participant.audioEnabled && stream && (
            <AudioVisualizer stream={stream} />
          )}
        </div>
        <div className="bg-black bg-opacity-50 px-2 py-1 rounded text-white text-sm flex items-center">
          <span className="mr-2">
            {participant.name} {isHost && '(Host)'}
          </span>
          {!participant.audioEnabled && <MicOff size={16} className="text-red-500" />}
          {!participant.videoEnabled && <VideoOff size={16} className="ml-1 text-red-500" />}
        </div>
      </div>
      
      {!participant.isConnected && (
        <div className="absolute inset-0 bg-black bg-opacity-70 flex items-center justify-center">
          <span className="text-white">Disconnected</span>
        </div>
      )}
    </div>
  );
};

export default ParticipantVideo;