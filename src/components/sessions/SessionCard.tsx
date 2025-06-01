import React from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock } from 'lucide-react';
import { Session } from '../../types';

interface SessionCardProps {
  session: Session;
}

const SessionCard: React.FC<SessionCardProps> = ({ session }) => {
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };
  
  // Format time
  const formatTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };
  
  // Check if session is upcoming
  const isUpcoming = new Date(session.createdAt) > new Date();
  
  // Get the first letter of the session name for the avatar
  const nameInitial = session.name.charAt(0).toUpperCase();

  return (
    <Link to={`/session/${session.id}`} className="block">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow">
        <div className="p-4 flex items-center">
          <div className="h-12 w-12 rounded-md bg-blue-100 text-blue-600 flex items-center justify-center mr-3 text-xl font-semibold">
            {nameInitial}
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-lg font-medium text-gray-900 truncate">
              {session.name}
            </h3>
            <div className="flex items-center text-sm text-gray-500">
              <Clock size={16} className="mr-1" />
              <span>{formatDate(session.createdAt)} at {formatTime(session.createdAt)}</span>
            </div>
          </div>
        </div>
        
        <div className="px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-lg flex justify-between items-center">
          <div className="flex items-center text-sm text-gray-600">
            <Users size={16} className="mr-1" />
            <span>{session.participants.length} participant{session.participants.length !== 1 ? 's' : ''}</span>
          </div>
          
          {isUpcoming ? (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
              Upcoming
            </span>
          ) : (
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Completed
            </span>
          )}
        </div>
      </div>
    </Link>
  );
};

export default SessionCard;