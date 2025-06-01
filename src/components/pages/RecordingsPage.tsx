import React, { useEffect, useState } from 'react';
import { Mic, Download, Trash2 } from 'lucide-react';
import useAuthStore from '../../store/authStore';
import useSessionStore from '../../store/sessionStore';
import useRecordingStore from '../../store/recordingStore';

const RecordingsPage: React.FC = () => {
  const { user } = useAuthStore();
  const { sessions, fetchUserSessions } = useSessionStore();
  const { recordings, fetchSessionRecordings, deleteRecording } = useRecordingStore();
  const [selectedSession, setSelectedSession] = useState<string | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);

  useEffect(() => {
    fetchUserSessions();
  }, [fetchUserSessions]);

  useEffect(() => {
    if (selectedSession) {
      fetchSessionRecordings(selectedSession);
    }
  }, [selectedSession, fetchSessionRecordings]);

  const handleDelete = async (recordingId: string) => {
    try {
      await deleteRecording(recordingId);
      setShowDeleteConfirm(null);
    } catch (error) {
      console.error('Error deleting recording:', error);
    }
  };

  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Your Recordings</h1>
        <p className="text-gray-600 mt-1">
          View and manage all your podcast recordings
        </p>
      </div>

      {sessions.map(session => (
        <div key={session.id} className="mb-8 bg-white rounded-lg shadow-md overflow-hidden">
          <div className="p-6 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">{session.name}</h2>
            <p className="text-sm text-gray-500 mt-1">
              Meeting Key: {session.meetingKey} • 
              Created: {new Date(session.createdAt).toLocaleDateString()}
            </p>
          </div>

          {session.records_file_url && (
            <div className="px-6 py-3 bg-gray-50 border-b border-gray-200">
              <a 
                href={session.records_file_url}
                download
                className="text-blue-600 hover:text-blue-800 flex items-center"
              >
                <Download size={16} className="mr-2" />
                Download Recording Metadata
              </a>
            </div>
          )}

          <div className="p-6">
            {recordings
              .filter(recording => recording.sessionId === session.id)
              .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime())
              .map(recording => (
                <div 
                  key={recording.id}
                  className="flex items-center justify-between py-3 border-b border-gray-200 last:border-0"
                >
                  <div className="flex items-center">
                    <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                      <Mic className="h-5 w-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">
                        Recording #{recording.videoNumber}
                      </p>
                      <p className="text-sm text-gray-500">
                        {new Date(recording.startTime).toLocaleTimeString()} - 
                        {recording.endTime ? new Date(recording.endTime).toLocaleTimeString() : 'Ongoing'}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <a
                      href={recording.videoUrl}
                      download
                      className="p-2 text-gray-600 hover:text-gray-900 rounded-full hover:bg-gray-100"
                      title="Download recording"
                    >
                      <Download size={20} />
                    </a>

                    {recording.userId === user?.id ? (
                      <>
                        {showDeleteConfirm === recording.id ? (
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => handleDelete(recording.id)}
                              className="px-3 py-1 bg-red-600 text-white rounded-md hover:bg-red-700"
                            >
                              Confirm
                            </button>
                            <button
                              onClick={() => setShowDeleteConfirm(null)}
                              className="px-3 py-1 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowDeleteConfirm(recording.id)}
                            className="p-2 text-gray-600 hover:text-red-600 rounded-full hover:bg-gray-100"
                            title="Delete recording"
                          >
                            <Trash2 size={20} />
                          </button>
                        )}
                      </>
                    ) : (
                      <button
                        className="p-2 text-gray-400 cursor-not-allowed"
                        title="Only owner can delete their recording"
                        disabled
                      >
                        <Trash2 size={20} />
                      </button>
                    )}
                  </div>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default RecordingsPage;