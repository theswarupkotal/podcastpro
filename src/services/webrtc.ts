import { io, Socket } from 'socket.io-client';
import SimplePeer from 'simple-peer';
import { Howl } from 'howler';
import { Participant, User } from '../types';

class WebRTCService {
  private socket: Socket;
  private peers: Map<string, SimplePeer.Instance> = new Map();
  private localStream: MediaStream | null = null;
  private onParticipantStreamHandler: (userId: string, stream: MediaStream) => void = () => {};
  private onParticipantJoinHandler: (participant: Participant, isInitiator: boolean) => void = () => {};
  private onParticipantLeaveHandler: (userId: string) => void = () => {};
  private joinSound: Howl;
  private socketIdToUserIdMap: Map<string, string> = new Map();

  constructor() {
    this.socket = io(import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:3000', {
      transports: ['websocket'],
      upgrade: false
    });
    
    this.setupSocketListeners();
    
    this.joinSound = new Howl({
      src: ['https://www.soundjay.com/button/sounds/button-09.mp3'],
      html5: true,
      preload: true,
      volume: 0.5
    });
  }

  private setupSocketListeners() {
    this.socket.on('user-joined', ({ remoteSocketId, participant, isInitiator }) => {
      console.log('User joined:', remoteSocketId, isInitiator);
      this.socketIdToUserIdMap.set(remoteSocketId, participant.id);
      
      if (this.localStream) {
        this.createPeer(remoteSocketId, isInitiator);
        this.joinSound.play();
        if (this.onParticipantJoinHandler) {
          this.onParticipantJoinHandler(participant, isInitiator);
        }
      }
    });

    this.socket.on('signal', ({ from, signal }) => {
      const peer = this.peers.get(from);
      if (peer) {
        peer.signal(signal);
      }
    });

    this.socket.on('user-left', ({ remoteSocketId, userId }) => {
      console.log('User left:', remoteSocketId, userId);
      this.removePeer(remoteSocketId);
      if (this.onParticipantLeaveHandler) {
        this.onParticipantLeaveHandler(userId);
      }
    });

    this.socket.on('session-ended', () => {
      this.handleSessionEnded();
    });

    this.socket.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
    });
  }

  private createPeer(remoteSocketId: string, isInitiator: boolean) {
    try {
      if (!this.localStream) {
        throw new Error('Local stream not available');
      }

      const peer = new SimplePeer({
        initiator: isInitiator,
        stream: this.localStream,
        trickle: false,
        config: {
          iceServers: [
            { urls: 'stun:stun.l.google.com:19302' },
            { urls: 'stun:global.stun.twilio.com:3478' },
            {
              urls: 'turn:global.turn.twilio.com:3478?transport=udp',
              username: 'your_username', // Replace with actual TURN credentials
              credential: 'your_password'
            }
          ]
        }
      });

      peer.on('signal', (signal) => {
        this.socket.emit('signal', {
          to: remoteSocketId,
          signal
        });
      });

      peer.on('stream', (stream) => {
        const userId = this.socketIdToUserIdMap.get(remoteSocketId);
        if (userId && this.onParticipantStreamHandler) {
          this.onParticipantStreamHandler(userId, stream);
        }
      });

      peer.on('error', (err) => {
        console.error('Peer connection error:', err);
        this.removePeer(remoteSocketId);
      });

      this.peers.set(remoteSocketId, peer);
    } catch (error) {
      console.error('Error creating peer:', error);
    }
  }

  private removePeer(remoteSocketId: string) {
    const peer = this.peers.get(remoteSocketId);
    if (peer) {
      peer.destroy();
      this.peers.delete(remoteSocketId);
      this.socketIdToUserIdMap.delete(remoteSocketId);
    }
  }

  private handleSessionEnded() {
    this.peers.forEach(peer => peer.destroy());
    this.peers.clear();
    this.socketIdToUserIdMap.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    window.location.href = '/dashboard';
  }

  public joinSession(sessionId: string, localStream: MediaStream, user: User) {
    console.log('Joining session:', sessionId);
    this.localStream = localStream;
    this.socket.emit('join-session', { sessionId, user });
  }

  public leaveSession() {
    this.peers.forEach(peer => peer.destroy());
    this.peers.clear();
    this.socketIdToUserIdMap.clear();
    
    if (this.localStream) {
      this.localStream.getTracks().forEach(track => track.stop());
      this.localStream = null;
    }
    
    this.socket.emit('leave-session');
  }

  public updateStream(newStream: MediaStream) {
    this.localStream = newStream;
    this.peers.forEach(peer => {
      peer.removeStream(this.localStream!);
      peer.addStream(newStream);
    });
  }

  public setOnParticipantStream(handler: (userId: string, stream: MediaStream) => void) {
    this.onParticipantStreamHandler = handler;
  }

  public setOnParticipantJoin(handler: (participant: Participant, isInitiator: boolean) => void) {
    this.onParticipantJoinHandler = handler;
  }

  public setOnParticipantLeave(handler: (userId: string) => void) {
    this.onParticipantLeaveHandler = handler;
  }

  public endSession() {
    this.socket.emit('end-session');
    this.leaveSession();
  }
}

export const webRTCService = new WebRTCService();