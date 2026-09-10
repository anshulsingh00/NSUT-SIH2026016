import React from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/layout/Header';
import { Sidebar } from './components/layout/Sidebar';
import { Footer } from './components/layout/Footer';
import { ToastContainer } from './components/layout/Toast';
import { GlobalSearchModal } from './components/common/GlobalSearchModal';

// Pages
import { LandingPage } from './components/landing/LandingPage';
import { AboutPage } from './components/landing/AboutPage';
import { LoginPage } from './components/auth/LoginPage';

// Officer Pages
import { OfficerDashboard } from './components/officer/OfficerDashboard';
import { ProjectList } from './components/officer/ProjectList';
import { ProjectDetail } from './components/officer/ProjectDetail';
import { CreateProjectWizard } from './components/officer/CreateProjectWizard';
import { LandParcelList } from './components/officer/LandParcelList';
import { LandParcelDetail } from './components/officer/LandParcelDetail';
import { GisMapModule } from './components/officer/GisMapModule';
import { DocumentOcrModule } from './components/officer/DocumentOcrModule';
import { CompensationManager } from './components/officer/CompensationManager';
import { RiskDelayMonitor } from './components/officer/RiskDelayMonitor';
import { OfficerNotifications } from './components/officer/OfficerNotifications';
import { OfficerAnalyticsModule } from './components/officer/OfficerAnalyticsModule';
import { OfficerProfile } from './components/officer/OfficerProfile';

// Landowner Pages
import { LandownerDashboard } from './components/landowner/LandownerDashboard';
import { LandownerDocuments } from './components/landowner/LandownerDocuments';
import { LandownerPaymentStatus } from './components/landowner/LandownerPaymentStatus';
import { LandownerAssistantPage } from './components/landowner/LandownerAssistantPage';
import { LandownerNotifications } from './components/landowner/LandownerNotifications';
import { LandownerChatbotWidget } from './components/landowner/LandownerChatbotWidget';
import CitizenKYCProfile from './components/landowner/CitizenKYCProfile';

// Admin Pages
import { AdminDashboard } from './components/admin/AdminDashboard';
import { DepartmentMaster } from './components/admin/DepartmentMaster';
import { ProjectGovernance } from './components/admin/ProjectGovernance';

