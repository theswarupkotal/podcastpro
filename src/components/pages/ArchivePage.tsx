import React from 'react';
import { Archive } from 'lucide-react';

const ArchivePage: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Archive</h1>
        <p className="text-gray-600 mt-1">
          Access your archived podcast content
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
            <Archive className="h-8 w-8 text-gray-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Archived Content</h2>
        <p className="text-gray-600 mb-4">
          Archive old recordings and sessions to keep your workspace organized
        </p>
      </div>
    </div>
  );
};

export default ArchivePage;