import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { UserIcon, CameraIcon, PlusIcon, PencilIcon, TrashIcon, CheckCircleIcon, UserGroupIcon, ChatBubbleLeftRightIcon, XMarkIcon, PaperAirplaneIcon, CodeBracketIcon, LinkIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import Collaborations from '../components/profile/Collaborations';
import ProjectTeams from '../components/profile/ProjectTeams';
import CompleteProjectModal from '../components/modals/CompleteProjectModal';
import socketService from '../services/socketService';

const Profile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [isEditingAbout, setIsEditingAbout] = useState(false);
  const [isEditingSkills, setIsEditingSkills] = useState(false);
  const [isEditingLinks, setIsEditingLinks] = useState(false);
  const [isAddingProject, setIsAddingProject] = useState(false);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dataSource, setDataSource] = useState(''); // 'localStorage' or 'default'
  const [projects, setProjects] = useState([]);
  const [userProjects, setUserProjects] = useState([]); // Projects created by user from database
  const [achievements, setAchievements] = useState([]);
  const [problemsPosted, setProblemsPosted] = useState([]);
  const [collaborations, setCollaborations] = useState([]);
  const [loadingProblems, setLoadingProblems] = useState(false);
  const [editingProblem, setEditingProblem] = useState(null);
  const [completingProblem, setCompletingProblem] = useState(null);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [showTeamModal, setShowTeamModal] = useState(false);
  const [selectedProject, setSelectedProject] = useState(null);
  const [showChatModal, setShowChatModal] = useState(false);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loadingChat, setLoadingChat] = useState(false);
  const messagesEndRef = useRef(null);
  const [newProject, setNewProject] = useState({
    title: '',
    description: '',
    technologies: '',
    status: 'In Progress',
    githubUrl: '',
    liveUrl: ''
  });
  const fileInputRef = useRef(null);
  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: '',
    location: '',
    bio: '',
    skills: [],
    experience: '',
    education: '',
    github: '',
    linkedin: '',
    website: '',
    profileImage: ''
  });

  useEffect(() => {
    if (user) {
      // Load profile data from localStorage or use defaults
      const savedProfile = localStorage.getItem(`profile_${user.id || user.email}`);
      
      if (savedProfile) {
        try {
          const parsedProfile = JSON.parse(savedProfile);
          setProfileData({
            ...parsedProfile,
            name: user.name || parsedProfile.name || '',
            email: user.email || parsedProfile.email || '',
          });
          setDataSource('localStorage');
          console.log('Profile loaded from localStorage:', parsedProfile);
        } catch (error) {
          console.error('Error parsing saved profile:', error);
          setDataSource('default');
        }
      } else {
        // Initialize with user data from auth context
        setProfileData(prev => ({
          ...prev,
          name: user.name || '',
          email: user.email || '',
        }));
        setDataSource('default');
        console.log('Profile initialized with default values');
      }

      // Load projects from localStorage
      const projectsKey = `projects_${user.id || user.email}`;
      const savedProjects = localStorage.getItem(projectsKey);
      
      if (savedProjects) {
        try {
          const parsedProjects = JSON.parse(savedProjects);
          setProjects(Array.isArray(parsedProjects) ? parsedProjects : []);
          console.log('Projects loaded from localStorage:', parsedProjects);
        } catch (error) {
          console.error('Error parsing saved projects:', error);
          setProjects([]);
        }
      } else {
        setProjects([]);
        console.log('No saved projects found');
      }
    }
    setLoading(false);
    
    // Fetch user's created projects from database
    if (user) {
      fetchUserProjects();
      fetchProblemsPostedByUser();
      fetchCollaborations();
    }
    
    // Connect to socket service
    socketService.connect();
    
    return () => {
      // Clean up socket listeners when component unmounts
      socketService.offNewMessage();
    };
  }, [user]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Check file size (limit to 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size should be less than 5MB');
        return;
      }

      // Check file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          // Create canvas to resize image
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          
          // Set canvas size to 400x400 for good quality
          const size = 400;
          canvas.width = size;
          canvas.height = size;
          
          // Calculate crop dimensions for square aspect ratio
          const minDimension = Math.min(img.width, img.height);
          const startX = (img.width - minDimension) / 2;
          const startY = (img.height - minDimension) / 2;
          
          // Draw cropped and resized image
          ctx.drawImage(
            img,
            startX, startY, minDimension, minDimension, // Source crop
            0, 0, size, size // Destination size
          );
          
          // Convert to data URL with good quality
          const imageDataUrl = canvas.toDataURL('image/jpeg', 0.8);
          
          setProfileData(prev => ({
            ...prev,
            profileImage: imageDataUrl
          }));
          
          // Auto-save the image with current state
          const profileKey = `profile_${user.id || user.email}`;
          // Use the updated profile data correctly
          setTimeout(() => {
            const currentProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
            const updatedProfile = {
              ...currentProfile,
              ...profileData,
              profileImage: imageDataUrl
            };
            localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
            setDataSource('localStorage');
          }, 100);
          
          console.log('Profile image updated and saved');
          alert('Profile image updated successfully!');
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const removeProfileImage = () => {
    if (window.confirm('Are you sure you want to remove your profile image?')) {
      setProfileData(prev => ({
        ...prev,
        profileImage: ''
      }));
      
      // Auto-save the change correctly
      setTimeout(() => {
        const profileKey = `profile_${user.id || user.email}`;
        const currentProfile = JSON.parse(localStorage.getItem(profileKey) || '{}');
        const updatedProfile = {
          ...currentProfile,
          profileImage: ''
        };
        localStorage.setItem(profileKey, JSON.stringify(updatedProfile));
        setDataSource('localStorage');
      }, 100);
      
      console.log('Profile image removed');
      alert('Profile image removed successfully!');
    }
  };

  const fetchUserProfile = async () => {
    try {
      // TODO: Implement API call to fetch user profile
      // const response = await axios.get('/api/users/profile');
      // setProfileData(response.data);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching profile:', error);
      setLoading(false);
    }
  };

  const fetchUserProjects = async () => {
    try {
      if (!user) return;
      
      const response = await axios.get('/api/projects', {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      // Filter projects created by the current user
      const allProjects = response.data.projects || response.data || [];
      const userCreatedProjects = allProjects.filter(project => {
        const ownerId = project.owner?._id || project.owner?.id || project.owner;
        const userId = user.id || user._id;
        return ownerId === userId || project.owner?.email === user.email;
      });
      
      console.log(`Found ${userCreatedProjects.length} projects created by user`);
      setUserProjects(userCreatedProjects);
    } catch (error) {
      console.error('Error fetching user projects:', error);
      setUserProjects([]);
    }
  };

  const fetchProblemsPostedByUser = async () => {
    try {
      if (!user) return;
      
      setLoadingProblems(true);
      // For now, we'll use an empty array since this seems to be for a problems/issues feature
      // that might not be implemented yet
      setProblemsPosted([]);
      setLoadingProblems(false);
      
      // TODO: Implement API call when problems/issues endpoint is available
      // const response = await axios.get('/api/problems/user', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // setProblemsPosted(response.data || []);
    } catch (error) {
      console.error('Error fetching problems posted by user:', error);
      setProblemsPosted([]);
      setLoadingProblems(false);
    }
  };

  const fetchCollaborations = async () => {
    try {
      if (!user) return;
      
      // For now, we'll use an empty array since this seems to be for a collaborations feature
      // that might not be fully implemented yet
      setCollaborations([]);
      
      // TODO: Implement API call when collaborations endpoint is available
      // const response = await axios.get('/api/collaborations/user', {
      //   headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      // });
      // setCollaborations(response.data || []);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      setCollaborations([]);
    }
  };

  const fetchUserAchievements = async () => {
    try {
      // TODO: Implement API call to fetch user achievements
      // const response = await axios.get('/api/users/achievements');
      // setAchievements(response.data);
    } catch (error) {
      console.error('Error fetching achievements:', error);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSkillsChange = (e) => {
    const skillsArray = e.target.value.split(',').map(skill => skill.trim());
    setProfileData({
      ...profileData,
      skills: skillsArray
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      // Save to localStorage for persistence
      const profileKey = `profile_${user.id || user.email}`;
      localStorage.setItem(profileKey, JSON.stringify(profileData));
      
      // Update the user in AuthContext if name changed
      if (user.name !== profileData.name) {
        // TODO: Update AuthContext when the updateUser function is available
        // updateUser({ name: profileData.name });
      }
      
      // TODO: Replace with actual API call when backend is ready
      // const response = await axios.put('/api/users/profile', profileData);
      // if (response.data.success) {
      //   // Update the auth context with new user data if needed
      //   updateUser({ name: profileData.name });
      // }
      
      console.log('Profile saved to localStorage:', profileData);
      
      // Simulate API call delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Close editing mode
      setIsEditing(false);
      
      // Show success message
      alert('Profile updated and saved successfully! Your changes will persist.');
      
    } catch (error) {
      console.error('Error saving profile:', error);
      alert('Failed to save profile. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    if (window.confirm('Are you sure you want to reset your profile? This will clear all saved data including your profile image and projects.')) {
      const profileKey = `profile_${user.id || user.email}`;
      const projectsKey = `projects_${user.id || user.email}`;
      
      // Clear both profile and projects from localStorage
      localStorage.removeItem(profileKey);
      localStorage.removeItem(projectsKey);
      
      // Reset to default values
      setProfileData({
        name: user?.name || '',
        email: user?.email || '',
        title: '',
        location: '',
        bio: '',
        skills: [],
        experience: '',
        education: '',
        github: '',
        linkedin: '',
        website: '',
        profileImage: ''
      });
      
      // Reset projects
      setProjects([]);
      
      setDataSource('default');
      alert('Profile and projects reset successfully!');
    }
  };

  const saveToLocalStorage = () => {
    const profileKey = `profile_${user.id || user.email}`;
    localStorage.setItem(profileKey, JSON.stringify(profileData));
    setDataSource('localStorage');
    console.log('Profile saved to localStorage:', profileData);
  };

  const handleSaveAbout = () => {
    saveToLocalStorage();
    setIsEditingAbout(false);
    alert('About section updated successfully!');
  };

  const handleSaveSkills = () => {
    saveToLocalStorage();
    setIsEditingSkills(false);
    alert('Skills updated successfully!');
  };

  const handleSaveLinks = () => {
    saveToLocalStorage();
    setIsEditingLinks(false);
    alert('Links updated successfully!');
  };

  const handleProjectInputChange = (e) => {
    setNewProject({
      ...newProject,
      [e.target.name]: e.target.value
    });
  };

  const handleAddProject = () => {
    if (!newProject.title.trim() || !newProject.description.trim()) {
      alert('Please fill in at least the title and description');
      return;
    }

    console.log('Adding project with data:', newProject);
    console.log('Current user:', user);

    const project = {
      id: Date.now(), // Simple ID generation
      title: newProject.title.trim(),
      description: newProject.description.trim(),
      technologies: newProject.technologies ? newProject.technologies.split(',').map(tech => tech.trim()).filter(tech => tech) : [],
      status: newProject.status,
      githubUrl: newProject.githubUrl.trim(),
      liveUrl: newProject.liveUrl.trim(),
      likes: Math.floor(Math.random() * 20), // Random likes for demo
      createdAt: new Date().toLocaleDateString()
    };

    console.log('Created project object:', project);

    const updatedProjects = [...projects, project];
    console.log('Updated projects array:', updatedProjects);
    
    // Update state first
    setProjects(updatedProjects);

    // Save to localStorage with immediate execution
    const projectsKey = `projects_${user.id || user.email}`;
    console.log('Saving to localStorage key:', projectsKey);
    
    try {
      localStorage.setItem(projectsKey, JSON.stringify(updatedProjects));
      
      // Verify it was saved
      const savedData = localStorage.getItem(projectsKey);
      console.log('Verification - Data saved to localStorage:', savedData);
      
      if (savedData) {
        const parsedData = JSON.parse(savedData);
        console.log('Verification - Parsed saved data:', parsedData);
      }
      
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Error saving project. Please try again.');
      return;
    }

    // Reset form
    setNewProject({
      title: '',
      description: '',
      technologies: '',
      status: 'In Progress',
      githubUrl: '',
      liveUrl: ''
    });

    setIsAddingProject(false);
    alert('Project added successfully!');
  };

  const handleDeleteProject = (projectId) => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const updatedProjects = projects.filter(project => project.id !== projectId);
      
      // Update state
      setProjects(updatedProjects);

      // Save to localStorage
      try {
        const projectsKey = `projects_${user.id || user.email}`;
        localStorage.setItem(projectsKey, JSON.stringify(updatedProjects));
        console.log('Project deleted, remaining projects:', updatedProjects);
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert('Error deleting project. Please try again.');
      }
    }
  };

  const handleDeleteUserProject = async (projectId) => {
    if (window.confirm('Are you sure you want to delete this project? This action cannot be undone.')) {
      try {
        await axios.delete(`/api/projects/${projectId}`, {
          headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
        });
        
        // Remove from state
        setUserProjects(prev => prev.filter(project => project._id !== projectId));
        alert('Project deleted successfully!');
      } catch (error) {
        console.error('Error deleting project:', error);
        alert(error.response?.data?.message || 'Error deleting project. Please try again.');
      }
    }
  };

  const handleViewTeam = (project) => {
    setSelectedProject(project);
    setShowTeamModal(true);
  };

  const handleOpenChat = async (project) => {
    setSelectedProject(project);
    setShowChatModal(true);
    await fetchChatMessages(project._id);
    
    // Join the project room for real-time updates
    socketService.joinProject(project._id);
    
    // Listen for new messages
    socketService.onNewMessage((data) => {
      if (data.projectId === project._id) {
        setChatMessages(prev => {
          // Check if message already exists to avoid duplicates
          const exists = prev.some(msg => msg._id === data.message._id);
          if (!exists) {
            return [...prev, data.message];
          }
          return prev;
        });
      }
    });
  };

  const fetchChatMessages = async (projectId) => {
    try {
      setLoadingChat(true);
      const response = await axios.get(`http://localhost:5000/api/projects/${projectId}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setChatMessages(response.data.messages || []);
    } catch (error) {
      console.error('Error fetching chat messages:', error);
      setChatMessages([]);
    } finally {
      setLoadingChat(false);
    }
  };

  const handleSendMessage = async () => {
    if (!newMessage.trim() || !selectedProject) return;

    try {
      await axios.post(`http://localhost:5000/api/projects/${selectedProject._id}/messages`, {
        content: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });

      // Don't add message to local state - it will come back via socket
      // This ensures all users see the message at the same time
      setNewMessage('');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    }
  };

  const closeTeamModal = () => {
    setShowTeamModal(false);
    setSelectedProject(null);
  };

  const closeChatModal = () => {
    if (selectedProject) {
      // Leave the project room and clean up listeners
      socketService.leaveProject(selectedProject._id);
      socketService.offNewMessage();
    }
    setShowChatModal(false);
    setSelectedProject(null);
    setChatMessages([]);
    setNewMessage('');
  };

  // Debug function to check localStorage
  const debugProjects = () => {
    const projectsKey = `projects_${user.id || user.email}`;
    const savedProjects = localStorage.getItem(projectsKey);
    console.log('Debug - Projects Key:', projectsKey);
    console.log('Debug - Saved Projects:', savedProjects);
    console.log('Debug - Current Projects State:', projects);
    console.log('Debug - User:', user);
    
    // Try to reload projects
    if (savedProjects) {
      try {
        const parsedProjects = JSON.parse(savedProjects);
        setProjects(Array.isArray(parsedProjects) ? parsedProjects : []);
        console.log('Debug - Reloaded projects:', parsedProjects);
      } catch (error) {
        console.error('Debug - Error parsing projects:', error);
      }
    }
  };

  const clearAllProjects = () => {
    if (window.confirm('Are you sure you want to clear all projects? This is for debugging.')) {
      const projectsKey = `projects_${user.id || user.email}`;
      localStorage.removeItem(projectsKey);
      setProjects([]);
      console.log('All projects cleared');
    }
  };

  // Functions for handling problems posted by the user
  const fetchUserProblemsPosted = async () => {
    if (!user) {
      console.log('No user available, skipping problem fetch');
      return;
    }
    
    try {
      setLoadingProblems(true);
      console.log('Fetching problems posted by user:', user.id || user.email);
      
      // Use dedicated endpoint for user's posted problems
      const response = await axios.get('/api/problems/user/posted');
      console.log('API response:', response.data);
      
      const userProblems = response.data.problems || [];
      console.log('User problems received:', userProblems.length);
      
      setProblemsPosted(userProblems);
      
    } catch (error) {
      console.error('Error fetching user problems:', error);
      
      if (error.response) {
        console.error('Response data:', error.response.data);
        console.error('Response status:', error.response.status);
      }
      
      // Set empty array on error but don't show error message
      setProblemsPosted([]);
    } finally {
      setLoadingProblems(false);
    }
  };

  const fetchUserCollaborations = async () => {
    if (!user) {
      console.log('No user available, skipping collaborations fetch');
      return;
    }
    
    try {
      console.log('Fetching collaborations for user:', user.id || user._id);
      
      const response = await axios.get(`/api/users/${user.id || user._id}/collaborations`);
      console.log('Collaborations API response:', response.data);
      
      const allCollaborations = response.data.collaborations || [];
      
      // Filter out collaborations where the user is the project owner
      // We only want to count projects where the user is a collaborator, not the owner
      const userCollaborations = allCollaborations.filter(collab => {
        const isOwner = collab.problem?.author?._id === (user.id || user._id) ||
                       collab.problem?.author === (user.id || user._id);
        return !isOwner; // Only include collaborations where user is NOT the owner
      });
      
      console.log('Filtered user collaborations (not owner):', userCollaborations.length);
      setCollaborations(userCollaborations);
      
    } catch (error) {
      console.error('Error fetching user collaborations:', error);
      setCollaborations([]);
    }
  };

  const handleEditProblem = (problem) => {
    setEditingProblem({
      ...problem,
      skillsNeeded: Array.isArray(problem.skillsNeeded) ? problem.skillsNeeded.join(', ') : '',
      tags: Array.isArray(problem.tags) ? problem.tags.join(', ') : ''
    });
  };

  const handleUpdateProblem = async () => {
    try {
      const updatedData = {
        title: editingProblem.title,
        description: editingProblem.description,
        category: editingProblem.category,
        skillsNeeded: editingProblem.skillsNeeded.split(',').map(skill => skill.trim()).filter(skill => skill),
        difficulty: editingProblem.difficulty,
        estimatedTime: editingProblem.estimatedTime,
        tags: editingProblem.tags ? editingProblem.tags.split(',').map(tag => tag.trim()).filter(tag => tag) : []
      };

      console.log('Updating problem:', editingProblem._id, updatedData);
      
      await axios.put(`/api/problems/${editingProblem._id}`, updatedData);
      
      // Refresh the problems list
      fetchUserProblemsPosted();
      setEditingProblem(null);
      alert('Problem updated successfully!');
    } catch (error) {
      console.error('Error updating problem:', error);
      alert('Failed to update problem. Please try again.');
    }
  };

  const handleDeleteProblem = async (problemId, problemTitle) => {
    if (window.confirm(`Are you sure you want to delete the problem "${problemTitle}"? This action cannot be undone.`)) {
      try {
        console.log('Deleting problem:', problemId);
        
        await axios.delete(`/api/problems/${problemId}`);
        
        // Refresh the problems list
        fetchUserProblemsPosted();
        alert('Problem deleted successfully!');
      } catch (error) {
        console.error('Error deleting problem:', error);
        alert('Failed to delete problem. Please try again.');
      }
    }
  };

  const handleCompleteProblem = (problem) => {
    console.log('Complete button clicked for problem:', problem);
    setCompletingProblem(problem);
    setShowCompleteModal(true);
  };

  const handleCompleteSubmit = async (completionData) => {
    if (!completingProblem) return;
    
    try {
      console.log('Completing problem:', completingProblem._id, completionData);
      
      const response = await axios.put(`/api/problems/${completingProblem._id}/complete`, completionData);
      
      console.log('Problem completed successfully:', response.data);
      
      // Refresh the problems list and collaborations to show updated status
      fetchUserProblemsPosted();
      fetchUserCollaborations();
      
      alert('Problem marked as completed successfully! 🎉');
    } catch (error) {
      console.error('Error completing problem:', error);
      
      if (error.response?.data?.message) {
        alert(error.response.data.message);
      } else {
        alert('Failed to mark problem as completed. Please try again.');
      }
      throw error; // Re-throw to prevent modal from closing
    }
  };

  const closeCompleteModal = () => {
    setShowCompleteModal(false);
    setCompletingProblem(null);
  };

  const handleProblemInputChange = (e) => {
    setEditingProblem(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Enhanced refresh function that checks for issues
  const forceRefreshProblems = async () => {
    console.log('=== FORCE REFRESH PROBLEMS ===');
    console.log('User state:', user);
    console.log('Current problems count:', problemsPosted.length);
    
    // Clear current state
    setProblemsPosted([]);
    
    // Wait a moment then refetch
    setTimeout(() => {
      fetchUserProblemsPosted();
    }, 100);
  };

  // Load problems posted when component mounts and user is available
  useEffect(() => {
    if (user) {
      fetchUserProblemsPosted();
      fetchUserCollaborations();
    }
  }, [user]);

  // Add a periodic refresh to catch newly created problems
  useEffect(() => {
    if (user) {
      const interval = setInterval(() => {
        fetchUserProblemsPosted();
        fetchUserCollaborations();
      }, 60000); // Refresh every 60 seconds (reduced from 30)

      return () => clearInterval(interval);
    }
  }, [user?.id]); // Only depend on user ID



  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Profile Info */}
          <div className="lg:col-span-1 space-y-6">
            {/* Profile Card */}
            <div className="card p-6 text-center">
              {/* Data Source Indicator */}
              {dataSource && (
                <div className="mb-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    dataSource === 'localStorage' 
                      ? 'bg-green-100 text-green-600' 
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {dataSource === 'localStorage' ? '✓ Saved Data' : 'Default Data'}
                  </span>
                </div>
              )}
              
              <div className="relative inline-block mb-4">
                <div className="w-32 h-32 bg-secondary-300 rounded-full flex items-center justify-center mx-auto overflow-hidden border-4 border-white shadow-lg">
                  {profileData.profileImage ? (
                    <img 
                      src={profileData.profileImage} 
                      alt="Profile" 
                      className="w-full h-full object-center"
                      style={{ objectFit: 'contain' }}
                    />
                  ) : (
                    <UserIcon className="w-16 h-16 text-secondary-600" />
                  )}
                </div>
                <div className="absolute -bottom-1 -right-1 flex flex-col space-y-1">
                  <button 
                    onClick={handleImageClick}
                    className="p-2 bg-primary-600 text-white rounded-full hover:bg-primary-700 transition-colors shadow-md border-2 border-white"
                    title="Upload image"
                  >
                    <CameraIcon className="w-4 h-4" />
                  </button>
                  {profileData.profileImage && (
                    <button 
                      onClick={removeProfileImage}
                      className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-colors shadow-md border-2 border-white text-xs font-bold"
                      title="Remove image"
                    >
                      ×
                    </button>
                  )}
                </div>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="hidden"
                />
              </div>
              
              {isEditing ? (
                <div className="space-y-3">
                  <input
                    type="text"
                    name="name"
                    value={profileData.name}
                    onChange={handleInputChange}
                    className="input text-center"
                    placeholder="Your Name"
                  />
                  <input
                    type="email"
                    name="email"
                    value={profileData.email}
                    onChange={handleInputChange}
                    className="input text-center"
                    placeholder="Your Email"
                    disabled
                    title="Email cannot be changed"
                  />
                  <input
                    type="text"
                    name="title"
                    value={profileData.title}
                    onChange={handleInputChange}
                    className="input text-center"
                    placeholder="Your Title (e.g., Full Stack Developer)"
                  />
                  <input
                    type="text"
                    name="location"
                    value={profileData.location}
                    onChange={handleInputChange}
                    className="input text-center"
                    placeholder="Your Location (e.g., Mumbai, India)"
                  />
                </div>
              ) : (
                <div>
                  <h2 className="text-xl font-bold text-secondary-900">
                    {profileData.name || 'Your Name'}
                  </h2>
                  <p className="text-primary-600 font-medium">
                    {profileData.title || 'Add your title'}
                  </p>
                  <p className="text-secondary-500">
                    {profileData.location || 'Add your location'}
                  </p>
                  <p className="text-secondary-400 text-sm mt-1">
                    {profileData.email}
                  </p>
                </div>
              )}
              
              <div className="mt-4 flex justify-center">
                {isEditing ? (
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="btn btn-primary btn-sm"
                    >
                      {saving ? 'Saving...' : 'Save'}
                    </button>
                    <button
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <div className="flex space-x-2">
                    <button
                      onClick={() => setIsEditing(true)}
                      className="btn btn-outline btn-sm"
                    >
                      <PencilIcon className="w-4 h-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={handleReset}
                      className="btn btn-outline btn-sm text-red-600 border-red-600 hover:bg-red-50"
                      title="Reset profile data"
                    >
                      Reset
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* About Section */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-secondary-900">About</h3>
                {!isEditingAbout && (
                  <button
                    onClick={() => setIsEditingAbout(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <PencilIcon className="w-4 h-4 mr-1" />
                    Edit
                  </button>
                )}
              </div>
              {isEditingAbout ? (
                <div>
                  <textarea
                    name="bio"
                    value={profileData.bio}
                    onChange={handleInputChange}
                    rows={4}
                    className="input mb-3"
                    placeholder="Tell us about yourself, your experience, interests, and goals..."
                  />
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveAbout}
                      className="btn btn-primary btn-sm"
                    >
                      Save About
                    </button>
                    <button
                      onClick={() => setIsEditingAbout(false)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <p className="text-secondary-600">
                  {profileData.bio || "Add a bio to tell others about yourself, your experience, and what you're passionate about."}
                </p>
              )}
            </div>

            {/* Skills Section */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-secondary-900">Skills</h3>
                {!isEditingSkills && (
                  <button
                    onClick={() => setIsEditingSkills(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    {profileData.skills.length > 0 ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>
              {isEditingSkills ? (
                <div>
                  <input
                    type="text"
                    value={profileData.skills.join(', ')}
                    onChange={handleSkillsChange}
                    className="input mb-2"
                    placeholder="React, Node.js, Python (comma-separated)"
                  />
                  <p className="text-sm text-secondary-500 mb-3">
                    Separate skills with commas
                  </p>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveSkills}
                      className="btn btn-primary btn-sm"
                    >
                      Save Skills
                    </button>
                    <button
                      onClick={() => setIsEditingSkills(false)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {profileData.skills.length > 0 ? (
                    profileData.skills.map((skill) => (
                      <span key={skill} className="badge badge-primary">
                        {skill}
                      </span>
                    ))
                  ) : (
                    <p className="text-secondary-500 text-sm">
                      Add your skills to help others understand your expertise
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Contact Links */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-3">
                <h3 className="text-lg font-semibold text-secondary-900">Links</h3>
                {!isEditingLinks && (
                  <button
                    onClick={() => setIsEditingLinks(true)}
                    className="btn btn-outline btn-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-1" />
                    {(profileData.github || profileData.linkedin || profileData.website) ? 'Edit' : 'Add'}
                  </button>
                )}
              </div>
              {isEditingLinks ? (
                <div>
                  <div className="space-y-3 mb-3">
                    <input
                      type="url"
                      name="github"
                      value={profileData.github}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="GitHub URL (e.g., https://github.com/username)"
                    />
                    <input
                      type="url"
                      name="linkedin"
                      value={profileData.linkedin}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="LinkedIn URL (e.g., https://linkedin.com/in/username)"
                    />
                    <input
                      type="url"
                      name="website"
                      value={profileData.website}
                      onChange={handleInputChange}
                      className="input"
                      placeholder="Personal Website (e.g., https://yourname.dev)"
                    />
                  </div>
                  <div className="flex space-x-2">
                    <button
                      onClick={handleSaveLinks}
                      className="btn btn-primary btn-sm"
                    >
                      Save Links
                    </button>
                    <button
                      onClick={() => setIsEditingLinks(false)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  {profileData.github ? (
                    <a href={profileData.github} target="_blank" rel="noopener noreferrer" 
                       className="block text-primary-600 hover:text-primary-700">
                      📂 GitHub
                    </a>
                  ) : null}
                  {profileData.linkedin ? (
                    <a href={profileData.linkedin} target="_blank" rel="noopener noreferrer" 
                       className="block text-primary-600 hover:text-primary-700">
                      💼 LinkedIn
                    </a>
                  ) : null}
                  {profileData.website ? (
                    <a href={profileData.website} target="_blank" rel="noopener noreferrer" 
                       className="block text-primary-600 hover:text-primary-700">
                      🌐 Personal Website
                    </a>
                  ) : null}
                  {!profileData.github && !profileData.linkedin && !profileData.website && (
                    <p className="text-secondary-500 text-sm">
                      Add your social media and website links to help others connect with you
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Projects & Achievements */}
          <div className="lg:col-span-2 space-y-6">
            {/* Projects Section */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-secondary-900">My Projects</h3>
                <div className="flex gap-2">
                  {/* <button
                    onClick={debugProjects}
                    className="bg-yellow-500 text-white px-2 py-1 rounded text-xs hover:bg-yellow-600"
                  >
                    Debug
                  </button> */}
                  {/* <button
                    onClick={clearAllProjects}
                    className="bg-red-500 text-white px-2 py-1 rounded text-xs hover:bg-red-600"
                  >
                    Clear
                  </button> */}
                  {!isAddingProject && (
                    <button 
                      onClick={() => setIsAddingProject(true)}
                      className="btn btn-outline btn-sm"
                    >
                      <PlusIcon className="w-4 h-4 mr-2" />
                      Add Project
                    </button>
                  )}
                </div>
              </div>

              {/* Add Project Form */}
              {isAddingProject && (
                <div className="mb-6 p-4 border border-secondary-200 rounded-lg bg-secondary-50">
                  <h4 className="font-semibold text-secondary-900 mb-3">Add New Project</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="title"
                      value={newProject.title}
                      onChange={handleProjectInputChange}
                      className="input"
                      placeholder="Project Title *"
                    />
                    <textarea
                      name="description"
                      value={newProject.description}
                      onChange={handleProjectInputChange}
                      rows={3}
                      className="input"
                      placeholder="Project Description *"
                    />
                    <input
                      type="text"
                      name="technologies"
                      value={newProject.technologies}
                      onChange={handleProjectInputChange}
                      className="input"
                      placeholder="Technologies used (comma-separated, e.g., React, Node.js, MongoDB)"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        name="status"
                        value={newProject.status}
                        onChange={handleProjectInputChange}
                        className="input"
                      >
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                        <option value="Planning">Planning</option>
                        <option value="On Hold">On Hold</option>
                      </select>
                      <input
                        type="url"
                        name="githubUrl"
                        value={newProject.githubUrl}
                        onChange={handleProjectInputChange}
                        className="input"
                        placeholder="GitHub URL (optional)"
                      />
                    </div>
                    <input
                      type="url"
                      name="liveUrl"
                      value={newProject.liveUrl}
                      onChange={handleProjectInputChange}
                      className="input"
                      placeholder="Live Demo URL (optional)"
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleAddProject}
                      className="btn btn-primary btn-sm"
                    >
                      Add Project
                    </button>
                    <button
                      onClick={() => {
                        setIsAddingProject(false);
                        setNewProject({
                          title: '',
                          description: '',
                          technologies: '',
                          status: 'In Progress',
                          githubUrl: '',
                          liveUrl: ''
                        });
                      }}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {projects.length === 0 ? (
                  <div className="col-span-2 text-center py-8">
                    <p className="text-gray-500">No projects yet. Start building!</p>
                  </div>
                ) : (
                  projects.map((project) => (
                    <div key={project.id} className="border border-secondary-200 rounded-lg p-4 relative">
                      <button
                        onClick={() => handleDeleteProject(project.id)}
                        className="absolute top-2 right-2 text-red-500 hover:text-red-700 text-xs font-bold"
                        title="Delete project"
                      >
                        ×
                      </button>
                      <h4 className="font-semibold text-secondary-900 mb-2 pr-6">{project.title}</h4>
                      <p className="text-secondary-600 text-sm mb-3">{project.description}</p>
                      
                      {project.technologies && project.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.technologies.map((tech, index) => (
                            <span key={index} className="badge badge-secondary badge-sm">
                              {tech}
                            </span>
                          ))}
                        </div>
                      )}
                      
                      <div className="flex justify-between items-center text-sm mb-2">
                        <span className={`badge ${project.status === 'Completed' ? 'badge-success' : project.status === 'In Progress' ? 'badge-warning' : 'badge-secondary'}`}>
                          {project.status}
                        </span>
                        <span className="text-secondary-500">{project.likes} likes</span>
                      </div>

                      {(project.githubUrl || project.liveUrl) && (
                        <div className="flex space-x-2 text-sm">
                          {project.githubUrl && (
                            <a 
                              href={project.githubUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              📂 Code
                            </a>
                          )}
                          {project.liveUrl && (
                            <a 
                              href={project.liveUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-primary-600 hover:text-primary-700"
                            >
                              🌐 Live Demo
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Created Projects Section */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-secondary-900">Created Projects</h3>
                <Link 
                  to="/projects/create"
                  className="btn btn-primary btn-sm"
                >
                  <PlusIcon className="w-4 h-4 mr-2" />
                  Create New Project
                </Link>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                {userProjects.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No projects created yet. Start your first project!</p>
                  </div>
                ) : (
                  userProjects.map((project) => (
                    <div key={project._id} className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                      <div className="flex justify-between items-start mb-3">
                        <div className="flex-1">
                          <Link 
                            to={`/projects/${project._id}`}
                            className="text-lg font-semibold text-secondary-900 hover:text-primary-600"
                          >
                            {project.title}
                          </Link>
                          <div className="flex items-center gap-2 mt-1">
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.status === 'Planning' ? 'bg-yellow-100 text-yellow-800' :
                              project.status === 'Active' ? 'bg-green-100 text-green-800' :
                              project.status === 'Completed' ? 'bg-blue-100 text-blue-800' :
                              'bg-gray-100 text-gray-800'
                            }`}>
                              {project.status}
                            </span>
                            <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                              project.difficulty === 'Beginner' ? 'bg-green-100 text-green-800' :
                              project.difficulty === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' :
                              'bg-red-100 text-red-800'
                            }`}>
                              {project.difficulty}
                            </span>
                            <span className="badge badge-primary">{project.category}</span>
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleViewTeam(project)}
                            className="text-blue-600 hover:text-blue-700 p-1"
                            title="View Team"
                          >
                            <UserGroupIcon className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenChat(project)}
                            className="text-green-600 hover:text-green-700 p-1"
                            title="Group Chat"
                          >
                            <ChatBubbleLeftRightIcon className="w-4 h-4" />
                          </button>
                          <Link 
                            to={`/projects/${project._id}/edit`}
                            className="text-primary-600 hover:text-primary-700 p-1"
                            title="Edit Project"
                          >
                            <PencilIcon className="w-4 h-4" />
                          </Link>
                          <button 
                            onClick={() => handleDeleteUserProject(project._id)}
                            className="text-red-600 hover:text-red-700 p-1"
                            title="Delete Project"
                          >
                            <TrashIcon className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                      
                      <p className="text-secondary-600 text-sm mb-3 line-clamp-2">{project.description}</p>
                      
                      {project.skillsNeeded && project.skillsNeeded.length > 0 && (
                        <div className="flex flex-wrap gap-1 mb-3">
                          {project.skillsNeeded.slice(0, 5).map((skill, index) => (
                            <span key={index} className="badge badge-secondary">
                              {skill}
                            </span>
                          ))}
                          {project.skillsNeeded.length > 5 && (
                            <span className="badge badge-outline">
                              +{project.skillsNeeded.length - 5} more
                            </span>
                          )}
                        </div>
                      )}
                      
                      <div className="flex items-center justify-between text-sm text-secondary-500">
                        <div className="flex items-center gap-4">
                          <span>{project.members?.length || 0}/{project.maxMembers} members</span>
                          <span>{project.likes?.length || 0} likes</span>
                          <span>{project.views || 0} views</span>
                          {project.joinRequests && project.joinRequests.filter(req => req.status === 'Pending').length > 0 && (
                            <span className="text-orange-600 font-medium">
                              {project.joinRequests.filter(req => req.status === 'Pending').length} pending requests
                            </span>
                          )}
                        </div>
                        <span>{new Date(project.createdAt).toLocaleDateString()}</span>
                      </div>
                      
                      {project.repository?.url && (
                        <div className="mt-3 pt-3 border-t border-secondary-200">
                          <a 
                            href={project.repository.url}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="text-primary-600 hover:text-primary-700 text-sm font-medium"
                          >
                            📂 View Repository
                          </a>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Achievements Section */}
            <div className="card p-6">
              <h3 className="text-xl font-semibold text-secondary-900 mb-6">Achievements</h3>
              
              <div className="space-y-4">
                {achievements.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500">No achievements yet. Keep participating in challenges!</p>
                  </div>
                ) : (
                  achievements.map((achievement) => (
                    <div key={achievement.id} className="flex items-start space-x-3 p-3 bg-secondary-50 rounded-lg">
                      <div className="flex-shrink-0 w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                        <span className="text-yellow-600 text-sm">🏆</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="font-semibold text-secondary-900">{achievement.title}</h4>
                        <p className="text-secondary-600 text-sm">{achievement.description}</p>
                        <div className="flex items-center space-x-2 mt-1">
                          <span className="badge badge-secondary badge-sm">{achievement.type}</span>
                          <span className="text-xs text-secondary-500">{achievement.date}</span>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Problems Posted Section */}
            <div className="card p-6">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-semibold text-secondary-900">Problems Posted</h3>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      console.log('Debug - Current user:', user);
                      console.log('Debug - Problems posted:', problemsPosted);
                      console.log('Debug - Loading state:', loadingProblems);
                      forceRefreshProblems();
                    }}
                    className="btn btn-outline btn-sm text-xs"
                    title="Debug and refresh problems"
                  >
                    🐛 Debug
                  </button>
                  <Link 
                    to="/problems/create"
                    className="btn btn-outline btn-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Post New Problem
                  </Link>
                  <button
                    onClick={forceRefreshProblems}
                    className="btn btn-outline btn-sm"
                    disabled={loadingProblems}
                  >
                    {loadingProblems ? 'Refreshing...' : 'Force Refresh'}
                  </button>
                </div>
              </div>

              {/* Edit Problem Modal */}
              {editingProblem && (
                <div className="mb-6 p-4 border border-primary-200 rounded-lg bg-primary-50">
                  <h4 className="font-semibold text-secondary-900 mb-3">Edit Problem</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      name="title"
                      value={editingProblem.title}
                      onChange={handleProblemInputChange}
                      className="input"
                      placeholder="Problem Title"
                    />
                    <textarea
                      name="description"
                      value={editingProblem.description}
                      onChange={handleProblemInputChange}
                      rows={4}
                      className="input"
                      placeholder="Problem Description"
                    />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <select
                        name="category"
                        value={editingProblem.category}
                        onChange={handleProblemInputChange}
                        className="input"
                      >
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
                      <select
                        name="difficulty"
                        value={editingProblem.difficulty}
                        onChange={handleProblemInputChange}
                        className="input"
                      >
                        <option value="Beginner">Beginner</option>
                        <option value="Intermediate">Intermediate</option>
                        <option value="Advanced">Advanced</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <input
                        type="text"
                        name="skillsNeeded"
                        value={editingProblem.skillsNeeded}
                        onChange={handleProblemInputChange}
                        className="input"
                        placeholder="Skills needed (comma-separated)"
                      />
                      <select
                        name="estimatedTime"
                        value={editingProblem.estimatedTime}
                        onChange={handleProblemInputChange}
                        className="input"
                      >
                        <option value="1-2 hours">1-2 hours</option>
                        <option value="1-3 days">1-3 days</option>
                        <option value="1-2 weeks">1-2 weeks</option>
                        <option value="1+ months">1+ months</option>
                      </select>
                    </div>
                    <input
                      type="text"
                      name="tags"
                      value={editingProblem.tags}
                      onChange={handleProblemInputChange}
                      className="input"
                      placeholder="Tags (comma-separated)"
                    />
                  </div>
                  <div className="flex space-x-2 mt-4">
                    <button
                      onClick={handleUpdateProblem}
                      className="btn btn-primary btn-sm"
                    >
                      Update Problem
                    </button>
                    <button
                      onClick={() => setEditingProblem(null)}
                      className="btn btn-outline btn-sm"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* Problems List */}
              {loadingProblems ? (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto mb-2"></div>
                  <p className="text-secondary-600">Loading your problems...</p>
                </div>
              ) : problemsPosted.length === 0 ? (
                <div className="text-center py-8">
                  <div className="mb-4">
                    <p className="text-gray-500 mb-2">No problems posted yet.</p>
                    <p className="text-sm text-gray-400">
                      Problems you post will appear here. Start by sharing a real-world challenge that needs solving!
                    </p>
                  </div>
                  <Link 
                    to="/problems/create"
                    className="btn btn-primary btn-sm"
                  >
                    <PlusIcon className="w-4 h-4 mr-2" />
                    Post Your First Problem
                  </Link>
                  {user && (
                    <div className="mt-4 text-xs text-gray-400">
                      <p>User ID: {user.id || user._id || 'Not available'}</p>
                      <p>Email: {user.email}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="space-y-4">
                  {problemsPosted.map((problem) => (
                    <div key={problem._id} className="border border-secondary-200 rounded-lg p-4 relative">
                      {/* Action Buttons */}
                      <div className="absolute top-4 right-4 flex space-x-2">
                        {problem.status !== 'Completed' && (
                          <button
                            onClick={() => {
                              handleCompleteProblem(problem);
                            }}
                            className="p-1 text-green-500 hover:text-green-700"
                            title="Mark as completed"
                          >
                            <CheckCircleIcon className="w-4 h-4" />
                          </button>
                        )}
                        <button
                          onClick={() => handleEditProblem(problem)}
                          className="p-1 text-blue-500 hover:text-blue-700"
                          title="Edit problem"
                        >
                          <PencilIcon className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteProblem(problem._id, problem.title)}
                          className="p-1 text-red-500 hover:text-red-700"
                          title="Delete problem"
                        >
                          <TrashIcon className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Problem Content */}
                      <div className="pr-16">
                        <div className="flex items-center space-x-3 mb-3">
                          <Link 
                            to={`/problems/${problem._id}`}
                            className="text-lg font-semibold text-secondary-900 hover:text-primary-600"
                          >
                            {problem.title}
                          </Link>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(problem.difficulty)}`}>
                            {problem.difficulty}
                          </span>
                          <span className="badge badge-primary badge-sm">{problem.category}</span>
                          {problem.status === 'Completed' && (
                            <span className="px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                              ✅ Completed
                            </span>
                          )}
                        </div>
                        
                        <p className="text-secondary-600 text-sm mb-3 line-clamp-2">
                          {problem.description}
                        </p>
                        
                        {/* Skills */}
                        {problem.skillsNeeded && problem.skillsNeeded.length > 0 && (
                          <div className="flex flex-wrap gap-1 mb-3">
                            {problem.skillsNeeded.slice(0, 4).map((skill, index) => (
                              <span key={index} className="badge badge-secondary badge-sm">
                                {skill}
                              </span>
                            ))}
                            {problem.skillsNeeded.length > 4 && (
                              <span className="badge badge-outline badge-sm">
                                +{problem.skillsNeeded.length - 4} more
                              </span>
                            )}
                          </div>
                        )}
                        
                        {/* Stats */}
                        <div className="flex justify-between items-center text-sm text-secondary-500">
                          <div className="flex space-x-4">
                            <span>{problem.supporters?.length || 0} supporters</span>
                            <span>{problem.views || 0} views</span>
                            <span>{problem.estimatedTime}</span>
                          </div>
                          <div className="flex space-x-2">
                            <span className="text-xs">
                              {new Date(problem.createdAt).toLocaleDateString()}
                            </span>
                            <Link 
                              to={`/problems/${problem._id}`}
                              className="text-primary-600 hover:text-primary-700 text-xs"
                            >
                              View Details →
                            </Link>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Collaborations Section */}
            <Collaborations userId={user?.id || user?._id} />

            {/* Project Teams Section */}
            <ProjectTeams userId={user?.id || user?._id} />

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="card p-6 text-center">
                <div className="text-2xl font-bold text-secondary-900">{problemsPosted.length}</div>
                <div className="text-secondary-600">Problems Posted</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-2xl font-bold text-secondary-900">{problemsPosted.filter(p => p.status === 'Completed').length}</div>
                <div className="text-secondary-600">Completed</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-2xl font-bold text-secondary-900">{collaborations.length}</div>
                <div className="text-secondary-600">Collaborations</div>
              </div>
              <div className="card p-6 text-center">
                <div className="text-2xl font-bold text-secondary-900">{achievements.length}</div>
                <div className="text-secondary-600">Achievements</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Complete Project Modal */}
      <CompleteProjectModal
        isOpen={showCompleteModal && !!completingProblem}
        problem={completingProblem}
        onClose={closeCompleteModal}
        onComplete={handleCompleteSubmit}
      />

      {/* Team View Modal */}
      {showTeamModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-xl font-semibold text-secondary-900">
                Team Members - {selectedProject.title}
              </h3>
              <button
                onClick={closeTeamModal}
                className="text-secondary-400 hover:text-secondary-600"
              >
                ✕
              </button>
            </div>
            
            <div className="space-y-4">
              {/* Project Owner */}
              <div className="border border-secondary-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-semibold">
                      {selectedProject.owner?.name?.charAt(0) || 'O'}
                    </div>
                    <div>
                      <h4 className="font-medium text-secondary-900">{selectedProject.owner?.name}</h4>
                      <p className="text-sm text-secondary-600">{selectedProject.owner?.email}</p>
                    </div>
                  </div>
                  <span className="px-3 py-1 bg-primary-100 text-primary-800 rounded-full text-sm font-medium">
                    Owner
                  </span>
                </div>
              </div>

              {/* Team Members */}
              {selectedProject.members && selectedProject.members.length > 0 ? (
                selectedProject.members.map((member, index) => (
                  <div key={index} className="border border-secondary-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-secondary-600 rounded-full flex items-center justify-center text-white font-semibold">
                          {member.user?.name?.charAt(0) || 'M'}
                        </div>
                        <div>
                          <h4 className="font-medium text-secondary-900">{member.user?.name}</h4>
                          <p className="text-sm text-secondary-600">{member.user?.email}</p>
                          {member.skills && member.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-1">
                              {member.skills.slice(0, 3).map((skill, skillIndex) => (
                                <span key={skillIndex} className="badge badge-secondary text-xs">
                                  {skill}
                                </span>
                              ))}
                              {member.skills.length > 3 && (
                                <span className="text-xs text-secondary-500">+{member.skills.length - 3} more</span>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                      <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                        {member.role || 'Member'}
                      </span>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-8">
                  <UserGroupIcon className="mx-auto h-12 w-12 text-secondary-400 mb-4" />
                  <p className="text-secondary-600">No team members yet. Invite collaborators to join!</p>
                </div>
              )}

              {/* Stats */}
              <div className="bg-secondary-50 rounded-lg p-4 mt-6">
                <div className="grid grid-cols-2 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-secondary-900">
                      {(selectedProject.members?.length || 0) + 1}
                    </div>
                    <div className="text-sm text-secondary-600">Total Members</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-secondary-900">
                      {selectedProject.maxMembers || 10}
                    </div>
                    <div className="text-sm text-secondary-600">Max Members</div>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <button onClick={closeTeamModal} className="btn btn-secondary">
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Group Chat Modal - Matching ProjectTeams Design */}
      {showChatModal && selectedProject && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl h-[700px] flex flex-col">
            {/* Enhanced Chat Header */}
            <div className="flex items-center justify-between p-6 border-b border-secondary-200 bg-gradient-to-r from-primary-50 to-primary-100">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-primary-600 rounded-xl flex items-center justify-center">
                  <ChatBubbleLeftRightIcon className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-secondary-900">
                    {selectedProject.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-secondary-600">
                    <span>Team Chat</span>
                    <span>•</span>
                    <span>{(selectedProject.members?.length || 0) + 1} members</span>
                    <span>•</span>
                    <span className="px-2 py-0.5 rounded-full text-xs bg-green-100 text-green-800">
                      {selectedProject.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChatModal}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-secondary-500" />
              </button>
            </div>

            {/* Enhanced Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
              {loadingChat ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600"></div>
                  </div>
                  <p className="text-secondary-600">Loading messages...</p>
                </div>
              ) : chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-secondary-400" />
                  </div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-2">Welcome to team chat!</h4>
                  <p className="text-secondary-500 mb-4">Share ideas, code snippets, and collaborate on your project</p>
                  <div className="text-sm text-secondary-400 space-y-1">
                    <p>💡 <strong>Tips:</strong></p>
                    <p>• Use ```code``` for code blocks</p>
                    <p>• Use `inline code` for inline code</p>
                    <p>• Share links and they'll be formatted automatically</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatMessages.map((message, index) => {
                    // Handle different possible message structures
                    const messageAuthor = message.author || message.sender || {};
                    const messageContent = message.content || message.message || '';
                    const isOwnMessage = messageAuthor._id === user._id || messageAuthor._id === user.id || messageAuthor.id === user._id || messageAuthor.id === user.id;
                    
                    return (
                      <div key={message._id || message.id || index} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                        <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-3xl`}>
                          {/* Avatar */}
                          <img
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            src={messageAuthor.avatar || `https://ui-avatars.com/api/?name=${messageAuthor.name || 'User'}&background=6366f1&color=fff`}
                            alt={messageAuthor.name || 'User'}
                          />
                          
                          {/* Message Content */}
                          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            {/* Message Header */}
                            <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                              <span className="text-sm font-medium text-secondary-900">
                                {messageAuthor.name || 'User'}
                              </span>
                              <span className="text-xs text-secondary-500">
                                {new Date(message.createdAt || message.timestamp || new Date()).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit'
                                })}
                              </span>
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white text-secondary-900 border border-secondary-200 rounded-bl-md'
                            }`}>
                              <div className="text-sm leading-relaxed whitespace-pre-wrap">
                                {messageContent}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                  <div ref={messagesEndRef} />
                </div>
              )}
            </div>

            {/* Enhanced Message Input */}
            <div className="p-6 border-t border-secondary-200 bg-white">
              <div className="flex items-end space-x-4">
                {/* Input Area */}
                <div className="flex-1 relative">
                  <textarea
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => {
                      if (e.key === 'Enter' && !e.shiftKey) {
                        e.preventDefault();
                        handleSendMessage();
                      }
                    }}
                    placeholder="Type your message... Use ```code``` for code blocks"
                    className="w-full px-4 py-3 pr-20 border border-secondary-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none text-sm leading-relaxed"
                    rows="3"
                    style={{ minHeight: '60px', maxHeight: '120px' }}
                  />
                  
                  {/* Input Tools */}
                  <div className="absolute right-2 bottom-2 flex items-center space-x-1">
                    <button
                      type="button"
                      className="p-1.5 text-secondary-400 hover:text-secondary-600 transition-colors"
                      title="Code formatting guide"
                      onClick={() => {
                        const codeExample = "```javascript\nconst example = 'Hello World';\nconsole.log(example);\n```";
                        setNewMessage(newMessage + (newMessage ? '\n\n' : '') + codeExample);
                      }}
                    >
                      <CodeBracketIcon className="w-5 h-5" />
                    </button>
                    <button
                      type="button"
                      className="p-1.5 text-secondary-400 hover:text-secondary-600 transition-colors"
                      title="Add link"
                      onClick={() => {
                        const link = prompt("Enter URL:");
                        if (link) {
                          setNewMessage(newMessage + (newMessage ? ' ' : '') + link);
                        }
                      }}
                    >
                      <LinkIcon className="w-5 h-5" />
                    </button>
                  </div>
                </div>
                
                {/* Send Button */}
                <button
                  onClick={handleSendMessage}
                  disabled={!newMessage.trim()}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  <PaperAirplaneIcon className="w-5 h-5" />
                  <span className="text-sm font-medium">Send</span>
                </button>
              </div>
              
              {/* Quick Tips */}
              <div className="mt-3 text-xs text-secondary-500">
                <span className="font-medium">Quick tips:</span> Use ```code``` for code blocks, `inline` for inline code, Shift+Enter for new line
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;
