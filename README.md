# City Services Recommendation System

A modern, intelligent city services platform built with React, TypeScript, and Vite that helps users discover, compare, and bookmark various city services including accommodation, food delivery, and more.

## 🚀 Quick Start

### Local Development

**1. Start the Python AI Backend:**
```powershell
cd "c:\Documents\isha's 5th august latest\cityservices"
python AI\server.py
```

**2. Start the Frontend (new terminal):**
```powershell
npm install  # First time only
npm run dev
```

**3. Open:** http://localhost:5000

### Deploy to Vercel

See **[VERCEL_DEPLOYMENT.md](./VERCEL_DEPLOYMENT.md)** for complete deployment instructions.

## 🌟 Features

### 🤖 AI-Powered Recommendations
- **Personalized suggestions** based on user wishlist and behavior
- **Smart algorithms** using collaborative filtering and market basket analysis
- **Automatic fallback** to sample data when backend is unavailable
- **Real-time updates** from Supabase database

### 🔍 Service Search & Discovery
- Advanced search with multiple filters:
  - Location/Area-based filtering
  - Price range selection
  - Rating-based filtering
  - Category-based filtering
- Real-time search results
- Interactive service cards with detailed information
- Modern, responsive grid/list view toggle

### 📊 Smart Dashboard
- Cost comparison charts
- Expense breakdown visualization
- Service popularity metrics
- Interactive data visualizations

### 🔖 Bookmarking System
- Save favorite services
- Synchronized bookmarks for logged-in users
- Local storage for guest users
- Easy access to saved services

### 👤 User Authentication & Profile
- Secure user registration and login
- Profile management
- Password recovery functionality
- Protected routes for authenticated users
### 💰 Cost Calculator
- Compare service prices
- Calculate estimated expenses
- Budget planning tools
- Cost breakdown analysis

### 🏘️ Accommodation Services
- Property listings across multiple cities:
  - Ahmedabad
  - Baroda
  - Gandhinagar
  - Rajkot
  - Surat
- Detailed property information
- Image galleries
- Location-based search

### 🍽️ Food Services
- Restaurant listings
- Tiffin service providers
- Food delivery options
- Menu and pricing details

## 🛠️ Technical Stack

### Frontend
- React 18
- TypeScript
- Vite
- Tailwind CSS
- Lucide React (for icons)
- Chart.js (for data visualization)

### Backend
- Node.js
- Express
- PostgreSQL
- Supabase
- JWT Authentication
### Data Management
- CSV parsing with PapaParse
- Local storage optimization
- Supabase real-time updates

## 🚀 Getting Started

1. Clone the repository:
\`\`\`bash
git clone https://github.com/isha-1212/cityservices.git
\`\`\`

2. Install dependencies:
\`\`\`bash
npm install
\`\`\`

3. Set up environment variables:
\`\`\`bash
cp .env.example .env
# Edit .env with your configuration
\`\`\`

4. Start the development server:
\`\`\`bash
npm run dev
\`\`\`

## 📱 Mobile Responsiveness
- Fully responsive design
- Mobile-first approach
- Touch-friendly interface
- Adaptive layouts for all screen sizes

## 🔒 Security Features
- JWT-based authentication
- Secure password handling
- Protected API endpoints
- Data encryption

## 🌐 Supported Cities
- Ahmedabad
- Baroda
- Gandhinagar
- Rajkot
- Surat

## 📂 Project Structure

\`\`\`
src/
├── components/         # React components
├── config/            # Configuration files
├── data/             # Static data and mock services
├── types/            # TypeScript type definitions
└── utils/            # Utility functions

backend/
├── src/              # Backend source code
├── schema.sql        # Database schema
└── server.js         # Express server setup
\`\`\`

## 🤝 Contributing
1. Fork the repository
2. Create your feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## 📄 License
This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments
- Icons by Lucide React
- UI components inspired by Tailwind CSS
- Chart visualizations powered by Chart.js
If backend present, fetch /api/dashboard/summary.
Data shapes (canonical)
Service

{ id: string, name: string, city: string, category: string, description?: string, price_min?: number, price_max?: number, rating?: number, images?: string[], metadata?: object, created_at?: string }
Bookmark (server)

{ id: number, user_id: number, service_id: string, meta?: object, created_at: string }
User

{ id: number, name: string, email: string }
API error

{ error: { code: string, message: string } }
Bookmark behavior & sync strategy
Offline / logged-out:
Maintain local_bookmarks (Array<string>). UI reads this for bookmarked state.
Logged-in:
Server is authoritative. When user logs in:
Option A (simple): don't auto-merge; keep server list only.
Option B (recommended): fetch server bookmarks, find local_bookmarks not present, call either POST /api/bookmarks per id or a batch endpoint to create them, then clear local_bookmarks (or keep as cached copy). Handle conflicts via unique constraint.
Implementation notes:
Keep bookmark_map (service_id → bookmark_id) in memory for quick DELETE mapping.
Backend should have UNIQUE(user_id, service_id).
UX & accessibility
Keyboard navigation for cards and bookmark buttons.
Screen-reader labels for interactive controls.
Announce state changes (toast/ARIA-live) for bookmark add/remove and form submissions.
Mobile-first: cards stack, filters collapse into a modal/accordion on small screens.
Network UX (performance & reliability)
Debounce search input (300ms).
Paginate results; server returns meta.total.
Optimistic UI for bookmark toggle (apply UI change immediately, revert on server error).
Cache service list pages in memory to support back/forward navigation without re-fetch.
Testing suggestions (what to test)
Unit: ServiceCard, bookmark toggle logic, utils (debounce, api wrapper).
Integration: ServiceSearch fetch + filters producing correct API calls.
End-to-end: Login → bookmark sync → ensure server record created.
Accessibility checks: keyboard, ARIA labels, color contrast.
