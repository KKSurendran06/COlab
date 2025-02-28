import { useAuth } from "../context/AuthContext";
import Login from "./Login";

export default function Popup() {
  const { user, logout } = useAuth();

  if (!user) {
    return <Login />;
  }

  return (
    <div className="p-4 w-72">
      <h2 className="text-lg font-bold">OLabs Tracker</h2>
      <p>Welcome, {user.email}</p>
      <button className="w-full p-2 bg-red-500 text-white rounded" onClick={logout}>
        Logout
      </button>
    </div>
  );
}
