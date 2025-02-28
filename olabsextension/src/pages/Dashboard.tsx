"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import getSubjectName from "../utils/getSubjectName";
import fetchExperimentTitle from "../utils/fetchExperimentTitle";
import useLiveUsers from "../utils/useLiveUsers";
import { setUserLiveStatus } from "../utils/useLiveUsers";
import { FaSignOutAlt, FaGlobe, FaRobot, FaUsers } from "react-icons/fa";
import { createGroup } from "../utils/createGroup"; // Import the function

interface Experiment {
  sub: string;
  sim: string;
  cnt: string;
}

export default function Dashboard({ experiment }: { experiment: Experiment | null }) {
  const { user, logout } = useAuth();
  const [subjectName, setSubjectName] = useState("Loading...");
  const [experimentName, setExperimentName] = useState("Loading...");
  const [aiResponse, setAiResponse] = useState<string | null>(null);
  const [groupId, setGroupId] = useState<string | null>(null);
  const liveUsers = useLiveUsers(experiment);

  useEffect(() => {
    async function fetchData() {
      if (experiment) {
        const subject = await getSubjectName(experiment.sub);
        setSubjectName(subject);

        chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
          if (tabs.length > 0 && tabs[0].url) {
            const expTitle = await fetchExperimentTitle(tabs[0].url);
            setExperimentName(expTitle);
          }
        });
      }
    }
    fetchData();
  }, [experiment]);

  useEffect(() => {
    if (experiment && user) {
      setUserLiveStatus(experiment, user.uid, user.displayName || "Anonymous", user.email || "N/A", true);

      return () => {
        setUserLiveStatus(experiment, user.uid, "", "", false);
      };
    }
  }, [experiment, user]);

  const handleCreateGroup = async () => {
    if (!experiment || !user) {
      alert("Cannot create group. Missing experiment details or user not logged in.");
      return;
    }

    try {
      const groupName = `${experimentName}`;
      const newGroupId = await createGroup(groupName, subjectName, experiment.sim);
      setGroupId(newGroupId);
      console.log("Group created with ID:", newGroupId);
    } catch (error) {
      console.error("Failed to create group:", error);
    }
  };

  const handleAIExplanation = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        const url = tabs[0].url;
        console.log("OLabs URL:", url);

        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC5JJ8UDOsoyVTIGZDFwvUdF0zV6liVHfs`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `Explain nicely the steps of the experiment titled "${experimentName}" in a summarized way using bullet points.` }] }],
              }),
            }
          );

          const data = await response.json();
          console.log("AI Response:", data);

          const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response.";
          setAiResponse(explanation);

          const speech = new SpeechSynthesisUtterance(explanation);
          speech.lang = "en-US";
          window.speechSynthesis.speak(speech);
        } catch (error) {
          console.error("AI request failed", error);
          setAiResponse("Failed to fetch AI explanation.");
        }
      } else {
        console.log("Failed to get OLabs URL.");
      }
    });
  };

  if (!experiment) {
    return <div className="p-4 text-center">Loading experiment details...</div>;
  }

  return (
    <div className="p-4 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-md">
        <h2 className="text-2xl font-semibold mb-4 text-center">Dashboard</h2>
        <button
          className="w-full py-2 px-4 bg-red-500 text-white rounded-md mb-4 flex items-center justify-center gap-2"
          onClick={logout}
        >
          <FaSignOutAlt /> Logout
        </button>
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Current Experiment</h3>
          <p className="text-sm">
            <span className="font-medium">Subject:</span> {subjectName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Experiment:</span> {experimentName}
          </p>
          <p className="text-sm">
            <span className="font-medium">Step:</span> {experiment.cnt}
          </p>
        </div>
        <div className="mb-4 p-4 border rounded-md bg-gray-50">
          <h3 className="text-lg font-semibold mb-2">Users Online</h3>
          {liveUsers.length > 0 ? (
            <ul className="list-disc list-inside">
              {liveUsers.map((user) => (
                <li key={user.id} className="text-sm">
                  {user.email}
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm">No users online</p>
          )}
        </div>
        <div className="flex flex-col gap-2">
          <button
            className="w-full py-2 px-4 bg-blue-500 text-white rounded-md flex items-center justify-center gap-2"
            onClick={() => window.open("https://www.olabs.edu.in", "_blank")}
          >
            <FaGlobe /> Main Website
          </button>
          <button
            className="w-full py-2 px-4 bg-purple-500 text-white rounded-md flex items-center justify-center gap-2"
            onClick={handleAIExplanation}
          >
            <FaRobot /> AI Explanation
          </button>
          <button
            className="w-full py-2 px-4 bg-green-500 text-white rounded-md flex items-center justify-center gap-2"
            onClick={handleCreateGroup}
          >
            <FaUsers /> Create Group
          </button>
        </div>
        {groupId && (
          <div className="mt-4 p-4 border rounded-md bg-green-100">
            <h3 className="text-lg font-semibold mb-2">Group Created</h3>
            <p className="text-sm">Group ID: {groupId}</p>
          </div>
        )}
        {aiResponse && (
          <div className="mt-4 p-4 border rounded-md bg-gray-50">
            <h3 className="text-lg font-semibold mb-2">AI Summary</h3>
            {aiResponse.includes("\n") ? (
              <ul className="list-disc list-inside text-sm">
                {aiResponse.split("\n").map((point, index) =>
                  point.trim() ? <li key={index}>{point}</li> : null
                )}
              </ul>
            ) : (
              <p className="text-sm">{aiResponse}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
