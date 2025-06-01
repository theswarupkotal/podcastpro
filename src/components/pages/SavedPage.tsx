import React from 'react';
import { Bookmark } from 'lucide-react';

const SavedPage: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Saved Items</h1>
        <p className="text-gray-600 mt-1">
          Access your bookmarked recordings and sessions
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Bookmark className="h-8 w-8 text-yellow-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Saved Items</h2>
        <p className="text-gray-600 mb-4">
          Save important recordings and sessions for quick access
        </p>
      </div>
    </div>
  );
};

export default SavedPage;