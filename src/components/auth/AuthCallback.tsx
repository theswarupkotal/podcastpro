//src/components/auth/AuthCallback.tsx
import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import useAuthStore from '../../store/authStore';

const AuthCallback: React.FC = () => {
  const navigate = useNavigate();
  const { checkAuth, handleSwarupCallback } = useAuthStore();
  const location = useLocation();


  useEffect(() => {
    const handleCallback = async () => {
      const queryParams = new URLSearchParams(location.search);
      const code = queryParams.get('code');
      const provider = queryParams.get('provider');

      try {
        if (provider === 'swarup') {
          if (!code) throw new Error('Authorization code missing');
          const success = await handleSwarupCallback(code);
          if (success) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        } else {
          // Handle Google callback
          const isAuthenticated = await checkAuth();
          if (isAuthenticated) {
            navigate('/dashboard');
          } else {
            navigate('/login');
          }
        }
      } catch (error) {
        console.error('Auth callback error:', error);
        navigate('/login');
      }
    };

    handleCallback();
  }, [navigate, checkAuth, handleSwarupCallback, location.search]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-xl font-bold text-gray-800 mb-4">
            Completing Authentication...
          </h1>
          <div className="flex justify-center my-4">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
          </div>
          <p className="text-gray-600">
            Please wait while we complete your authentication...
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthCallback;
