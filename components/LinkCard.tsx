
import React, { useState } from 'react';
import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../services/firebase';
import { type Link } from '../types';
import { LinkIcon, TrashIcon } from './icons';

interface LinkCardProps {
  link: Link;
}

const LinkCard: React.FC<LinkCardProps> = ({ link }) => {
  const [isDeleting, setIsDeleting] = useState(false);

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this link?")) {
      setIsDeleting(true);
      try {
        await deleteDoc(doc(db, 'links', link.id));
      } catch (error) {
        console.error("Error deleting document: ", error);
        alert("Failed to delete link.");
        setIsDeleting(false);
      }
    }
  };

  const formattedDate = link.createdAt?.toDate().toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  return (
    <div className={`flex flex-col bg-gray-800/70 rounded-lg shadow-md border border-gray-700 transition-all duration-300 hover:border-indigo-500 hover:shadow-indigo-500/10 ${isDeleting ? 'opacity-50' : ''}`}>
      <div className="p-5 flex-grow">
        <div className="flex justify-between items-start">
            <h3 className="text-lg font-bold text-gray-100 mb-2 pr-2">
                {link.title || 'Untitled'}
            </h3>
             <p className="text-xs text-gray-500 flex-shrink-0">{formattedDate}</p>
        </div>
        
        <a
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 truncate mb-4"
        >
          <LinkIcon className="h-4 w-4 flex-shrink-0" />
          <span className="truncate">{link.url}</span>
        </a>

        <div className="text-sm text-gray-300 space-y-2 prose prose-invert prose-sm">
           {link.summary.split('\n').map((item, index) => item.trim() && <p key={index} className="my-0">{item.trim()}</p>)}
        </div>
      </div>
      
      <div className="p-5 border-t border-gray-700/50 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap gap-2">
            {link.tags.map(tag => (
            <span key={tag} className="px-2 py-1 text-xs font-medium text-purple-300 bg-purple-900/50 rounded-full">
                {tag}
            </span>
            ))}
        </div>
        <button
          onClick={handleDelete}
          disabled={isDeleting}
          className="p-2 text-gray-500 hover:text-red-400 rounded-full hover:bg-gray-700 transition-colors disabled:cursor-not-allowed"
          aria-label="Delete link"
        >
           {isDeleting ? 
             <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-b-2 border-gray-400"></div> :
             <TrashIcon className="h-5 w-5" />
           }
        </button>
      </div>
    </div>
  );
};

export default LinkCard;
