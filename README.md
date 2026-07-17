# Ekyam Community Platform

![Ekyam](https://img.shields.io/badge/Status-Active-green) ![MERN Stack](https://img.shields.io/badge/Stack-MERN-blue) ![License](https://img.shields.io/badge/License-ISC-yellow)

## 📌 Overview

**Ekyam** (meaning "Oneness" or "Unity" in Sanskrit) is a comprehensive, full-stack community platform designed to foster genuine human connection, professional networking, and collaborative innovation. It bridges the gap between casual social networking and structured professional collaboration by integrating community management, project collaboration, and resource sharing into a cohesive ecosystem.

The platform enables users to:
- Build and join communities with shared interests or geographic locations
- Discover and collaborate on projects
- Share valuable resources
- Expand professional networks
- Participate in community events

---

## ✨ Key Features

### 🌍 Community Management
- **Create & Discover Communities**: Build public or private communities; discover communities via interactive map
- **Geospatial Discovery**: Visualize communities on a map using Leaflet integration
- **Member Management**: Accept join requests, manage roles (admin, moderator, member)
- **Community Events**: Schedule and RSVP to virtual or physical events
- **Moderated Discussions**: Threaded comments on community posts

### 👥 User Networking
- **Professional Profiles**: Customize avatars, bios, skills, and portfolio links
- **Connection System**: Send/accept connection requests similar to LinkedIn
- **Network Dashboard**: View connections and pending requests
- **User Discovery**: Search by skills, location, or interests

### 💼 Project Collaboration
- **Project Directory**: Browse open projects seeking contributors
- **Project Creation**: Define goals, required skills, and status tracking
- **Collaboration Requests**: Vet potential collaborators through Ekyam profiles
- **Detailed Project Pages**: Discussion boards, contributor lists, and repo links

### 📚 Resource Sharing
- **Resource Library**: Browse and categorize shared resources
- **Upload & Organize**: Share documents, links, or media files
- **Resource Details**: Comments, ratings, and download tracking

### 📰 Social Feed
- **Rich Posts**: Create posts with text, images, and links
- **Interactive Engagement**: Like and comment on posts
- **Feed Pagination**: Cursor-based pagination for performance
- **Media Management**: Cloudinary integration for optimized image storage

### 📧 Communication
- **Newsletter System**: Email subscriptions for platform updates
- **Community Chat**: Real-time discussions within communities
- **Email Notifications**: Account verification, password resets, and updates

### 🔐 Admin Panel
- **System Management**: Comprehensive admin dashboard
- **User Management**: Monitor and manage users
- **Analytics & Stats**: Platform usage statistics and insights
- **Moderation Tools**: Manage community content and users

---

## 🛠 Technology Stack

### Frontend
- **React 19** - UI library with hooks
- **Vite** - Lightning-fast build tool
- **Tailwind CSS** - Utility-first CSS framework with dark mode support
- **React Router DOM v7** - Client-side routing
- **Axios** - HTTP client with JWT interceptors
- **Leaflet & React-Leaflet** - Geospatial mapping
- **React Context API** - State management for auth and theme

### Backend
- **Node.js & Express.js** - RESTful API server
- **MongoDB & Mongoose** - NoSQL database with ODM
- **JWT (JSON Web Tokens)** - Stateless authentication
- **Bcryptjs** - Password hashing
- **Multer & Cloudinary** - File upload management
- **Nodemailer** - Email delivery
- **Helmet** - Security headers
- **Express Rate Limit** - API rate limiting
- **Morgan** - HTTP request logging
- **Compression** - Gzip response compression

### DevOps & Deployment
- **MongoDB Atlas** - Cloud database hosting
- **Render** - Backend hosting
- **Vercel** - Frontend hosting

---

## 📂 Project Structure

```
Ekyam-main/
├── backend/                      # Node.js/Express API
│   ├── models/                   # Mongoose schemas
│   │   ├── User.js              # User authentication & profile
│   │   ├── Community.js         # Community data
│   │   ├── CommunityMember.js   # Community membership
│   │   ├── Post.js              # Feed posts
│   │   ├── Comment.js           # Post comments
│   │   ├── Project.js           # Project collaboration
│   │   ├── Resource.js          # Resource sharing
│   │   ├── Connection.js        # User networking
│   │   ├── JoinRequest.js       # Community join requests
│   │   ├── CommunityEvent.js    # Event scheduling
│   │   ├── CommunityActivity.js # Activity logging
│   │   ├── ChatMessage.js       # Community messaging
│   │   ├── Message.js           # Direct messaging
│   │   └── Newsletter.js        # Newsletter subscriptions
│   ├── routes/                   # API endpoints
│   │   ├── authRoutes.js        # Authentication (login, register)
│   │   ├── users.js             # User management
│   │   ├── communities.js       # Community operations
│   │   ├── posts.js             # Feed & posts
│   │   ├── projects.js          # Project management
│   │   ├── resources.js         # Resource management
│   │   ├── connections.js       # Network connections
│   │   ├── communityChat.js     # Community messaging
│   │   ├── communityEvents.js   # Event management
│   │   ├── newsletter.js        # Newsletter operations
│   │   ├── admin.js             # Admin operations
│   │   └── stats.js             # Analytics & statistics
│   ├── middleware/               # Express middleware
│   │   ├── auth.js              # JWT verification
│   │   └── upload.js            # File upload handling
│   ├── scripts/                  # Utility scripts
│   │   └── setupAdmin.js        # Admin initialization
│   ├── uploads/                  # Local file storage (dev)
│   ├── server.js                 # Express application
│   ├── package.json              # Dependencies
│   └── .env                      # Environment variables (not committed)
│
├── frontend/                     # React SPA with Vite
│   ├── src/
│   │   ├── pages/                # Route pages (lazy-loaded)
│   │   │   ├── Home.jsx
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   ├── Dashboard.jsx
│   │   │   ├── Communities.jsx
│   │   │   ├── CommunityDetails.jsx
│   │   │   ├── CommunityDashboard.jsx
│   │   │   ├── CommunityMap.jsx
│   │   │   ├── CommunityMembers.jsx
│   │   │   ├── CreateCommunity.jsx
│   │   │   ├── Projects.jsx
│   │   │   ├── ProjectDetails.jsx
│   │   │   ├── CreateProject.jsx
│   │   │   ├── Resources.jsx
│   │   │   ├── ResourceDetails.jsx
│   │   │   ├── CreateResource.jsx
│   │   │   ├── Profile.jsx
│   │   │   ├── UserPublicProfile.jsx
│   │   │   ├── Feed.jsx
│   │   │   ├── MyNetwork.jsx
│   │   │   ├── Newsletter.jsx
│   │   │   ├── AdminPanel.jsx
│   │   │   └── [Additional pages...]
│   │   ├── components/           # Reusable components
│   │   │   ├── Navbar.jsx
│   │   │   ├── Footer.jsx
│   │   │   ├── PostCard.jsx
│   │   │   ├── CommentSection.jsx
│   │   │   ├── UserCard.jsx
│   │   │   ├── ProtectedRoute.jsx
│   │   │   ├── AdminRoute.jsx
│   │   │   ├── LoadingSpinner.jsx
│   │   │   ├── GlobalLoader.jsx
│   │   │   └── ScrollToTop.jsx
│   │   ├── context/              # React Context providers
│   │   │   ├── AuthContext.jsx   # Authentication state
│   │   │   └── ThemeContext.jsx  # Dark/Light mode
│   │   ├── api/
│   │   │   └── api.js            # Axios instance & interceptors
│   │   ├── utils/
│   │   │   └── media.js          # Media utilities
│   │   ├── App.jsx               # Main app component
│   │   ├── main.jsx              # Entry point
│   │   ├── App.css
│   │   └── index.css
│   ├── public/                   # Static assets
│   ├── index.html                # HTML template
│   ├── vite.config.js            # Vite configuration
│   ├── tailwind.config.js        # Tailwind CSS config
│   ├── vercel.json               # Vercel deployment config
│   ├── eslint.config.js          # ESLint rules
│   └── package.json              # Dependencies
│
├── ekyam_project_description.md  # Detailed project documentation
├── implementation_plan.md        # Deployment strategy
└── README.md                     # This file
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** (v14.0 or higher)
- **npm** or **yarn**
- **MongoDB** (local or MongoDB Atlas account)
- **Git**

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/Ekyam-main.git
   cd Ekyam-main
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   ```
   Create a `.env` file in the `backend` directory:
   ```env
   PORT=5000
   MONGO_URI=mongodb://localhost:27017/ekyam_db
   NODE_ENV=development
   JWT_SECRET=your_jwt_secret_key_here
   FRONTEND_URL=http://localhost:5173
   CORS_ORIGIN=http://localhost:5173
   
   # Cloudinary (optional, for media uploads)
   CLOUDINARY_NAME=your_cloudinary_name
   CLOUDINARY_API_KEY=your_api_key
   CLOUDINARY_API_SECRET=your_api_secret
   
   # Email Configuration (Nodemailer)
   EMAIL_USER=your_email@gmail.com
   EMAIL_PASS=your_app_password
   
   # Google OAuth (optional)
   GOOGLE_CLIENT_ID=your_client_id
   GOOGLE_CLIENT_SECRET=your_client_secret
   ```

3. **Setup Frontend**
   ```bash
   cd ../frontend
   npm install
   ```
   Create a `.env` file in the `frontend` directory:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### Running Locally

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev  # Uses nodemon for auto-reload
```
Backend will run on `http://localhost:5000`

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
```
Frontend will run on `http://localhost:5173`

### Initial Setup

1. Open the application at `http://localhost:5173`
2. Register a new account
3. Verify email (check terminal output for OTP in development)
4. Create your first community or profile

---

## 📚 API Documentation

### Base URL
```
http://localhost:5000/api
```

### Authentication Endpoints (`/auth`)
- `POST /auth/register` - Register new user
- `POST /auth/login` - User login
- `POST /auth/verify-email` - Verify email with OTP
- `POST /auth/forgot-password` - Request password reset
- `POST /auth/reset-password` - Reset password with token

### User Endpoints (`/users`)
- `GET /users/profile` - Get current user profile
- `PUT /users/profile` - Update user profile
- `GET /users/:userId` - Get user public profile
- `GET /users/search?q=query` - Search users
- `GET /users/by-skills` - Filter users by skills

### Community Endpoints (`/communities`)
- `POST /communities` - Create community
- `GET /communities` - List communities (with filters)
- `GET /communities/:id` - Get community details
- `PUT /communities/:id` - Update community
- `DELETE /communities/:id` - Delete community
- `POST /communities/:id/join` - Join community
- `POST /communities/:id/members` - Manage members

### Post Endpoints (`/posts`)
- `POST /posts` - Create post
- `GET /posts` - Get feed posts
- `GET /posts/:id` - Get post details
- `PUT /posts/:id` - Update post
- `DELETE /posts/:id` - Delete post
- `POST /posts/:id/like` - Like post
- `POST /posts/:id/comments` - Add comment

### Project Endpoints (`/projects`)
- `POST /projects` - Create project
- `GET /projects` - List projects
- `GET /projects/:id` - Get project details
- `PUT /projects/:id` - Update project
- `DELETE /projects/:id` - Delete project
- `POST /projects/:id/join` - Request to join

### Resource Endpoints (`/resources`)
- `POST /resources` - Create resource
- `GET /resources` - List resources
- `GET /resources/:id` - Get resource details
- `PUT /resources/:id` - Update resource
- `DELETE /resources/:id` - Delete resource

### Connection Endpoints (`/connections`)
- `POST /connections/request/:userId` - Send connection request
- `GET /connections` - Get connections
- `PUT /connections/accept/:requestId` - Accept connection
- `PUT /connections/reject/:requestId` - Reject connection

### Newsletter Endpoints (`/newsletter`)
- `POST /newsletter/subscribe` - Subscribe to newsletter
- `POST /newsletter/unsubscribe` - Unsubscribe

### Admin Endpoints (`/admin`)
- `GET /admin/stats` - Platform statistics
- `GET /admin/users` - List all users
- `PUT /admin/users/:id/role` - Update user role
- `DELETE /admin/users/:id` - Delete user

### Events Endpoints (`/events`)
- `POST /events` - Create event
- `GET /events` - List events
- `GET /events/:id` - Get event details
- `POST /events/:id/rsvp` - RSVP to event

**Note:** All protected endpoints require a valid JWT token in the `Authorization: Bearer <token>` header.

---

## 🗄 Database Schema Overview

### Core Collections

**User**
- Basic authentication and profile information
- Tracks email verification status
- Stores profile image and location data

**Community**
- Community metadata (name, description, category)
- Privacy settings (public/private)
- Geospatial coordinates for mapping

**CommunityMember**
- Tracks user-community relationships
- Role management (admin, moderator, member)
- Join timestamps

**Post**
- Feed content with rich text and media
- Like counters and comment references
- Author and community references

**Comment**
- Threaded discussions on posts
- Author and timestamp tracking

**Project**
- Project details (goals, status, required skills)
- Contributor tracking
- Repository links

**Resource**
- Shared materials and documents
- Tags and categories
- File storage references

**Connection**
- User networking relationships
- Connection status (pending, accepted, rejected)

**CommunityEvent**
- Event scheduling and metadata
- RSVP tracking
- Date and location information

---

## 🔐 Security Features

✅ **JWT Authentication** - Stateless token-based authentication  
✅ **Password Hashing** - Bcryptjs with salt rounds  
✅ **Email Verification** - OTP-based verification on registration  
✅ **CORS Configuration** - Restricted to authorized frontend origins  
✅ **Rate Limiting** - API rate limits (200 req/15min general, 20 for auth)  
✅ **Security Headers** - Helmet.js for HTTP header security  
✅ **Input Validation** - Mongoose schema validation  
✅ **Error Handling** - Centralized error handling without exposing stack traces in production  
✅ **File Upload Security** - Cloudinary integration with size/type restrictions  

---

## 📦 Deployment

### Quick Start: Cloud Deployment

The application is optimized for deployment across three specialized platforms:

#### **Step 1: Database - MongoDB Atlas** (Free Tier)
1. Create account at [MongoDB Atlas](https://www.mongodb.com/atlas/database)
2. Deploy a shared cluster (FREE)
3. Create database user and get connection string
4. Allow network access from `0.0.0.0/0`

#### **Step 2: Backend - Render** (Free Web Service)
1. Push backend code to GitHub
2. Sign up at [Render](https://render.com)
3. Create new Web Service
4. Connect GitHub repository
5. Set root directory: `backend`
6. Set environment variables (MONGO_URI, JWT_SECRET, etc.)
7. Deploy

#### **Step 3: Frontend - Vercel** (Free Hobby)
1. Push frontend code to GitHub
2. Sign up at [Vercel](https://vercel.com)
3. Create new project from GitHub
4. Set root directory: `frontend`
5. Set `VITE_API_URL` to Render backend URL
6. Deploy

#### **Step 4: Link Services**
Update Render backend environment variables with:
- `FRONTEND_URL`: Your Vercel frontend URL
- `CORS_ORIGIN`: Your Vercel frontend URL

**Complete Deployment Guide:** See [implementation_plan.md](implementation_plan.md)

---

## 🤝 Contributing

1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```
3. **Make your changes and commit**
   ```bash
   git commit -m "Add your feature description"
   ```
4. **Push to branch**
   ```bash
   git push origin feature/your-feature-name
   ```
5. **Create a Pull Request**

### Contribution Guidelines
- Follow existing code style and naming conventions
- Add comments for complex logic
- Test changes locally before submitting PR
- Update README if adding new features
- Keep commits atomic and descriptive

---

## 📋 Development Guidelines

### Code Style
- **Backend**: CommonJS modules, async/await pattern
- **Frontend**: Functional components with hooks, JSX

### Naming Conventions
- **Files**: camelCase for JS/JSX files
- **Components**: PascalCase (e.g., `UserCard.jsx`)
- **Variables**: camelCase (e.g., `isLoading`, `userData`)
- **Classes/Models**: PascalCase (e.g., `User`, `Community`)

### Commit Messages
```
type(scope): brief description

[optional body]
[optional footer]
```
**Types**: feat, fix, docs, style, refactor, test, chore

---

## 🐛 Troubleshooting

### Issue: Backend won't connect to MongoDB
**Solution:** Verify `MONGO_URI` in `.env` file. For local MongoDB:
```bash
mongod  # Start MongoDB service first
```

### Issue: CORS errors in browser console
**Solution:** Ensure `CORS_ORIGIN` in backend `.env` matches frontend URL

### Issue: Images not uploading
**Solution:** Verify Cloudinary credentials are set in `.env`

### Issue: Emails not sending
**Solution:** Check Email service credentials and enable "Less secure apps" for Gmail

### Issue: JWT token errors
**Solution:** Ensure `JWT_SECRET` is set consistently in `.env`

---

## 📝 License

This project is licensed under the ISC License - see the LICENSE file for details.

---

## 👨‍💻 Author & Support

**Ekyam Community Platform** - Fostering genuine connection and collaboration

For questions, issues, or suggestions:
- **GitHub Issues**: [Create an issue](https://github.com/yourusername/Ekyam-main/issues)
- **Email**: support@ekyam.io
- **Documentation**: [Full Project Description](ekyam_project_description.md)

---

## 🔮 Future Roadmap

- [ ] Real-time notifications using Socket.io
- [ ] Video conferencing for community events
- [ ] Advanced recommendation engine
- [ ] Mobile native applications (React Native)
- [ ] Stripe integration for premium features
- [ ] Advanced analytics dashboard
- [ ] AI-powered community suggestions
- [ ] Community gamification system

---

## 📊 Performance Metrics

- **Frontend**: Vite HMR, Code-splitting with lazy-loaded routes
- **Backend**: Gzip compression, Response caching, Rate limiting
- **Database**: Indexed queries, Connection pooling
- **Deployment**: CDN via Vercel (frontend), Auto-scaling on Render (backend)

---

<div align="center">

**Made with ❤️ by the Ekyam Community**

Star ⭐ this repository if you find it useful!

</div>


---

<div align="center">

**Made with ❤️ by the Ekyam Community**

Star ⭐ this repository if you find it useful!

</div>
=======
>>>>>>> 8dff6a34b730829683bbbfdb7da556d1f511d6b2
