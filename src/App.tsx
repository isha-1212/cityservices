import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import { ServiceSearch } from './components/ServiceSearch';
import { Bookmarks } from './components/Bookmarks';
import { Profile } from './components/Profile';
import { AuthPage } from './AuthPage';
import { ToastContainer } from './components/Toast';
import CostCalculatorPage from './CostCalculatorPage';


function App() {
  const [user, setUser] = useState<any>(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    return token && userData ? JSON.parse(userData) : null;
  });
  const [currentPage, setCurrentPage] = useState('dashboard');

  const handleAuth = (user: any, token: string) => {
    setUser(user);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
  };

  const handleSignOut = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  if (!user) {
    // mount ToastContainer even on the auth page so toasts are visible before login
    return (
      <>
        <AuthPage onAuth={handleAuth} />
        <ToastContainer />
      </>
    );
  }

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return <ServiceSearch />;
      case 'calculator':
        return <CostCalculatorPage />;
      case 'bookmarks':
        return <Bookmarks />;
      case 'profile':
        return <Profile />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <Layout currentPage={currentPage} onPageChange={setCurrentPage}>
      <div className="flex justify-end p-2">
        <button className="bg-red-500 text-white px-3 py-1 rounded" onClick={handleSignOut}>
          Sign Out
        </button>
      </div>
      {/* dev-only Test Toast removed per user request */}
      {renderCurrentPage()}
      <ToastContainer />
    </Layout>
  );
}

export default App;