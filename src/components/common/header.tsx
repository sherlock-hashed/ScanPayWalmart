
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ThemeToggle } from '@/components/theme/theme-toggle';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';
import { ShoppingCart, ScanLine ,User, LogOut, BarChart3, ClipboardList, type LucideIcon } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

interface NavigationItem {
  to: string;
  label: string;
  icon?: LucideIcon;
}

export function Header() {
  const { user, logout } = useAuth();
  const { getItemCount } = useCart();
  const navigate = useNavigate();
  const itemCount = getItemCount();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getNavigationItems = (): NavigationItem[] => {
    if (!user) return [];
    
    if (user.role === 'staff') {
      return [
        { to: '/staff-dashboard', label: 'Staff Dashboard', icon: ClipboardList },
        { to: '/insights', label: 'Store Performance Insights', icon: BarChart3 }
      ];
    }
    
    if (user.role === 'customer') {
      return [
        { to: '/', label: 'Home' },
        { to: '/scan', label: 'Scan Products' },
        { to: '/cart', label: 'Cart' },
        { to: '/meal-planner', label: 'Meal Planner' },
        { to: '/orders', label: 'My Orders' }
      ];
    }
    
    return [];
  };

  const navigationItems = getNavigationItems();

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur-md supports-[backdrop-filter]:bg-background/80 shadow-sm">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
      <Link to="/" className="flex items-center space-x-3 group">
        <div className="w-10 h-10 bg-gradient-to-r from-purple-600 to-blue-600 rounded-xl flex items-center justify-center">
          <ScanLine className="text-white h-5 w-5" />
        </div>
        <span className="text-2xl font-extrabold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
          ScanPay
        </span>
      </Link>

        {/* Navigation */}
        <nav className="hidden md:flex items-center space-x-1">
          {navigationItems.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.to}
                to={item.to}
                className="px-4 py-2 text-sm font-medium text-foreground/80 hover:text-foreground hover:bg-accent/50 rounded-lg transition-all duration-200 flex items-center space-x-2 group"
              >
                {Icon && <Icon className="h-4 w-4 group-hover:scale-110 transition-transform" />}
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        {/* Right side actions */}
        <div className="flex items-center space-x-2">
          <ThemeToggle />
          
          {user ? (
            <>
              {user.role === 'customer' && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="relative hover:bg-accent/50 hover:scale-105 transition-all duration-200"
                  onClick={() => navigate('/cart')}
                >
                  <ShoppingCart className="h-5 w-5" />
                  {itemCount > 0 && (
                    <Badge
                      variant="destructive"
                      className="absolute -top-2 -right-2 h-5 w-5 flex items-center justify-center p-0 text-xs animate-pulse"
                    >
                      {itemCount}
                    </Badge>
                  )}
                </Button>
              )}
              
              <div className="flex items-center space-x-2 ml-2 pl-2 border-l border-border/50">
                <div className="flex items-center space-x-2 px-3 py-1.5 bg-accent/30 rounded-lg border border-border/50">
                  {user.photoURL ? (
                    <img 
                      src={user.photoURL} 
                      alt={user.name}
                      className="w-8 h-8 rounded-full object-cover border-2 border-border/50"
                    />
                  ) : (
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center">
                      <User className="h-4 w-4 text-white" />
                    </div>
                  )}
                  <div className="hidden md:block">
                    <span className="text-sm font-medium">{user.name}</span>
                    <div className="text-xs text-muted-foreground capitalize">{user.role}</div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="hover:bg-destructive/10 hover:text-destructive hover:scale-105 transition-all duration-200"
                  title="Logout"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            </>
          ) : (
            <div className="flex items-center space-x-2">
              <Button 
                variant="ghost" 
                onClick={() => navigate('/login')}
                className="hover:bg-accent/50 transition-all duration-200"
              >
                Login
              </Button>
              <Button 
                onClick={() => navigate('/register')}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Register
              </Button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
