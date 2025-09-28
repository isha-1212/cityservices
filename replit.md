# Overview

This is an Intelligent City Services Recommendation System built as a React-based single-page application. The platform helps users discover, compare, and bookmark various city services including accommodation, food delivery, tiffin services, transport, coworking spaces, and utilities across Indian cities (primarily focused on Gujarat). The app features a comprehensive dashboard with cost analysis charts, searchable service catalog with advanced filtering, bookmark management with local and server-backed storage, and user authentication with profile management.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React 18 with TypeScript for type safety and modern development patterns
- **Build Tool**: Vite for fast development and optimized production builds
- **Styling**: Tailwind CSS for utility-first responsive design
- **State Management**: React Context API for authentication state, local component state for UI interactions
- **Routing**: Client-side navigation using conditional rendering based on page state
- **Icons**: Lucide React for consistent iconography

## Component Structure
- **Layout Component**: Provides app shell with responsive navigation and header
- **Page Components**: Dashboard (with charts), ServiceSearch (main catalog), Bookmarks, Profile, Cost Calculator
- **Shared Components**: ServiceCard, ServiceDetails modal, Toast notifications, AuthForm
- **Chart Components**: CostComparisonChart and ExpenseBreakdownChart for data visualization

## Data Management
- **Static Data**: Mock services data with predefined accommodation, food, and service listings
- **Dynamic Data**: CSV parsing using PapaParse for loading external service data (food services from Swiggy data)
- **Local Storage**: Bookmark persistence, authentication tokens, user preferences, search filters
- **Area Data**: Comprehensive mapping of Ahmedabad localities with images and listing URLs

## Authentication & Authorization
- **Strategy**: JWT-based authentication with localStorage token storage (demo implementation)
- **Protected Routes**: Profile page requires authentication
- **User Management**: Registration and login flows with form validation
- **Session Handling**: Automatic token attachment to API requests

## Backend Architecture
- **Server**: Express.js with TypeScript support
- **Database**: PostgreSQL with connection pooling
- **Authentication**: bcrypt for password hashing, JWT for session management
- **Schema Management**: Automatic SQL schema application on startup
- **API Design**: RESTful endpoints for user management and bookmark synchronization

# External Dependencies

## Core Frontend Libraries
- **React & React DOM**: UI framework and DOM rendering
- **Vite**: Development server and build tool with React plugin
- **Tailwind CSS**: Utility-first CSS framework with PostCSS and Autoprefixer
- **TypeScript**: Static typing and enhanced development experience
- **Lucide React**: Icon library for consistent UI elements

## Data Processing
- **PapaParse**: CSV parsing for external service data integration
- **csv-parse & csv-parser**: Alternative CSV processing utilities for backend data handling

## Backend Infrastructure
- **Express**: Web server framework
- **PostgreSQL (pg)**: Primary database with connection pooling
- **bcrypt**: Password hashing for secure authentication
- **jsonwebtoken**: JWT token generation and verification
- **dotenv**: Environment variable management

## Development Tools
- **ESLint**: Code linting with React-specific rules and TypeScript support
- **TypeScript ESLint**: Enhanced linting for TypeScript code
- **Globals**: Global variable definitions for browser environment

## Potential External Services
- **Supabase**: Database and authentication service (dependency present but not actively used)
- **Housing.com**: Property listing integration for accommodation services
- **Third-party APIs**: Food delivery and service provider integrations