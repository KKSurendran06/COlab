import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import Signup from "./Signup";

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [showSignup, setShowSignup] = useState(false);

  const handleLogin = async () => {
    try {
      await login(email, password);
    } catch (err) {
      setError("Invalid credentials");
    }
  };

  if (showSignup) {
    return <Signup />;
  }

  return (
    <div className="p-4">
      <h2 className="text-lg font-bold">Login</h2>
      {error && <p className="text-red-500">{error}</p>}
      <input
        type="email"
        placeholder="Email"
        className="w-full p-2 border rounded mb-2"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <input
        type="password"
        placeholder="Password"
        className="w-full p-2 border rounded mb-2"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
      />
      <button className="w-full p-2 bg-blue-500 text-white rounded mb-2" onClick={handleLogin}>
        Login
      </button>
      <p className="text-center">Don't have an account?</p>
      <button className="w-full p-2 bg-gray-500 text-white rounded" onClick={() => setShowSignup(true)}>
        Signup
      </button>
    </div>
  );
}
