import { useEffect, useState } from "react";
import "./App.css";
import { getData } from "./utils/storage";
import Chat from "./components/Chat";
import { useAuth } from "./context/AuthContext";
import Login from "./pages/Login";

function App() {
  const { user } = useAuth();
  const [experiment, setExperiment] = useState<any>(null);

  useEffect(() => {
    if (user) {
      getData("experimentDetails").then((data) => {
        if (data) setExperiment(data);
      });
    }
  }, [user]);

  if (!user) {
    return <Login />; // Show login page if user is not authenticated
  }

  return (
    <div className="p-4 w-72">
      <h2 className="text-lg font-bold">OLabs Tracker</h2>
      {experiment ? (
        <div>
          <p>🔬 Subject: {experiment.sub}</p>
          <p>🧪 Experiment: {experiment.sim}</p>
          <p>📜 Step: {experiment.cnt}</p>
        </div>
      ) : (
        <p>Loading experiment details...</p>
      )}
      <Chat />
    </div>
  );
}

export default App;
