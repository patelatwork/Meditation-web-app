 Meditation App

A complete meditation application with timer functionality, session tracking, and user management.

Features

 Frontend Features
1. User Authentication
   - Clean, responsive login and signup pages
   - User session management with JWT tokens
2. Meditation Timer
   - Three preset meditation durations (7, 15, and 21 minutes)
   - Visual circular timer with progress indication
   - Start, pause, resume, and stop functionality
3. User Dashboard
   - Personalized welcome message
   - Meditation history display showing recent sessions
   - Completion screen with congratulatory message
4. Responsive Design
   - Works on mobile, tablet, and desktop devices
   - Smooth animations and transitions
   - Calming blue color scheme with clean UI

Backend Features
1. User Management
   - Secure password hashing with bcrypt
   - JWT authentication for protected routes
   - User profile storage in MongoDB
2. Meditation Tracking
   - Records completed meditation sessions
   - Stores duration and timestamp for each session
   - API endpoints for session history retrieval

= Installation

1. Clone the repository
   ```
   git clone https://github.com/yourusername/zen-meditation-app.git
   cd zen-meditation-app
   ```

2. Install dependencies
   ```
   npm install express mongoose bcrypt jsonwebtoken cookie-parser
   ```

3. Configure environment variables
   - Create a `.env` file in the root directory:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/meditation-app
   JWT_SECRET=your_secret_key
   ```

4. Start MongoDB
   - Make sure MongoDB is running locally or update the connection string in the `.env` file

5. Start the application
   ```
   node server.js
   ```

6. Access the application
   - Open your browser and navigate to `http://localhost:3000`

Project Structure

```
meditation-app/
├── public/                  # Static assets
│   ├── css/                 # Stylesheets
│   ├── js/                  # Client-side JavaScript
│   └── sounds/              # Meditation sounds
├── views/                   # Frontend templates
├── models/                  # Database models
├── routes/                  # API routes
├── middleware/              # Custom middleware
├── controllers/             # Request handlers
├── server.js                # Main application file
├── package.json             # Project dependencies
└── README.md                # Project documentation
```

 API Endpoints

 Authentication
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Log in a user
- `GET /api/auth/logout` - Log out a user

 Meditation Sessions
- `GET /api/sessions` - Get all sessions for the logged-in user
- `POST /api/sessions` - Create a new meditation session
- `GET /api/sessions/:id` - Get details for a specific session



 Technologies Used

- Node.js and Express for the backend
- MongoDB for data storage
- JWT for authentication
- HTML, CSS, and JavaScript for the frontend
- Responsive design with modern CSS techniques

