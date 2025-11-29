import React, { useState, useEffect } from 'react';
import { FolderIcon, PlusIcon, MagnifyingGlassIcon, UserGroupIcon, EyeIcon, HeartIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Projects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    status: '',
    search: ''
  });

  useEffect(() => {
    fetchProjects();
  }, [filters]);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.status) params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);

      const response = await axios.get(`/api/projects?${params.toString()}`);
      console.log('Projects fetched:', response.data);
      
      setProjects(response.data.projects || response.data);
    } catch (error) {
      console.error('Error fetching projects:', error);
      setError('Failed to load projects. Please try again.');
      setProjects([]);
    } finally {
      setLoading(false);
    }
  };

  const getDifficultyColor = (difficulty) => {
    const colors = {
      'Beginner': 'bg-green-100 text-green-800',
      'Intermediate': 'bg-yellow-100 text-yellow-800',
      'Advanced': 'bg-red-100 text-red-800'
    };
    return colors[difficulty] || 'bg-gray-100 text-gray-800';
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

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.ceil(diffDays / 7)} weeks ago`;
    return date.toLocaleDateString();
  };

  const handleJoinProject = (projectId) => {
    // Navigation to project detail page for joining
    window.location.href = `/projects/${projectId}`;
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Projects</h1>
            <p className="text-secondary-600 mt-2">
              Discover and collaborate on exciting projects
            </p>
          </div>
          <Link to="/projects/create" className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Create Project
          </Link>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              className="input"
              value={filters.category}
              onChange={(e) => setFilters({...filters, category: e.target.value})}
            >
              <option value="">All Categories</option>
              <option value="Web Development">Web Development</option>
              <option value="Mobile App">Mobile App</option>
              <option value="AI/ML">AI/ML</option>
              <option value="Data Science">Data Science</option>
              <option value="Design">Design</option>
              <option value="Game Development">Game Development</option>
              <option value="Blockchain">Blockchain</option>
              <option value="IoT">IoT</option>
              <option value="Research">Research</option>
              <option value="Open Source">Open Source</option>
              <option value="Startup">Startup</option>
              <option value="Other">Other</option>
            </select>
            <select 
              className="input"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select 
              className="input"
              value={filters.status}
              onChange={(e) => setFilters({...filters, status: e.target.value})}
            >
              <option value="">All Statuses</option>
              <option value="Planning">Planning</option>
              <option value="Active">Active</option>
              <option value="On Hold">On Hold</option>
              <option value="Completed">Completed</option>
            </select>
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Search projects..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            </div>
          </div>
        </div>

        {/* Projects Grid */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary-600">Loading projects...</p>
            </div>
          ) : projects.length === 0 ? (
            <div className="text-center py-12">
              <FolderIcon className="mx-auto h-24 w-24 text-secondary-400 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No projects found</h3>
              <p className="text-secondary-600 mb-6">
                {Object.values(filters).some(filter => filter) 
                  ? "Try adjusting your filters to see more projects."
                  : "Be the first to create an exciting project for collaboration."
                }
              </p>
              <Link to="/projects/create" className="btn btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                Create First Project
              </Link>
            </div>
          ) : (
            projects.map((project) => (
              <div key={project._id} className="card p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link 
                        to={`/projects/${project._id}`}
                        className="text-xl font-semibold text-secondary-900 hover:text-primary-600"
                      >
                        {project.title}
                      </Link>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(project.difficulty)}`}>
                        {project.difficulty}
                      </span>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                      <span className="badge badge-primary">{project.category}</span>
                    </div>
                    
                    <p className="text-secondary-600 mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.skillsNeeded?.slice(0, 5).map((skill, index) => (
                        <span key={index} className="badge badge-secondary">
                          {skill}
                        </span>
                      ))}
                      {project.skillsNeeded?.length > 5 && (
                        <span className="badge badge-outline">
                          +{project.skillsNeeded.length - 5} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-500">
                      <span>By {project.owner?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <UserGroupIcon className="w-4 h-4" />
                        <span>{project.members?.length || 0}/{project.maxMembers} members</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <HeartIcon className="w-4 h-4" />
                        <span>{project.likes?.length || 0} likes</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1">
                        <EyeIcon className="w-4 h-4" />
                        <span>{project.views || 0} views</span>
                      </div>
                      <span>•</span>
                      <span>{formatDate(project.createdAt)}</span>
                      <span>•</span>
                      <span>{project.duration}</span>
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    <button 
                      onClick={() => handleJoinProject(project._id)}
                      className="btn btn-primary btn-sm"
                      disabled={!user}
                    >
                      Join Project
                    </button>
                    <Link 
                      to={`/projects/${project._id}`}
                      className="btn btn-outline btn-sm text-center"
                    >
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
};

export default Projects;
