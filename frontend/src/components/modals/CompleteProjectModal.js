import React, { useState } from 'react';
import {
  CheckCircleIcon,
  XMarkIcon,
  UserGroupIcon,
  ChatBubbleLeftEllipsisIcon,
  TrophyIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolidIcon } from '@heroicons/react/24/solid';

const CompleteProjectModal = ({ isOpen, onClose, problem, onComplete }) => {
  const [completionNotes, setCompletionNotes] = useState('');
  const [acknowledgedCollaborators, setAcknowledgedCollaborators] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleCollaboratorToggle = (collaboratorId) => {
    setAcknowledgedCollaborators(prev => 
      prev.includes(collaboratorId)
        ? prev.filter(id => id !== collaboratorId)
        : [...prev, collaboratorId]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    try {
      await onComplete({
        completionNotes,
        acknowledgedCollaborators
      });
      
      // Reset form
      setCompletionNotes('');
      setAcknowledgedCollaborators([]);
      onClose();
    } catch (error) {
      console.error('Error completing project:', error);
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen || !problem) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-secondary-200 bg-gradient-to-r from-green-50 to-emerald-50">
          <div className="flex items-center space-x-3">
            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
              <TrophyIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-semibold text-secondary-900">
                Mark Project as Completed
              </h2>
              <p className="text-sm text-secondary-600">
                Celebrate your achievement and acknowledge contributors
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
          >
            <XMarkIcon className="w-6 h-6 text-secondary-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Project Summary */}
          <div className="bg-secondary-50 rounded-lg p-4">
            <h3 className="font-medium text-secondary-900 mb-2">{problem.title}</h3>
            <p className="text-sm text-secondary-600 mb-3">{problem.description}</p>
            <div className="flex items-center space-x-4 text-sm text-secondary-500">
              <span>Category: {problem.category}</span>
              <span>•</span>
              <span>Difficulty: {problem.difficulty}</span>
              {problem.collaborators?.length > 0 && (
                <>
                  <span>•</span>
                  <span>{problem.collaborators.length} Collaborator{problem.collaborators.length !== 1 ? 's' : ''}</span>
                </>
              )}
            </div>
          </div>

          {/* Completion Notes */}
          <div>
            <label className="block text-sm font-medium text-secondary-700 mb-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 inline mr-1" />
              Completion Summary <span className="text-secondary-500">(Optional)</span>
            </label>
            <textarea
              value={completionNotes}
              onChange={(e) => setCompletionNotes(e.target.value)}
              placeholder="Share what was accomplished, key learnings, or final outcomes..."
              className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent resize-none"
              rows="4"
              maxLength="1000"
            />
            <p className="text-xs text-secondary-500 mt-1">
              {completionNotes.length}/1000 characters
            </p>
          </div>

          {/* Acknowledge Collaborators */}
          {problem.collaborators && problem.collaborators.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-secondary-700 mb-3">
                <UserGroupIcon className="w-4 h-4 inline mr-1" />
                Acknowledge Contributors
              </label>
              <p className="text-sm text-secondary-600 mb-4">
                Select collaborators who made significant contributions to receive reputation points.
              </p>
              
              <div className="space-y-3">
                {problem.collaborators.map((collaboration) => (
                  <div
                    key={collaboration.user._id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      acknowledgedCollaborators.includes(collaboration.user._id)
                        ? 'border-green-300 bg-green-50'
                        : 'border-secondary-200 hover:bg-secondary-50'
                    }`}
                    onClick={() => handleCollaboratorToggle(collaboration.user._id)}
                  >
                    <div className="flex items-center space-x-3">
                      <img
                        className="w-10 h-10 rounded-full border-2 border-white shadow-sm"
                        src={collaboration.user.avatar || `https://ui-avatars.com/api/?name=${collaboration.user.name}&background=6366f1&color=fff`}
                        alt={collaboration.user.name}
                      />
                      <div>
                        <p className="font-medium text-secondary-900">
                          {collaboration.user.name}
                        </p>
                        <p className="text-sm text-secondary-600">
                          {collaboration.role || 'Collaborator'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center">
                      {acknowledgedCollaborators.includes(collaboration.user._id) ? (
                        <CheckCircleSolidIcon className="w-6 h-6 text-green-600" />
                      ) : (
                        <CheckCircleIcon className="w-6 h-6 text-secondary-400" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              {acknowledgedCollaborators.length > 0 && (
                <div className="mt-3 p-3 bg-green-50 border border-green-200 rounded-lg">
                  <p className="text-sm text-green-800">
                    <TrophyIcon className="w-4 h-4 inline mr-1" />
                    {acknowledgedCollaborators.length} contributor{acknowledgedCollaborators.length !== 1 ? 's' : ''} will receive +10 reputation points
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Reputation Reward Info */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start space-x-3">
              <TrophyIcon className="w-5 h-5 text-blue-600 mt-0.5" />
              <div>
                <h4 className="font-medium text-blue-900 mb-1">Reputation Rewards</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                  <li>• You'll receive +15 reputation points for completing this project</li>
                  <li>• Acknowledged collaborators will receive +10 reputation points each</li>
                  <li>• Project contribution count will increase for all participants</li>
                </ul>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end space-x-4 pt-4 border-t border-secondary-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-secondary-300 text-secondary-700 rounded-lg hover:bg-secondary-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Completing...</span>
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  <span>Mark as Completed</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CompleteProjectModal;
