import { useEffect, useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
import './App.css'
import { getData } from './utils/storage';
import Chat from './components/Chat';

function App() {
  const [experiment, setExperiment] = useState<any>(null);

  useEffect(() => {
    getData("experimentDetails").then((data) => {
      if (data) setExperiment(data);
    });
  }, []);

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

export default App
