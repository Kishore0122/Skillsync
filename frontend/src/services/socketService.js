import { io } from 'socket.io-client';

class SocketService {
  constructor() {
    this.socket = null;
    this.connected = false;
  }

  connect() {
    if (!this.socket) {
      this.socket = io(process.env.REACT_APP_API_URL || 'http://localhost:5000', {
        transports: ['websocket', 'polling'],
        autoConnect: true,
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionAttempts: 5
      });

      this.socket.on('connect', () => {
        console.log('🔗 Connected to server:', this.socket.id);
        this.connected = true;
      });

      this.socket.on('disconnect', (reason) => {
        console.log('🔌 Disconnected from server:', reason);
        this.connected = false;
      });

      this.socket.on('connect_error', (error) => {
        console.error('❌ Connection error:', error);
      });
    }
    return this.socket;
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
      this.connected = false;
    }
  }

  isConnected() {
    return this.connected && this.socket?.connected;
  }

  // Project-specific methods
  joinProject(projectId) {
    if (this.socket && projectId) {
      this.socket.emit('join-project', projectId);
      console.log(`👥 Joined project room: ${projectId}`);
    }
  }

  leaveProject(projectId) {
    if (this.socket && projectId) {
      this.socket.emit('leave-project', projectId);
      console.log(`👋 Left project room: ${projectId}`);
    }
  }

  // Collaboration-specific methods
  joinCollaboration(collaborationId) {
    if (this.socket && collaborationId) {
      this.socket.emit('join-collaboration', collaborationId);
      console.log(`👥 Joined collaboration room: ${collaborationId}`);
    }
  }

  leaveCollaboration(collaborationId) {
    if (this.socket && collaborationId) {
      this.socket.emit('leave-collaboration', collaborationId);
      console.log(`👋 Left collaboration room: ${collaborationId}`);
    }
  }

  // Message methods
  onNewMessage(callback) {
    if (this.socket) {
      this.socket.on('new-message', callback);
    }
  }

  offNewMessage() {
    if (this.socket) {
      this.socket.off('new-message');
    }
  }

  // Collaboration message methods
  onNewCollaborationMessage(callback) {
    if (this.socket) {
      this.socket.on('new-collaboration-message', callback);
    }
  }

  offNewCollaborationMessage() {
    if (this.socket) {
      this.socket.off('new-collaboration-message');
    }
  }

  // Project update methods
  onProjectUpdate(callback) {
    if (this.socket) {
      this.socket.on('project-updated', callback);
    }
  }

  offProjectUpdate() {
    if (this.socket) {
      this.socket.off('project-updated');
    }
  }

  // Generic emit method
  emit(event, data) {
    if (this.socket) {
      this.socket.emit(event, data);
    }
  }

  // Generic listener method
  on(event, callback) {
    if (this.socket) {
      this.socket.on(event, callback);
    }
  }

  // Generic off method
  off(event, callback = null) {
    if (this.socket) {
      if (callback) {
        this.socket.off(event, callback);
      } else {
        this.socket.off(event);
      }
    }
  }
}

// Create a singleton instance
const socketService = new SocketService();

export default socketService;
