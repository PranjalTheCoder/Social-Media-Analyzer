import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import EnhancedHome from "@/pages/EnhancedHome";
import NotFound from "@/pages/not-found";

/**
 * App Router
 * ----------
 * Defines the main client-side routes.
 */
function Router() {
  return (
    <Switch>
      {/* Main Dashboard */}
      <Route path="/" component={EnhancedHome} />

      {/* 404 Catch-all */}
      <Route component={NotFound} />
    </Switch>
  );
}

/**
 * App Root
 * --------
 * Wraps the application in essential providers:
 * - QueryClientProvider: For API state management
 * - TooltipProvider: For UI tooltips
 * - Toaster: For global notifications
 */
function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
