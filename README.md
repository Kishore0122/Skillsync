# SkillSync - Professional Social Network for Real-World Collaboration

<div align="center">

![SkillSync Logo](https://img.shields.io/badge/SkillSync-Professional%20Network-blue?style=for-the-badge&logo=react)

**"Show what you can do. Sync with those who can help."**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Node.js](https://img.shields.io/badge/Node.js-18+-green.svg)](https://nodejs.org/)
[![React](https://img.shields.io/badge/React-18+-blue.svg)](https://reactjs.org/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Atlas-green.svg)](https://www.mongodb.com/)

</div>

## 📖 About

SkillSync is a comprehensive MERN stack application that serves as a professional social network focused on real-world collaboration. The platform enables users to connect, collaborate on projects, solve problems, participate in challenges, and build their professional reputation through a skill-first approach.

### 🎯 Core Philosophy
- **Skill-First Networking**: Connect based on what you can do, not just what you claim to know
- **Real-World Impact**: Focus on solving actual problems and building meaningful projects
- **Collaborative Learning**: Learn by doing and working with others
- **Reputation Building**: Earn recognition through contributions and achievements

## ✨ Key Features

### 🔐 User Management
- **Secure Authentication**: JWT-based authentication with password reset
- **Rich Profiles**: Skills, portfolio, education, experience, and social links
- **Reputation System**: Points, badges, and endorsements for contributions
- **User Discovery**: Advanced search and recommendation engine

### 🤝 Collaboration Platform
- **Project Management**: Create and manage collaborative projects with team features
- **Task Assignment**: Assign and track tasks with real-time updates
- **Join Requests**: Request to join projects with skill-based matching
- **Real-time Chat**: Live messaging for project teams

### 🧩 Problem Solving
- **Problem Wall**: Post and collaborate on real-world challenges
- **Solution Submissions**: Submit and vote on solutions
- **Collaboration Requests**: Connect with problem authors
- **Progress Tracking**: Monitor problem-solving progress

### 🏆 Challenge System
- **Coding Challenges**: Participate in skill-based competitions
- **Submission System**: Submit solutions with file uploads
- **Voting & Judging**: Community-driven evaluation
- **Leaderboards**: Track performance and achievements

### 💬 Real-time Communication
- **Live Messaging**: Socket.io powered real-time chat
- **Project Rooms**: Dedicated chat rooms for projects
- **Collaboration Chat**: Direct messaging for problem collaborations
- **Notifications**: Real-time updates and alerts

### 📁 File Management
- **Cloudinary Integration**: Secure file uploads and storage
- **Portfolio Showcase**: Upload and display work samples
- **Challenge Submissions**: File uploads for challenge entries
- **Avatar Management**: Profile picture uploads with optimization

## 🛠️ Technology Stack

### Frontend
- **React 18** - Modern React with hooks and context
- **React Router** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Animation library
- **React Query** - Server state management
- **React Hook Form** - Form handling
- **Socket.io Client** - Real-time communication
- **React Hot Toast** - Notifications

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **MongoDB** - NoSQL database
- **Mongoose** - MongoDB object modeling
- **Socket.io** - Real-time bidirectional communication
- **JWT** - JSON Web Token authentication
- **bcryptjs** - Password hashing
- **Multer** - File upload handling
- **Cloudinary** - Cloud-based file storage
- **Express Validator** - Input validation
- **Helmet** - Security middleware
- **CORS** - Cross-origin resource sharing

### Development Tools
- **Nodemon** - Development server
- **Concurrently** - Run multiple commands
- **ESLint** - Code linting
- **Prettier** - Code formatting

## 🚀 Quick Start

### Prerequisites
- **Node.js** (v16 or higher)
- **MongoDB** (local or Atlas)
- **npm** or **yarn**
- **Git**

### Installation

1. **Clone the repository**
```bash
git clone https://github.com/yourusername/skillsync.git
cd skillsync
```

2. **Install dependencies**
```bash
npm run install-deps
```

3. **Set up environment variables**

Create a `.env` file in the `backend` directory:
```env
# Database
MONGODB_URI=mongodb://localhost:27017/skillsync

# Authentication
JWT_SECRET=your_super_secret_jwt_key_here

# Server
NODE_ENV=development
PORT=5000

# Cloudinary (for file uploads)
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret

# Email (for password reset)
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
```

4. **Start the development servers**
```bash
npm run dev
```

The application will be available at:
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000

## 📁 Project Structure

```
skillsync/
├── backend/                    # Node.js/Express API server
│   ├── middleware/            # Custom middleware
│   │   ├── auth.js           # JWT authentication
│   │   └── optionalAuth.js   # Optional authentication
│   ├── models/               # MongoDB models
│   │   ├── User.js           # User model
│   │   ├── Project.js        # Project model
│   │   ├── Problem.js        # Problem model
│   │   ├── Challenge.js      # Challenge model
│   │   ├── CollaborationRequest.js
│   │   └── CollaborationMessage.js
│   ├── routes/               # API routes
│   │   ├── auth.js           # Authentication routes
│   │   ├── users.js          # User management
│   │   ├── projects.js       # Project management
│   │   ├── problems.js       # Problem management
│   │   ├── challenges.js     # Challenge management
│   │   ├── collaborationRequests.js
│   │   ├── collaborations.js
│   │   └── upload.js         # File upload
│   ├── server.js             # Main server file
│   └── package.json
├── frontend/                  # React application
│   ├── public/               # Static files
│   ├── src/
│   │   ├── components/       # Reusable components
│   │   │   ├── auth/         # Authentication components
│   │   │   ├── common/       # Common components
│   │   │   ├── layout/       # Layout components
│   │   │   ├── modals/       # Modal components
│   │   │   └── profile/      # Profile components
│   │   ├── contexts/         # React contexts
│   │   │   ├── AuthContext.js
│   │   │   └── SocketContext.js
│   │   ├── hooks/            # Custom hooks
│   │   ├── pages/            # Page components
│   │   │   ├── auth/         # Authentication pages
│   │   │   ├── challenges/   # Challenge pages
│   │   │   ├── problems/     # Problem pages
│   │   │   ├── projects/     # Project pages
│   │   │   └── profile/      # Profile pages
│   │   ├── services/         # API services
│   │   ├── App.js            # Main app component
│   │   └── index.js          # Entry point
│   └── package.json
├── package.json              # Root package.json
├── README.md
└── LICENSE
```

## 🌐 API Documentation

### Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://your-domain.com/api`

### Authentication
All protected endpoints require a Bearer token:
```bash
Authorization: Bearer <jwt_token>
```

### Key Endpoints

#### Authentication
```bash
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
GET  /api/auth/me          # Get current user
POST /api/auth/forgot-password
POST /api/auth/reset-password
```

#### Users
```bash
GET  /api/users/profile/:id        # Get user profile
PUT  /api/users/profile            # Update profile
POST /api/users/skills             # Add/update skills
POST /api/users/portfolio          # Add portfolio item
POST /api/users/follow/:id         # Follow/unfollow user
GET  /api/users/search             # Search users
GET  /api/users/recommendations    # Get recommendations
```

#### Projects
```bash
GET  /api/projects                 # Get all projects
GET  /api/projects/:id             # Get project details
POST /api/projects                 # Create project
PUT  /api/projects/:id             # Update project
POST /api/projects/:id/join        # Join project
POST /api/projects/:id/tasks       # Create task
POST /api/projects/:id/messages    # Send message
```

#### Problems
```bash
GET  /api/problems                 # Get all problems
GET  /api/problems/:id             # Get problem details
POST /api/problems                 # Create problem
POST /api/problems/:id/support     # Support problem
POST /api/problems/:id/solutions   # Submit solution
POST /api/problems/:id/collaborate # Request collaboration
```

#### Challenges
```bash
GET  /api/challenges               # Get all challenges
GET  /api/challenges/:id           # Get challenge details
POST /api/challenges               # Create challenge
POST /api/challenges/:id/participate # Join challenge
POST /api/challenges/:id/submit    # Submit solution
```

## 🔧 Available Scripts

### Root Level
```bash
npm run dev              # Start both frontend and backend
npm run server           # Start backend only
npm run client           # Start frontend only
npm run install-deps     # Install all dependencies
npm run build            # Build frontend for production
npm start                # Start production server
```

### Backend
```bash
npm start                # Start production server
npm run dev              # Start development server with nodemon
```

### Frontend
```bash
npm start                # Start development server
npm run build            # Build for production
npm test                 # Run tests
npm run eject            # Eject from Create React App
```

## 🔐 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt with salt rounds
- **Rate Limiting**: API rate limiting to prevent abuse
- **Input Validation**: Comprehensive input validation and sanitization
- **CORS Protection**: Proper cross-origin resource sharing
- **Helmet Security**: Security headers middleware
- **File Upload Security**: File type and size restrictions
- **XSS Protection**: React's built-in XSS protection

## 🚀 Deployment

SkillSync is configured for easy deployment to production using modern cloud platforms:

- **Frontend**: [Netlify](https://netlify.com) (Static Site Hosting)
- **Backend**: [Render](https://render.com) (Web Service)
- **Database**: [MongoDB Atlas](https://mongodb.com/atlas) (Cloud Database)
- **File Storage**: [Cloudinary](https://cloudinary.com) (Cloud File Storage)

### Quick Deployment

1. **Set up your accounts**:
   - [MongoDB Atlas](https://mongodb.com/atlas) (Free tier available)
   - [Cloudinary](https://cloudinary.com) (Free tier available)
   - [Netlify](https://netlify.com) (Free tier available)
   - [Render](https://render.com) (Free tier available)

2. **Deploy Backend to Render**:
   - Connect your GitHub repository
   - Set root directory to `backend`
   - Add environment variables (see below)
   - Deploy

3. **Deploy Frontend to Netlify**:
   - Connect your GitHub repository
   - Set base directory to `frontend`
   - Add environment variables (see below)
   - Deploy

### Environment Variables

#### Backend (Render)
```env
NODE_ENV=production
PORT=10000
MONGODB_URI=your_mongodb_atlas_connection_string
JWT_SECRET=your_super_secret_jwt_key_here
CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_app_password
FRONTEND_URL=https://your-netlify-app.netlify.app
```

#### Frontend (Netlify)
```env
REACT_APP_API_URL=https://your-backend-url.onrender.com
REACT_APP_SERVER_URL=https://your-backend-url.onrender.com
```

### Detailed Deployment Guide

For step-by-step deployment instructions, see our comprehensive [Deployment Guide](deploy.md).

### Local Production Build
```bash
# Build frontend
cd frontend
npm run build

# Start production server
cd ../backend
npm start
```

## 🤝 Contributing

We welcome contributions! Please follow these steps:

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add some amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Development Guidelines
- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure all tests pass
- Follow semantic commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

### ✅ Completed Features
- [x] User Authentication & Profiles
- [x] Project Management System
- [x] Problem Solving Platform
- [x] Challenge System
- [x] Real-time Messaging
- [x] File Upload System
- [x] Reputation System

### 🚧 In Progress
- [ ] Mobile Application (React Native)
- [ ] Advanced Analytics Dashboard
- [ ] AI-Powered Recommendations
- [ ] Video Call Integration

### 🔮 Future Features
- [ ] Multi-language Support
- [ ] Payment Integration
- [ ] Advanced Search (Elasticsearch)
- [ ] Push Notifications
- [ ] API Documentation (Swagger)
- [ ] Microservices Architecture
- [ ] Advanced Caching (Redis)

## 🐛 Known Issues

- File upload size limits may need adjustment for large files
- Real-time notifications could be enhanced with push notifications
- Mobile responsiveness could be improved for some components

## 📞 Support & Contact

- **Website**: [https://skillsync.in](https://skillsync.in)
- **Email**: hello@skillsync.in
- **Twitter**: [@SkillSyncIndia](https://twitter.com/SkillSyncIndia)
- **Issues**: [GitHub Issues](https://github.com/yourusername/skillsync/issues)

## 🙏 Acknowledgments

- React team for the amazing framework
- MongoDB for the flexible database
- Socket.io for real-time capabilities
- Cloudinary for file management
- All contributors and users

---

<div align="center">

**Made with ❤️ for creators, doers, and learners worldwide.**

[⭐ Star this repo](https://github.com/yourusername/skillsync) | [🐛 Report Bug](https://github.com/yourusername/skillsync/issues) | [💡 Request Feature](https://github.com/yourusername/skillsync/issues)

</div>