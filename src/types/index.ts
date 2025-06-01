export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
}

export interface Session {
  id: string;
  name: string;
  hostId: string;
  participants: Participant[];
  createdAt: string;
  meetingKey: string;
  records_file_url?: string;
}

export interface Participant {
  id: string;
  name: string;
  avatar?: string;
  isHost: boolean;
  audioEnabled: boolean;
  videoEnabled: boolean;
  isConnected: boolean;
  stream?: MediaStream;
}

export interface Recording {
  id: string;
  sessionId: string;
  userId: string;
  videoNumber: number;
  startTime: string;
  endTime?: string;
  videoUrl: string;
}

export interface File {
  id: string;
  name: string;
  type: string;
  size: number;
  storagePath: string;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
}

export interface VideoMetadata {
  fileId: string;
  title: string;
  description?: string;
  duration?: number;
  thumbnail?: string;
  resolution?: string;
  codec?: string;
}

export interface AuthResponse {
  user: User;
  token: string;
}