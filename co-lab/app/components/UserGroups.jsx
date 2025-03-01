// app/components/UserGroups.jsx
'use client';

import { useState, useEffect } from 'react';
import { getUserGroups } from '../utils/groups';

export default function UserGroups({ onSelectGroup, activeGroupId, isDarkMode = false, asCards = false }) {
  const [userGroups, setUserGroups] = useState([]);
  
  useEffect(() => {
    // Get user's groups
    const unsubscribe = getUserGroups(setUserGroups);
    return () => unsubscribe();
  }, []);
  
  const bgColor = isDarkMode ? 'bg-[#2F3136]' : 'bg-white';
  const textColor = isDarkMode ? 'text-white' : 'text-gray-800';
  const emptyTextColor = isDarkMode ? 'text-gray-400' : 'text-gray-500';
  const activeGroupBg = isDarkMode ? 'bg-[#393C43] text-white' : 'bg-blue-100 text-blue-800';
  const hoverBg = isDarkMode ? 'hover:bg-[#393C43]' : 'hover:bg-gray-100';
  const avatarBg = isDarkMode ? 'bg-[#7289DA]' : 'bg-blue-500';
  const countBg = isDarkMode ? 'bg-[#40444B] text-gray-300' : 'bg-gray-200 text-gray-700';
  
  // If displayed as list (original format)
  if (!asCards) {
    return (
      <div className={`${bgColor} rounded-lg shadow p-2 mb-6 border`}>
        <h3 className={`text-lg font-semibold mb-3 ${textColor}`}>Your Groups</h3>
        
        {userGroups.length === 0 ? (
          <p className={`${emptyTextColor} text-sm`}>You haven't joined any groups yet</p>
        ) : (
          <ul className="space-y-2">
            {userGroups.map(group => (
              <li 
                key={group.id} 
                onClick={() => onSelectGroup(group)}
                className={`p-2 rounded-md cursor-pointer flex items-center justify-between ${
                  activeGroupId === group.id 
                    ? activeGroupBg
                    : hoverBg
                }`}
              >
                <div className="flex items-center">
                  <div className={`w-8 h-8 rounded-full ${avatarBg} flex items-center justify-center text-white mr-2`}>
                    {group.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm font-medium text-black truncate">{group.name}</span>
                </div>
                <span className={`text-xs ${countBg} rounded-full px-2 py-1`}>
                  {group.membersCount}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    );
  }
  
  // If displayed as cards (new format)
  return (
    <>
      {userGroups.length === 0 ? (
        <div className="col-span-3 text-center py-10">
          <p className={`${emptyTextColor} text-lg`}>You haven't joined any groups yet</p>
          <p className={`${emptyTextColor} text-sm mt-2`}>Create a new group to get started</p>
        </div>
      ) : (
        userGroups.map(group => (
          <div 
            key={group.id}
            onClick={() => onSelectGroup(group)}
            className={`bg-white rounded-lg shadow-md overflow-hidden cursor-pointer hover:shadow-lg transition-shadow border border-gray-200`}
          >
            {/* Card header with category label */}
            <div className="relative">
              {/* Background color based on subject/category */}
              <div className={`h-24 ${
                group.category === 'Marketing' ? 'bg-yellow-200' : 
                group.category === 'Computer Science' ? 'bg-purple-200' : 
                group.category === 'Psychology' ? 'bg-blue-200' : 'bg-gray-200'
              }`}>
                {/* Bookmark icon */}
                <button className="absolute top-2 right-2 text-gray-700">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                  </svg>
                </button>
              </div>
              
              {/* Category tag */}
              <div className="px-4 py-4">
                <span className={`inline-block px-3 py-1 text-xs font-medium rounded-full mb-2 ${
                  group.category === 'Marketing' ? 'bg-yellow-500 text-black' : 
                  group.category === 'Computer Science' ? 'bg-purple-500 text-white' : 
                  group.category === 'Psychology' ? 'bg-blue-500 text-white' : 'bg-gray-500 text-white'
                }`}>
                  {group.category || 'Study Group'}
                </span>
                
                {/* Group name */}
                <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
              </div>
            </div>
            
            {/* Progress bar */}
            <div className="px-4">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progress</span>
                <span>{group.progress || '0'}/{group.totalLessons || '20'} lessons</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
                <div 
                  className={`h-2 rounded-full ${
                    group.category === 'Marketing' ? 'bg-yellow-500' : 
                    group.category === 'Computer Science' ? 'bg-purple-500' : 
                    group.category === 'Psychology' ? 'bg-blue-500' : 'bg-gray-500'
                  }`} 
                  style={{ width: `${(group.progress / group.totalLessons) * 100 || 10}%` }}
                ></div>
              </div>
            </div>
            
            {/* Members and continue button */}
            <div className="px-4 pb-4 flex justify-between items-center">
              {/* Member avatars */}
              <div className="flex -space-x-2 overflow-hidden">
                {[...Array(Math.min(3, group.membersCount || 3))].map((_, i) => (
                  <div 
                    key={i} 
                    className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center text-white text-xs"
                  >
                    {String.fromCharCode(65 + i)}
                  </div>
                ))}
                {(group.membersCount > 3) && (
                  <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-gray-500 flex items-center justify-center text-white text-xs">
                    +{group.membersCount - 3}
                  </div>
                )}
              </div>
              
              {/* Continue button */}
              <button className="px-4 py-2 bg-[#ff5722] text-white rounded-md text-sm font-medium hover:bg-[#e64a19]">
                Continue
              </button>
            </div>
          </div>
        ))
      )}
    </>
  );
}







