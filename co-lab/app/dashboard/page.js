'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useRouter } from 'next/navigation';
import GroupList from '../components/GroupList';
import GroupChat from '../components/GroupChat';
import CreateGroupModal from '../components/CreateGroupModal';
import OnlineUsers from '../components/OnlineUsers';
import UserGroups from '../components/UserGroups';
import Whiteboard from '../components/Whiteboard';
import VideoCall from '../components/VideoCall';
import Notes from '../components/Notes';
import { setupPresence } from '../utils/presence';

export default function Dashboard() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState('chat'); // chat, whiteboard, video, notes
  const [searchQuery, setSearchQuery] = useState('');
  
  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }
    
    // Set up presence tracking when user logs in
    const cleanupPresence = setupPresence();
    
    return () => {
      // Clean up presence tracking when component unmounts or user logs out
      if (cleanupPresence) cleanupPresence();
    };
  }, [user, router]);
  
  const handleLogout = async () => {
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setActiveTab('chat'); // Reset to chat view when selecting a new group
  };
  
  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };
  
  const handleGroupCreated = (newGroup) => {
    setSelectedGroup(newGroup);
    setIsCreateModalOpen(false);
  };
  
  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  
  if (!user) {
    return <div>Loading...</div>;
  }
  
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navigation */}
      <nav className="bg-[#0066cc] shadow-md z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-white">Co-Lab AI</h1>
              <button
                onClick={toggleSidebar}
                className="ml-4 p-2 text-white hover:bg-[#005bb8] md:hidden"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" className="h-6 w-6">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
                </svg>
              </button>
            </div>
            <div className="flex items-center">
              <span className="text-white mr-4">{user.email}</span>
              <button
                onClick={handleLogout}
                className="bg-white hover:bg-gray-100 text-[#0066cc] px-4 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>
      
      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - User Groups */}
        <aside 
          className={`bg-gray-50 border-r border-gray-200 w-64 shadow-lg flex flex-col z-10 
                   ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'} 
                   md:relative md:translate-x-0 
                   transition-transform duration-300 ease-in-out
                   absolute inset-y-0 left-0`}
        >
          <div className="flex-1 overflow-y-auto p-2">
            {/* User's Groups */}
            <UserGroups 
              onSelectGroup={handleGroupSelect} 
              activeGroupId={selectedGroup?.id} 
              isDarkMode={false}
            />
          </div>
        </aside>
        
        {/* Main area with tabs or group creation */}
        <main className="flex-1 flex flex-col overflow-hidden">
          {selectedGroup ? (
            <>
              {/* Tabs */}
              <div className="bg-white shadow-sm px-4 flex border-b border-gray-200 items-center">
                <button
                  onClick={() => setSelectedGroup(null)}
                  className="py-4 px-4 font-medium text-sm text-[#0066cc] flex items-center mr-4 hover:bg-gray-50 rounded-md"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                  </svg>
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('chat')}
                  className={`py-4 px-4 font-medium text-sm ${activeTab === 'chat' ? 'text-[#0066cc] border-b-2 border-[#0066cc]' : 'text-gray-600 hover:text-[#0066cc]'}`}
                >
                  Group Chat
                </button>
                <button
                  onClick={() => setActiveTab('whiteboard')}
                  className={`py-4 px-4 font-medium text-sm ${activeTab === 'whiteboard' ? 'text-[#0066cc] border-b-2 border-[#0066cc]' : 'text-gray-600 hover:text-[#0066cc]'}`}
                >
                  Whiteboard
                </button>
                <button
                  onClick={() => setActiveTab('video')}
                  className={`py-4 px-4 font-medium text-sm ${activeTab === 'video' ? 'text-[#0066cc] border-b-2 border-[#0066cc]' : 'text-gray-600 hover:text-[#0066cc]'}`}
                >
                  Video Call
                </button>
                <button
                  onClick={() => setActiveTab('notes')}
                  className={`py-4 px-4 font-medium text-sm ${activeTab === 'notes' ? 'text-white border-b-2 border-[#7289DA]' : 'text-gray-300 hover:text-white'}`}
                >
                  Notes
                </button>
              </div>
              
              {/* Content area */}
              <div className="flex-1 overflow-hidden bg-white">
                {activeTab === 'chat' && <GroupChat group={selectedGroup} />}
                {activeTab === 'whiteboard' && <Whiteboard groupId={selectedGroup.id} />}
                {activeTab === 'video' && <VideoCall groupId={selectedGroup.id} />}
                {activeTab === 'notes' && <Notes groupId={selectedGroup.id} />}
              </div>
            </>
          ) : (
            <div className="flex-1 bg-gray-50">
              <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-gray-800">Research Collaboration Groups</h1>
                  <button 
                    onClick={handleCreateGroup}
                    className="bg-[#0066cc] hover:bg-[#005bb8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
                    </svg>
                    Create Group
                  </button>
                </div>
                
                {/* Search & Available Groups */}
                <div className="bg-white rounded-lg shadow-md overflow-hidden">                  
                  <div className="p-6">
                    <GroupList 
                      onSelectGroup={handleGroupSelect}
                      searchQuery={searchQuery} 
                      isDarkMode={false}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
        
        {/* Online Users Panel */}
        <aside className="bg-white w-100 shadow-lg flex flex-col z-10 border-l border-gray-200">
          <div className="flex-1 overflow-y-auto p-2">
            <OnlineUsers isDarkMode={false} />
          </div>
        </aside>
      </div>
      
      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />
    </div>
  );
}