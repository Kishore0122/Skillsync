import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon } from '@heroicons/react/24/outline';
import { useAuth } from '../../contexts/AuthContext';
import axios from 'axios';

const CreateProblem = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    skillsNeeded: '',
    difficulty: 'Intermediate',
    estimatedTime: '1-3 days',
    tags: '',
    githubRepo: '',
    projectLinks: '',
    additionalResources: '',
    projectType: 'New Project'
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim() || formData.title.length < 5) {
      newErrors.title = 'Title must be at least 5 characters long';
    }

    if (!formData.description.trim() || formData.description.length < 20) {
      newErrors.description = 'Description must be at least 20 characters long';
    }

    if (!formData.category) {
      newErrors.category = 'Please select a category';
    }

    if (!formData.skillsNeeded.trim()) {
      newErrors.skillsNeeded = 'Please specify the skills needed';
    }

    // Validate GitHub repository URL if provided
    if (formData.githubRepo && formData.githubRepo.trim()) {
      const githubPattern = /^https?:\/\/(www\.)?github\.com\/[\w\-._]+\/[\w\-._]+\/?$/;
      if (!githubPattern.test(formData.githubRepo.trim())) {
        newErrors.githubRepo = 'Please enter a valid GitHub repository URL (e.g., https://github.com/username/repository)';
      }
    }

    // Validate project links if provided
    if (formData.projectLinks && formData.projectLinks.trim()) {
      const links = formData.projectLinks.split('\n').filter(link => link.trim());
      const urlPattern = /^https?:\/\/.+\..+/;
      const invalidLinks = links.filter(link => !urlPattern.test(link.trim()));
      if (invalidLinks.length > 0) {
        newErrors.projectLinks = 'Please enter valid URLs (one per line)';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setLoading(true);

    try {
      // Prepare the data for API
      const problemData = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        category: formData.category,
        skillsNeeded: formData.skillsNeeded.split(',').map(skill => skill.trim()).filter(skill => skill),
        difficulty: formData.difficulty,
        estimatedTime: formData.estimatedTime,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        githubRepo: formData.githubRepo.trim() || null,
        projectLinks: formData.projectLinks ? formData.projectLinks.split('\n').map(link => link.trim()).filter(link => link) : [],
        additionalResources: formData.additionalResources.trim() || null,
        projectType: formData.projectType
      };

      console.log('Submitting problem data:', problemData);

      const response = await axios.post('/api/problems', problemData);
      
      console.log('Problem created successfully:', response.data);
      
      // Redirect to the problems page or the newly created problem
      navigate('/problems');
      
    } catch (error) {
      console.error('Error creating problem:', error);
      
      if (error.response?.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = {};
        error.response.data.errors.forEach(err => {
          backendErrors[err.param] = err.msg;
        });
        setErrors(backendErrors);
      } else {
        setErrors({ 
          submit: error.response?.data?.message || 'Failed to create problem. Please try again.' 
        });
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = () => {
    // Save to localStorage as draft
    const draftKey = `problem_draft_${user?.id || 'anonymous'}`;
    localStorage.setItem(draftKey, JSON.stringify(formData));
    alert('Draft saved successfully!');
  };

  // Load draft on component mount
  React.useEffect(() => {
    const draftKey = `problem_draft_${user?.id || 'anonymous'}`;
    const savedDraft = localStorage.getItem(draftKey);
    if (savedDraft) {
      try {
        const draftData = JSON.parse(savedDraft);
        setFormData(draftData);
      } catch (error) {
        console.error('Error loading draft:', error);
      }
    }
  }, [user]);

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-8">
          <PlusIcon className="mx-auto h-16 w-16 text-secondary-400 mb-4" />
          <h1 className="text-3xl font-bold text-secondary-900 mb-4">Create New Problem</h1>
          <p className="text-secondary-600">
            Share a real-world challenge that needs solving. Describe the problem, 
            what skills are needed, and what impact it could have.
          </p>
        </div>

        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {errors.submit && (
              <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
                {errors.submit}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Problem Title *
              </label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className={`input ${errors.title ? 'border-red-500' : ''}`}
                placeholder="e.g., Build a learning platform for rural schools"
                maxLength={200}
              />
              {errors.title && <p className="text-red-500 text-sm mt-1">{errors.title}</p>}
              <p className="text-sm text-secondary-500 mt-1">{formData.title.length}/200 characters</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Description *
              </label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={6}
                className={`input ${errors.description ? 'border-red-500' : ''}`}
                placeholder="Describe the problem in detail. What is the challenge? Who would benefit from solving it? What impact could it have?"
                maxLength={2000}
              />
              {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
              <p className="text-sm text-secondary-500 mt-1">{formData.description.length}/2000 characters</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category *
                </label>
                <select 
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className={`input ${errors.category ? 'border-red-500' : ''}`}
                >
                  <option value="">Select category</option>
                  <option value="Technology">Technology</option>
                  <option value="Education">Education</option>
                  <option value="Healthcare">Healthcare</option>
                  <option value="Environment">Environment</option>
                  <option value="Social Impact">Social Impact</option>
                  <option value="Business">Business</option>
                  <option value="Agriculture">Agriculture</option>
                  <option value="Infrastructure">Infrastructure</option>
                  <option value="Arts & Culture">Arts & Culture</option>
                  <option value="Other">Other</option>
                </select>
                {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Difficulty Level
                </label>
                <select 
                  name="difficulty"
                  value={formData.difficulty}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Skills Needed *
                </label>
                <input
                  type="text"
                  name="skillsNeeded"
                  value={formData.skillsNeeded}
                  onChange={handleChange}
                  className={`input ${errors.skillsNeeded ? 'border-red-500' : ''}`}
                  placeholder="e.g., React, Node.js, MongoDB (comma separated)"
                />
                {errors.skillsNeeded && <p className="text-red-500 text-sm mt-1">{errors.skillsNeeded}</p>}
                <p className="text-sm text-secondary-500 mt-1">Separate skills with commas</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Estimated Time
                </label>
                <select 
                  name="estimatedTime"
                  value={formData.estimatedTime}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="1-2 hours">1-2 hours</option>
                  <option value="1-3 days">1-3 days</option>
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1+ months">1+ months</option>
                </select>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-2">
                Tags (Optional)
              </label>
              <input
                type="text"
                name="tags"
                value={formData.tags}
                onChange={handleChange}
                className="input"
                placeholder="e.g., mobile, API, database (comma separated)"
              />
              <p className="text-sm text-secondary-500 mt-1">Add relevant tags to help others find your problem</p>
            </div>

            {/* Project Details Section */}
            <div className="bg-gray-50 p-6 rounded-lg space-y-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-4">Project Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Project Type
                  </label>
                  <select 
                    name="projectType"
                    value={formData.projectType}
                    onChange={handleChange}
                    className="input"
                  >
                    <option value="New Project">New Project</option>
                    <option value="Existing Project">Existing Project</option>
                    <option value="Open Source">Open Source Contribution</option>
                    <option value="Research">Research Project</option>
                    <option value="Prototype">Prototype/MVP</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  GitHub Repository (Optional)
                </label>
                <input
                  type="url"
                  name="githubRepo"
                  value={formData.githubRepo}
                  onChange={handleChange}
                  className={`input ${errors.githubRepo ? 'border-red-500' : ''}`}
                  placeholder="https://github.com/username/repository"
                />
                {errors.githubRepo && <p className="text-red-500 text-sm mt-1">{errors.githubRepo}</p>}
                <p className="text-sm text-secondary-500 mt-1">Link to existing repository or where the project will be hosted</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Project Links (Optional)
                </label>
                <textarea
                  name="projectLinks"
                  value={formData.projectLinks}
                  onChange={handleChange}
                  rows={3}
                  className={`input ${errors.projectLinks ? 'border-red-500' : ''}`}
                  placeholder="https://example.com/demo&#10;https://figma.com/design-link&#10;https://docs.google.com/project-doc"
                />
                {errors.projectLinks && <p className="text-red-500 text-sm mt-1">{errors.projectLinks}</p>}
                <p className="text-sm text-secondary-500 mt-1">Add relevant links (demo, design, documentation) - one per line</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Additional Resources (Optional)
                </label>
                <textarea
                  name="additionalResources"
                  value={formData.additionalResources}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  placeholder="Share any additional context, requirements, reference materials, APIs to use, design guidelines, or helpful resources for collaborators..."
                  maxLength={1000}
                />
                <p className="text-sm text-secondary-500 mt-1">{formData.additionalResources.length}/1000 characters</p>
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button 
                type="button" 
                onClick={handleSaveDraft}
                className="btn btn-outline"
                disabled={loading}
              >
                Save Draft
              </button>
              <button 
                type="submit" 
                className={`btn btn-primary ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
                disabled={loading}
              >
                {loading ? 'Posting...' : 'Post Problem'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default CreateProblem;
