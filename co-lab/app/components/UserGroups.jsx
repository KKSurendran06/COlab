// app/components/UserGroups.jsx
'use client';

import { useState, useEffect } from 'react';
import { getUserGroups } from '../utils/groups';

export default function UserGroups({ onSelectGroup, activeGroupId, isDarkMode = false }) {
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