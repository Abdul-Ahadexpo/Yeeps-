import React from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Button } from '../components/ui/Button';
import { GoogleIcon } from '../components/ui/Icons';

const Login: React.FC = () => {
  const { signInWithGoogle, loading } = useAuth();
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 p-4">
      <div className="max-w-md w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
            <span className="text-primary-600">Notes</span> & Questions
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Organize your thoughts and track questions in one place
          </p>
        </div>
        
        <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg p-8 animate-fade-in">
          <div className="text-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
              Welcome Back
            </h2>
            <p className="mt-2 text-gray-600 dark:text-gray-400">
              Sign in to access your notes and questions
            </p>
          </div>
          
          <div className="space-y-4">
            <Button
              className="w-full"
              size="lg"
              leftIcon={<GoogleIcon />}
              onClick={signInWithGoogle}
              isLoading={loading}
              loadingText="Signing in..."
            >
              Sign in with Google
            </Button>
            
            <p className="text-sm text-center text-gray-500 dark:text-gray-400 mt-6">
              By signing in, you agree to our Terms of Service and Privacy Policy.
            </p>
          </div>
        </div>
        
        <div className="mt-8 text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            Notes & Questions App &copy; {new Date().getFullYear()} | All Rights Reserved
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;