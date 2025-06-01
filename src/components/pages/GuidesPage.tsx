import React from 'react';
import { FileText } from 'lucide-react';

const GuidesPage: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guides</h1>
        <p className="text-gray-600 mt-1">
          Learn how to make the most of your podcasting experience
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-teal-100 rounded-full flex items-center justify-center">
            <FileText className="h-8 w-8 text-teal-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">Guides Coming Soon</h2>
        <p className="text-gray-600 mb-4">
          Helpful guides and tutorials will be available soon
        </p>
      </div>
    </div>
  );
};

export default GuidesPage;