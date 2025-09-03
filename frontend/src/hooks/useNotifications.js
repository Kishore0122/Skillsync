import { useState, useEffect } from 'react';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

export const useNotifications = () => {
  const { user, isAuthenticated } = useAuth();
  const [notifications, setNotifications] = useState({
    collaborationRequests: 0,
    total: 0
  });
  const [loading, setLoading] = useState(false);

  const fetchNotifications = async () => {
    if (!isAuthenticated || !user) return;
    
    try {
      setLoading(true);
      
      // Fetch pending collaboration requests count
      const response = await axios.get('/api/collaboration-requests/stats');
      const pendingCount = response.data.received?.pending || 0;
      
      setNotifications({
        collaborationRequests: pendingCount,
        total: pendingCount
      });
    } catch (error) {
      console.error('Error fetching notifications:', error);
      setNotifications({
        collaborationRequests: 0,
        total: 0
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
    
    // Poll for new notifications every 30 seconds
    const interval = setInterval(fetchNotifications, 30000);
    
    return () => clearInterval(interval);
  }, [user, isAuthenticated]);

  const markAsRead = () => {
    setNotifications({
      collaborationRequests: 0,
      total: 0
    });
  };

  return {
    notifications,
    loading,
    fetchNotifications,
    markAsRead
  };
};
