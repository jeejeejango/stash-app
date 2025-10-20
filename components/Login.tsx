
import React from 'react';
import { signInWithPopup } from 'firebase/auth';
import { auth, googleProvider } from '../services/firebase';
import { GoogleIcon } from './icons';

const Login: React.FC = () => {
  const handleGoogleSignIn = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
    } catch (error) {
      console.error("Error signing in with Google:", error);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center text-center mt-16 sm:mt-24">
      <div className="bg-gray-800/50 p-8 rounded-2xl shadow-2xl max-w-lg w-full backdrop-blur-md border border-gray-700">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-500 mb-4">
          Unlock Your Content
        </h2>
        <p className="text-lg text-gray-300 mb-8">
          Sign in to start building your personal library of summarized and tagged articles.
        </p>
        <button
          onClick={handleGoogleSignIn}
          className="w-full inline-flex items-center justify-center px-6 py-3 text-lg font-semibold text-white bg-indigo-600 rounded-lg hover:bg-indigo-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-all duration-300 transform hover:scale-105"
        >
          <GoogleIcon className="mr-3" />
          Sign in with Google
        </button>
      </div>
    </div>
  );
};

export default Login;
