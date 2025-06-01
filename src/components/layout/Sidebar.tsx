//src/components/layout/Sidebar.tsx
import React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, Mic, Clock, Bookmark, Archive, Users, Calendar, FileText } from 'lucide-react';
import classNames from 'classnames';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
}

const NavItem: React.FC<NavItemProps> = ({ to, icon, label }) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        classNames(
          'flex items-center px-4 py-3 text-sm font-medium rounded-lg transition-colors duration-200',
          {
            'bg-blue-50 text-blue-600': isActive,
            'text-gray-700 hover:bg-gray-100': !isActive
          }
        )
      }
    >
      <span className="mr-3">{icon}</span>
      {label}
    </NavLink>
  );
};

const Sidebar: React.FC<{
  onOpenCreateSession: () => void;
}> = ({ onOpenCreateSession }) => {

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col pt-16">
      <div className="flex flex-col flex-grow px-3 py-5 bg-white border-r border-gray-200 overflow-y-auto">
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-3 mb-2">
            Main
          </h2>
          <ul className="space-y-1">
            <li>
              <NavItem to="/dashboard" icon={<Home size={20} />} label="Dashboard" />
            </li>
            <li>
              <NavItem to="/recordings" icon={<Mic size={20} />} label="Recordings" />
            </li>
            <li>
              <NavItem to="/scheduled" icon={<Clock size={20} />} label="Scheduled" />
            </li>
            <li>
              <NavItem to="/saved" icon={<Bookmark size={20} />} label="Saved" />
            </li>
          </ul>
        </div>
        
        <div className="mb-6">
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-3 mb-2">
            Library
          </h2>
          <ul className="space-y-1">
            <li>
              <NavItem to="/archive" icon={<Archive size={20} />} label="Archive" />
            </li>
            <li>
              <NavItem to="/guests" icon={<Users size={20} />} label="Guests" />
            </li>
          </ul>
        </div>
        
        <div>
          <h2 className="text-xs font-semibold text-gray-500 uppercase tracking-wider ml-3 mb-2">
            Resources
          </h2>
          <ul className="space-y-1">
            <li>
              <NavItem to="/calendar" icon={<Calendar size={20} />} label="Calendar" />
            </li>
            <li>
              <NavItem to="/guides" icon={<FileText size={20} />} label="Guides" />
            </li>
          </ul>
        </div>
        
        <div className="mt-auto pt-4 border-t border-gray-200">
            <div className="px-3">
             <button
               onClick={onOpenCreateSession}
               className="w-full text-left flex items-center px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors duration-200"
               type="button"
             >
               <Mic className="mr-2" size={18} />
               New Podcast
             </button>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
