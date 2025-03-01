"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAvailableGroups } from '../utils/groups';
import DashboardLayout from '../components/sidebar';
import OnlineUsers from '../components/OnlineUsers';
import CreateGroupModal from '../components/CreateGroupModal';

export default function Groups() {
  const router = useRouter();
  const [groups, setGroups] = useState([]);
  const [filteredGroups, setFilteredGroups] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [isLoading, setIsLoading] = useState(true);

  // Categories for filtering
  const categories = ["All", "Computer Science", "Mathematics", "Physics", "Other"];

  useEffect(() => {
    // Fetch all available groups
    const unsubscribe = getAvailableGroups((fetchedGroups) => {
      setGroups(fetchedGroups);
      setFilteredGroups(fetchedGroups);
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Filter groups based on search query and selected category
  useEffect(() => {
    let result = groups;
    
    // Filter by search query
    if (searchQuery) {
      result = result.filter(group => 
        group.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (group.description && group.description.toLowerCase().includes(searchQuery.toLowerCase())) ||
        (group.category && group.category.toLowerCase().includes(searchQuery.toLowerCase()))
      );
    }
    
    // Filter by category
    if (selectedCategory !== "All") {
      result = result.filter(group => group.category === selectedCategory);
    }
    
    setFilteredGroups(result);
  }, [searchQuery, selectedCategory, groups]);

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleGroupCreated = (newGroup) => {
    setIsCreateModalOpen(false);
    router.push(`/dashboard?group=${newGroup.id}`);
  };

  const handleJoinGroup = (group) => {
    // Here you would implement the logic to join a group
    // For now, we'll just navigate to the dashboard with the group selected
    router.push(`/dashboard?group=${group.id}`);
  };

  const handleCategoryChange = (category) => {
    setSelectedCategory(category);
  };

  return (
    <DashboardLayout activeItem="courses">
      <div className="rounded-xl shadow-sm flex h-full">
        {/* Main content area (75%) */}
        <div className="w-3/4 pr-4">
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
            <div className="flex justify-between items-center mb-6">
              <h1 className="text-2xl font-bold text-gray-800">All Groups</h1>
              <button
                onClick={handleCreateGroup}
                className="bg-[#0066cc] hover:bg-[#005bb8] text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M12 4v16m8-8H4"
                  />
                </svg>
                Create Group
              </button>
            </div>

            {/* Search and filters */}
            <div className="flex flex-col sm:flex-row justify-between mb-6 space-y-4 sm:space-y-0">
              <div className="relative w-full sm:w-64">
                <input
                  type="text"
                  placeholder="Search groups..."
                  className="pl-10 pr-4 py-2 w-full rounded-lg border border-gray-200 focus:outline-none focus:ring-2 focus:ring-[#ff5722] focus:border-transparent"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
                <div className="absolute left-3 top-2.5">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              {/* Category filters */}
              <div className="flex flex-wrap gap-2">
                {categories.map(category => (
                  <button
                    key={category}
                    onClick={() => handleCategoryChange(category)}
                    className={`px-3 py-1 text-sm rounded-full ${
                      selectedCategory === category
                        ? 'bg-[#ff5722] text-white'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>

            {/* Groups grid */}
            {isLoading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-[#ff5722]"></div>
              </div>
            ) : filteredGroups.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-12 w-12 mx-auto text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <h3 className="mt-4 text-lg font-medium text-gray-900">No groups found</h3>
                <p className="mt-1 text-gray-500">Try adjusting your search or filter criteria</p>
                <button 
                  onClick={handleCreateGroup}
                  className="mt-4 px-4 py-2 bg-[#ff5722] text-white rounded-md hover:bg-[#e64a19]"
                >
                  Create a new group
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredGroups.map(group => (
                  <div 
                    key={group.id}
                    className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 hover:shadow-lg transition-shadow"
                  >
                    {/* Card header with category label */}
                    <div className="relative">
                      {/* Background color based on subject/category */}
                      <div className={`h-24 ${
                        group.category === 'Computer Science' ? 'bg-purple-200' : 
                        group.category === 'Mathematics' ? 'bg-green-200' : 
                        group.category === 'Physics' ? 'bg-red-200' : 'bg-gray-200'
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
                          group.category === 'Computer Science' ? 'bg-purple-500 text-white' : 
                          group.category === 'Mathematics' ? 'bg-green-500 text-white' : 
                          group.category === 'Physics' ? 'bg-red-500 text-white' : 'bg-gray-500 text-white'
                        }`}>
                          {group.category || 'Study Group'}
                        </span>
                        
                        {/* Group name */}
                        <h3 className="text-lg font-bold text-gray-800">{group.name}</h3>
                        {group.description && (
                          <p className="mt-1 text-sm text-gray-600 line-clamp-2">{group.description}</p>
                        )}
                      </div>
                    </div>
                    
                    {/* Members and join button */}
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
                      
                      {/* Join button */}
                      <button 
                        onClick={() => handleJoinGroup(group)}
                        className="px-4 py-2 bg-[#ff5722] text-white rounded-md text-sm font-medium hover:bg-[#e64a19]"
                      >
                        Join
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Sidebar (25%) */}
        <div className="w-1/4">
          <div className="bg-white rounded-xl shadow-sm h-full p-4">
            <OnlineUsers />
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </DashboardLayout>
  );
}