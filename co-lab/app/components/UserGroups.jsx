'use client';

import { useState, useEffect } from 'react';
import { getUserGroups } from '../utils/groups';

export default function UserGroups({ onSelectGroup, activeGroupId, isDarkMode = false, asCards = true, maxGroups }) {
  const [userGroups, setUserGroups] = useState([]);
  const [bookmarkedGroups, setBookmarkedGroups] = useState([]);

  useEffect(() => {
    const unsubscribe = getUserGroups(setUserGroups);
    return () => unsubscribe();
  }, []);

  const toggleBookmark = (groupId) => {
    setBookmarkedGroups((prev) =>
      prev.includes(groupId) ? prev.filter(id => id !== groupId) : [...prev, groupId]
    );
  };

  const displayedGroups = maxGroups ? userGroups.slice(0, maxGroups) : userGroups;

  // Sample data for demonstration - replace with actual data
  const sampleGroups = [
    {
      id: '1',
      name: 'Random Variable',
      category: 'Mathematics',
      progress: 0,
      totalLessons: 20,
      membersCount: 1
    },
    {
      id: '2',
      name: 'Testing2',
      category: 'Computer Science',
      progress: 0,
      totalLessons: 20,
      membersCount: 1
    },
    {
      id: '3',
      name: 'Creative Writing for Beginners',
      category: 'English',
      progress: 5,
      totalLessons: 20,
      membersCount: 120
    },
    {
      id: '4',
      name: 'Digital Illustration with Adobe Illustrator',
      category: 'Computer Science',
      progress: 12,
      totalLessons: 50,
      membersCount: 80
    }
  ];

  const getColorByCategory = (category) => {
    const colorMap = {
      'Marketing': 'bg-black',
      'Computer Science': 'bg-black',
      'Mathematics': 'bg-black',
      'Design': 'bg-black',
      'Business': 'bg-black'
    };
    return colorMap[category] || 'bg-black';
  };

  const isBookmarked = (groupId) => bookmarkedGroups.includes(groupId);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {sampleGroups.length === 0 ? (
        <div className="col-span-4 text-center py-10">
          <p className="text-white text-lg">You haven't joined any groups yet</p>
          <p className="text-white text-sm mt-2">Create a new group to get started</p>
        </div>
      ) : (
        sampleGroups.map((group) => (
          <div 
            key={group.id}
            onClick={() => onSelectGroup && onSelectGroup(group)}
            className={`rounded-xl shadow-md text-white overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border ${getColorByCategory(group.category)}`}
          >
            {/* Category tag */}
            <div className="px-4 pt-4 pb-2 flex justify-between items-center">
              <span className="text-sm text-white font-semibold">{group.category}</span>
              <button 
                className={`text-red-500 ${isBookmarked(group.id) ? 'fill-red-500' : ''}`}
                onClick={(e) => {
                  e.stopPropagation();
                  toggleBookmark(group.id);
                }}
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={isBookmarked(group.id) ? 0 : 2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>
            </div>
              
            {/* Group title */}
            <div className="px-4 py-2">
              <h3 className="text-lg font-bold text-white">{group.name}</h3>
            </div>
            
            {/* Progress bar */}
            <div className="px-4 mt-2">
              <div className="flex justify-between text-xs text-white mb-1">
                <span>Progress</span>
                <span>{group.progress}/{group.totalLessons} lessons</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className="h-2 rounded-full bg-blue-500" 
                  style={{ width: `${Math.max(5, (group.progress / group.totalLessons) * 100)}%` }}
                ></div>
              </div>
            </div>
             
            <div className="px-4 pb-4 flex ml-1">
              {/* <div className="flex -space-x-2 overflow-hidden">
                {[...Array(Math.min(3, group.membersCount > 0 ? 3 : 0))].map((_, i) => (
                  <div 
                    key={i} 
                    className="inline-block h-10 w-10 rounded-full ring-2 ring-white bg-yellow-500 flex items-center justify-center text-white text-xs"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {(group.membersCount > 3) && (
                  <div className="inline-block h-15 w-15 rounded-full ring-2 ring-white bg-gray-500 flex items-center justify-center text-white text-xs">
                    +{group.membersCount - 3}
                  </div>
                )}
              </div>
              */}
              
              <button className="px-4 py-2 bg-[#ff5722] text-white rounded-md text-sm font-medium hover:bg-red-600">
                Continue
              </button>
            </div>
          </div>
        ))
      )}
    </div>
  );
}