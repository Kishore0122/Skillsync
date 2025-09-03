import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const CreateChallenge = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    difficulty: '',
    prizeAmount: '',
    duration: '',
    technologies: '',
    requirements: '',
    judgingCriteria: '',
    submissionGuidelines: '',
    sponsorName: '',
    sponsorContact: ''
  });

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Creating challenge:', formData);
    // Here we would make an API call to create the challenge
    navigate('/challenges');
  };

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="card p-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-secondary-900">Host a New Challenge</h1>
            <p className="text-secondary-600 mt-2">
              Create an exciting coding challenge and discover talented developers
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Challenge Title */}
            <div>
              <label className="label">Challenge Title</label>
              <input
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                className="input"
                placeholder="Give your challenge an engaging title"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="label">Challenge Description</label>
              <textarea
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="Describe what participants need to build or solve"
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
                  <option value="Mobile Development">Mobile Development</option>
                  <option value="AI/ML">AI/ML</option>
                  <option value="Design">Design</option>
                  <option value="Data Science">Data Science</option>
                  <option value="Game Development">Game Development</option>
                  <option value="Algorithm">Algorithm</option>
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

            {/* Prize and Duration */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="label">Prize Amount (₹)</label>
                <input
                  type="number"
                  name="prizeAmount"
                  value={formData.prizeAmount}
                  onChange={handleChange}
                  className="input"
                  placeholder="10000"
                  min="0"
                  required
                />
              </div>

              <div>
                <label className="label">Challenge Duration</label>
                <select
                  name="duration"
                  value={formData.duration}
                  onChange={handleChange}
                  className="input"
                  required
                >
                  <option value="">Select duration</option>
                  <option value="3 days">3 days</option>
                  <option value="1 week">1 week</option>
                  <option value="2 weeks">2 weeks</option>
                  <option value="1 month">1 month</option>
                  <option value="2 months">2 months</option>
                </select>
              </div>
            </div>

            {/* Technologies */}
            <div>
              <label className="label">Technologies/Skills Required</label>
              <input
                type="text"
                name="technologies"
                value={formData.technologies}
                onChange={handleChange}
                className="input"
                placeholder="e.g., React, Node.js, Python, Machine Learning (comma-separated)"
                required
              />
              <p className="text-sm text-secondary-500 mt-1">
                List the main technologies participants should use
              </p>
            </div>

            {/* Requirements */}
            <div>
              <label className="label">Challenge Requirements</label>
              <textarea
                name="requirements"
                value={formData.requirements}
                onChange={handleChange}
                rows={4}
                className="input"
                placeholder="List specific requirements, features, or constraints for the solution"
                required
              />
            </div>

            {/* Judging Criteria */}
            <div>
              <label className="label">Judging Criteria</label>
              <textarea
                name="judgingCriteria"
                value={formData.judgingCriteria}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="How will submissions be evaluated? (e.g., functionality, code quality, creativity, UI/UX)"
                required
              />
            </div>

            {/* Submission Guidelines */}
            <div>
              <label className="label">Submission Guidelines</label>
              <textarea
                name="submissionGuidelines"
                value={formData.submissionGuidelines}
                onChange={handleChange}
                rows={3}
                className="input"
                placeholder="What should participants submit? (e.g., GitHub repo, live demo, documentation)"
                required
              />
            </div>

            {/* Sponsor Information */}
            <div className="border-t pt-6">
              <h3 className="text-lg font-semibold text-secondary-900 mb-4">Sponsor Information</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="label">Sponsor/Company Name</label>
                  <input
                    type="text"
                    name="sponsorName"
                    value={formData.sponsorName}
                    onChange={handleChange}
                    className="input"
                    placeholder="Your company or organization name"
                    required
                  />
                </div>

                <div>
                  <label className="label">Contact Email</label>
                  <input
                    type="email"
                    name="sponsorContact"
                    value={formData.sponsorContact}
                    onChange={handleChange}
                    className="input"
                    placeholder="contact@yourcompany.com"
                    required
                  />
                </div>
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex space-x-4 pt-6">
              <button
                type="submit"
                className="btn btn-primary flex-1"
              >
                Create Challenge
              </button>
              <button
                type="button"
                onClick={() => navigate('/challenges')}
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

export default CreateChallenge;
