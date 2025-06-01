//src/components/recording/AudioVisualizer.tsx

import React, { useRef, useEffect } from 'react';

interface AudioVisualizerProps {
  stream: MediaStream | null;
}

const AudioVisualizer: React.FC<AudioVisualizerProps> = ({ stream }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !stream) return;
    
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Create AudioContext and AnalyserNode
    const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)();
    const analyser = audioCtx.createAnalyser();
    analyser.fftSize = 64; // small FFT for a few bars

    // Connect the microphone stream to the analyser
    const source = audioCtx.createMediaStreamSource(stream);
    source.connect(analyser);

    const bufferLength = analyser.frequencyBinCount; // fftSize/2
    const dataArray = new Uint8Array(bufferLength);

    let animationFrameId: number;

    const draw = () => {
      analyser.getByteFrequencyData(dataArray);

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const barCount = bufferLength;
      const barWidth = canvas.width / barCount;
      const barMaxHeight = canvas.height;

      ctx.fillStyle = '#4F46E5';

      for (let i = 0; i < barCount; i++) {
        // Normalize frequency data (0 – 255) to [0, 1]
        const v = dataArray[i] / 255;
        const height = v * barMaxHeight;
        const x = i * barWidth;
        const y = canvas.height - height;

       ctx.fillRect(x, y, barWidth - 2, height);
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    // Start the loop
    draw();

    // Cleanup on unmount or when stream changes
    return () => {
      cancelAnimationFrame(animationFrameId);
      analyser.disconnect();
     source.disconnect();
      audioCtx.close();
    };
  }, [stream]);

  return (
    <canvas 
      ref={canvasRef} 
      width={200} 
      height={30}
      className="w-full h-8 bg-black bg-opacity-30 rounded"
    />
  );
};

export default AudioVisualizer;
