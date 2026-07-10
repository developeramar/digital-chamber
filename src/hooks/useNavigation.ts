import { useState } from 'react';

export function useNavigation() {
  const [currentView, setCurrentView] = useState('dashboard');
  const [navigationHistory, setNavigationHistory] = useState<string[]>([]);
  const [viewParams, setViewParams] = useState<any>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigateToView = (view: string, data: any = null) => {
    setNavigationHistory(prev => [...prev, currentView]);
    setCurrentView(view);
    setViewParams(data);
    setSidebarOpen(false);
  };

  const navigateBack = () => {
    if (navigationHistory.length > 0) {
      const previous = navigationHistory[navigationHistory.length - 1];
      setNavigationHistory(prev => prev.slice(0, -1));
      setCurrentView(previous);
    } else {
      setCurrentView('dashboard');
    }
  };

  return {
    currentView,
    navigationHistory,
    viewParams,
    sidebarOpen,
    setSidebarOpen,
    navigateToView,
    navigateBack,
  };
}
