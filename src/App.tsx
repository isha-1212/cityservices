import { useState } from 'react';
import { Layout } from './components/Layout';
import { Dashboard } from './components/Dashboard';
import ServiceSearch from './components/ServiceSearch';
import { Bookmarks } from './components/Bookmarks';
import { Profile } from './components/Profile';
import { ToastContainer } from './components/Toast';
import CostCalculatorPage from './CostCalculatorPage';
import TiffinRentalList from './components/TiffinRentalList';


function App() {
  const [currentPage, setCurrentPage] = useState('dashboard');

  const renderCurrentPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <Dashboard />;
      case 'search':
        return <ServiceSearch />;
      case 'tiffin':
        return <TiffinRentalList />;
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
      {/* dev-only Test Toast removed per user request */}
      {renderCurrentPage()}
      <ToastContainer />
    </Layout>
  );
}

export default App;