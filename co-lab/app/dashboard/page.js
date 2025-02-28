"use client";

import { useState, useEffect, useRef } from "react";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import GroupList from "../components/GroupList";
import GroupChat from "../components/GroupChat";
import CreateGroupModal from "../components/CreateGroupModal";
import OnlineUsers from "../components/OnlineUsers";
import UserGroups from "../components/UserGroups";
import Whiteboard from "../components/Whiteboard";
import VideoCall from "../components/VideoCall";
import Notes from "../components/Notes";
import { setupPresence } from "../utils/presence";
import Image from "next/image";

export default function Dashboard() {
  const { user, logout, userPoints } = useAuth();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [activeTab, setActiveTab] = useState("chat"); // chat, whiteboard, video, notes
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);

  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    // Set up presence tracking when user logs in
    const cleanupPresence = setupPresence();

    return () => {
      // Clean up presence tracking when component unmounts or user logs out
      if (cleanupPresence) cleanupPresence();
    };
  }, [user, router]);

  // Handle clicks outside of profile dropdown to close it
  useEffect(() => {
    function handleClickOutside(event) {
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setIsProfileOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [profileRef]);

  const handleLogout = async () => {
    try {
      await logout();
      router.push("/login");
    } catch (error) {
      console.error("Failed to log out", error);
    }
  };

  const handleGroupSelect = (group) => {
    setSelectedGroup(group);
    setActiveTab("chat"); // Reset to chat view when selecting a new group
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

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  // Get initials for avatar
  const getInitials = (email) => {
    if (!email) return "";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 2);
  };

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
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  className="h-6 w-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M4 6h16M4 12h16m-7 6h7"
                  />
                </svg>
              </button>
            </div>
            <div className="flex items-center relative" ref={profileRef}>
              <div
                onClick={toggleProfile}
                className="flex items-center cursor-pointer hover:bg-[#005bb8] px-3 py-2 rounded-md transition-colors"
              >
                <div className="w-8 h-8 rounded-full bg-white text-[#0066cc] flex items-center justify-center font-semibold mr-2">
                  {getInitials(user.email)}
                </div>
                <span className="text-white mr-1">{user.email}</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`h-4 w-4 text-white transition-transform duration-200 ${
                    isProfileOpen ? "rotate-180" : ""
                  }`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </div>

              {/* Profile Dropdown */}
              {isProfileOpen && (
                <div className="absolute right-0 top-16 w-64 bg-white rounded-md shadow-lg py-1 z-20 border border-gray-200">
                  <div className="px-4 py-3 border-b border-gray-100">
                    <p className="text-sm text-gray-500">Signed in as</p>
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {user.email}
                    </p>
                  </div>

                  <div className="py-1">
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                        />
                      </svg>
                      Profile Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      Account Settings
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                        />
                      </svg>
                      Help &amp; Support
                    </a>
                    <a
                      href="#"
                      className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M12 17.25l4.95 2.61-1.27-5.42L20 10.92l-5.52-.47L12 5.5l-2.48 4.95-5.52.47 4.32 3.52-1.27 5.42L12 17.25z"
                        />
                      </svg>
                      Points: {userPoints}
                    </a>
                  </div>

                  <div className="py-1 border-t border-gray-100">
                    <button
                      onClick={handleLogout}
                      className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-2"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
                        />
                      </svg>
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </nav>

      {/* Main content */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar - User Groups */}
        <aside
          className={`bg-gray-50 border-r border-gray-200 w-64 shadow-lg flex flex-col z-10 
                   ${isSidebarOpen ? "translate-x-0" : "-translate-x-full"} 
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
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M10 19l-7-7m0 0l7-7m-7 7h18"
                    />
                  </svg>
                  Back to Dashboard
                </button>
                <button
                  onClick={() => setActiveTab("chat")}
                  className={`py-4 px-4 font-medium text-sm ${
                    activeTab === "chat"
                      ? "text-[#0066cc] border-b-2 border-[#0066cc]"
                      : "text-gray-600 hover:text-[#0066cc]"
                  }`}
                >
                  Groups Chat
                </button>
                <button
                  onClick={() => setActiveTab("whiteboard")}
                  className={`py-4 px-4 font-medium text-sm ${
                    activeTab === "whiteboard"
                      ? "text-[#0066cc] border-b-2 border-[#0066cc]"
                      : "text-gray-600 hover:text-[#0066cc]"
                  }`}
                >
                  Whiteboard
                </button>
                <button
                  onClick={() => setActiveTab("video")}
                  className={`py-4 px-4 font-medium text-sm ${
                    activeTab === "video"
                      ? "text-[#0066cc] border-b-2 border-[#0066cc]"
                      : "text-gray-600 hover:text-[#0066cc]"
                  }`}
                >
                  Video Call
                </button>
                <button
                  onClick={() => setActiveTab("notes")}
                  className={`py-4 px-4 font-medium text-sm ${
                    activeTab === "notes"
                      ? "text-[#0066cc] border-b-2 border-[#0066cc]"
                      : "text-gray-600 hover:text-[#0066cc]"
                  }`}
                >
                  Notes
                </button>
              </div>

              {/* Content area */}
              <div className="flex-1 overflow-hidden bg-white">
                {activeTab === "chat" && <GroupChat group={selectedGroup} />}
                {activeTab === "whiteboard" && (
                  <Whiteboard groupId={selectedGroup.id} />
                )}
                {activeTab === "video" && (
                  <VideoCall groupId={selectedGroup.id} />
                )}
                {activeTab === "notes" && <Notes groupId={selectedGroup.id} />}
              </div>
            </>
          ) : (
            <div className="flex-1 bg-gray-50">
              <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="flex items-center justify-between mb-8">
                  <h1 className="text-2xl font-bold text-gray-800">
                    Research Collaboration Groups
                  </h1>
                  <button
                    onClick={handleCreateGroup}
                    className="bg-[#0066cc] hover:bg-[#005bb8] text-white px-4 py-2 rounded-md text-sm font-medium flex items-center"
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
