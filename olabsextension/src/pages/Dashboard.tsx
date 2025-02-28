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
  const { user, logout } = useAuth(); // Assuming user has `user.uid` and `user.displayName`
  const [subjectName, setSubjectName] = useState("Loading...");
  const [experimentName, setExperimentName] = useState("Loading...");
  const liveUsers = useLiveUsers(experiment);

  useEffect(() => {
    if (experiment) {
      getSubjectName(experiment.sub).then(setSubjectName);
      fetchExperimentTitle(window.location.href).then(setExperimentName);
    }
  }, [experiment]);

  useEffect(() => {
    if (experiment && user) {
      // Set user as live on mount
      setUserLiveStatus(experiment, user.uid, user.displayName || "Anonymous", true);

      // Set user as offline on unmount
      return () => {
        setUserLiveStatus(experiment, user.uid, "", false);
      };
    }
  }, [experiment, user]);

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

        <button className="w-full p-3 bg-purple-500 text-white rounded-lg shadow-md flex items-center justify-center gap-2">
          <FaRobot /> AI Explanation
        </button>
      </div>
    </div>
  );
}
