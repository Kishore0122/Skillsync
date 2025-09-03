import React, { useState, useEffect } from 'react';
import { TrophyIcon, PlusIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';

const Challenges = () => {
  const [challenges, setChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    status: '',
    difficulty: '',
    category: '',
    search: ''
  });

  useEffect(() => {
    // TODO: Replace with actual API call
    // fetchChallenges();
    setLoading(false);
  }, []);

  const fetchChallenges = async () => {
    try {
      // TODO: Implement API call to fetch challenges
      // const response = await axios.get('/api/challenges');
      // setChallenges(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching challenges:', error);
      setLoading(false);
    }
  };

  const filteredChallenges = challenges.filter(challenge => {
    const matchesSearch = challenge.title?.toLowerCase().includes(filters.search.toLowerCase()) ||
                         challenge.description?.toLowerCase().includes(filters.search.toLowerCase());
    const matchesStatus = !filters.status || challenge.status === filters.status;
    const matchesDifficulty = !filters.difficulty || challenge.difficulty === filters.difficulty;
    const matchesCategory = !filters.category || challenge.technologies?.includes(filters.category);
    
    return matchesSearch && matchesStatus && matchesDifficulty && matchesCategory;
  });

  const handleFilterChange = (filterType, value) => {
    setFilters(prev => ({
      ...prev,
      [filterType]: value
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-purple-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading challenges...</p>
          </div>
        </div>
      </div>
    );
  }

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'badge-success';
      case 'Intermediate': return 'badge-warning';
      case 'Advanced': return 'badge-danger';
      default: return 'badge-secondary';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Active': return 'text-green-600';
      case 'Completed': return 'text-blue-600';
      case 'Upcoming': return 'text-orange-600';
      default: return 'text-secondary-600';
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-secondary-900">Skill Challenges</h1>
            <p className="text-secondary-600 mt-2">
              Compete in coding challenges, win prizes, and showcase your skills
            </p>
          </div>
          <Link to="/challenges/create" className="btn btn-primary">
            <PlusIcon className="w-5 h-5 mr-2" />
            Host Challenge
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="card p-6 text-center">
            <TrophyIcon className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-secondary-900">₹2.5L</div>
            <div className="text-secondary-600">Total Prize Pool</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-secondary-900">15</div>
            <div className="text-secondary-600">Active Challenges</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-secondary-900">1,234</div>
            <div className="text-secondary-600">Total Participants</div>
          </div>
          <div className="card p-6 text-center">
            <div className="text-2xl font-bold text-secondary-900">89</div>
            <div className="text-secondary-600">Winners This Month</div>
          </div>
        </div>

        {/* Filters */}
        <div className="card p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <select 
              className="input"
              value={filters.category}
              onChange={(e) => handleFilterChange('category', e.target.value)}
            >
              <option value="">All Categories</option>
              <option value="React">Web Development</option>
              <option value="React Native">Mobile Development</option>
              <option value="Machine Learning">AI/ML</option>
              <option value="UI/UX">Design</option>
              <option value="Python">Data Science</option>
            </select>
            <select 
              className="input"
              value={filters.difficulty}
              onChange={(e) => handleFilterChange('difficulty', e.target.value)}
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
            <select 
              className="input"
              value={filters.status}
              onChange={(e) => handleFilterChange('status', e.target.value)}
            >
              <option value="">All Status</option>
              <option value="Active">Active</option>
              <option value="Upcoming">Upcoming</option>
              <option value="Completed">Completed</option>
            </select>
            <input
              type="text"
              className="input"
              placeholder="Search challenges..."
              value={filters.search}
              onChange={(e) => handleFilterChange('search', e.target.value)}
            />
          </div>
        </div>

        {/* Challenges Grid */}
        {filteredChallenges.length === 0 ? (
          <div className="text-center py-12">
            <TrophyIcon className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-semibold text-gray-900">No challenges found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {challenges.length === 0 
                ? "No challenges available at the moment." 
                : "Try adjusting your filters to see more challenges."
              }
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredChallenges.map((challenge) => (
              <div key={challenge.id} className="card p-6 card-hover">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-xl font-semibold text-secondary-900">
                        {challenge.title}
                      </h3>
                      <span className={`badge ${getDifficultyColor(challenge.difficulty)}`}>
                        {challenge.difficulty}
                      </span>
                    </div>
                    <p className="text-secondary-600 mb-4">{challenge.description}</p>
                    
                    {/* Prize and Sponsor */}
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="text-lg font-bold text-yellow-800">{challenge.prize}</div>
                          <div className="text-sm text-yellow-600">Prize Money</div>
                        </div>
                        <div className="text-right">
                          <div className="text-sm font-medium text-secondary-900">{challenge.sponsor}</div>
                          <div className="text-xs text-secondary-500">Sponsored by</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Technologies */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {challenge.technologies?.map((tech) => (
                        <span key={tech} className="badge badge-secondary">
                          {tech}
                        </span>
                      ))}
                    </div>
                    
                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-4 mb-4 text-center">
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{challenge.participants}</div>
                        <div className="text-xs text-secondary-500">Participants</div>
                      </div>
                      <div>
                        <div className="text-lg font-bold text-secondary-900">{challenge.submissions}</div>
                        <div className="text-xs text-secondary-500">Submissions</div>
                      </div>
                      <div>
                        <div className={`text-lg font-bold ${getStatusColor(challenge.status)}`}>
                          {challenge.timeLeft}
                        </div>
                        <div className="text-xs text-secondary-500">Time Left</div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="flex space-x-3">
                  {challenge.status === 'Active' ? (
                    <button className="btn btn-primary btn-sm flex-1">
                      Join Challenge
                    </button>
                  ) : challenge.status === 'Completed' ? (
                    <button className="btn btn-outline btn-sm flex-1">
                      View Results
                    </button>
                  ) : (
                    <button className="btn btn-secondary btn-sm flex-1">
                      Coming Soon
                    </button>
                  )}
                  <button className="btn btn-outline btn-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action */}
        <div className="card p-8 text-center mt-12 bg-gradient-to-r from-primary-500 to-primary-600 text-white">
          <TrophyIcon className="w-12 h-12 mx-auto mb-4" />
          <h2 className="text-2xl font-bold mb-2">Ready to Showcase Your Skills?</h2>
          <p className="mb-6 opacity-90">
            Join our coding challenges and compete with developers worldwide for amazing prizes
          </p>
          <Link to="/challenges/create" className="btn btn-white">
            Host Your Own Challenge
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Challenges;
