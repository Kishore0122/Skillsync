import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import { FaUsers, FaGithub, FaExternalLinkAlt, FaEye, FaHeart, FaCalendarAlt, FaClock, FaCode, FaStar, FaPlus, FaUserPlus, FaEdit, FaTrash } from 'react-icons/fa';
import { BiTask } from 'react-icons/bi';
import { MdDateRange } from 'react-icons/md';

const ProjectDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinMessage, setJoinMessage] = useState('');
  const [showJoinModal, setShowJoinModal] = useState(false);

  useEffect(() => {
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`http://localhost:5000/api/projects/${id}`);
      setProject(response.data);
      setError('');
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleJoinRequest = async (requestId, action) => {
    try {
      await axios.put(`http://localhost:5000/api/projects/${id}/join-requests/${requestId}`, {
        action
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      fetchProject(); // Refresh project data
      alert(`Join request ${action}ed successfully!`);
    } catch (error) {
      console.error('Error handling join request:', error);
      alert(error.response?.data?.message || `Failed to ${action} join request`);
    }
  };

  const handleDeleteProject = async () => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await axios.delete(`http://localhost:5000/api/projects/${id}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        alert('Project deleted successfully!');
        navigate('/projects');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(error.response?.data?.message || 'Error deleting project. Please try again.');
      }
    }
  };

  const handleJoinProject = async () => {
    if (!user) {
      navigate('/login');
      return;
    }

    try {
      setJoinLoading(true);
      await axios.post(`http://localhost:5000/api/projects/${id}/join`, {
        message: joinMessage,
        skills: user.skills || []
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      setShowJoinModal(false);
      setJoinMessage('');
      fetchProject(); // Refresh project data
      alert('Join request sent successfully!');
    } catch (error) {
      console.error('Error joining project:', error);
      alert(error.response?.data?.message || 'Failed to send join request');
    } finally {
      setJoinLoading(false);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      'Planning': 'bg-yellow-100 text-yellow-800',
      'Active': 'bg-green-100 text-green-800',
      'On Hold': 'bg-red-100 text-red-800',
      'Completed': 'bg-blue-100 text-blue-800',
      'Cancelled': 'bg-gray-100 text-gray-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
  };

  const getTaskStatusColor = (status) => {
    const colors = {
      'Todo': 'bg-gray-100 text-gray-800',
      'In Progress': 'bg-blue-100 text-blue-800',
      'Review': 'bg-yellow-100 text-yellow-800',
      'Done': 'bg-green-100 text-green-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const isUserMember = () => {
    return user && project?.members?.some(member => member.user._id === user.id);
  };

  const hasUserRequested = () => {
    return user && project?.joinRequests?.some(request => 
      request.user._id === user.id && request.status === 'Pending'
    );
  };

  const isProjectOwner = () => {
    if (!user || !project) return false;
    const ownerId = project.owner?._id || project.owner?.id || project.owner;
    const userId = user.id || user._id;
    return ownerId === userId || project.owner?.email === user.email;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-semibold text-red-600 mb-2">Error</h2>
          <p className="text-secondary-600">{error}</p>
          <button 
            onClick={() => navigate('/projects')}
            className="btn-primary mt-4"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="card p-6 text-center">
          <h2 className="text-xl font-semibold text-secondary-900 mb-2">Project Not Found</h2>
          <p className="text-secondary-600">The project you're looking for doesn't exist.</p>
          <button 
            onClick={() => navigate('/projects')}
            className="btn-primary mt-4"
          >
            Back to Projects
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="card p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-4">
                <h1 className="text-3xl font-bold text-secondary-900">{project.title}</h1>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(project.status)}`}>
                  {project.status}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getDifficultyColor(project.difficulty)}`}>
                  {project.difficulty}
                </span>
              </div>
              
              <p className="text-secondary-600 mb-4 leading-relaxed">{project.description}</p>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-secondary-500">
                <div className="flex items-center gap-1">
                  <FaEye className="w-4 h-4" />
                  <span>{project.views} views</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaHeart className="w-4 h-4" />
                  <span>{project.likes?.length || 0} likes</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaUsers className="w-4 h-4" />
                  <span>{project.members?.length || 0}/{project.maxMembers} members</span>
                </div>
                <div className="flex items-center gap-1">
                  <FaClock className="w-4 h-4" />
                  <span>{project.duration}</span>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              {/* Owner Actions */}
              {isProjectOwner() && (
                <>
                  <button
                    onClick={() => {
                      console.log('Edit button clicked, navigating to:', `/projects/${id}/edit`);
                      navigate(`/projects/${id}/edit`);
                    }}
                    className="btn-secondary flex items-center gap-2"
                  >
                    <FaEdit className="w-4 h-4" />
                    Edit Project
                  </button>
                  <button
                    onClick={handleDeleteProject}
                    className="btn-danger flex items-center gap-2"
                  >
                    <FaTrash className="w-4 h-4" />
                    Delete Project
                  </button>
                </>
              )}
              
              {/* Join Button for Non-Members */}
              {!isUserMember() && !isProjectOwner() && (
                <button
                  onClick={() => setShowJoinModal(true)}
                  disabled={hasUserRequested()}
                  className={`btn-primary flex items-center gap-2 ${
                    hasUserRequested() ? 'opacity-50 cursor-not-allowed' : ''
                  }`}
                >
                  <FaUserPlus className="w-4 h-4" />
                  {hasUserRequested() ? 'Request Pending' : 'Join Project'}
                </button>
              )}
              
              {/* External Links */}
              {project.repository?.url && (
                <a
                  href={project.repository.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaGithub className="w-4 h-4" />
                  Repository
                </a>
              )}
              
              {project.demoUrl && (
                <a
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-secondary flex items-center gap-2"
                >
                  <FaExternalLinkAlt className="w-4 h-4" />
                  Demo
                </a>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Project Details */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Project Details</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="font-medium text-secondary-700">Category:</span>
                  <span className="ml-2 text-secondary-600">{project.category}</span>
                </div>
                <div>
                  <span className="font-medium text-secondary-700">Visibility:</span>
                  <span className="ml-2 text-secondary-600">{project.visibility}</span>
                </div>
                {project.startDate && (
                  <div>
                    <span className="font-medium text-secondary-700">Start Date:</span>
                    <span className="ml-2 text-secondary-600">
                      {new Date(project.startDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
                {project.endDate && (
                  <div>
                    <span className="font-medium text-secondary-700">End Date:</span>
                    <span className="ml-2 text-secondary-600">
                      {new Date(project.endDate).toLocaleDateString()}
                    </span>
                  </div>
                )}
              </div>
              
              {project.tags && project.tags.length > 0 && (
                <div className="mt-4">
                  <span className="font-medium text-secondary-700 block mb-2">Tags:</span>
                  <div className="flex flex-wrap gap-2">
                    {project.tags.map((tag, index) => (
                      <span key={index} className="px-2 py-1 bg-primary-100 text-primary-700 rounded-md text-sm">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Skills Needed */}
            {project.skillsNeeded && project.skillsNeeded.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">Skills Needed</h2>
                <div className="flex flex-wrap gap-2">
                  {project.skillsNeeded.map((skill, index) => (
                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm">
                      <FaCode className="inline w-3 h-3 mr-1" />
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Tasks */}
            {project.tasks && project.tasks.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <BiTask className="w-5 h-5" />
                  Tasks ({project.tasks.length})
                </h2>
                <div className="space-y-3">
                  {project.tasks.map((task, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-secondary-900">{task.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getTaskStatusColor(task.status)}`}>
                          {task.status}
                        </span>
                      </div>
                      {task.description && (
                        <p className="text-secondary-600 text-sm mb-2">{task.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-secondary-500">
                        {task.assignedTo && (
                          <span>Assigned to: {task.assignedTo.name}</span>
                        )}
                        {task.dueDate && (
                          <span>Due: {new Date(task.dueDate).toLocaleDateString()}</span>
                        )}
                        <span className={`px-2 py-1 rounded ${
                          task.priority === 'High' ? 'bg-red-100 text-red-700' :
                          task.priority === 'Medium' ? 'bg-yellow-100 text-yellow-700' :
                          'bg-green-100 text-green-700'
                        }`}>
                          {task.priority}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Milestones */}
            {project.milestones && project.milestones.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4 flex items-center gap-2">
                  <MdDateRange className="w-5 h-5" />
                  Milestones ({project.milestones.length})
                </h2>
                <div className="space-y-3">
                  {project.milestones.map((milestone, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-4">
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-secondary-900">{milestone.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          milestone.status === 'Completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
                        }`}>
                          {milestone.status}
                        </span>
                      </div>
                      {milestone.description && (
                        <p className="text-secondary-600 text-sm mb-2">{milestone.description}</p>
                      )}
                      <div className="flex items-center gap-4 text-xs text-secondary-500">
                        {milestone.dueDate && (
                          <span>Due: {new Date(milestone.dueDate).toLocaleDateString()}</span>
                        )}
                        {milestone.completedAt && (
                          <span>Completed: {new Date(milestone.completedAt).toLocaleDateString()}</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Project Owner */}
            <div className="card p-6">
              <h2 className="text-xl font-semibold text-secondary-900 mb-4">Project Owner</h2>
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                  {project.owner?.avatar ? (
                    <img src={project.owner.avatar} alt={project.owner.name} className="w-12 h-12 rounded-full" />
                  ) : (
                    project.owner?.name?.charAt(0)
                  )}
                </div>
                <div>
                  <h3 className="font-medium text-secondary-900">{project.owner?.name}</h3>
                  {project.owner?.reputation && (
                    <div className="flex items-center gap-1 text-sm text-secondary-500">
                      <FaStar className="w-3 h-3 text-yellow-500" />
                      <span>{project.owner.reputation.score || project.owner.reputation} reputation</span>
                    </div>
                  )}
                  {project.owner?.bio && (
                    <p className="text-sm text-secondary-600 mt-1">{project.owner.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Team Members */}
            {project.members && project.members.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Team Members ({project.members.length})
                </h2>
                <div className="space-y-3">
                  {project.members.map((member, index) => (
                    <div key={index} className="flex items-center gap-3">
                      <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
                        {member.user?.avatar ? (
                          <img src={member.user.avatar} alt={member.user.name} className="w-10 h-10 rounded-full" />
                        ) : (
                          member.user?.name?.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <h4 className="font-medium text-secondary-900 text-sm">{member.user?.name}</h4>
                          <span className="px-2 py-0.5 bg-primary-100 text-primary-700 rounded text-xs">
                            {member.role}
                          </span>
                        </div>
                        {member.user?.reputation && (
                          <div className="flex items-center gap-1 text-xs text-secondary-500">
                            <FaStar className="w-2 h-2 text-yellow-500" />
                            <span>{member.user.reputation.score || member.user.reputation}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Join Requests (only for project owner) */}
            {isProjectOwner() && project.joinRequests && project.joinRequests.length > 0 && (
              <div className="card p-6">
                <h2 className="text-xl font-semibold text-secondary-900 mb-4">
                  Join Requests ({project.joinRequests.filter(req => req.status === 'Pending').length})
                </h2>
                <div className="space-y-3">
                  {project.joinRequests
                    .filter(request => request.status === 'Pending')
                    .map((request, index) => (
                    <div key={index} className="border border-secondary-200 rounded-lg p-3">
                      <div className="flex items-center gap-2 mb-2">
                        <div className="w-8 h-8 bg-primary-600 rounded-full flex items-center justify-center text-white text-xs font-semibold">
                          {request.user?.avatar ? (
                            <img src={request.user.avatar} alt={request.user.name} className="w-8 h-8 rounded-full" />
                          ) : (
                            request.user?.name?.charAt(0)
                          )}
                        </div>
                        <span className="font-medium text-secondary-900 text-sm">{request.user?.name}</span>
                      </div>
                      {request.message && (
                        <p className="text-xs text-secondary-600 mb-2">{request.message}</p>
                      )}
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleJoinRequest(request._id, 'accept')}
                          className="px-3 py-1 bg-green-600 text-white rounded text-xs hover:bg-green-700"
                        >
                          Accept
                        </button>
                        <button 
                          onClick={() => handleJoinRequest(request._id, 'reject')}
                          className="px-3 py-1 bg-red-600 text-white rounded text-xs hover:bg-red-700"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Join Project Modal */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-secondary-900 mb-4">Join Project</h3>
            <p className="text-secondary-600 mb-4">
              Send a request to join "{project.title}". You can include a message to introduce yourself.
            </p>
            <textarea
              value={joinMessage}
              onChange={(e) => setJoinMessage(e.target.value)}
              placeholder="Introduce yourself and explain why you want to join this project..."
              className="w-full p-3 border border-secondary-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none"
              rows="4"
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={handleJoinProject}
                disabled={joinLoading}
                className="btn-primary flex-1"
              >
                {joinLoading ? 'Sending...' : 'Send Request'}
              </button>
              <button
                onClick={() => setShowJoinModal(false)}
                className="btn-secondary flex-1"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProjectDetail;
