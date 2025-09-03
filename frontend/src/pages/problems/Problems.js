import React, { useState, useEffect, useRef } from 'react';
import { PuzzlePieceIcon, PlusIcon, MagnifyingGlassIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const Problems = () => {
  const { user } = useAuth();
  const [problems, setProblems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const lastFetchRef = useRef(0);
  const cacheRef = useRef({ data: null, timestamp: 0, params: '' });
  const [filters, setFilters] = useState({
    category: '',
    difficulty: '',
    skill: '',
    search: ''
  });

  useEffect(() => {
    // Add a small delay to debounce requests when filters change
    const timeoutId = setTimeout(() => {
      fetchProblems();
    }, 300); // 300ms debounce

    return () => clearTimeout(timeoutId);
  }, [filters]); // Removed user dependency

  // Separate useEffect for initial load when user is available
  useEffect(() => {
    if (user) {
      fetchProblems();
    }
  }, [user?.id]); // Only depend on user ID, not the entire user object

  const fetchProblems = async () => {
    try {
      // Prevent too frequent requests (minimum 2 seconds between requests)
      const now = Date.now();
      if (now - lastFetchRef.current < 2000) {
        console.log('Request throttled - too frequent');
        return;
      }
      lastFetchRef.current = now;

      setLoading(true);
      setError('');
      
      // Build query parameters
      const params = new URLSearchParams();
      if (filters.category) params.append('category', filters.category);
      if (filters.difficulty) params.append('difficulty', filters.difficulty);
      if (filters.search) params.append('search', filters.search);
      if (filters.skill) params.append('skills', filters.skill);

      const paramsString = params.toString();
      
      // Check cache (5 minutes cache duration)
      const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes
      if (cacheRef.current.data && 
          cacheRef.current.params === paramsString && 
          (now - cacheRef.current.timestamp) < CACHE_DURATION) {
        console.log('Using cached data');
        setProblems(cacheRef.current.data);
        setLoading(false);
        return;
      }

      console.log('Fetching problems with params:', paramsString);

      const response = await axios.get(`/api/problems?${paramsString}`);
      console.log('Problems fetched:', response.data);
      
      const allProblems = response.data.problems || [];
      
      // Filter out problems posted by the current user
      const filteredProblems = user ? allProblems.filter(problem => {
        const authorId = problem.author?._id || problem.author?.id || problem.author;
        const userId = user.id || user._id || user.email;
        
        // Exclude problems where the author is the current user
        const isNotUsersProblem = authorId !== userId && problem.author?.email !== user.email;
        
        return isNotUsersProblem;
      }) : allProblems;
      
      console.log(`Filtered ${allProblems.length} problems to ${filteredProblems.length} (excluding user's own problems)`);
      
      // Update cache
      cacheRef.current = {
        data: filteredProblems,
        timestamp: now,
        params: paramsString
      };
      
      setProblems(filteredProblems);
    } catch (error) {
      console.error('Error fetching problems:', error);
      setError('Failed to load problems. Please try again.');
      
      // For development, let's show some mock data if API fails
      if (process.env.NODE_ENV === 'development') {
        setProblems([]);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSupportProblem = async (problemId) => {
    try {
      await axios.post(`/api/problems/${problemId}/support`);
      // Refresh problems to show updated support count
      fetchProblems();
    } catch (error) {
      console.error('Error supporting problem:', error);
      alert('Failed to support problem. Please try again.');
    }
  };

  const handleCollaborate = async (problemId) => {
    try {
      await axios.post(`/api/problems/${problemId}/collaborate`);
      alert('Collaboration request sent!');
      fetchProblems();
    } catch (error) {
      console.error('Error requesting collaboration:', error);
      alert('Failed to send collaboration request. Please try again.');
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'badge-success';
      case 'Intermediate': return 'badge-warning';
      case 'Advanced': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Problem Wall</h1>
            <p className="text-secondary-600 mt-2">
              Discover real-world challenges that need your skills
            </p>
          </div>
          <Link to="/problems/create" className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Post Problem
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
              <option value="technology">Technology</option>
              <option value="education">Education</option>
              <option value="healthcare">Healthcare</option>
              <option value="environment">Environment</option>
            </select>
            <select 
              className="input"
              value={filters.difficulty}
              onChange={(e) => setFilters({...filters, difficulty: e.target.value})}
            >
              <option value="">All Difficulties</option>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
            <select 
              className="input"
              value={filters.skill}
              onChange={(e) => setFilters({...filters, skill: e.target.value})}
            >
              <option value="">All Skills</option>
              <option value="react">React</option>
              <option value="python">Python</option>
              <option value="design">Design</option>
            </select>
            <div className="relative">
              <input
                type="text"
                className="input pl-10"
                placeholder="Search problems..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
              />
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-secondary-400" />
            </div>
          </div>
        </div>

        {/* Problems Grid */}
        <div className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          {loading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary-600 mx-auto"></div>
              <p className="mt-4 text-secondary-600">Loading problems...</p>
            </div>
          ) : problems.length === 0 ? (
            <div className="text-center py-12">
              <PuzzlePieceIcon className="mx-auto h-24 w-24 text-secondary-400 mb-4" />
              <h3 className="text-xl font-semibold text-secondary-900 mb-2">No problems found</h3>
              <p className="text-secondary-600 mb-6">
                Be the first to share a real-world challenge that needs solving.
              </p>
              <Link to="/problems/create" className="btn btn-primary">
                <PlusIcon className="w-5 h-5 mr-2" />
                Post First Problem
              </Link>
            </div>
          ) : (
            problems.map((problem) => (
              <div key={problem._id} className="card p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <Link 
                        to={`/problems/${problem._id}`}
                        className="text-xl font-semibold text-secondary-900 hover:text-primary-600"
                      >
                        {problem.title}
                      </Link>
                      <span className={`badge ${getDifficultyColor(problem.difficulty)}`}>
                        {problem.difficulty}
                      </span>
                      <span className="badge badge-primary">{problem.category}</span>
                    </div>
                    
                    <p className="text-secondary-600 mb-4 line-clamp-3">
                      {problem.description}
                    </p>
                    
                    <div className="flex flex-wrap gap-2 mb-4">
                      {problem.skillsNeeded?.slice(0, 5).map((skill, index) => (
                        <span key={index} className="badge badge-secondary">
                          {skill}
                        </span>
                      ))}
                      {problem.skillsNeeded?.length > 5 && (
                        <span className="badge badge-outline">
                          +{problem.skillsNeeded.length - 5} more
                        </span>
                      )}
                    </div>
                    
                    <div className="flex items-center space-x-4 text-sm text-secondary-500">
                      <span>By {problem.author?.name || 'Anonymous'}</span>
                      <span>•</span>
                      <span>{problem.supporters?.length || 0} supporters</span>
                      <span>•</span>
                      <span>{formatDate(problem.createdAt)}</span>
                      <span>•</span>
                      <span>{problem.estimatedTime}</span>
                      {problem.views && (
                        <>
                          <span>•</span>
                          <span>{problem.views} views</span>
                        </>
                      )}
                    </div>
                  </div>
                  
                  <div className="ml-6 flex flex-col space-y-2">
                    <button 
                      onClick={() => handleSupportProblem(problem._id)}
                      className="btn btn-primary btn-sm"
                      disabled={!user}
                    >
                      Support
                    </button>
                    <button 
                      onClick={() => handleCollaborate(problem._id)}
                      className="btn btn-outline btn-sm"
                      disabled={!user}
                    >
                      Collaborate
                    </button>
                    <Link 
                      to={`/problems/${problem._id}`}
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

export default Problems;
