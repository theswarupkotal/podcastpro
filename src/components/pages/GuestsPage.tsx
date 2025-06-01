import React from 'react';
import { Users } from 'lucide-react';

const GuestsPage: React.FC = () => {
  return (
    <div className="pt-16">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Guests</h1>
        <p className="text-gray-600 mt-1">
          Manage your podcast guests and collaborators
        </p>
      </div>

      <div className="bg-white rounded-lg shadow p-6 text-center">
        <div className="flex justify-center mb-4">
          <div className="h-16 w-16 bg-green-100 rounded-full flex items-center justify-center">
            <Users className="h-8 w-8 text-green-600" />
          </div>
        </div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Guests Yet</h2>
        <p className="text-gray-600 mb-4">
          Add and manage guests for your podcast sessions
        </p>
      </div>
    </div>
  );
};

export default GuestsPage;