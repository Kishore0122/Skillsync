import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';

const EditProject = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [project, setProject] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: 'Intermediate',
    duration: '1-2 months',
    skillsNeeded: [],
    tags: [],
    maxMembers: 10,
    visibility: 'Public',
    repository: { url: '', platform: 'GitHub' },
    demoUrl: '',
    startDate: '',
    endDate: ''
  });

  useEffect(() => {
    console.log('EditProject component mounted, id:', id);
    fetchProject();
  }, [id]);

  const fetchProject = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`/api/projects/${id}`);
      const projectData = response.data;
      
      console.log('EditProject - Fetched project data:', projectData);
      console.log('EditProject - Current user:', user);
      console.log('EditProject - Project owner ID:', projectData.owner._id);
      console.log('EditProject - User ID:', user.id);
      console.log('EditProject - Project owner email:', projectData.owner.email);
      console.log('EditProject - User email:', user.email);
      
      // Check if user is the owner
      const ownerId = projectData.owner?._id || projectData.owner?.id || projectData.owner;
      const userId = user?.id || user?._id;
      const isOwner = ownerId === userId || projectData.owner?.email === user?.email;
      console.log('EditProject - Is owner?', isOwner);
      
      if (!user) {
        console.log('EditProject - No user found, redirecting to login');
        navigate('/login');
        return;
      }
      
      if (!isOwner) {
        console.log('EditProject - User is not owner, redirecting to projects page');
        navigate('/projects');
        return;
      }
      
      setProject({
        title: projectData.title || '',
        description: projectData.description || '',
        category: projectData.category || '',
        difficulty: projectData.difficulty || 'Intermediate',
        duration: projectData.duration || '1-2 months',
        skillsNeeded: projectData.skillsNeeded || [],
        tags: projectData.tags || [],
        maxMembers: projectData.maxMembers || 10,
        visibility: projectData.visibility || 'Public',
        repository: projectData.repository || { url: '', platform: 'GitHub' },
        demoUrl: projectData.demoUrl || '',
        startDate: projectData.startDate ? new Date(projectData.startDate).toISOString().split('T')[0] : '',
        endDate: projectData.endDate ? new Date(projectData.endDate).toISOString().split('T')[0] : ''
      });
      setError('');
    } catch (error) {
      console.error('Error fetching project:', error);
      setError(error.response?.data?.message || 'Failed to load project');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');

    try {
      const updateData = {
        ...project,
        skillsNeeded: Array.isArray(project.skillsNeeded) 
          ? project.skillsNeeded 
          : project.skillsNeeded.split(',').map(skill => skill.trim()).filter(skill => skill),
        tags: Array.isArray(project.tags) 
          ? project.tags 
          : project.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
        startDate: project.startDate || undefined,
        endDate: project.endDate || undefined
      };

      await axios.put(`/api/projects/${id}`, updateData, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      alert('Project updated successfully!');
      navigate(`/projects/${id}`);
    } catch (error) {
      console.error('Error updating project:', error);
      setError(error.response?.data?.message || 'Failed to update project');
    } finally {
      setSaving(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    
    if (name.includes('.')) {
      const [parent, child] = name.split('.');
      setProject(prev => ({
        ...prev,
        [parent]: {
          ...prev[parent],
          [child]: value
        }
      }));
    } else {
      setProject(prev => ({
        ...prev,
        [name]: type === 'number' ? parseInt(value) : value
      }));
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-secondary-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-6">
          <h1 className="text-3xl font-bold text-secondary-900 mb-6">Edit Project</h1>
          
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Project Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={project.title}
                  onChange={handleChange}
                  className="input"
                  required
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Description *
                </label>
                <textarea
                  name="description"
                  value={project.description}
                  onChange={handleChange}
                  rows={4}
                  className="input"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Category *
                </label>
                <select
                  name="category"
                  value={project.category}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select Category</option>
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
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  name="difficulty"
                  value={project.difficulty}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Duration
                </label>
                <select
                  name="duration"
                  value={project.duration}
                  onChange={handleChange}
                  className="input"
                >
                  <option value="1-2 weeks">1-2 weeks</option>
                  <option value="1-2 months">1-2 months</option>
                  <option value="3-6 months">3-6 months</option>
                  <option value="6+ months">6+ months</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Max Members
                </label>
                <input
                  type="number"
                  name="maxMembers"
                  value={project.maxMembers}
                  onChange={handleChange}
                  min="1"
                  max="50"
                  className="input"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Skills Needed
                </label>
                <input
                  type="text"
                  name="skillsNeeded"
                  value={Array.isArray(project.skillsNeeded) ? project.skillsNeeded.join(', ') : project.skillsNeeded}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., React, Node.js, MongoDB, AWS"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Tags
                </label>
                <input
                  type="text"
                  name="tags"
                  value={Array.isArray(project.tags) ? project.tags.join(', ') : project.tags}
                  onChange={handleChange}
                  className="input"
                  placeholder="e.g., frontend, backend, mobile"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Repository URL
                </label>
                <input
                  type="url"
                  name="repository.url"
                  value={project.repository?.url || ''}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://github.com/username/repo"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Demo URL
                </label>
                <input
                  type="url"
                  name="demoUrl"
                  value={project.demoUrl}
                  onChange={handleChange}
                  className="input"
                  placeholder="https://your-demo.com"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  Start Date
                </label>
                <input
                  type="date"
                  name="startDate"
                  value={project.startDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-secondary-700 mb-2">
                  End Date
                </label>
                <input
                  type="date"
                  name="endDate"
                  value={project.endDate}
                  onChange={handleChange}
                  className="input"
                />
              </div>
            </div>

            <div className="flex gap-4">
              <button
                type="submit"
                disabled={saving}
                className="btn-primary"
              >
                {saving ? 'Updating...' : 'Update Project'}
              </button>
              <button
                type="button"
                onClick={() => navigate(`/projects/${id}`)}
                className="btn-secondary"
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

export default EditProject;
