# CityServices - Smart City Living Platform

## 🌟 **Project Overview**
CityServices is a comprehensive web application for discovering, managing, and calculating costs for various city services including accommodation, food, transport, and more.

## ✨ **Key Features**
- **Smart Service Discovery**: Find the best city services tailored to your needs
- **Cost Calculator**: Budget analysis and expense planning
- **Admin Panel**: Service management with proper user isolation  
- **Wishlist Management**: Save and organize your favorite services
- **Mobile-Optimized**: Perfect responsive design for all devices
- **User Authentication**: Secure login with Google OAuth and manual signup

## 🎯 **Recent Major Improvements**
- ✅ Changed "Dashboard" to "For You" for better UX
- ✅ Fixed admin service isolation (each admin only sees their own services)
- ✅ Perfected mobile view for cost calculator
- ✅ Streamlined profile page (removed unnecessary tabs)
- ✅ Enhanced admin panel with proper ownership controls
- ✅ Improved authentication with better error handling

## 🚀 **Tech Stack**
- **Frontend**: React, TypeScript, Tailwind CSS, Vite
- **Backend**: Node.js, Express, Supabase
- **Database**: PostgreSQL (Supabase)
- **Authentication**: Supabase Auth with Google OAuth
- **Deployment**: Vercel
- **Version Control**: Git, GitHub

## 📱 **Mobile Experience**
- Responsive design optimized for all screen sizes
- Touch-friendly interface with proper button sizing
- Optimized typography and spacing for mobile screens
- Perfect mobile cost calculator with compact layouts

## 🔧 **Setup Instructions**
1. Clone the repository
2. Install dependencies: `npm install`
3. Set up environment variables (see .env.example)
4. Run development server: `npm run dev`
5. Access at http://localhost:5000

## 📊 **Project Structure**
```
src/
├── components/          # React components
├── data/               # Mock data and area information
├── utils/              # Utility functions
├── config/             # Supabase and API configuration
└── types/              # TypeScript type definitions
```

## 🎨 **Key Components**
- **ModernCityServicesApp**: Main application component
- **ServiceSearch**: Advanced service discovery with filtering
- **CostCalculator**: Budget planning and cost analysis
- **AdminPanel**: Service management for administrators
- **Dashboard**: Personalized recommendations ("For You" page)
- **Profile**: User account management

## 🔐 **Admin Features**
- Service creation and management
- Admin-only service visibility
- Proper ownership controls
- Enhanced admin panel UI

## 🌐 **Live Demo**
Visit the live application: [Your Vercel URL]

## 👨‍💻 **Contributing**
This project is part of SGP (Student Guided Project) development.

## 📄 **License**
Educational project for SGP coursework.

---
**Built with ❤️ for Smart City Living**