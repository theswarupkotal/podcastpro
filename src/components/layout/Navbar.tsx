//src/components/layout/Navbar.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import useAuthStore from '../../store/authStore';
import { Menu, X, Bell, Settings, ChevronDown, LogOut } from 'lucide-react';

const Navbar: React.FC = () => {
  const { user, logout } = useAuthStore();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);
  const [isProfileOpen, setIsProfileOpen] = React.useState(false);
  
  // Profile menu ref for click outside detection
  const profileRef = React.useRef<HTMLDivElement>(null);
  
  // Handle click outside of profile menu
  React.useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (profileRef.current && !profileRef.current.contains(event.target as Node)) {
        setIsProfileOpen(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <nav className="bg-white border-b border-gray-200 px-4 py-2.5 fixed left-0 right-0 z-50">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex items-center justify-start">
          <button 
            className="md:hidden p-2 mr-2 text-gray-600 rounded-lg hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-gray-200"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
            <span className="sr-only">Toggle sidebar</span>
          </button>
          
          <Link to="/dashboard" className="flex items-center ml-4 md:ml-0">
            <span className="self-center text-xl font-semibold whitespace-nowrap text-blue-600">
              PodcastPro
            </span>
          </Link>
        </div>
        
        <div className="flex items-center gap-3">
          {/* Notification button */}
          <button className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
            <Bell size={20} />
            <span className="sr-only">View notifications</span>
          </button>
          
          {/* Settings button */}
          <Link to="/settings" className="p-2 text-gray-600 rounded-lg hover:bg-gray-100">
            <Settings size={20} />
            <span className="sr-only">Settings</span>
          </Link>
          
          {/* Profile dropdown */}
          <div className="relative" ref={profileRef}>
            <button 
              className="flex items-center gap-2 text-sm p-2 rounded-lg hover:bg-gray-100"
              onClick={() => setIsProfileOpen(!isProfileOpen)}
            >
              <span className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white font-medium">
                {user?.name?.charAt(0) || '?'}
              </span>
              <span className="hidden md:inline-block font-medium">{user?.name}</span>
              <ChevronDown size={16} />
            </button>
            
            {/* Profile dropdown menu */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-200">
                <div className="px-4 py-2 text-sm text-gray-900 border-b border-gray-200">
                  <div className="font-medium truncate">{user?.name}</div>
                  <div className="truncate text-gray-500">{user?.email}</div>
                </div>
                <Link 
                  to="/profile" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Your Profile
                </Link>
                <Link 
                  to="/settings" 
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsProfileOpen(false)}
                >
                  Settings
                </Link>
                <button 
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                  onClick={() => {
                    logout();
                    setIsProfileOpen(false);
                  }}
                >
                  <div className="flex items-center">
                    <LogOut size={16} className="mr-2" />
                    Sign out
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