const AppContent: React.FC = () => {
  const { currentRoute, currentUser, currentRole, navigate, showToast } = useApp();

  const isLandownerRoute = currentRoute.startsWith('/landowner');
  const isOfficerRoute = currentRoute.startsWith('/officer');
  const isAdminRoute = currentRoute.startsWith('/admin');
  const isProtectedRoute = isLandownerRoute || isOfficerRoute || isAdminRoute;

  // Protect routes and enforce role-based access control
  React.useEffect(() => {
    if (isProtectedRoute) {
      if (!currentUser) {
        showToast(
          'Authentication Required',
          isLandownerRoute
            ? 'Please log in with your registered credentials to access your landowner records and BhoomiMitra AI.'
            : 'Please log in to access this official portal section.',
          'warning'
        );
        navigate('/login');
      } else {
        // Enforce role-based access control
        if (isLandownerRoute && currentUser.role !== 'LANDOWNER') {
          showToast('Unauthorized', 'You do not have permission to view citizen records.', 'error');
          navigate(currentUser.role === 'ADMIN' ? '/admin/dashboard' : '/officer/dashboard');
        } else if (isOfficerRoute && currentUser.role !== 'OFFICER' && currentUser.role !== 'ADMIN') {
          showToast('Unauthorized', 'You do not have permission to access officer operational modules.', 'error');
          navigate(currentUser.role === 'LANDOWNER' ? '/landowner/dashboard' : '/admin/dashboard');
        } else if (isAdminRoute && currentUser.role !== 'ADMIN') {
          showToast('Unauthorized', 'Administrative privileges required.', 'error');
          navigate(currentUser.role === 'LANDOWNER' ? '/landowner/dashboard' : '/officer/dashboard');
        }
      }
    }
  }, [currentRoute, currentUser, isProtectedRoute, isLandownerRoute, isOfficerRoute, isAdminRoute, navigate, showToast]);

  const renderRoute = () => {
    // If trying to access a protected route without being authenticated, display login
    if (isProtectedRoute && !currentUser) {
      return <LoginPage />;
    }

    // Role-based rendering protection (prevents flash of unauthorized content before redirect)
    if (isLandownerRoute && currentUser?.role !== 'LANDOWNER') return null;
    if (isOfficerRoute && currentUser?.role !== 'OFFICER' && currentUser?.role !== 'ADMIN') return null;
    if (isAdminRoute && currentUser?.role !== 'ADMIN') return null;

    switch (currentRoute) {
      case '/':
        return <LandingPage />;
      case '/about':
        return <AboutPage />;
      case '/login':
        return <LoginPage />;

      // Officer Routes
      case '/officer/dashboard':
        return <OfficerDashboard />;
      case '/officer/reports':
      case '/officer/analytics':
        return <OfficerAnalyticsModule />;
      case '/officer/projects':
        return <ProjectList />;
      case '/officer/projects/create':
        return <CreateProjectWizard />;
      case '/officer/projects/:id':
        return <ProjectDetail />;
      case '/officer/land-parcels':
        return <LandParcelList />;
      case '/officer/land-parcels/:id':
        return <LandParcelDetail />;
      case '/officer/map':
        return <GisMapModule />;
      case '/officer/documents':
        return <DocumentOcrModule />;
      case '/officer/compensation':
        return <CompensationManager />;
      case '/officer/risk-monitor':
        return <RiskDelayMonitor />;
      case '/officer/notifications':
        return <OfficerNotifications />;
      case '/officer/profile':
        return <OfficerProfile />;

      // Landowner Routes
      case '/landowner/dashboard':
      case '/landowner/my-land':
      case '/landowner/my-land/:id':
        return <LandownerDashboard />;
      case '/landowner/assistant':
        return <LandownerAssistantPage />;
      case '/landowner/profile':
        return <CitizenKYCProfile />;
      case '/landowner/documents':
        return <LandownerDocuments />;
      case '/landowner/notifications':
        return <LandownerNotifications />;
      case '/landowner/payments':
      case '/landowner/compensation':
        return <LandownerPaymentStatus />;

      // Admin Routes
      case '/admin/dashboard':
      case '/admin/reports':
      case '/admin/users':
      case '/admin/settings':
      case '/admin/audit-logs':
        return <AdminDashboard />;
      case '/admin/departments':
        return <DepartmentMaster />;
      case '/admin/projects':
        return <ProjectGovernance />;

      default:
        return <LandingPage />;
    }
  };

  const isPublicRoute = currentRoute === '/' || currentRoute === '/about' || currentRoute === '/login' || !currentUser;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 flex flex-col font-sans text-slate-800 dark:text-slate-200 selection:bg-blue-600 selection:text-white transition-colors duration-200">
      {/* Universal GovTech Header */}
      <Header />

      {/* Main Body */}
      {isPublicRoute ? (
        <main className="flex-1 flex flex-col">
          {renderRoute()}
        </main>
      ) : (
        <div className="flex-1 flex flex-col md:flex-row max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 gap-6">
          {/* Responsive Sidebar */}
          <aside className="w-full md:w-64 shrink-0">
            <Sidebar />
          </aside>

          {/* Main Dashboard Workspace */}
          <main className="flex-1 min-w-0">
            {renderRoute()}
          </main>
        </div>
      )}

      {/* Global Modals & Notifications */}
      <GlobalSearchModal />
      <ToastContainer />

      {/* Chatbot is displayed ONLY after successful owner authentication */}
      {currentUser && currentUser.role === 'LANDOWNER' && (
        <LandownerChatbotWidget />
      )}

      {/* Standardized GovTech Footer */}
      <Footer />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
};

export default App;
