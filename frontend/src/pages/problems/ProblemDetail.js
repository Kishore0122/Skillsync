import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  PuzzlePieceIcon, 
  UserIcon, 
  CalendarIcon, 
  EyeIcon,
  HeartIcon,
  UserGroupIcon,
  LinkIcon,
  ClockIcon,
  TagIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const ProblemDetail = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [problem, setProblem] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isSupporting, setIsSupporting] = useState(false);
  const [showAuthorProfile, setShowAuthorProfile] = useState(false);
  const [showCollaborationModal, setShowCollaborationModal] = useState(false);
  const [collaborationMessage, setCollaborationMessage] = useState('');
  const [proposedRole, setProposedRole] = useState('Collaborator');
  const [sendingRequest, setSendingRequest] = useState(false);

  useEffect(() => {
    fetchProblemDetail();
  }, [id]);

  const fetchProblemDetail = async () => {
    try {
      setLoading(true);
      setError('');
      
      console.log('Fetching problem detail for ID:', id);
      const response = await axios.get(`/api/problems/${id}`);
      console.log('Problem detail fetched:', response.data);
      
      setProblem(response.data);
    } catch (error) {
      console.error('Error fetching problem detail:', error);
      setError('Failed to load problem details. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSupport = async () => {
    if (!user) {
      alert('Please log in to support this problem');
      return;
    }

    try {
      setIsSupporting(true);
      await axios.post(`/api/problems/${id}/support`);
      
      // Refresh the problem data to show updated support count
      fetchProblemDetail();
    } catch (error) {
      console.error('Error supporting problem:', error);
      alert('Failed to support problem. Please try again.');
    } finally {
      setIsSupporting(false);
    }
  };

  const handleCollaborate = async () => {
    if (!user) {
      alert('Please log in to collaborate on this problem');
      return;
    }

    // Check if user is the problem author
    if (problem.author._id === user.id || problem.author._id === user._id) {
      alert('You cannot collaborate on your own problem');
      return;
    }

    // Show collaboration modal
    setShowCollaborationModal(true);
  };

  const sendCollaborationRequest = async () => {
    try {
      setSendingRequest(true);
      
      await axios.post(`/api/problems/${id}/collaborate`, {
        message: collaborationMessage || 'I would like to collaborate on this problem.',
        proposedRole: proposedRole
      });
      
      alert('Collaboration request sent successfully! The problem author will review your request.');
      setShowCollaborationModal(false);
      setCollaborationMessage('');
      setProposedRole('Collaborator');
      fetchProblemDetail();
    } catch (error) {
      console.error('Error requesting collaboration:', error);
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to send collaboration request. Please try again.');
      }
    } finally {
      setSendingRequest(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const isUserSupporting = () => {
    return problem?.supporters?.some(supporter => supporter.user === user?.id);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-secondary-600">Loading problem details...</p>
        </div>
      </div>
    );
  }

  if (error || !problem) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="text-center">
          <PuzzlePieceIcon className="mx-auto h-24 w-24 text-secondary-400 mb-4" />
          <h1 className="text-2xl font-bold text-secondary-900 mb-2">Problem Not Found</h1>
          <p className="text-secondary-600 mb-6">{error || 'The problem you\'re looking for doesn\'t exist.'}</p>
          <Link to="/problems" className="btn btn-primary">
            Back to Problems
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/problems" className="text-primary-600 hover:text-primary-700 mb-4 inline-block">
            ← Back to Problems
          </Link>
          
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <div className="flex items-center space-x-3 mb-4">
                <h1 className="text-3xl font-bold text-secondary-900">{problem.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(problem.difficulty)}`}>
                  {problem.difficulty}
                </span>
                <span className="badge badge-primary">{problem.category}</span>
              </div>
              
              <div className="flex items-center space-x-6 text-sm text-secondary-600 mb-6">
                <div className="flex items-center space-x-1">
                  <CalendarIcon className="w-4 h-4" />
                  <span>Posted {formatDate(problem.createdAt)}</span>
                </div>
                <div className="flex items-center space-x-1">
                  <EyeIcon className="w-4 h-4" />
                  <span>{problem.views || 0} views</span>
                </div>
                <div className="flex items-center space-x-1">
                  <HeartIcon className="w-4 h-4" />
                  <span>{problem.supporters?.length || 0} supporters</span>
                </div>
                <div className="flex items-center space-x-1">
                  <ClockIcon className="w-4 h-4" />
                  <span>{problem.estimatedTime}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col space-y-3 ml-6">
              <button
                onClick={handleSupport}
                disabled={isSupporting || !user}
                className={`btn ${isUserSupporting() ? 'btn-primary' : 'btn-outline'} ${isSupporting ? 'opacity-50' : ''}`}
              >
                {isUserSupporting() ? (
                  <HeartSolidIcon className="w-4 h-4 mr-2" />
                ) : (
                  <HeartIcon className="w-4 h-4 mr-2" />
                )}
                {isSupporting ? 'Supporting...' : isUserSupporting() ? 'Supported' : 'Support'}
              </button>
              <button
                onClick={handleCollaborate}
                disabled={!user}
                className="btn btn-secondary"
              >
                <UserGroupIcon className="w-4 h-4 mr-2" />
                Collaborate
              </button>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Problem Description */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Problem Description</h2>
              <div className="prose max-w-none">
                <p className="text-secondary-700 whitespace-pre-wrap">{problem.description}</p>
              </div>
            </div>

            {/* Skills Needed */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Skills Needed</h2>
              <div className="flex flex-wrap gap-2">
                {problem.skillsNeeded?.map((skill, index) => (
                  <span key={index} className="badge badge-secondary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            {/* Tags */}
            {problem.tags && problem.tags.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Tags</h2>
                <div className="flex flex-wrap gap-2">
                  {problem.tags.map((tag, index) => (
                    <span key={index} className="badge badge-outline">
                      <TagIcon className="w-3 h-3 mr-1" />
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Author Profile */}
            <div className="card p-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Posted by</h3>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  {problem.author?.avatar ? (
                    <img
                      src={problem.author.avatar}
                      alt={problem.author.name}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 bg-secondary-200 rounded-full flex items-center justify-center">
                      <UserIcon className="w-6 h-6 text-secondary-500" />
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-base font-medium text-secondary-900 truncate">
                    {problem.author?.name || 'Anonymous User'}
                  </h4>
                  
                  {problem.author?.reputation && (
                    <p className="text-sm text-secondary-600">
                      {problem.author.reputation.score || 0} reputation points
                    </p>
                  )}
                  
                  {problem.author?.bio && (
                    <p className="text-sm text-secondary-600 mt-2 line-clamp-3">
                      {problem.author.bio}
                    </p>
                  )}
                  
                  <button
                    onClick={() => setShowAuthorProfile(!showAuthorProfile)}
                    className="text-primary-600 hover:text-primary-700 text-sm mt-2"
                  >
                    {showAuthorProfile ? 'Hide' : 'View'} Profile Details
                  </button>
                </div>
              </div>

              {/* Extended Author Info */}
              {showAuthorProfile && problem.author && (
                <div className="mt-4 pt-4 border-t border-secondary-200">
                  <div className="space-y-3">
                    {problem.author.skills && problem.author.skills.length > 0 && (
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-2">Skills</h5>
                        <div className="flex flex-wrap gap-1">
                          {problem.author.skills.slice(0, 5).map((skill, index) => (
                            <span key={index} className="text-xs bg-secondary-100 text-secondary-700 px-2 py-1 rounded">
                              {skill}
                            </span>
                          ))}
                          {problem.author.skills.length > 5 && (
                            <span className="text-xs text-secondary-500">
                              +{problem.author.skills.length - 5} more
                            </span>
                          )}
                        </div>
                      </div>
                    )}
                    
                    {(problem.author.github || problem.author.linkedin || problem.author.website) && (
                      <div>
                        <h5 className="text-sm font-medium text-secondary-700 mb-2">Links</h5>
                        <div className="space-y-1">
                          {problem.author.github && (
                            <a
                              href={problem.author.github}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              GitHub
                            </a>
                          )}
                          {problem.author.linkedin && (
                            <a
                              href={problem.author.linkedin}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              LinkedIn
                            </a>
                          )}
                          {problem.author.website && (
                            <a
                              href={problem.author.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex items-center text-sm text-primary-600 hover:text-primary-700"
                            >
                              <LinkIcon className="w-3 h-3 mr-1" />
                              Website
                            </a>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Supporters */}
            {problem.supporters && problem.supporters.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Supporters ({problem.supporters.length})
                </h3>
                <div className="space-y-3">
                  {problem.supporters.slice(0, 5).map((supporter, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-secondary-500" />
                      </div>
                      <span className="text-sm text-secondary-700">
                        {supporter.user?.name || 'Anonymous'}
                      </span>
                    </div>
                  ))}
                  {problem.supporters.length > 5 && (
                    <p className="text-sm text-secondary-500">
                      +{problem.supporters.length - 5} more supporters
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Collaborators */}
            {problem.collaborators && problem.collaborators.length > 0 && (
              <div className="card p-6">
                <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                  Collaborators ({problem.collaborators.length})
                </h3>
                <div className="space-y-3">
                  {problem.collaborators.map((collaborator, index) => (
                    <div key={index} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-secondary-200 rounded-full flex items-center justify-center">
                        <UserIcon className="w-4 h-4 text-secondary-500" />
                      </div>
                      <span className="text-sm text-secondary-700">
                        {collaborator.user?.name || 'Anonymous'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Collaboration Request Modal */}
        {showCollaborationModal && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">
                Send Collaboration Request
              </h3>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Proposed Role
                  </label>
                  <select
                    value={proposedRole}
                    onChange={(e) => setProposedRole(e.target.value)}
                    className="input"
                  >
                    <option value="Collaborator">Collaborator</option>
                    <option value="Developer">Developer</option>
                    <option value="Designer">Designer</option>
                    <option value="Researcher">Researcher</option>
                    <option value="Advisor">Advisor</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-1">
                    Message to Problem Author
                  </label>
                  <textarea
                    value={collaborationMessage}
                    onChange={(e) => setCollaborationMessage(e.target.value)}
                    rows={4}
                    className="input"
                    placeholder="Tell the author why you want to collaborate and what you can contribute..."
                  />
                </div>
              </div>
              
              <div className="flex justify-end space-x-3 mt-6">
                <button
                  onClick={() => {
                    setShowCollaborationModal(false);
                    setCollaborationMessage('');
                    setProposedRole('Collaborator');
                  }}
                  className="btn btn-outline"
                  disabled={sendingRequest}
                >
                  Cancel
                </button>
                <button
                  onClick={sendCollaborationRequest}
                  className="btn btn-primary"
                  disabled={sendingRequest}
                >
                  {sendingRequest ? 'Sending...' : 'Send Request'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProblemDetail;
