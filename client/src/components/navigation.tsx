import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export default function Navigation() {
  const [location] = useLocation();
  const { user, isAuthenticated } = useAuth();

  if (!isAuthenticated || !user) return null;

  const isActive = (path: string) => {
    if (path === "/" && location === "/") return true;
    return location.startsWith(path) && path !== "/";
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'admin':
        return 'bg-red-500/20 text-red-400';
      case 'trainer':
        return 'bg-blue-500/20 text-blue-400';
      default:
        return 'bg-bells-gold/20 text-bells-gold';
    }
  };

  const getRoleLabel = (role: string) => {
    switch (role) {
      case 'admin':
        return 'Admin';
      case 'trainer':
        return 'Trainer';
      default:
        return 'Student';
    }
  };

  return (
    <nav className="bg-bells-dark border-b border-bells-gray" data-testid="navigation">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex items-center" data-testid="link-home">
              <div className="text-2xl font-black text-bells-gold">BELLS GYM</div>
              <div className="ml-2 text-sm text-gray-400">BOOKING</div>
            </Link>
            <div className="hidden md:ml-10 md:flex md:space-x-8">
              <Link href="/" className={`px-1 pt-1 pb-4 text-sm font-medium ${isActive('/') && location === '/' ? 'text-bells-gold border-b-2 border-bells-gold' : 'text-gray-300 hover:text-white'}`} data-testid="link-dashboard">
                Dashboard
              </Link>
              <Link href="/classes" className={`px-1 pt-1 pb-4 text-sm font-medium ${isActive('/classes') ? 'text-bells-gold border-b-2 border-bells-gold' : 'text-gray-300 hover:text-white'}`} data-testid="link-classes">
                Classes
              </Link>
              <Link href="/trainers" className={`px-1 pt-1 pb-4 text-sm font-medium ${isActive('/trainers') ? 'text-bells-gold border-b-2 border-bells-gold' : 'text-gray-300 hover:text-white'}`} data-testid="link-trainers">
                Trainers
              </Link>
              <Link href="/membership" className={`px-1 pt-1 pb-4 text-sm font-medium ${isActive('/membership') ? 'text-bells-gold border-b-2 border-bells-gold' : 'text-gray-300 hover:text-white'}`} data-testid="link-membership">
                Membership
              </Link>
              {user?.role === 'admin' && (
                <Link href="/admin" className={`px-1 pt-1 pb-4 text-sm font-medium ${isActive('/admin') ? 'text-bells-gold border-b-2 border-bells-gold' : 'text-gray-300 hover:text-white'}`} data-testid="link-admin">
                  Admin
                </Link>
              )}
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:block">
              <span className="text-sm text-gray-300" data-testid="text-user-name">
                {user?.firstName} {user?.lastName}
              </span>
              <Badge className={`ml-2 ${getRoleBadgeColor(user?.role || 'student')}`} data-testid="badge-user-role">
                {getRoleLabel(user?.role || 'student')}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="button-notifications">
              <i className="fas fa-bell"></i>
            </Button>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="sm" className="text-gray-400 hover:text-white" data-testid="button-user-menu">
                  <i className="fas fa-user-circle text-xl"></i>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="bg-bells-dark border-bells-gray text-white" align="end">
                <DropdownMenuItem className="hover:bg-bells-darker" data-testid="menu-profile">
                  <i className="fas fa-user mr-2"></i>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem className="hover:bg-bells-darker" data-testid="menu-settings">
                  <i className="fas fa-cog mr-2"></i>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuSeparator className="bg-bells-gray" />
                <DropdownMenuItem 
                  className="hover:bg-bells-darker text-red-400"
                  onClick={() => window.location.href = '/api/logout'}
                  data-testid="menu-logout"
                >
                  <i className="fas fa-sign-out-alt mr-2"></i>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
