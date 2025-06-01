//src/components/sessions/JoinSessionModal.tsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { X } from 'lucide-react';
import useSessionStore from '../../store/sessionStore';

interface JoinSessionModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const JoinSessionModal: React.FC<JoinSessionModalProps> = ({ isOpen, onClose }) => {
  const [meetingKey, setMeetingKey] = useState('');
  const [error, setError] = useState('');
  const { joinSession, isLoading } = useSessionStore();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!meetingKey.trim()) {
      setError('Please enter a meeting key');
      return;
    }

    try {
      const session = await joinSession(meetingKey.trim());
      onClose();
      navigate(`/session/${session.id}`);
    } catch (err) {
      console.error('Error joining session:', err);
      setError('Invalid meeting key or session no longer exists.');
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Join Podcast</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
            <span className="sr-only">Close</span>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-3 text-red-700">
              <p>{error}</p>
            </div>
          )}

          <div className="mb-4">
            <label htmlFor="meeting-key" className="block text-sm font-medium text-gray-700 mb-1">
              Meeting Key
            </label>
            <input
              type="text"
              id="meeting-key"
              value={meetingKey}
              onChange={(e) => setMeetingKey(e.target.value)}
              placeholder="Enter the meeting key"
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              disabled={isLoading}
            />
            <p className="mt-1 text-sm text-gray-500">
              Enter the meeting key provided by the podcast host
            </p>
          </div>

          <div className="flex justify-end space-x-3 border-t border-gray-200 pt-4 mt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
              disabled={isLoading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 border border-transparent rounded-md shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 flex items-center"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="animate-spin -ml-1 mr-2 h-4 w-4 text-white border-2 border-white border-t-transparent rounded-full"></div>
                  Joining...
                </>
              ) : (
                'Join Podcast'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinSessionModal;
