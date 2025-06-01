//src/components/dashboard/DashboardPage.tsx
import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Clock, Calendar, Plus, ArrowRight } from 'lucide-react';
import useSessionStore from '../../store/sessionStore';
import useAuthStore from '../../store/authStore';
import JoinSessionModal from '../sessions/JoinSessionModal';
import CreateSessionModal from '../sessions/CreateSessionModal';
import SessionCard from '../sessions/SessionCard';

const DashboardPage: React.FC = () => {
  const { user } = useAuthStore();
  const { sessions, fetchUserSessions, isLoading } = useSessionStore();
  const [isJoinModalOpen, setIsJoinModalOpen] = React.useState(false);
  const [isCreateModalOpen, setIsCreateModalOpen] = React.useState(false);
  
  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  const upcomingSessions = sessions.filter(s => new Date(s.createdAt) > new Date());
  const recentSessions = sessions.filter(s => new Date(s.createdAt) <= new Date())
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  return (
    <div className="pt-16">
      {/* Welcome section */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user?.name?.split(' ')[0] || 'Podcaster'}!
        </h1>
        <p className="text-gray-600 mt-1">
          Ready to create amazing content today?
        </p>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
        <button 
          onClick={() => setIsCreateModalOpen(true)}
          className="flex items-center p-4 bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
            <Plus className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-blue-900">New Podcast</h3>
            <p className="text-sm text-blue-700">Start a new recording session</p>
          </div>
        </button>
        
        <button 
          onClick={() => setIsJoinModalOpen(true)}
          className="flex items-center p-4 bg-teal-50 border border-teal-100 rounded-lg hover:bg-teal-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-teal-100 flex items-center justify-center mr-3">
            <Calendar className="h-5 w-5 text-teal-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-teal-900">Join Podcast</h3>
            <p className="text-sm text-teal-700">Enter a meeting key to join</p>
          </div>
        </button>
        
        <Link 
          to="/scheduled"
          className="flex items-center p-4 bg-purple-50 border border-purple-100 rounded-lg hover:bg-purple-100 transition-colors"
        >
          <div className="h-10 w-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
            <Clock className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <h3 className="font-medium text-purple-900">Scheduled</h3>
            <p className="text-sm text-purple-700">View your upcoming sessions</p>
          </div>
        </Link>
      </div>

      {/* Upcoming sessions */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Upcoming Sessions</h2>
          <Link to="/scheduled" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : upcomingSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {upcomingSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-3">You don't have any upcoming sessions.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Schedule a new session
            </button>
          </div>
        )}
      </div>

      {/* Recent sessions */}
      <div>
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-lg font-medium text-gray-900">Recent Sessions</h2>
          <Link to="/recordings" className="text-sm text-blue-600 hover:text-blue-800 flex items-center">
            View all <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-blue-500"></div>
          </div>
        ) : recentSessions.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentSessions.map(session => (
              <SessionCard key={session.id} session={session} />
            ))}
          </div>
        ) : (
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 text-center">
            <p className="text-gray-700 mb-3">You haven't created any sessions yet.</p>
            <button
              onClick={() => setIsCreateModalOpen(true)}
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Create your first podcast session
            </button>
          </div>
        )}
      </div>

      {/* Modals */}
      <JoinSessionModal 
        isOpen={isJoinModalOpen} 
        onClose={() => setIsJoinModalOpen(false)} 
      />
      
      <CreateSessionModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />
    </div>
  );
};

export default DashboardPage;
