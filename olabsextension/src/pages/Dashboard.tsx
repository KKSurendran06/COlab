import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import getSubjectName from "../utils/getSubjectName";
import fetchExperimentTitle from "../utils/fetchExperimentTitle";
import useLiveUsers from "../utils/useLiveUsers";
import { setUserLiveStatus } from "../utils/useLiveUsers";
import { FaSignOutAlt, FaGlobe, FaRobot } from "react-icons/fa";

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
  const liveUsers = useLiveUsers(experiment);

  useEffect(() => {
    if (experiment) {
      getSubjectName(experiment.sub).then(setSubjectName);
      fetchExperimentTitle(window.location.href).then(setExperimentName);
    }
  }, [experiment]);

  useEffect(() => {
    if (experiment && user) {
      setUserLiveStatus(experiment, user.uid, user.displayName || "Anonymous", true);
      return () => {
        setUserLiveStatus(experiment, user.uid, "", false);
      };
    }
  }, [experiment, user]);

  const handleAIExplanation = async () => {
    chrome.tabs.query({ active: true, currentWindow: true }, async (tabs) => {
      if (tabs.length > 0 && tabs[0].url) {
        const url = tabs[0].url;
        console.log("OLabs URL:", url); // ✅ Correctly gets the URL
  
        try {
          const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=AIzaSyC5JJ8UDOsoyVTIGZDFwvUdF0zV6liVHfs`,
            {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                contents: [{ parts: [{ text: `${url} go to this url and explain me the steps in a summarised way within points` }] }],
              }),
            }
          );
  
          const data = await response.json();
          console.log("AI Response:", data);
  
          const explanation = data.candidates?.[0]?.content?.parts?.[0]?.text || "No AI response.";
          setAiResponse(explanation);
  
          // Read out the response
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
    return <div className="p-6 text-center">Loading experiment details...</div>;
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen flex flex-col items-center">
      <div className="bg-white p-6 rounded-2xl shadow-xl w-full max-w-lg text-center">
        <h2 className="text-2xl font-bold text-gray-700">Dashboard</h2>

        <button className="w-full p-3 bg-red-500 text-white rounded-lg shadow-md flex items-center justify-center gap-2 mb-4" onClick={logout}>
          <FaSignOutAlt /> Logout
        </button>

        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm mb-4">
          <h3 className="text-lg font-semibold">Current Experiment</h3>
          <p>🔬 Subject: {subjectName}</p>
          <p>🧪 Experiment: {experimentName}</p>
          <p>📜 Step: {experiment.cnt}</p>
        </div>

        <div className="p-4 border rounded-lg bg-gray-50 shadow-sm mb-4">
          <h3 className="text-lg font-semibold">Users Online</h3>
          {liveUsers.length > 0 ? (
            <ul>
              {liveUsers.map((user) => (
                <li key={user.id} className="text-gray-700">{user.name}</li>
              ))}
            </ul>
          ) : (
            <p>No users online</p>
          )}
        </div>

        <button className="w-full p-3 bg-blue-500 text-white rounded-lg shadow-md flex items-center justify-center gap-2 mb-2"
          onClick={() => window.open("https://www.olabs.edu.in", "_blank")}>
          <FaGlobe /> Go to Main Website
        </button>

        <button className="w-full p-3 bg-purple-500 text-white rounded-lg shadow-md flex items-center justify-center gap-2"
          onClick={handleAIExplanation}>
          <FaRobot /> AI Explanation
        </button>

        {aiResponse && (
          <div className="p-4 border rounded-lg bg-gray-50 shadow-sm mt-4">
            <h3 className="text-lg font-semibold">AI Summary</h3>
            <p>{aiResponse}</p>
          </div>
        )}
      </div>
    </div>
  );
}
