
import React from 'react';
import { useAuth } from './index';
import { LoadingSpinner } from './components/common/LoadingSpinner';
import { Layout } from './components/layout/Layout';
import { LandingPage } from './components/pages/LandingPage';
import { AdminPage } from './components/pages/AdminPage';
import { SetupPage } from './components/pages/SetupPage';
import { DashboardPage } from './components/pages/DashboardPage';

function App() {
  const { user, loading } = useAuth();

  if (loading) {
    return <LoadingSpinner />;
  }

  const renderAuthenticatedApp = () => {
    if (user?.role === 'admin') {
      return <AdminPage />;
    }
    if (!user?.sheetId) {
      return <SetupPage />;
    }
    return <DashboardPage />;
  };

  return (
    <Layout>
      {!user ? <LandingPage /> : renderAuthenticatedApp()}
    </Layout>
  );
}

export default App;