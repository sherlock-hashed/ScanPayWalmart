import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ThemeProvider } from "@/context/ThemeContext";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Header } from "@/components/common/header";
import { Particles } from "@/components/ui/particles";
import { useTheme } from "@/context/ThemeContext";
import { useEffect, useState } from "react";
import MealCartPlannerPage from "./pages/mealCartPlanner";
import { ModernFooter } from "./components/common/footer";

// Pages
import HomePage from "./pages/HomePage";
import ScanPage from "./pages/ScanPage";
import CartPage from "./pages/CartPage";
import CheckoutPage from "./pages/CheckoutPage";
import InvoicePage from "./pages/InvoicePage";
import LoginPage from "./pages/LoginPage";
import RegisterPage from "./pages/RegisterPage";
import StaffDashboard from "./pages/StaffDashboard";
import InsightsDashboard from "./pages/InsightsDashboard";
import NotFound from "./pages/NotFound";
import UserOrdersPage from "./pages/UserOrdersPage";

const queryClient = new QueryClient();

// Particles Background Component with Theme Support
function ParticlesBackground() {
  const { theme } = useTheme();
  const [color, setColor] = useState("#ffffff");

  useEffect(() => {
    setColor(theme === "dark" ? "#ffffff" : "#000000");
  }, [theme]);

  return (
    <Particles
      className="fixed inset-0 -z-10"
      quantity={120}
      ease={80}
      staticity={50}
      size={0.6}
      color={color}
      refresh={true}
      vx={0}
      vy={0}
    />
  );
}

// Protected Route component
function ProtectedRoute({ children, requireAuth = true, allowedRoles }: { 
  children: React.ReactNode; 
  requireAuth?: boolean;
  allowedRoles?: string[];
}) {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  if (requireAuth && !user) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}

// App content with routing
function AppContent() {
  return (
    <div className="min-h-screen bg-background relative">
      <ParticlesBackground />
      <Header />
      <main className="relative z-10">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          
          {/* Protected customer routes */}
          <Route 
            path="/scan" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <ScanPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/cart" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CartPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/checkout" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <CheckoutPage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <InvoicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/invoice/:orderId" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <InvoicePage />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/orders" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <UserOrdersPage />
              </ProtectedRoute>
            } 
          />
           <Route 
            path="/meal-planner" 
            element={
              <ProtectedRoute allowedRoles={['customer']}>
                <MealCartPlannerPage />
              </ProtectedRoute>
            } 
          />

          {/* Protected staff routes */}
          <Route 
            path="/staff-dashboard" 
            element={
              <ProtectedRoute allowedRoles={['staff']}>
                <StaffDashboard />
              </ProtectedRoute>
            } 
          />
          
          <Route 
            path="/insights" 
            element={
              <ProtectedRoute allowedRoles={['staff', 'manager']}>
                <InsightsDashboard />
              </ProtectedRoute>
            } 
          />

          <Route path="*" element={<NotFound />} />
        </Routes>
        <ModernFooter />
      </main>
    </div>
  );
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider defaultTheme="light" storageKey="scanpay-ui-theme">
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <AuthProvider>
            <CartProvider>
              <AppContent />
            </CartProvider>
          </AuthProvider>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
