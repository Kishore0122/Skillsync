import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { 
  ChartBarIcon, 
  PuzzlePieceIcon, 
  FolderIcon, 
  TrophyIcon,
  UserGroupIcon,
  StarIcon 
} from '@heroicons/react/24/outline';

const Dashboard = () => {
  const { user } = useAuth();

  const stats = [
    {
      label: 'Problems Created',
      value: '5',
      icon: PuzzlePieceIcon,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      label: 'Projects Joined',
      value: '12',
      icon: FolderIcon,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      label: 'Challenges Won',
      value: '3',
      icon: TrophyIcon,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      label: 'Collaborations',
      value: '8',
      icon: UserGroupIcon,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
  ];

  return (
    <div className="min-h-screen bg-secondary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-secondary-900">
            Welcome back, {user?.name}!
          </h1>
          <p className="text-secondary-600 mt-2">
            Here's what's happening with your collaborations today.
          </p>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div key={stat.label} className="card p-6">
                <div className="flex items-center">
                  <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                    <Icon className={`w-6 h-6 ${stat.color}`} />
                  </div>
                  <div className="ml-4">
                    <p className="text-sm font-medium text-secondary-600">{stat.label}</p>
                    <p className="text-2xl font-semibold text-secondary-900">{stat.value}</p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Recent Activity */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Recent Problems</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary-900">Build a learning platform</h3>
                  <p className="text-sm text-secondary-600">Technology • 5 supporters</p>
                </div>
                <span className="badge badge-success">Open</span>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary-900">Design system for startups</h3>
                  <p className="text-sm text-secondary-600">Design • 12 supporters</p>
                </div>
                <span className="badge badge-warning">In Progress</span>
              </div>
            </div>
          </div>

          <div className="card p-6">
            <h2 className="text-lg font-semibold text-secondary-900 mb-4">Active Projects</h2>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary-900">E-commerce Mobile App</h3>
                  <p className="text-sm text-secondary-600">React Native • 4 members</p>
                </div>
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-secondary-600">75%</span>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                <div>
                  <h3 className="font-medium text-secondary-900">AI Chatbot</h3>
                  <p className="text-sm text-secondary-600">Python • 3 members</p>
                </div>
                <div className="flex items-center">
                  <StarIcon className="w-4 h-4 text-yellow-500 mr-1" />
                  <span className="text-sm text-secondary-600">40%</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
