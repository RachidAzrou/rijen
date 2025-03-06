import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import { SufufPage } from "@/pages/sufuf";
import ImamDashboard from "@/pages/imam";
import PublicImamDashboard from "@/pages/public-imam";
import DelenPage from "@/pages/delen";
import { Sidebar } from "@/components/Sidebar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

function Router() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean | null>(null);
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  useEffect(() => {
    try {
      const unsubscribe = auth.onAuthStateChanged((user) => {
        console.log('Auth state changed:', user ? 'logged in' : 'logged out');
        setIsLoggedIn(!!user);

        // Redirect to login if not authenticated and not on public routes
        if (!user && 
            location !== '/login' && 
            location !== '/public-imam' && 
            !location.startsWith('/static/')) {
          console.log('Redirecting to login');
          setLocation('/login');
        }
      }, (error) => {
        console.error('Auth state change error:', error);
        setIsLoggedIn(false);
      });

      return () => unsubscribe();
    } catch (error) {
      console.error('Error in auth state change:', error);
      setIsLoggedIn(false);
    }
  }, [location, setLocation]);

  // Show loading state while checking authentication
  if (isLoggedIn === null && location !== '/public-imam') {
    return (
      <div className="min-h-screen w-full flex items-center justify-center">
        <div className="text-[#963E56]">Loading...</div>
      </div>
    );
  }

  const showSidebar = isLoggedIn && location !== '/login' && location !== '/public-imam';

  return (
    <div className="min-h-screen w-full bg-gray-50/50">
      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}
      <main className={`relative transition-all duration-300
        ${showSidebar ? (
          isSidebarOpen ? 
            'md:ml-56' : 
            'md:ml-12'
        ) : ''}`}
      >
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={SufufPage} />
          <Route path="/imam" component={ImamDashboard} />
          <Route path="/public-imam" component={PublicImamDashboard} />
          <Route path="/delen" component={DelenPage} />
          <Route component={NotFound} />
        </Switch>
      </main>
    </div>
  );
}

function App() {
  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Router />
        <Toaster />
      </QueryClientProvider>
    </ErrorBoundary>
  );
}

export default App;