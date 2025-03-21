import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import RoomSelect from "@/pages/room-select";
import { SufufPage } from "@/pages/sufuf";
import ImamDashboard from "@/pages/imam";
import PublicImamDashboard from "@/pages/public-imam";
import DelenPage from "@/pages/delen";
import { Sidebar } from "@/components/Sidebar";
import { useState, useEffect } from "react";
import { getAuth } from "firebase/auth";
import { useLocation } from "wouter";

function Router() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useLocation();
  const auth = getAuth();

  useEffect(() => {
    if (window.innerWidth >= 768) {
      setIsSidebarOpen(true);
    }
  }, []);

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      if (!user && location !== '/login' && location !== '/public-imam') {
        setLocation('/login');
      }
    });

    return () => unsubscribe();
  }, [location]);

  const showSidebar = isLoggedIn && 
    !['/login', '/public-imam'].includes(location);

  return (
    <div className="min-h-screen flex flex-col w-full overflow-x-hidden">
      {showSidebar && (
        <Sidebar isOpen={isSidebarOpen} onToggle={() => setIsSidebarOpen(!isSidebarOpen)} />
      )}
      <main className={`relative flex-grow ${
        showSidebar ? (
          isSidebarOpen ? 
            'md:ml-56' : 
            'md:ml-16'
        ) : ''
      }`}>
        <Switch>
          <Route path="/login" component={Login} />
          <Route path="/" component={RoomSelect} />
          <Route path="/room-select" component={RoomSelect} />
          <Route path="/dashboard/:roomId" component={SufufPage} />
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