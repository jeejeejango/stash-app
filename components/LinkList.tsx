
import React, { useState, useMemo } from 'react';
import { type Link } from '../types';
import LinkCard from './LinkCard';

interface LinkListProps {
  links: Link[];
}

const LinkList: React.FC<LinkListProps> = ({ links }) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    links.forEach(link => link.tags.forEach(tag => tagSet.add(tag)));
    return Array.from(tagSet).sort();
  }, [links]);

  const filteredLinks = useMemo(() => {
    return links.filter(link => {
      const matchesSearch =
        link.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
        link.url.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesTag = selectedTag ? link.tags.includes(selectedTag) : true;
      
      return matchesSearch && matchesTag;
    });
  }, [links, searchQuery, selectedTag]);

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-gray-200 mb-4">Your Library</h2>
        <div className="flex flex-col md:flex-row gap-4">
            <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search summaries, titles, or URLs..."
                className="block w-full md:w-1/3 rounded-md border-0 bg-gray-800 py-2.5 px-4 text-gray-200 ring-1 ring-inset ring-gray-700 placeholder:text-gray-500 focus:ring-2 focus:ring-inset focus:ring-indigo-500 transition-colors"
            />
        </div>
      </div>
      
      {allTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
            <button
                onClick={() => setSelectedTag(null)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                selectedTag === null
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
            >
                All
            </button>
            {allTags.map(tag => (
                <button
                key={tag}
                onClick={() => setSelectedTag(tag)}
                className={`px-3 py-1 text-sm font-medium rounded-full transition-colors ${
                    selectedTag === tag
                    ? 'bg-indigo-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
                >
                {tag}
                </button>
            ))}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredLinks.map(link => (
          <LinkCard key={link.id} link={link} />
        ))}
      </div>
       {filteredLinks.length === 0 && (
         <div className="text-center py-16 text-gray-500 col-span-full">
            <p>No links found matching your criteria.</p>
        </div>
       )}
    </div>
  );
};

export default LinkList;
