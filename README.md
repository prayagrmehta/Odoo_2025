# Skill Swap Platform

A modern React-based platform for skill exchange between users. Users can offer their skills and request to learn from others through a swap system.

## Features

- 🔐 **Authentication**: Email/password and Google OAuth login
- 👥 **User Profiles**: Manage skills offered and wanted
- 🔍 **Browse Skills**: Search and filter users by skills and availability
- 🤝 **Swap Requests**: Send, accept, and reject skill swap requests
- 📊 **Dashboard**: View statistics and manage your swaps
- 📱 **Responsive Design**: Works on desktop and mobile devices
- 🎨 **Modern UI**: Built with Material-UI components

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd swap_skill_frontend
```

2. Install dependencies:
```bash
npm install
```

3. Set up Google OAuth (Optional but recommended):
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select an existing one
   - Enable the Google+ API
   - Go to Credentials → Create Credentials → OAuth 2.0 Client IDs
   - Set the authorized JavaScript origins to `http://localhost:3000`
   - Copy the Client ID
   - Replace `YOUR_GOOGLE_CLIENT_ID` in `src/App.js` with your actual Client ID

4. Start the development server:
```bash
npm start
```

The app will open at `http://localhost:3000`

## Usage

### Authentication
- **Email/Password**: Use any email and password (6+ characters) for demo purposes
- **Google OAuth**: Click "Continue with Google" to sign in with your Google account

### Browse Skills
- Search for users by name or skills
- Filter by availability (weekdays, weekends, evenings)
- Click "Request Swap" to send a swap request
- Add an optional message explaining what you can offer

### Swap Requests
- View all your incoming and outgoing swap requests
- Accept or reject pending requests
- Filter requests by status (All, Pending, Accepted, Rejected)

### Profile
- Upload a profile photo
- Manage your skills offered and wanted
- Update your availability

## Project Structure

```
src/
├── components/          # Reusable UI components
│   └── Header.jsx      # Navigation header
├── context/            # React context providers
│   └── AuthContext.js  # Authentication state management
├── pages/              # Page components
│   ├── Home.jsx        # Landing page
│   ├── Login.jsx       # Login page with OAuth
│   ├── Register.jsx    # Registration page
│   ├── Dashboard.jsx   # User dashboard
│   ├── Profile.jsx     # User profile management
│   ├── Browse.jsx      # Skill browsing and requests
│   ├── SwapRequests.jsx # Swap request management
│   └── AdminPanel.jsx  # Admin panel (if admin user)
├── services/           # API and business logic
│   └── swapService.js  # Swap request operations
└── App.js              # Main app component with routing
```

## Technologies Used

- **React 18**: Frontend framework
- **Material-UI (MUI)**: UI component library
- **React Router**: Client-side routing
- **@react-oauth/google**: Google OAuth integration
- **jwt-decode**: JWT token decoding

## Development

### Available Scripts

- `npm start`: Start development server
- `npm build`: Build for production
- `npm test`: Run tests
- `npm eject`: Eject from Create React App

### Adding New Features

1. **New Pages**: Add routes in `src/App.js`
2. **Authentication**: Use the `useAuth()` hook from `AuthContext`
3. **API Calls**: Add services in the `src/services/` directory
4. **Styling**: Use Material-UI components and sx prop for custom styling

## Deployment

1. Build the project:
```bash
npm run build
```

2. Deploy the `build` folder to your hosting service (Netlify, Vercel, etc.)

3. Update Google OAuth settings with your production domain

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please open an issue in the repository. 