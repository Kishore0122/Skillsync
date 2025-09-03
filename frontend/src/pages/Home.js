import React from 'react';
import { Link } from 'react-router-dom';
import { 
  PuzzlePieceIcon, 
  FolderIcon, 
  TrophyIcon,
  UserGroupIcon,
  StarIcon,
  ArrowRightIcon,
  CheckIcon
} from '@heroicons/react/24/outline';
import { motion } from 'framer-motion';

const Home = () => {
  const features = [
    {
      icon: PuzzlePieceIcon,
      title: 'Problem Wall',
      description: 'Post real-world challenges and crowdsource solutions from the community.',
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      icon: FolderIcon,
      title: 'Build Rooms',
      description: 'Collaborate on projects with teams, track progress, and share updates.',
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
    {
      icon: TrophyIcon,
      title: 'Skill Challenges',
      description: 'Participate in weekly challenges to improve skills and build portfolio.',
      color: 'text-purple-600',
      bgColor: 'bg-purple-100',
    },
    {
      icon: UserGroupIcon,
      title: 'Collab Matching',
      description: 'AI-powered recommendations to find perfect collaboration partners.',
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
  ];

  const stats = [
    { label: 'Active Users', value: '10K+' },
    { label: 'Projects Created', value: '5K+' },
    { label: 'Problems Solved', value: '2K+' },
    { label: 'Skills Shared', value: '50K+' },
  ];

  const benefits = [
    'Build skill-based interactive profiles',
    'Discover real-time collaboration opportunities',
    'Join or create project teams',
    'Solve real-world problems',
    'Boost visibility through work, not just words',
    'Connect with India\'s creators and doers',
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-50 via-white to-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
          <div className="text-center">
            <motion.h1 
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-secondary-900 mb-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Show what you can do.{' '}
              <span className="text-gradient">Sync</span> with those who can help.
            </motion.h1>
            
            <motion.p 
              className="text-xl text-secondary-600 mb-8 max-w-3xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              SkillSync is India's first skill-first social networking platform designed to connect 
              individuals based on what they can do — not just what they claim to know.
            </motion.p>
            
            <motion.div 
              className="flex flex-col sm:flex-row gap-4 justify-center items-center"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              <Link
                to="/register"
                className="btn btn-primary btn-lg px-8 py-4 text-lg"
              >
                Get Started Free
                <ArrowRightIcon className="ml-2 w-5 h-5" />
              </Link>
              <Link
                to="/problems"
                className="btn btn-outline btn-lg px-8 py-4 text-lg"
              >
                Explore Problems
              </Link>
            </motion.div>
          </div>
        </div>

        {/* Decorative elements */}
        <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-primary-200 rounded-full opacity-20 blur-3xl"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-secondary-200 rounded-full opacity-20 blur-3xl"></div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-4">
              Everything you need to collaborate
            </h2>
            <p className="text-xl text-secondary-600 max-w-3xl mx-auto">
              From finding the right teammates to tracking project progress, 
              SkillSync provides all the tools you need for successful collaboration.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => {
              const Icon = feature.icon;
              return (
                <motion.div
                  key={feature.title}
                  className="card p-6 text-center card-hover"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                >
                  <div className={`w-12 h-12 ${feature.bgColor} rounded-lg flex items-center justify-center mx-auto mb-4`}>
                    <Icon className={`w-6 h-6 ${feature.color}`} />
                  </div>
                  <h3 className="text-lg font-semibold text-secondary-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-secondary-600">
                    {feature.description}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gradient-primary text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <motion.div
                key={stat.label}
                className="text-center"
                initial={{ opacity: 0, scale: 0.5 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
              >
                <div className="text-3xl sm:text-4xl font-bold mb-2">{stat.value}</div>
                <div className="text-lg opacity-90">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-secondary-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-6">
                Why choose SkillSync?
              </h2>
              <p className="text-xl text-secondary-600 mb-8">
                Unlike traditional platforms, SkillSync focuses on skills, action, and impact. 
                We believe what you can do matters more than degrees or titles.
              </p>
              
              <ul className="space-y-4">
                {benefits.map((benefit, index) => (
                  <motion.li
                    key={benefit}
                    className="flex items-center space-x-3"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                  >
                    <div className="flex-shrink-0">
                      <CheckIcon className="w-5 h-5 text-success-600" />
                    </div>
                    <span className="text-secondary-700">{benefit}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
            
            <div className="relative">
              <img
                src="https://images.unsplash.com/photo-1522071820081-009f0129c71c?ixlib=rb-4.0.3&auto=format&fit=crop&w=1470&q=80"
                alt="Team collaboration"
                className="rounded-2xl shadow-2xl"
              />
              <div className="absolute -bottom-6 -left-6 w-24 h-24 bg-primary-600 rounded-2xl flex items-center justify-center">
                <StarIcon className="w-12 h-12 text-white" />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-bold text-secondary-900 mb-6">
            Ready to sync with amazing collaborators?
          </h2>
          <p className="text-xl text-secondary-600 mb-8">
            Join thousands of creators, developers, and doers who are building the future together.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/register"
              className="btn btn-primary btn-lg px-8 py-4 text-lg"
            >
              Start Building Today
            </Link>
            <Link
              to="/projects"
              className="btn btn-outline btn-lg px-8 py-4 text-lg"
            >
              Browse Projects
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;
