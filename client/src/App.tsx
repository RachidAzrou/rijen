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
import { useState, useEffect } from "react";
import { auth } from "@/lib/firebase";
import { useLocation } from "wouter";

function Router() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location] = useLocation();

  // Close sidebar on mobile when route changes
  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
    });

    return () => unsubscribe();
  }, []);

  // Don't show sidebar on login page or public imam dashboard
  const showSidebar = isLoggedIn && location !== '/login' && location !== '/public-imam';

  return (
    <div className="min-h-screen w-full relative">
      {/* Background Image for all pages */}
      <div 
        className="fixed inset-0 z-0"
        style={{
          backgroundImage: "url('/static/123.jpg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          backgroundRepeat: 'no-repeat',
          opacity: 0.7
        }}
      />

      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}
      <main className={`relative z-10 transition-all duration-300
        ${showSidebar ? (
          isSidebarOpen ? 
            'ml-0 md:ml-64' : 
            'ml-0 md:ml-16'
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
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;