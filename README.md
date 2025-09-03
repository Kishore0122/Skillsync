# SkillSync - Professional Social Network for Real-World Collaboration

![SkillSync Logo](./assets/skillsync-logo.png)

## 🚀 "Show what you can do. Sync with those who can help."

SkillSync is a skill-first social networking platform designed to connect individuals based on what they can do — not just what they claim to know. Built for India's creators, doers, and learners.

## 🌟 Key Features

- **Live Skill Cards**: Interactive profiles showcasing real work
- **Collab Matchmaking**: AI-powered collaboration recommendations
- **Problem Wall**: Real-world challenges and crowdsourced solutions
- **Build Rooms**: Collaborative project workspaces
- **Skill Challenges**: Weekly tasks to build portfolios
- **Signal Boosting**: Credit system for contributions

## 🛠️ Tech Stack

- **Frontend**: React.js + Tailwind CSS
- **Backend**: Node.js + Express.js
- **Database**: MongoDB
- **Real-time**: Socket.io
- **Authentication**: JWT
- **File Upload**: Multer + Cloudinary

## 🚀 Quick Start

### Prerequisites
- Node.js (v14 or higher)
- MongoDB
- npm or yarn

### Installation

1. Clone the repository
```bash
git clone https://github.com/skillsync/skillsync.git
cd skillsync
```

2. Install dependencies
```bash
npm run install-deps
```

3. Set up environment variables
```bash
# Backend (.env)
MONGODB_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret
CLOUDINARY_CLOUD_NAME=your_cloudinary_name
CLOUDINARY_API_KEY=your_cloudinary_key
CLOUDINARY_API_SECRET=your_cloudinary_secret
```

4. Start development servers
```bash
npm run dev
```

The application will be available at:
- Frontend: http://localhost:3000
- Backend: http://localhost:5000

## 📁 Project Structure

```
skillsync/
├── frontend/                 # React.js frontend
│   ├── src/
│   │   ├── components/      # Reusable components
│   │   ├── pages/          # Page components
│   │   ├── context/        # React context
│   │   ├── utils/          # Utility functions
│   │   └── services/       # API services
├── backend/                 # Node.js backend
│   ├── models/             # MongoDB models
│   ├── routes/             # API routes
│   ├── middleware/         # Custom middleware
│   ├── utils/              # Utility functions
│   └── server.js           # Entry point
└── README.md
```

## 🌐 API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Users
- `GET /api/users/profile/:id` - Get user profile
- `PUT /api/users/profile` - Update profile
- `POST /api/users/skills` - Add skills

### Problems
- `GET /api/problems` - Get all problems
- `POST /api/problems` - Create problem
- `PUT /api/problems/:id/support` - Support problem

### Projects
- `GET /api/projects` - Get all projects
- `POST /api/projects` - Create project
- `POST /api/projects/:id/join` - Join project

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🎯 Roadmap

- [x] User Authentication & Profiles
- [x] Problem Wall
- [x] Build Rooms
- [x] Skill Challenges
- [ ] AI Matchmaking Engine
- [ ] Mobile App
- [ ] Multi-language Support

## 📞 Contact

- Website: https://skillsync.in
- Email: hello@skillsync.in
- Twitter: @SkillSyncIndia

---

Made with ❤️ for India's creators, doers, and learners.
