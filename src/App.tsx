import React, { useState, useEffect } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { default as ServiceSearch } from './components/ServiceSearch';
import { Bookmarks } from './components/Bookmarks';
import { Profile } from './components/Profile';
import { AuthPage } from './AuthPage';
import { ToastContainer } from './components/Toast';
import { AuthTest } from './components/AuthTest';
import CostCalculatorPage from './CostCalculatorPage';
import TiffinRentalList from './components/TiffinRentalList';
import { LoginPromptModal } from './components/LoginPromptModal';
import { AdminPanel } from './components/AdminPanel';
import { supabase } from './config/supabase';
import { FilterCriteria } from './utils/serviceFilteringLogic';


function App() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('dashboard');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [showAuthPage, setShowAuthPage] = useState(false);
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);

  // Service search filter state - lifted to persist across page switches
  const [criteria, setCriteria] = useState<FilterCriteria>({
    searchQuery: '',
    selectedCity: '',
    selectedTypes: [],
    priceRange: [0, 100000],
    minRating: 0,
    areaQuery: '',
    foodQuery: '',
    tiffinQuery: ''
  });
  const [areaQuery, setAreaQuery] = useState('');
  const [foodQuery, setFoodQuery] = useState('');
  const [tiffinQuery, setTiffinQuery] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeView, setActiveView] = useState<'combined' | 'individual'>('combined');
  const [sortOrder, setSortOrder] = useState<'priceLowToHigh' | 'priceHighToLow'>('priceLowToHigh');
  const [wishlistCount, setWishlistCount] = useState(0);
  const headerRef = React.createRef<HTMLDivElement>();

  // Initialize authentication state
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        const userData = {
          id: session.user.id,
          email: session.user.email,
          name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
          avatar_url: session.user.user_metadata?.avatar_url,
          supabase: true
        };
        setUser(userData);
        // Store in localStorage for consistency
        localStorage.setItem('token', session.access_token);
        localStorage.setItem('user', JSON.stringify(userData));
      } else {
        // Clear any stale data
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setUser(null);
      }
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session?.user?.id);

        if (event === 'PASSWORD_RECOVERY') {
          // User clicked password reset link - show auth page with reset modal
          setIsPasswordRecovery(true);
          setShowAuthPage(true);
        } else if (event === 'SIGNED_IN' && session?.user) {
          const userData = {
            id: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            avatar_url: session.user.user_metadata?.avatar_url,
            supabase: true
          };
          setUser(userData);
          localStorage.setItem('token', session.access_token);
          localStorage.setItem('user', JSON.stringify(userData));
          setIsPasswordRecovery(false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          // Clear user-specific data
          clearUserSpecificData();
          setIsPasswordRecovery(false);
        }
        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Load service search state from localStorage
  useEffect(() => {
    try {
      const raw = localStorage.getItem('service_search_state');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed.criteria) {
          setCriteria(parsed.criteria);
          setAreaQuery(parsed.criteria.areaQuery || '');
          setFoodQuery(parsed.criteria.foodQuery || '');
          setTiffinQuery(parsed.criteria.tiffinQuery || '');
        }
        if (parsed.viewMode) setViewMode(parsed.viewMode);
        if (parsed.activeView) setActiveView(parsed.activeView);
        if (parsed.sortOrder) setSortOrder(parsed.sortOrder);
      }
    } catch (e) {
      // ignore parse errors
    }
  }, []);

  // Load wishlist count
  useEffect(() => {
    const updateWishlistCount = async () => {
      if (!user) {
        setWishlistCount(0);
        return;
      }

      try {
        const { UserStorage } = await import('./utils/userStorage');
        const ids = await UserStorage.getWishlistFromDB();
        setWishlistCount(ids.length);
      } catch (error) {
        console.error('Failed to load wishlist count:', error);
        setWishlistCount(0);
      }
    };

    updateWishlistCount();

    // Listen for wishlist changes
    const handleWishlistChange = () => {
      updateWishlistCount();
    };

    window.addEventListener('wishlist:changed', handleWishlistChange);
    window.addEventListener('bookmarks:changed', handleWishlistChange);

    return () => {
      window.removeEventListener('wishlist:changed', handleWishlistChange);
      window.removeEventListener('bookmarks:changed', handleWishlistChange);
    };
  }, [user]);

  // Save service search state to localStorage
  useEffect(() => {
    try {
      const toSave = {
        criteria: { ...criteria, areaQuery, foodQuery, tiffinQuery },
        viewMode,
        activeView,
        sortOrder
      };
      localStorage.setItem('service_search_state', JSON.stringify(toSave));
    } catch (e) {
      // ignore storage errors
    }
  }, [criteria, viewMode, activeView, sortOrder, areaQuery, foodQuery, tiffinQuery]);

  const clearUserSpecificData = () => {
    // Clear user-specific localStorage data
    const keysToRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.includes('user_') || key === 'local_bookmarks' || key === 'local_bookmark_items')) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach(key => localStorage.removeItem(key));
  };

  const handleAuth = (user: any, token: string) => {
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    // Return to main app after successful login
    setShowAuthPage(false);
  };

  const handleSignOut = async () => {
    setLoading(true);
    try {
      await supabase.auth.signOut();
      // The onAuthStateChange listener will handle cleanup
    } catch (error) {
      console.error('Sign out error:', error);
      // Fallback cleanup
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      clearUserSpecificData();
    } finally {
      setLoading(false);
    }
  };

  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-500 border-t-transparent mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show auth page when explicitly requested
  if (showAuthPage) {
    return (
      <>
        <AuthPage onAuth={handleAuth} isPasswordRecovery={isPasswordRecovery} />
        <ToastContainer />
      </>
    );
  }

  const handleAuthRequired = () => {
    setShowAuthPage(true);
  };

  const handleLoginPrompt = () => {
    setShowAuthModal(false);
    setShowAuthPage(true);
  };

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return (
          <ServiceSearch
            user={user}
            headerRef={headerRef}
            onAuthRequired={handleAuthRequired}
            criteria={criteria}
            setCriteria={setCriteria}
            areaQuery={areaQuery}
            setAreaQuery={setAreaQuery}
            foodQuery={foodQuery}
            setFoodQuery={setFoodQuery}
            tiffinQuery={tiffinQuery}
            setTiffinQuery={setTiffinQuery}
            viewMode={viewMode}
            setViewMode={setViewMode}
            activeView={activeView}
            setActiveView={setActiveView}
            sortOrder={sortOrder}
            setSortOrder={setSortOrder}
          />
        );
      case 'tiffin':
        return <TiffinRentalList />;
      case 'calculator':
        return <CostCalculatorPage user={user} />;
      case 'admin':
        return <AdminPanel user={user} />;
      case 'bookmarks':
        return <Bookmarks user={user} onAuthRequired={handleAuthRequired} />;
      case 'profile':
        return <Profile user={user} onAuthRequired={handleAuthRequired} />;
      case 'authtest':
        return <AuthTest />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout 
      currentPage={currentPage} 
      onPageChange={setCurrentPage} 
      onSignOut={user ? handleSignOut : undefined} 
      headerRef={headerRef}
      user={user}
      wishlistCount={wishlistCount}
    >
      {renderCurrentPage()}
      <LoginPromptModal
        isOpen={showAuthModal}
        onClose={() => setShowAuthModal(false)}
        onLogin={handleLoginPrompt}
        message="You need to login to save items to your wishlist or edit your profile."
      />
      <ToastContainer />
    </Layout>
  );
}

export default App;