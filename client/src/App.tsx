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
import { auth } from "@/lib/firebase";
import { useLocation, useLocation as useLocationHook } from "wouter";

function Router() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [location, setLocation] = useLocationHook();

  useEffect(() => {
    if (window.innerWidth < 768) {
      setIsSidebarOpen(false);
    }
  }, [location]);

  useEffect(() => {
    const unsubscribe = auth.onAuthStateChanged((user) => {
      setIsLoggedIn(!!user);
      if (!user && location !== '/login') {
        setLocation('/login');
      }
    });

    return () => unsubscribe();
  }, []);

  // Don't show sidebar on login and public pages
  const showSidebar = isLoggedIn && 
    !['/login', '/public-imam', '/room-select'].includes(location);

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