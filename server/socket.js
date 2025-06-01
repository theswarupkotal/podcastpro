import { Server } from 'socket.io';
import pool from './config/db.js';

export function setupSocketServer(server) {
  const io = new Server(server, {
    cors: {
      origin: [
        'https://swarup-podcast.vercel.app',
        'https://swaruppodcast.onrender.com',
        'http://localhost:3000'
      ],
      methods: ['GET', 'POST'],
      credentials: true
    }
  });

  // Map to store active sessions and their participants (socketId -> Participant object)
  const sessions = new Map(); // sessions: Map<sessionId, Map<socketId, Participant>>

  io.on('connection', (socket) => {
    console.log(`New client connected: ${socket.id}`);

    socket.on('join-session', async ({ sessionId, user }) => {
      try {
        // Get session details from database
        const { rows } = await pool.query(
          'SELECT * FROM podcast_sessions WHERE id = $1',
          [sessionId]
        );
        
        if (rows.length === 0) {
          socket.emit('error', { message: 'Session not found' });
          return;
        }

        const session = rows[0];
        const currentUserId = user.id;
        const currentUserName = user.name;
        
        // Join the session room
        socket.join(sessionId);
        
        // Initialize session participants if needed
        if (!sessions.has(sessionId)) {
          sessions.set(sessionId, new Map()); // Map<socketId, Participant>
        }
        
        const sessionParticipants = sessions.get(sessionId);

        // Create participant object for the joining user
        const newParticipant = {
          id: currentUserId,
          name: currentUserName,
          socketId: socket.id,
          isHost: session.host_id === currentUserId,
          audioEnabled: true,
          videoEnabled: true,
          isConnected: true,
        };
        
        // Notify existing participants about the new peer
        sessionParticipants.forEach((existingParticipant, existingSocketId) => {
          socket.to(existingSocketId).emit('user-joined', {
            remoteSocketId: socket.id,
            participant: newParticipant,
            isInitiator: false
          });
        });
        
        // Add the new participant
        sessionParticipants.set(socket.id, newParticipant);
        
        // Send existing participants to the new peer
        sessionParticipants.forEach((existingParticipant, existingSocketId) => {
          if (existingSocketId !== socket.id) {
            socket.emit('user-joined', {
              remoteSocketId: existingSocketId,
              participant: existingParticipant,
              isInitiator: true
            });
          }
        });

        console.log(`Client ${socket.id} (${currentUserName}) joined session ${sessionId}`);
      } catch (error) {
        console.error('Error joining session:', error);
        socket.emit('error', { message: 'Failed to join session' });
      }
    });

    socket.on('signal', ({ to, signal }) => {
      console.log(`Signal from ${socket.id} to ${to}`);
      socket.to(to).emit('signal', {
        from: socket.id,
        signal
      });
    });

    socket.on('leave-session', () => {
      leaveAllSessions(socket);
    });

    socket.on('end-session', () => {
      const sessionId = findSessionForSocket(socket.id);
      if (sessionId) {
        console.log(`Host ${socket.id} ended session ${sessionId}`);
        io.to(sessionId).emit('session-ended');
        sessions.get(sessionId)?.clear();
        sessions.delete(sessionId);
      }
    });

    socket.on('disconnect', () => {
      leaveAllSessions(socket);
      console.log('Client disconnected:', socket.id);
    });
  });

  // Helper function to find which session a socket is in
  function findSessionForSocket(socketId) {
    for (const [sessionId, participants] of sessions.entries()) {
      if (participants.has(socketId)) {
        return sessionId;
      }
    }
    return null;
  }

  // Helper function to get participant details by socket ID
  function getParticipantBySocketId(socketId) {
    const sessionId = findSessionForSocket(socketId);
    return sessionId ? sessions.get(sessionId)?.get(socketId) : null;
  }

  // Helper function to remove a socket from all sessions
  function leaveAllSessions(socket) {
    for (const [sessionId, participants] of sessions.entries()) {
      if (participants.has(socket.id)) {
        const leavingParticipant = participants.get(socket.id);
        if (leavingParticipant) {
          participants.delete(socket.id);
          socket.to(sessionId).emit('user-left', {
            remoteSocketId: socket.id,
            userId: leavingParticipant.id
          });
        }
        
        if (participants.size === 0) {
          sessions.delete(sessionId);
        }
      }
    }
  }

  return io;
}