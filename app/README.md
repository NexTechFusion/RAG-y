# AI Chat Frontend

A modern React TypeScript frontend for the AI Chat application with authentication, built with Vite and Tailwind CSS.

## 🚀 Features

- **Authentication**: Login and registration with form validation
- **Modern UI**: Clean, responsive design with Tailwind CSS
- **Type Safety**: Full TypeScript support
- **Form Validation**: Zod schemas with React Hook Form
- **Protected Routes**: Route guards for authenticated users
- **Token Management**: Automatic token refresh and storage
- **Error Handling**: User-friendly error messages
- **Loading States**: Smooth loading indicators

## 🛠️ Tech Stack

- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **React Router DOM** - Client-side routing
- **React Hook Form** - Form handling
- **Zod** - Schema validation
- **Axios** - HTTP client
- **Lucide React** - Icon library

## 📋 Prerequisites

- Node.js >= 18.0.0
- npm or yarn
- Backend API running on `http://localhost:3000`

## 🛠️ Installation

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Environment Setup**
   Create a `.env` file in the root directory:
   ```env
   VITE_API_URL=http://localhost:3000/api/v1
   VITE_NODE_ENV=development
   ```

3. **Start the development server**
   ```bash
   npm run dev
   ```

4. **Open your browser**
   Navigate to `http://localhost:5173`

## 🏗️ Project Structure

```
src/
├── components/
│   ├── auth/
│   │   ├── LoginForm.tsx      # Login form component
│   │   └── RegisterForm.tsx   # Registration form component
│   ├── Dashboard.tsx          # Main dashboard component
│   └── ProtectedRoute.tsx     # Route protection component
├── contexts/
│   └── AuthContext.tsx        # Authentication context
├── lib/
│   ├── api.ts                 # API client configuration
│   └── validations.ts         # Zod validation schemas
├── types/
│   └── auth.ts                # TypeScript type definitions
├── App.tsx                    # Main app component
├── main.tsx                   # App entry point
└── index.css                  # Global styles with Tailwind
```

## 🔐 Authentication Flow

### Login
1. User enters email and password
2. Form validation with Zod schema
3. API call to `/auth/login`
4. Store tokens and user data in localStorage
5. Redirect to dashboard

### Registration
1. User fills registration form
2. Client-side validation (password strength, email format)
3. API call to `/auth/register`
4. Automatic login after successful registration
5. Redirect to dashboard

### Token Management
- Access tokens stored in localStorage
- Automatic token refresh on 401 responses
- Logout clears all stored data

## 🎨 UI Components

### Form Components
- Input fields with icons and validation states
- Password visibility toggle
- Loading states and error messages
- Responsive design for mobile and desktop

### Dashboard
- User information display
- Department and status cards
- Account details section
- Logout functionality

## 🔧 Available Scripts

```bash
# Development
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build

# Code Quality
npm run lint         # Run ESLint
npm run type-check   # Run TypeScript compiler
```

## 🌐 API Integration

The frontend integrates with the backend API:

- **Base URL**: `http://localhost:3000/api/v1`
- **Authentication**: JWT tokens with automatic refresh
- **Error Handling**: Axios interceptors for global error handling

### API Endpoints Used
- `POST /auth/login` - User login
- `POST /auth/register` - User registration
- `POST /auth/logout` - User logout
- `POST /auth/refresh` - Token refresh
- `GET /departments` - Fetch departments list

## 🎯 Form Validation

### Login Form
- Email: Required, valid email format
- Password: Required, minimum 6 characters

### Registration Form
- First Name: Required, 2-50 characters
- Last Name: Required, 2-50 characters
- Email: Required, valid email format
- Password: Required, 8+ characters with complexity requirements
- Confirm Password: Must match password
- Department: Required selection

## 🔒 Security Features

- **Input Validation**: Client-side validation with Zod
- **XSS Protection**: React's built-in XSS protection
- **Token Security**: Secure token storage and automatic refresh
- **Route Protection**: Protected routes require authentication
- **Error Handling**: Safe error message display

## 📱 Responsive Design

- Mobile-first approach
- Responsive grid layouts
- Touch-friendly interface
- Optimized for all screen sizes

## 🚀 Deployment

### Build for Production
```bash
npm run build
```

### Deploy to Static Hosting
The `dist` folder can be deployed to any static hosting service:
- Vercel
- Netlify
- AWS S3 + CloudFront
- GitHub Pages

### Environment Variables for Production
```env
VITE_API_URL=https://your-api-domain.com/api/v1
VITE_NODE_ENV=production
```

## 🤝 Contributing

1. Follow the existing code style
2. Use TypeScript for all new components
3. Add proper error handling
4. Test forms and validation
5. Ensure responsive design

## 📄 License

This project is part of the AI Chat Application and follows the same license terms.

---

**Note**: Make sure the backend API is running before starting the frontend development server.
