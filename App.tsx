
import React from 'react';
import { signOut } from 'firebase/auth';
import Dashboard from './components/Dashboard';
import Login from './components/Login';
import { LogoIcon } from './components/icons';
import { useAuth, auth } from './hooks/useAuth';

const App: React.FC = () => {
  const { user, loading } = useAuth();

  const handleSignOut = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error("Error signing out:", error);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-900">
        <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-indigo-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 text-gray-100 font-sans">
      <header className="bg-gray-800/50 backdrop-blur-sm border-b border-gray-700 sticky top-0 z-10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <LogoIcon className="h-8 w-8 text-indigo-400" />
              <h1 className="text-xl font-bold tracking-tight text-gray-200">Stash App</h1>
            </div>
            {user && (
              <div className="flex items-center space-x-4">
                {user.photoURL && (
                  <img src={user.photoURL} alt="User avatar" className="h-8 w-8 rounded-full" />
                )}
                <span className="text-sm font-medium text-gray-300 hidden sm:block">{user.displayName || user.email}</span>
                <button
                  onClick={handleSignOut}
                  className="px-3 py-1.5 text-sm font-semibold text-gray-300 bg-gray-700/50 rounded-md hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-900 focus:ring-indigo-500 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </header>
      <main className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {user ? <Dashboard user={user} /> : <Login />}
      </main>
    </div>
  );
};

export default App;
