import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CreateProject = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Intermediate',
    maxMembers: 5,
    skillsNeeded: '',
    timeline: '',
    goals: '',
    requirements: '',
    visibility: 'Public'
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!user) {
      setError('You must be logged in to create a project');
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Prepare the data for submission
      const projectData = {
        title: formData.title,
        description: formData.description,
        category: formData.category,
        difficulty: formData.difficulty,
        maxMembers: parseInt(formData.maxMembers),
        skillsNeeded: formData.skillsNeeded.split(',').map(skill => skill.trim()).filter(skill => skill),
        duration: formData.timeline,
        visibility: formData.visibility,
        goals: formData.goals,
        requirements: formData.requirements
      };

      console.log('Creating project:', projectData);

      const response = await axios.post('/api/projects', projectData);
      
      console.log('Project created successfully:', response.data);
      
      // Redirect to the new project page
      navigate(`/projects/${response.data._id}`);
    } catch (error) {
      console.error('Error creating project:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors
        const errorMessages = error.response.data.errors.map(err => err.msg).join(', ');
        setError(errorMessages);
      } else if (error.response?.data?.message) {
        setError(error.response.data.message);
      } else {
        setError('Failed to create project. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900">Start a New Project</h1>
            <p className="text-secondary-600 mt-2">
              Create a collaborative project and invite talented developers to join your team
            </p>
            
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-red-600 text-sm">{error}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Project Title */}
            <div>
              <label className="label">Project Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Give your project a compelling title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Project Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Describe what you're building and why it matters"
                required
              />
            </div>

            {/* Category and Difficulty */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Category</label>
                <select
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select a category</option>
                  <option value="Web Development">Web Development</option>
                  <option value="Mobile App">Mobile App</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Game Development">Game Development</option>
                  <option value="IoT">IoT</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="label">Difficulty Level</label>
                <select
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select difficulty</option>
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            {/* Max Members and Timeline */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Maximum Team Members</label>
                <input
                  type="number"
                  name="maxMembers"
                  value={formData.maxMembers}
                  onChange={handleChange}
                  className="input"
                  min="2"
                  max="20"
                />
              </div>

              <div>
                <label className="label">Expected Timeline</label>
                <select
                  name="timeline"
                  value={formData.timeline}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select timeline</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </select>
              </div>
            </div>

            {/* Skills Needed */}
            <div>
              <label className="label">Skills Needed</label>
              <input
                type="text"
                name="skillsNeeded"
                value={formData.skillsNeeded}
                onChange={handleChange}
                className="input"
                placeholder="e.g., React, Node.js, Python, UI/UX Design (comma-separated)"
                required
              />
              <p className="text-sm text-secondary-500 mt-1">
                List the key skills team members should have
              </p>
            </div>

            {/* Project Goals */}
            <div>
              <label className="label">Project Goals</label>
              <textarea
                name="goals"
                value={formData.goals}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="What do you hope to achieve with this project?"
                required
              />
            </div>

            {/* Requirements */}
            <div>
              <label className="label">Requirements & Expectations</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="What do you expect from team members? Any specific requirements?"
              />
            </div>

            {/* Project Visibility */}
            <div>
              <label className="label">Project Visibility</label>
              <select
                name="visibility"
                value={formData.visibility}
                onChange={handleChange}
                className="input"
                required
              >
                <option value="Public">Public - Anyone can see and join</option>
                <option value="Private">Private - Invite only</option>
              </select>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                disabled={loading}
                className={`btn btn-primary flex-1 ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                {loading ? 'Creating Project...' : 'Create Project'}
              </button>
              <button
                type="button"
                onClick={() => navigate('/projects')}
                disabled={loading}
                className="btn btn-outline flex-1"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProject;
