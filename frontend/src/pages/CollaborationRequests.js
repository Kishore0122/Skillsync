import React, { useState, useEffect } from 'react';
import { 
  BellIcon, 
  CheckIcon, 
  XMarkIcon, 
  UserIcon,
  EyeIcon,
  ClockIcon,
  ChatBubbleLeftRightIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../contexts/AuthContext';

const CollaborationRequests = () => {
  const { user } = useAuth();
  const [receivedRequests, setReceivedRequests] = useState([]);
  const [sentRequests, setSentRequests] = useState([]);
  const [projectJoinRequests, setProjectJoinRequests] = useState([]);
  const [sentProjectRequests, setSentProjectRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('received');
  const [stats, setStats] = useState({ received: {}, sent: {} });
  const [respondingTo, setRespondingTo] = useState(null);
  const [responseMessage, setResponseMessage] = useState('');

  useEffect(() => {
    if (user) {
      fetchRequests();
      fetchStats();
    }
  }, [user]);

  const fetchRequests = async () => {
    try {
      console.log('=== FETCHING ALL REQUESTS ===');
      console.log('Current user:', user);
      
      const [receivedRes, sentRes, projectJoinReceivedRes, projectJoinSentRes] = await Promise.all([
        axios.get('/api/collaboration-requests/received'),
        axios.get('/api/collaboration-requests/sent'),
        axios.get('/api/projects/join-requests/received'),
        axios.get('/api/projects/join-requests/sent')
      ]);
      
      console.log('Problem collaboration requests received:', receivedRes.data);
      console.log('Problem collaboration requests sent:', sentRes.data);
      console.log('Project join requests received:', projectJoinReceivedRes.data);
      console.log('Project join requests sent:', projectJoinSentRes.data);
      
      setReceivedRequests(receivedRes.data.requests || []);
      setSentRequests(sentRes.data.requests || []);
      setProjectJoinRequests(projectJoinReceivedRes.data.requests || []);
      setSentProjectRequests(projectJoinSentRes.data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
      console.error('Error response:', error.response?.data);
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await axios.get('/api/collaboration-requests/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const handleResponse = async (requestId, status) => {
    try {
      await axios.put(`/api/collaboration-requests/${requestId}/respond`, {
        status,
        responseMessage
      });
      
      alert(`Request ${status} successfully!`);
      setRespondingTo(null);
      setResponseMessage('');
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error responding to request:', error);
      alert('Failed to respond to request. Please try again.');
    }
  };

  const handleProjectJoinResponse = async (projectId, requestId, action) => {
    try {
      await axios.put(`/api/projects/${projectId}/join-requests/${requestId}`, {
        action
      });
      
      alert(`Project join request ${action}ed successfully!`);
      fetchRequests();
      fetchStats();
    } catch (error) {
      console.error('Error responding to project join request:', error);
      alert('Failed to respond to project join request. Please try again.');
    }
  };

  const cancelRequest = async (requestId) => {
    if (window.confirm('Are you sure you want to cancel this collaboration request?')) {
      try {
        await axios.delete(`/api/collaboration-requests/${requestId}`);
        alert('Request cancelled successfully!');
        fetchRequests();
        fetchStats();
      } catch (error) {
        console.error('Error cancelling request:', error);
        alert('Failed to cancel request. Please try again.');
      }
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'accepted': return 'bg-green-100 text-green-800';
      case 'rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'pending': return <ClockIcon className="w-4 h-4" />;
      case 'accepted': return <CheckIcon className="w-4 h-4" />;
      case 'rejected': return <XMarkIcon className="w-4 h-4" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex items-center mb-8">
          <BellIcon className="w-8 h-8 text-primary-600 mr-3" />
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Collaboration Requests</h1>
            <p className="text-secondary-600 mt-2">
              Manage collaboration requests for your problems
            </p>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-yellow-600">
              {(receivedRequests.filter(r => r.status === 'pending').length + 
                projectJoinRequests.filter(r => r.status === 'Pending').length) || 0}
            </div>
            <div className="text-secondary-600 text-sm">Pending Received</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-green-600">
              {(receivedRequests.filter(r => r.status === 'accepted').length + 
                projectJoinRequests.filter(r => r.status === 'Accepted').length) || 0}
            </div>
            <div className="text-secondary-600 text-sm">Accepted</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-blue-600">
              {(sentRequests.filter(r => r.status === 'pending').length + 
                sentProjectRequests.filter(r => r.status === 'Pending').length) || 0}
            </div>
            <div className="text-secondary-600 text-sm">Pending Sent</div>
          </div>
          <div className="card p-4 text-center">
            <div className="text-2xl font-bold text-red-600">
              {(receivedRequests.filter(r => r.status === 'rejected').length + 
                projectJoinRequests.filter(r => r.status === 'Rejected').length) || 0}
            </div>
            <div className="text-secondary-600 text-sm">Rejected</div>
          </div>
        </div>

        {/* Tabs */}
        <div className="card">
          <div className="border-b border-secondary-200">
            <nav className="-mb-px flex">
              <button
                onClick={() => setActiveTab('received')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'received'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Received Requests ({receivedRequests.length + projectJoinRequests.length})
              </button>
              <button
                onClick={() => setActiveTab('sent')}
                className={`py-2 px-4 border-b-2 font-medium text-sm ${
                  activeTab === 'sent'
                    ? 'border-primary-500 text-primary-600'
                    : 'border-transparent text-secondary-500 hover:text-secondary-700 hover:border-secondary-300'
                }`}
              >
                Sent Requests ({sentRequests.length + sentProjectRequests.length})
              </button>
            </nav>
          </div>

          <div className="p-6">
            {activeTab === 'received' ? (
              <div className="space-y-4">
                {(receivedRequests.length === 0 && projectJoinRequests.length === 0) ? (
                  <div className="text-center py-8">
                    <BellIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No requests</h3>
                    <p className="text-secondary-600">
                      When people want to collaborate on your problems or join your projects, their requests will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Project Join Requests */}
                    {projectJoinRequests.map((request) => (
                      <div key={`project-${request._id}`} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <div className="flex items-center space-x-2">
                                <UserIcon className="w-5 h-5 text-secondary-500" />
                                <span className="font-medium text-secondary-900">
                                  {request.user.name}
                                </span>
                              </div>
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Project Join Request
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status.toLowerCase())}`}>
                                {request.status}
                              </span>
                            </div>
                            
                            <Link 
                              to={`/projects/${request.project._id}`}
                              className="text-lg font-semibold text-primary-600 hover:text-primary-700 mb-2 block"
                            >
                              {request.project.title}
                            </Link>
                            
                            {request.message && (
                              <p className="text-secondary-600 text-sm mb-3">
                                <strong>Message:</strong> {request.message}
                              </p>
                            )}
                            
                            {request.skills && request.skills.length > 0 && (
                              <div className="mb-3">
                                <strong className="text-sm text-secondary-700">Skills:</strong>
                                <div className="flex flex-wrap gap-1 mt-1">
                                  {request.skills.map((skill, index) => (
                                    <span key={index} className="badge badge-secondary text-xs">
                                      {skill}
                                    </span>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            <p className="text-xs text-secondary-500">
                              Requested on {formatDate(request.createdAt)}
                            </p>
                          </div>
                          
                          {request.status === 'Pending' && (
                            <div className="ml-4 flex space-x-2">
                              <button
                                onClick={() => handleProjectJoinResponse(request.project._id, request._id, 'accept')}
                                className="btn-primary btn-sm flex items-center space-x-1"
                              >
                                <CheckIcon className="w-4 h-4" />
                                <span>Accept</span>
                              </button>
                              <button
                                onClick={() => handleProjectJoinResponse(request.project._id, request._id, 'reject')}
                                className="btn-danger btn-sm flex items-center space-x-1"
                              >
                                <XMarkIcon className="w-4 h-4" />
                                <span>Reject</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                    
                    {/* Problem Collaboration Requests */}
                    {receivedRequests.map((request) => (
                    <div key={request._id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <div className="flex items-center space-x-2">
                              <UserIcon className="w-5 h-5 text-secondary-500" />
                              <span className="font-medium text-secondary-900">
                                {request.requester.name}
                              </span>
                            </div>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span>{request.status}</span>
                            </span>
                          </div>
                          
                          <Link 
                            to={`/problems/${request.problem._id}`}
                            className="text-lg font-semibold text-primary-600 hover:text-primary-700 mb-2 block"
                          >
                            {request.problem.title}
                          </Link>
                          
                          <p className="text-secondary-600 text-sm mb-2">
                            <strong>Proposed Role:</strong> {request.proposedRole}
                          </p>
                          
                          <p className="text-secondary-600 text-sm mb-3">
                            <strong>Message:</strong> {request.message}
                          </p>
                          
                          <p className="text-xs text-secondary-500">
                            Requested on {formatDate(request.requestedAt)}
                          </p>
                          
                          {request.responseMessage && (
                            <div className="mt-3 p-2 bg-secondary-50 rounded">
                              <p className="text-sm text-secondary-700">
                                <strong>Your Response:</strong> {request.responseMessage}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          <Link
                            to={`/profile/${request.requester._id}`}
                            className="btn btn-outline btn-sm flex items-center space-x-1"
                          >
                            <EyeIcon className="w-4 h-4" />
                            <span>View Profile</span>
                          </Link>
                          
                          {request.status === 'pending' && (
                            <>
                              <button
                                onClick={() => setRespondingTo(request._id)}
                                className="btn btn-primary btn-sm flex items-center space-x-1"
                              >
                                <ChatBubbleLeftRightIcon className="w-4 h-4" />
                                <span>Respond</span>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                      
                      {/* Response Modal */}
                      {respondingTo === request._id && (
                        <div className="mt-4 p-4 border border-primary-200 rounded-lg bg-primary-50">
                          <h4 className="font-semibold text-secondary-900 mb-3">Respond to Request</h4>
                          <textarea
                            value={responseMessage}
                            onChange={(e) => setResponseMessage(e.target.value)}
                            className="input mb-3"
                            rows={3}
                            placeholder="Optional response message..."
                          />
                          <div className="flex space-x-2">
                            <button
                              onClick={() => handleResponse(request._id, 'accepted')}
                              className="btn btn-success btn-sm"
                            >
                              <CheckIcon className="w-4 h-4 mr-1" />
                              Accept
                            </button>
                            <button
                              onClick={() => handleResponse(request._id, 'rejected')}
                              className="btn btn-danger btn-sm"
                            >
                              <XMarkIcon className="w-4 h-4 mr-1" />
                              Reject
                            </button>
                            <button
                              onClick={() => {
                                setRespondingTo(null);
                                setResponseMessage('');
                              }}
                              className="btn btn-outline btn-sm"
                            >
                              Cancel
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                  </>
                )}
              </div>
            ) : (
              <div className="space-y-4">
                {(sentRequests.length === 0 && sentProjectRequests.length === 0) ? (
                  <div className="text-center py-8">
                    <ChatBubbleLeftRightIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                    <h3 className="text-lg font-medium text-secondary-900 mb-2">No sent requests</h3>
                    <p className="text-secondary-600">
                      When you request to collaborate on problems or join projects, your requests will appear here.
                    </p>
                  </div>
                ) : (
                  <>
                    {/* Sent Project Join Requests */}
                    {sentProjectRequests.map((request) => (
                      <div key={`sent-project-${request._id}`} className="border border-secondary-200 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-3 mb-2">
                              <span className="px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Project Join Request
                              </span>
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(request.status.toLowerCase())}`}>
                                {request.status}
                              </span>
                            </div>
                            
                            <Link 
                              to={`/projects/${request.project._id}`}
                              className="text-lg font-semibold text-primary-600 hover:text-primary-700 mb-2 block"
                            >
                              {request.project.title}
                            </Link>
                            
                            <p className="text-secondary-600 text-sm mb-2">
                              <strong>Project Owner:</strong> {request.project.owner.name}
                            </p>
                            
                            {request.message && (
                              <p className="text-secondary-600 text-sm mb-3">
                                <strong>Your Message:</strong> {request.message}
                              </p>
                            )}
                            
                            <p className="text-xs text-secondary-500">
                              Sent on {formatDate(request.createdAt)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {/* Sent Problem Collaboration Requests */}
                    {sentRequests.map((request) => (
                    <div key={request._id} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${getStatusColor(request.status)}`}>
                              {getStatusIcon(request.status)}
                              <span>{request.status}</span>
                            </span>
                          </div>
                          
                          <Link 
                            to={`/problems/${request.problem._id}`}
                            className="text-lg font-semibold text-primary-600 hover:text-primary-700 mb-2 block"
                          >
                            {request.problem.title}
                          </Link>
                          
                          <p className="text-secondary-600 text-sm mb-2">
                            <strong>Problem Author:</strong> {request.problemAuthor.name}
                          </p>
                          
                          <p className="text-secondary-600 text-sm mb-2">
                            <strong>Your Proposed Role:</strong> {request.proposedRole}
                          </p>
                          
                          <p className="text-secondary-600 text-sm mb-3">
                            <strong>Your Message:</strong> {request.message}
                          </p>
                          
                          <p className="text-xs text-secondary-500">
                            Sent on {formatDate(request.requestedAt)}
                            {request.respondedAt && ` • Responded on ${formatDate(request.respondedAt)}`}
                          </p>
                          
                          {request.responseMessage && (
                            <div className="mt-3 p-2 bg-secondary-50 rounded">
                              <p className="text-sm text-secondary-700">
                                <strong>Author's Response:</strong> {request.responseMessage}
                              </p>
                            </div>
                          )}
                        </div>
                        
                        <div className="ml-4 flex flex-col space-y-2">
                          {request.status === 'pending' && (
                            <button
                              onClick={() => cancelRequest(request._id)}
                              className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
                            >
                              Cancel Request
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CollaborationRequests;
