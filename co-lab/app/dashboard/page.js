"use client";

import { useState, useEffect, useRef } from "react";
import { useFont } from "../context/FontContext";
import { useAuth } from "../context/AuthContext";
import { useRouter } from "next/navigation";
import Link from 'next/link';
import GroupList from "../components/GroupList";
import GroupChat from "../components/GroupChat";
import CreateGroupModal from "../components/CreateGroupModal";
import OnlineUsers from "../components/OnlineUsers";
import UserGroups from "../components/UserGroups";
import Whiteboard from "../components/Whiteboard";
import VideoCall from "../components/VideoCall";
import Notes from "../components/Notes";
import { setupPresence } from "../utils/presence";
import LiveQuiz from "../components/QuizComponent";
import DashboardLayout from "../components/sidebar";
import { getAvailableGroups } from "../utils/groups";

export default function Dashboard() {
  const { user, logout, userPoints } = useAuth();
  const router = useRouter();
  const [selectedGroup, setSelectedGroup] = useState(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("chat"); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const profileRef = useRef(null);
  const [userGroups, setUserGroups] = useState([]);
  const [showFontSettings, setShowFontSettings] = useState(false); 
  const {
    fontSize,
    fontFamily,
    lineSpacing,
    highContrast,
    changeFontSize,
    changeFontFamily,
    changeLineSpacing,
    toggleHighContrast,
  } = useFont();
  
  useEffect(() => {
    if (!user) {
      router.push("/login");
      return;
    }

    const cleanupPresence = setupPresence();

    const unsubscribe = getAvailableGroups(setUserGroups);

    return () => {
      if (cleanupPresence) cleanupPresence();
      unsubscribe();
    };
  }, [user, router]);

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
    setActiveTab("chat"); 
  };

  const handleCreateGroup = () => {
    setIsCreateModalOpen(true);
  };

  const handleGroupCreated = (newGroup) => {
    setSelectedGroup(newGroup);
    setIsCreateModalOpen(false);
  };

  const toggleProfile = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  const getInitials = (email) => {
    if (!email) return "";
    const parts = email.split("@")[0].split(/[._-]/);
    return parts
      .map((part) => part[0]?.toUpperCase() || "")
      .join("")
      .substring(0, 2);
  };

  return (
    <DashboardLayout activeItem="dashboard">
      <div className="bg-white rounded-xl shadow-sm h-full p-10">
        <nav className="bg-white rounded-xl z-10 mb-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex items-center">
              <h1 className="text-xl text-black">
  Welcome to <span className="font-bold text-[#ff5722]">COlaba AI</span>
</h1>

              </div>

              <div className="flex items-center space-x-4">
                <button className="p-2 rounded-full text-gray-600 hover:bg-gray-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
                  </svg>
                </button>

                <div className="relative" ref={profileRef}>
                  <div
                    onClick={toggleProfile}
                    className="flex items-center cursor-pointer"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#ff5722] text-white flex items-center justify-center font-semibold">
                      {getInitials(user.email)}
                    </div>
                  </div>

                  {isProfileOpen && (
                    <div className="absolute right-0 top-10 w-64 bg-white rounded-xl shadow-lg py-1 z-20 border border-gray-100">
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
                              d="M12 17.25l4.95 2.61-1.27-5.42L20 10.92l-5.52-.47L12 5.5l-2.48 4.95-5.52.47 4.32 3.52-1.27 5.42L12 17.25z"
                            />
                          </svg>
                          Points: {userPoints}
                        </a>
                        <button
                          onClick={() => setShowFontSettings(!showFontSettings)}
                          className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
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
                          Text Settings
                        </button>
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
          </div>
        </nav>

        <div className="overflow-hidden">
          {selectedGroup ? (
            <>
              <div className="bg-white shadow-sm px-4 flex border border-gray-100 items-center rounded-xl mb-6">
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
                  Group Chat
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
                <button
                  onClick={() => setActiveTab("quiz")}
                  className={`py-4 px-4 font-medium text-sm ${
                    activeTab === "quiz"
                      ? "text-[#ff9800] border-b-2 border-[#ff9800]"
                      : "text-gray-600 hover:text-[#ff9800]"
                  }`}
                >
                  Live Quiz
                </button>
              </div>

              <div className="overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm h-[600px]">                {activeTab === "chat" && <GroupChat group={selectedGroup} />}
                {activeTab === "whiteboard" && (
                  <Whiteboard groupId={selectedGroup.id} />
                )}
                {activeTab === "video" && (
                  <VideoCall groupId={selectedGroup.id} />
                )}
                {activeTab === "notes" && <Notes groupId={selectedGroup.id} />}
                {activeTab === "quiz" && (
                  <LiveQuiz groupId={selectedGroup.name} />
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-white p-6 rounded-xl ">
                <h1 className="text-2xl font-bold text-gray-800">My Groups</h1>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <UserGroups
                  asCards={true}
                  onSelectGroup={handleGroupSelect}
                  activeGroupId={selectedGroup?.id}
                  isDarkMode={false}
                  maxGroups={4}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-8">
                <div className="bg-white rounded-3xl shadow-sm overflow-hidden md:col-span-2 border-2 border-black">
                  <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                      <h2 className="text-lg font-semibold text-gray-800">
                        My Groups
                      </h2>
                      <Link
                        href="/groups"
                        className="text-[#ff5722] text-sm font-medium hover:underline"
                      >
                        View all groups
                      </Link>
                    </div>

                    <table className="w-full">
                      <thead>
                        <tr className="text-left text-gray-500 text-sm">
                          <th className="pb-2">Group</th>
                          <th className="pb-2">Subject</th>
                        </tr>
                      </thead>
                      <tbody>
                        {userGroups.length === 0 ? (
                          <tr>
                            <td
                              colSpan="4"
                              className="py-4 text-center text-gray-500"
                            >
                              No groups available. Create one to get started!
                            </td>
                          </tr>
                        ) : (
                          userGroups.slice(0, 5).map((group) => (
                            <tr
                              key={group.id}
                              className="border-t border-gray-100"
                              onClick={() => handleGroupSelect(group)}
                            >
                              <td className="py-3">
                                <div>
                                  <p className="font-medium text-black ">
                                    {group.name}
                                  </p>
                                </div>
                              </td>
                              <td className="py-4">
                                <span className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                                  {group.subject}
                                </span>
                              </td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="bg-[#333333] text-white rounded-xl shadow-sm overflow-hidden border border-[#444444]">
                  <div className="p-6">
                    <h2 className="text-lg font-semibold mb-2">
                      New group matching your interests
                    </h2>

                    <div className="bg-[#444444] rounded-lg p-4 mt-4">
                      {userGroups.length > 0 && (
                        <>
                          <span className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full mb-2">
                            {userGroups[0]?.subject || "Computer Science"}
                          </span>
                          <h3 className="text-lg font-bold mb-3">
                            {userGroups[0]?.name ||
                              "Data Analysis Fundamentals"}
                          </h3>

                          <div className="mt-3">
                            <div className="flex -space-x-2 overflow-hidden mb-2">
                              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-blue-500 flex items-center justify-center">
                                {getInitials(
                                  userGroups[0]?.creatorName || "User"
                                )}
                              </div>
                              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-green-500 flex items-center justify-center">
                                {getInitials("Group Member")}
                              </div>
                              <div className="inline-block h-8 w-8 rounded-full ring-2 ring-white bg-purple-500 flex items-center justify-center">
                                +{userGroups[0]?.membersCount || 0}
                              </div>
                            </div>
                            <p className="text-gray-300 text-sm">
                              They are already studying
                            </p>
                          </div>

                          <button
                            onClick={() => handleGroupSelect(userGroups[0])}
                            className="mt-6 w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-3 px-4 rounded-lg text-sm font-medium"
                          >
                            Join Group
                          </button>
                        </>
                      )}

                      {userGroups.length === 0 && (
                        <>
                          <span className="inline-block px-3 py-1 bg-yellow-500 text-black text-xs font-medium rounded-full mb-2">
                            Computer Science
                          </span>
                          <h3 className="text-xl font-bold mb-4">
                            No groups available
                          </h3>
                          <p className="text-gray-300 text-sm">
                            Create a group to get started!
                          </p>
                          <button
                            onClick={handleCreateGroup}
                            className="mt-6 w-full bg-[#ff5722] hover:bg-[#e64a19] text-white py-3 px-4 rounded-lg text-sm font-medium"
                          >
                            Create Group
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      <CreateGroupModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onGroupCreated={handleGroupCreated}
      />

      {showFontSettings && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Accessibility Settings</h2>
              <button
                onClick={() => setShowFontSettings(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </div>

            <div className="space-y-4 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Size
                </label>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => changeFontSize("small")}
                    className={`px-3 py-1 rounded ${
                      fontSize === "small"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Small
                  </button>
                  <button
                    onClick={() => changeFontSize("medium")}
                    className={`px-3 py-1 rounded ${
                      fontSize === "medium"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Medium
                  </button>
                  <button
                    onClick={() => changeFontSize("large")}
                    className={`px-3 py-1 rounded ${
                      fontSize === "large"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    Large
                  </button>
                  <button
                    onClick={() => changeFontSize("x-large")}
                    className={`px-3 py-1 rounded ${
                      fontSize === "x-large"
                        ? "bg-blue-600 text-white"
                        : "bg-gray-200"
                    }`}
                  >
                    X-Large
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Text Spacing
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() =>
                      changeLineSpacing(Math.max(1, lineSpacing - 0.1))
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 5a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                  <input
                    type="range"
                    min="1"
                    max="3"
                    step="0.1"
                    value={lineSpacing}
                    onChange={(e) =>
                      changeLineSpacing(parseFloat(e.target.value))
                    }
                    className="w-full"
                  />
                  <button
                    className="p-2 rounded bg-gray-100 hover:bg-gray-200"
                    onClick={() =>
                      changeLineSpacing(Math.min(3, lineSpacing + 0.1))
                    }
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M3 7a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                Current: {lineSpacing.toFixed(1)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Font Style
                </label>
                <select
                  className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-[#ff5722] focus:border-[#ff5722]"
                  value={fontFamily}
                  onChange={(e) => changeFontFamily(e.target.value)}
                >
                  <option value="system">System Default</option>
                  <option value="serif">Serif</option>
                  <option value="default">Sans Serif</option>
                  <option value="dyslexic">Dyslexic Friendly</option>
                  <option value="comic-sans">Comic Sans</option>
                </select>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-gray-700">
                  High Contrast Mode
                </span>
                <div className="relative inline-block w-10 mr-2 align-middle select-none">
                  <input
                    type="checkbox"
                    name="toggle"
                    id="contrast-toggle"
                    className="sr-only"
                    checked={highContrast}
                    onChange={toggleHighContrast}
                  />
                  <label
                    htmlFor="contrast-toggle"
                    className={`block overflow-hidden h-6 rounded-full cursor-pointer ${
                      highContrast ? "bg-blue-600" : "bg-gray-300"
                    }`}
                  ></label>
                </div>
              </div>
            </div>

            <div className="flex justify-end">
              <button
                onClick={() => setShowFontSettings(false)}
                className="bg-blue-600 text-white px-4 py-2 rounded"
              >
                Apply & Close
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
