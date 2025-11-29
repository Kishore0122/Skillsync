import React, { useState, useEffect, useRef } from 'react';
import {
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  CalendarIcon,
  ClockIcon,
  TagIcon,
  UserIcon,
  PaperAirplaneIcon,
  EyeIcon,
  XMarkIcon,
  DocumentDuplicateIcon,
  LinkIcon,
  CodeBracketIcon,
  PhotoIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { useAuth } from '../../contexts/AuthContext';
import socketService from '../../services/socketService';

const Collaborations = ({ userId }) => {
  const { user } = useAuth();
  const [collaborations, setCollaborations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedChat, setSelectedChat] = useState(null);
  const [chatMessages, setChatMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [sendingMessage, setSendingMessage] = useState(false);
  const [copiedText, setCopiedText] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const messagesEndRef = useRef(null);

  useEffect(() => {
    fetchCollaborations();
    
    // Connect to socket service
    socketService.connect();
    
    return () => {
      // Clean up socket listeners when component unmounts
      socketService.offNewCollaborationMessage();
      // Note: selectedChat in cleanup will refer to the value when effect was created,
      // so we rely on closeChat() to handle room leaving when user closes chat
    };
  }, [userId]);

  // Scroll to bottom when new messages arrive
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const fetchCollaborations = async () => {
    try {
      const response = await axios.get(`/api/users/${userId}/collaborations`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      setCollaborations(response.data.collaborations);
    } catch (error) {
      console.error('Error fetching collaborations:', error);
      setCollaborations([]);
    } finally {
      setLoading(false);
    }
  };

  const openChat = async (collaboration) => {
    console.log('🔓 Opening collaboration chat:', collaboration._id);
    
    try {
      setSelectedChat(collaboration);
      const response = await axios.get(`/api/collaborations/${collaboration._id}/messages`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('📥 Loaded messages:', response.data.messages?.length || 0);
      setChatMessages(response.data.messages);
      
      // Join the collaboration room for real-time updates
      console.log('🏠 Joining collaboration room:', collaboration._id);
      socketService.joinCollaboration(collaboration._id);
      
      // Set up real-time message listener
      socketService.onNewCollaborationMessage((data) => {
        console.log('📨 New collaboration message received:', data);
        
        // Validate data structure (should match backend emission structure)
        if (!data || !data.collaborationId || !data.message) {
          console.warn('⚠️ Invalid collaboration message data:', data);
          return;
        }
        
        // Only add message if it's for the current collaboration
        if (data.collaborationId === collaboration._id) {
          console.log('✅ Adding message to chat:', data.message);
          setChatMessages(prevMessages => {
            // Check if message already exists to prevent duplicates
            const messageExists = prevMessages.some(msg => msg._id === data.message._id);
            if (!messageExists) {
              return [...prevMessages, data.message];
            }
            return prevMessages;
          });
        } else {
          console.log('🚫 Message not for current collaboration:', {
            received: data.collaborationId,
            current: collaboration._id
          });
        }
      });
      
    } catch (error) {
      console.error('❌ Error fetching chat messages:', error);
      setChatMessages([]);
    }
  };

  const closeChat = () => {
    console.log('🔒 Closing collaboration chat');
    
    if (selectedChat) {
      console.log('🚪 Leaving collaboration room:', selectedChat._id);
      // Leave the collaboration room
      socketService.leaveCollaboration(selectedChat._id);
      // Remove collaboration message listeners
      socketService.offNewCollaborationMessage();
    }
    setSelectedChat(null);
    setChatMessages([]);
    setNewMessage('');
  };

  // Utility functions
  const getDifficultyColor = (difficulty) => {
    switch (difficulty) {
      case 'Beginner':
        return 'bg-green-100 text-green-800';
      case 'Intermediate':
        return 'bg-yellow-100 text-yellow-800';
      case 'Advanced':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'Planning':
        return 'bg-blue-100 text-blue-800';
      case 'Active':
        return 'bg-green-100 text-green-800';
      case 'On Hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'Completed':
        return 'bg-purple-100 text-purple-800';
      case 'Cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-secondary-100 text-secondary-800';
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    return new Date(dateString).toLocaleDateString();
  };

  const sendMessage = async () => {
    if (!newMessage.trim() || sendingMessage) return;

    console.log('🚀 Sending collaboration message:', {
      collaborationId: selectedChat._id,
      message: newMessage.trim()
    });

    try {
      setSendingMessage(true);
      const response = await axios.post(`/api/collaborations/${selectedChat._id}/messages`, {
        message: newMessage.trim()
      }, {
        headers: { Authorization: `Bearer ${localStorage.getItem('token')}` }
      });
      
      console.log('✅ Message sent successfully:', response.data);
      
      // Don't add to local state - Socket.IO will handle the real-time update
      setNewMessage('');
    } catch (error) {
      console.error('❌ Error sending message:', error);
      console.error('Error details:', error.response?.data);
      alert('Failed to send message. Please try again.');
    } finally {
      setSendingMessage(false);
    }
  };

  // Utility functions for message formatting
  const copyToClipboard = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedText(text);
      setTimeout(() => setCopiedText(''), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const formatMessageContent = (content) => {
    // Safety check for content
    if (!content || typeof content !== 'string') {
      return [{
        type: 'text',
        content: content || '[Empty message]',
        id: 'fallback-text'
      }];
    }
    
    // Split message into parts (code blocks, links, regular text)
    const parts = [];
    let currentIndex = 0;
    
    // Regex patterns
    const codeBlockRegex = /```([\s\S]*?)```/g;
    const inlineCodeRegex = /`([^`]+)`/g;
    const urlRegex = /(https?:\/\/[^\s]+)/g;
    
    // First, find code blocks
    let match;
    const codeBlocks = [];
    while ((match = codeBlockRegex.exec(content)) !== null) {
      codeBlocks.push({
        type: 'codeBlock',
        content: match[1].trim(),
        start: match.index,
        end: match.index + match[0].length,
        fullMatch: match[0]
      });
    }
    
    // Then find inline code
    const inlineCodes = [];
    while ((match = inlineCodeRegex.exec(content)) !== null) {
      // Skip if it's inside a code block
      const insideCodeBlock = codeBlocks.some(cb => match.index >= cb.start && match.index < cb.end);
      if (!insideCodeBlock) {
        inlineCodes.push({
          type: 'inlineCode',
          content: match[1],
          start: match.index,
          end: match.index + match[0].length,
          fullMatch: match[0]
        });
      }
    }
    
    // Find URLs
    const urls = [];
    while ((match = urlRegex.exec(content)) !== null) {
      // Skip if it's inside a code block or inline code
      const insideCode = [...codeBlocks, ...inlineCodes].some(c => match.index >= c.start && match.index < c.end);
      if (!insideCode) {
        urls.push({
          type: 'url',
          content: match[1],
          start: match.index,
          end: match.index + match[0].length,
          fullMatch: match[0]
        });
      }
    }
    
    // Combine and sort all special elements
    const allElements = [...codeBlocks, ...inlineCodes, ...urls].sort((a, b) => a.start - b.start);
    
    // Build the final parts array
    let lastIndex = 0;
    allElements.forEach((element, index) => {
      // Add text before this element
      if (element.start > lastIndex) {
        const textContent = content.slice(lastIndex, element.start);
        if (textContent.trim()) {
          parts.push({
            type: 'text',
            content: textContent,
            id: `text-${index}-${lastIndex}`
          });
        }
      }
      
      // Add the special element
      parts.push({
        ...element,
        id: `${element.type}-${index}-${element.start}`
      });
      
      lastIndex = element.end;
    });
    
    // Add remaining text
    if (lastIndex < content.length) {
      const textContent = content.slice(lastIndex);
      if (textContent.trim()) {
        parts.push({
          type: 'text',
          content: textContent,
          id: `text-final-${lastIndex}`
        });
      }
    }
    
    // If no special elements found, return the original content as text
    if (parts.length === 0) {
      parts.push({
        type: 'text',
        content: content,
        id: 'text-only'
      });
    }
    
    return parts;
  };

  const renderMessagePart = (part, isOwnMessage) => {
    const baseClasses = isOwnMessage ? 'text-white' : 'text-secondary-900';
    
    switch (part.type) {
      case 'codeBlock':
        return (
          <div key={part.id} className="my-2">
            <div className={`relative rounded-lg p-3 font-mono text-sm ${
              isOwnMessage ? 'bg-primary-700' : 'bg-secondary-200'
            }`}>
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center space-x-2">
                  <CodeBracketIcon className={`w-4 h-4 ${baseClasses}`} />
                  <span className={`text-xs font-medium ${baseClasses}`}>Code Block</span>
                </div>
                <button
                  onClick={() => copyToClipboard(part.content)}
                  className={`p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors ${baseClasses}`}
                  title="Copy code"
                >
                  {copiedText === part.content ? (
                    <span className="text-xs">Copied!</span>
                  ) : (
                    <DocumentDuplicateIcon className="w-4 h-4" />
                  )}
                </button>
              </div>
              <pre className={`whitespace-pre-wrap overflow-x-auto ${baseClasses}`}>
                {part.content}
              </pre>
            </div>
          </div>
        );
        
      case 'inlineCode':
        return (
          <span key={part.id} className="relative group">
            <code className={`px-2 py-1 rounded text-sm font-mono ${
              isOwnMessage ? 'bg-primary-700 text-white' : 'bg-secondary-200 text-secondary-900'
            }`}>
              {part.content}
            </code>
            <button
              onClick={() => copyToClipboard(part.content)}
              className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-secondary-800 text-white px-2 py-1 rounded text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              title="Copy"
            >
              Copy
            </button>
          </span>
        );
        
      case 'url':
        return (
          <div key={part.id} className="my-1">
            <div className={`inline-flex items-center space-x-2 p-2 rounded-lg border ${
              isOwnMessage 
                ? 'border-primary-300 bg-primary-600' 
                : 'border-secondary-300 bg-secondary-50'
            }`}>
              <LinkIcon className={`w-4 h-4 ${baseClasses}`} />
              <a
                href={part.content}
                target="_blank"
                rel="noopener noreferrer"
                className={`text-sm underline hover:no-underline ${baseClasses}`}
              >
                {part.content.length > 50 ? `${part.content.substring(0, 50)}...` : part.content}
              </a>
              <button
                onClick={() => copyToClipboard(part.content)}
                className={`p-1 rounded hover:bg-opacity-20 hover:bg-white transition-colors ${baseClasses}`}
                title="Copy link"
              >
                {copiedText === part.content ? (
                  <span className="text-xs">Copied!</span>
                ) : (
                  <DocumentDuplicateIcon className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>
        );
        
      case 'text':
      default:
        return (
          <span key={part.id} className={`whitespace-pre-wrap ${baseClasses}`}>
            {part.content}
          </span>
        );
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="animate-pulse">
          <div className="h-6 bg-secondary-200 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((item) => (
              <div key={item} className="border border-secondary-200 rounded-lg p-4">
                <div className="h-4 bg-secondary-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-secondary-200 rounded w-1/4"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-secondary-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-secondary-900 flex items-center">
            <UserGroupIcon className="w-5 h-5 mr-2 text-primary-600" />
            Active Collaborations
          </h3>
          <span className="text-sm text-secondary-500">
            {collaborations.length} {collaborations.length === 1 ? 'project' : 'projects'}
          </span>
        </div>

        {collaborations.length === 0 ? (
          <div className="text-center py-8">
            <UserGroupIcon className="w-12 h-12 text-secondary-400 mx-auto mb-4" />
            <p className="text-secondary-500 mb-2">No active collaborations</p>
            <p className="text-sm text-secondary-400">
              Start collaborating on projects to see them here
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {collaborations.map((collaboration) => (
              <div
                key={collaboration._id}
                className="border border-secondary-200 rounded-lg p-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <Link
                      to={`/problems/${collaboration.problem._id}`}
                      className="text-lg font-medium text-secondary-900 hover:text-primary-600 transition-colors"
                    >
                      {collaboration.problem.title}
                    </Link>
                    <p className="text-sm text-secondary-600 mt-1 line-clamp-2">
                      {collaboration.problem.description}
                    </p>
                  </div>
                  <div className="flex items-center space-x-2 ml-4">
                    <button
                      onClick={() => openChat(collaboration)}
                      className="btn btn-ghost btn-sm"
                      title="Open team chat"
                    >
                      <ChatBubbleLeftRightIcon className="w-4 h-4" />
                    </button>
                    <Link
                      to={`/problems/${collaboration.problem._id}`}
                      className="btn btn-ghost btn-sm"
                      title="View problem"
                    >
                      <EyeIcon className="w-4 h-4" />
                    </Link>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(collaboration.problem.difficulty)}`}>
                    {collaboration.problem.difficulty}
                  </span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(collaboration.problem.status)}`}>
                    {collaboration.problem.status}
                  </span>
                  <span className="px-2 py-1 bg-secondary-100 text-secondary-700 rounded-full text-xs font-medium">
                    <TagIcon className="w-3 h-3 inline mr-1" />
                    {collaboration.problem.category}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex items-center text-sm text-secondary-600">
                      <CalendarIcon className="w-4 h-4 mr-1" />
                      {collaboration.isOwner ? 'Created' : 'Joined'} {formatDate(collaboration.joinedAt)}
                    </div>
                    <div className="flex items-center text-sm text-secondary-600">
                      <UserIcon className="w-4 h-4 mr-1" />
                      Role: <span className={collaboration.isOwner ? 'font-semibold text-primary-600' : ''}>{collaboration.role}</span>
                      {collaboration.isOwner && (
                        <span className="ml-1 px-2 py-0.5 bg-primary-100 text-primary-700 rounded-full text-xs font-medium">
                          Owner
                        </span>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <span className="text-sm text-secondary-500 mr-2">Team:</span>
                    <div className="flex -space-x-2">
                      {/* Problem author */}
                      <img
                        className="w-8 h-8 rounded-full border-2 border-white"
                        src={collaboration.problem.author.avatar || `https://ui-avatars.com/api/?name=${collaboration.problem.author.name}&background=6366f1&color=fff`}
                        alt={collaboration.problem.author.name}
                        title={`${collaboration.problem.author.name} (Author)`}
                      />
                      {/* Other collaborators */}
                      {collaboration.problem.collaborators.slice(0, 3).map((collab) => (
                        <img
                          key={collab.user._id}
                          className="w-8 h-8 rounded-full border-2 border-white"
                          src={collab.user.avatar || `https://ui-avatars.com/api/?name=${collab.user.name}&background=6366f1&color=fff`}
                          alt={collab.user.name}
                          title={collab.user.name}
                        />
                      ))}
                      {collaboration.problem.collaborators.length > 3 && (
                        <div className="w-8 h-8 rounded-full border-2 border-white bg-secondary-200 flex items-center justify-center">
                          <span className="text-xs font-medium text-secondary-600">
                            +{collaboration.problem.collaborators.length - 3}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Chat Modal */}
      {selectedChat && (
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
                    {selectedChat.problem.title}
                  </h3>
                  <div className="flex items-center space-x-3 text-sm text-secondary-600">
                    <span>Team Chat</span>
                    <span>•</span>
                    <span>{selectedChat.problem.collaborators.length + 1} members</span>
                    <span>•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(selectedChat.problem.status)}`}>
                      {selectedChat.problem.status}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={closeChat}
                className="p-2 hover:bg-white hover:bg-opacity-20 rounded-lg transition-colors"
              >
                <XMarkIcon className="w-6 h-6 text-secondary-500" />
              </button>
            </div>

            {/* Enhanced Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 bg-gradient-to-b from-gray-50 to-white">
              {chatMessages.length === 0 ? (
                <div className="text-center py-12">
                  <div className="w-20 h-20 bg-secondary-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <ChatBubbleLeftRightIcon className="w-10 h-10 text-secondary-400" />
                  </div>
                  <h4 className="text-lg font-medium text-secondary-900 mb-2">Welcome to team chat!</h4>
                  <p className="text-secondary-500 mb-4">Share ideas, code snippets, and collaborate effectively</p>
                  <div className="text-sm text-secondary-400 space-y-1">
                    <p>💡 <strong>Tips:</strong></p>
                    <p>• Use ```code``` for code blocks</p>
                    <p>• Use `inline code` for inline code</p>
                    <p>• Share links and they'll be formatted automatically</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {chatMessages.map((message) => {
                    // Safety check for message structure
                    if (!message || !message.sender || !message.content) {
                      return null;
                    }
                    
                    const isOwnMessage = message.sender._id === user._id;
                    const messageParts = formatMessageContent(message.content);
                    const senderName = message.sender.name || 'Unknown User';
                    
                    return (
                      <div
                        key={message._id || `message-${Date.now()}`}
                        className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}
                      >
                        <div className={`flex ${isOwnMessage ? 'flex-row-reverse' : 'flex-row'} items-start space-x-3 max-w-3xl`}>
                          {/* Avatar */}
                          <img
                            className="w-10 h-10 rounded-full border-2 border-white shadow-sm flex-shrink-0"
                            src={message.sender.avatar || `https://ui-avatars.com/api/?name=${encodeURIComponent(senderName)}&background=6366f1&color=fff`}
                            alt={senderName}
                          />
                          
                          {/* Message Content */}
                          <div className={`flex flex-col ${isOwnMessage ? 'items-end' : 'items-start'}`}>
                            {/* Message Header */}
                            <div className={`flex items-center space-x-2 mb-1 ${isOwnMessage ? 'flex-row-reverse space-x-reverse' : 'flex-row'}`}>
                              <span className="text-sm font-medium text-secondary-900">
                                {senderName}
                              </span>
                              <span className="text-xs text-secondary-500">
                                {message.createdAt ? formatTime(message.createdAt) : 'Just now'}
                              </span>
                            </div>
                            
                            {/* Message Bubble */}
                            <div className={`relative px-4 py-3 rounded-2xl shadow-sm ${
                              isOwnMessage
                                ? 'bg-primary-600 text-white rounded-br-md'
                                : 'bg-white text-secondary-900 border border-secondary-200 rounded-bl-md'
                            }`}>
                              <div className="text-sm leading-relaxed">
                                {messageParts.map((part) => renderMessagePart(part, isOwnMessage))}
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
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
                    onKeyPress={handleKeyPress}
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
                  onClick={sendMessage}
                  disabled={!newMessage.trim() || sendingMessage}
                  className="px-6 py-3 bg-primary-600 text-white rounded-xl hover:bg-primary-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 flex items-center space-x-2 shadow-lg hover:shadow-xl"
                >
                  {sendingMessage ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-sm font-medium">Sending...</span>
                    </>
                  ) : (
                    <>
                      <PaperAirplaneIcon className="w-5 h-5" />
                      <span className="text-sm font-medium">Send</span>
                    </>
                  )}
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
    </>
  );
};

export default Collaborations;
