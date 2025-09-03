import React, { createContext, useContext, useEffect, useState } from 'react';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const SocketContext = createContext();

export const SocketProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const { user, isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated && user) {
      // Initialize socket connection
      const socketInstance = io(process.env.REACT_APP_SERVER_URL || 'http://localhost:5000', {
        transports: ['websocket'],
      });

      setSocket(socketInstance);

      // Join user to their rooms
      socketInstance.emit('user-online', user.id);

      // Listen for online users updates
      socketInstance.on('online-users', (users) => {
        setOnlineUsers(users);
      });

      // Cleanup on unmount
      return () => {
        socketInstance.close();
        setSocket(null);
      };
    } else {
      // Close socket if user is not authenticated
      if (socket) {
        socket.close();
        setSocket(null);
      }
    }
  }, [isAuthenticated, user]);

  // Join a project room
  const joinProject = (projectId) => {
    if (socket) {
      socket.emit('join-project', projectId);
    }
  };

  // Leave a project room
  const leaveProject = (projectId) => {
    if (socket) {
      socket.emit('leave-project', projectId);
    }
  };

  // Send project update
  const sendProjectUpdate = (projectId, updateData) => {
    if (socket) {
      socket.emit('project-update', { projectId, ...updateData });
    }
  };

  // Send chat message
  const sendMessage = (projectId, message) => {
    if (socket) {
      socket.emit('send-message', { projectId, ...message });
    }
  };

  // Send task update
  const sendTaskUpdate = (projectId, taskData) => {
    if (socket) {
      socket.emit('task-update', { projectId, ...taskData });
    }
  };

  const value = {
    socket,
    onlineUsers,
    joinProject,
    leaveProject,
    sendProjectUpdate,
    sendMessage,
    sendTaskUpdate,
  };

  return (
    <SocketContext.Provider value={value}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
};
