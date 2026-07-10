import React from 'react';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { useClients } from './hooks/useClients';
import { useHearings } from './hooks/useHearings';
import { usePayments } from './hooks/usePayments';
import { useNavigation } from './hooks/useNavigation';
import { useClientActions } from './hooks/useClientActions';
import { useHearingActions } from './hooks/useHearingActions';
import { usePaymentActions } from './hooks/usePaymentActions';

import LoginScreen from './components/LoginScreen';
import DashboardView from './components/DashboardView';
import AddClientView from './components/AddClientView';
import ClientListView from './components/ClientListView';
import ClientDetailsView from './components/ClientDetailsView';
import DailyRegisterView from './components/DailyRegisterView';
import ReportsView from './components/ReportsView';

import Sidebar from './components/layout/Sidebar';
import MobileSidebar from './components/layout/MobileSidebar';
import Header from './components/layout/Header';
import PageContainer from './components/layout/PageContainer';
import ErrorBanner from './components/layout/ErrorBanner';

import { AlertCircle } from 'lucide-react';

function MainApp() {
  const { currentUser, isDemo, logout, handleLoginSuccess, authChecked } = useAuth();

  // Custom hooks for base state management
  const clientsHook = useClients();
  const hearingsHook = useHearings();
  const paymentsHook = usePayments();
  
  // Navigation hook
  const navigation = useNavigation();

  // Specialized action hooks to delegate business logic and CRUD operations
  const { handleSaveClient, handleDeleteClient } = useClientActions(
    clientsHook,
    hearingsHook,
    paymentsHook,
    navigation
  );

  const { handleAddHearing, handleUpdateHearingStatus, handleDeleteHearing } = useHearingActions(
    hearingsHook,
    clientsHook
  );

  const { handleAddPayment, handleDeletePayment } = usePaymentActions(
    paymentsHook,
    clientsHook
  );

  const { clients, error: clientError, updateClientDocuments, updateClientNotes, updateClientPrivateNotes, updateClientScans } = clientsHook;
  const { hearings } = hearingsHook;
  const { payments } = paymentsHook;
  const { currentView, sidebarOpen, setSidebarOpen, navigateToView, navigateBack, viewParams } = navigation;

  // Show loading spinner while Firebase Authentication is initializing
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center font-sans">
        <div className="text-center">
          <div className="h-8 w-8 border-4 border-amber-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-400 text-sm font-medium">Loading Digital Chamber...</p>
        </div>
      </div>
    );
  }

  // Not logged in -> Show Login/Signup Screen
  if (!currentUser) {
    return <LoginScreen onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div className="h-screen bg-slate-950 text-slate-100 flex font-sans overflow-hidden">
      
      {/* 1. SIDEBAR NAVIGATION - DESKTOP */}
      <Sidebar 
        user={currentUser} 
        isDemo={isDemo} 
        currentView={currentView} 
        clients={clients}
        onNavigate={navigateToView} 
        onLogout={logout} 
      />

      {/* 2. MOBILE FLOATING SIDEBAR DRAWER */}
      <MobileSidebar 
        isOpen={sidebarOpen} 
        onClose={() => setSidebarOpen(false)} 
        user={currentUser} 
        isDemo={isDemo} 
        currentView={currentView} 
        clients={clients}
        onNavigate={navigateToView} 
        onLogout={logout} 
      />

      {/* 3. MAIN WORKSPACE CONTAINER */}
      <div className="flex-grow flex flex-col h-full overflow-hidden min-w-0">
        
        {/* Mobile Header Bar */}
        <Header onMenuClick={() => setSidebarOpen(true)} user={currentUser} />

        {/* Content canvas */}
        <PageContainer>
          {clientError && <ErrorBanner error={clientError} />}

          {currentView === 'dashboard' && (
            <DashboardView 
              clients={clients} 
              hearings={hearings} 
              onNavigateToView={navigateToView}
              onUpdateHearingStatus={handleUpdateHearingStatus}
              user={currentUser}
            />
          )}

          {currentView === 'add-client' && (
            <AddClientView 
              onAddClient={handleSaveClient} 
              onNavigateBack={navigateBack}
              editClientData={viewParams?.editClient}
            />
          )}

          {currentView === 'client-list' && (
            <ClientListView 
              clients={clients} 
              onNavigateToView={navigateToView}
              onDeleteClient={handleDeleteClient}
              initialSearchTerm={viewParams?.search || ''}
            />
          )}

          {currentView === 'client-details' && (() => {
            const client = clients.find(c => c.id === viewParams?.clientId);
            if (!client) {
              return (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800 text-slate-400 text-xs flex items-center gap-2">
                  <AlertCircle className="h-5 w-5 text-rose-400 shrink-0" />
                  <span>Case file not found or has been deleted.</span>
                  <button onClick={navigateBack} className="text-amber-500 font-medium hover:underline ml-auto">Go Back</button>
                </div>
              );
            }
            return (
              <ClientDetailsView 
                client={client}
                hearings={hearings}
                payments={payments}
                onNavigateBack={navigateBack}
                onNavigateToEdit={(cl) => navigateToView('add-client', { editClient: cl })}
                onAddHearing={handleAddHearing}
                onUpdateHearingStatus={handleUpdateHearingStatus}
                onDeleteHearing={handleDeleteHearing}
                onAddPayment={handleAddPayment}
                onDeletePayment={handleDeletePayment}
                onUpdateClientDocuments={updateClientDocuments}
                onUpdateClientNotes={updateClientNotes}
                onUpdateClientPrivateNotes={updateClientPrivateNotes}
                onUpdateClientScans={updateClientScans}
                initialTab={viewParams?.activeTab || 'info'}
              />
            );
          })()}

          {currentView === 'daily-register' && (
            <DailyRegisterView 
              clients={clients} 
              hearings={hearings} 
              onNavigateToView={navigateToView}
              onUpdateHearingStatus={handleUpdateHearingStatus}
            />
          )}

          {currentView === 'reports' && (
            <ReportsView 
              clients={clients} 
              hearings={hearings} 
              payments={payments} 
              onNavigateToView={navigateToView}
            />
          )}
        </PageContainer>
      </div>

    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <MainApp />
    </AuthProvider>
  );
}
