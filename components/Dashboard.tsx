
import React, { useState, useEffect, useCallback } from 'react';
import { collection, query, onSnapshot, orderBy, where } from 'firebase/firestore';
import { db } from '../services/firebase';
import { type Link, type User } from '../types';
import AddLink from './AddLink';
import LinkList from './LinkList';
import { LogoIcon } from './icons';

interface DashboardProps {
  user: User;
}

const Dashboard: React.FC<DashboardProps> = ({ user }) => {
  const [links, setLinks] = useState<Link[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLinks = useCallback(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    setLoading(true);
    const linksCollection = collection(db, 'links');
    // Query links for the current user
    const q = query(linksCollection, where("userId", "==", user.uid), orderBy('createdAt', 'desc'));

    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      const linksData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      } as Link));
      setLinks(linksData);
      setLoading(false);
    }, (err) => {
      console.error("Error fetching links:", err);
      setError('Failed to fetch links. Please try again later.');
      setLoading(false);
    });

    return unsubscribe;
  }, [user]);

  useEffect(() => {
    const unsubscribe = fetchLinks();
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  }, [fetchLinks]);

  return (
    <div className="space-y-8">
      <AddLink user={user} />
      
      {loading ? (
        <div className="flex justify-center items-center py-16">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-400"></div>
        </div>
      ) : error ? (
        <div className="text-center py-16 text-red-400 bg-red-900/20 rounded-lg">
            <p>{error}</p>
        </div>
      ) : links.length > 0 ? (
        <LinkList links={links} />
      ) : (
        <div className="text-center py-16 border-2 border-dashed border-gray-700 rounded-lg">
            <LogoIcon className="mx-auto h-12 w-12 text-gray-500" />
            <h3 className="mt-2 text-xl font-semibold text-gray-300">No links saved yet</h3>
            <p className="mt-1 text-gray-500">Add a URL above to get started!</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard;
