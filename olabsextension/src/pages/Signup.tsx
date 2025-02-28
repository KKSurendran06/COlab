import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { motion } from "framer-motion";
import { FaUser, FaLock } from "react-icons/fa";

interface SignupProps {
  onBackToLogin: () => void;
}

export default function Signup({ onBackToLogin }: SignupProps) {
  const { signup } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSignup = async () => {
    setError("");
    if (!email || !password) {
      setError("Please enter both email and password.");
      return;
    }
    if (!/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setLoading(true);
    try {
      await signup(email, password);
    } catch (err) {
      console.error(err);
      setError("Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
      className="flex justify-center items-center min-h-screen bg-gradient-to-r from-blue-500 to-purple-600 p-6"
    >
      <div className="bg-white p-10 rounded-3xl shadow-2xl w-full max-w-md space-y-6">
        <h2 className="text-3xl font-bold text-center text-gray-700">Signup</h2>
        {error && <p className="text-red-500 text-center">{error}</p>}
        <div className="relative">
          <FaUser className="absolute left-4 top-8 text-gray-500 text-lg" />
          <input
            type="email"
            placeholder="Email"
            className="w-full p-8 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div className="relative">
          <FaLock className="absolute left-4 top-4 text-gray-500 text-lg" />
          <input
            type="password"
            placeholder="Password"
            className="w-full p-4 pl-12 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-400"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
        </div>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className={`w-full p-4 bg-blue-500 text-white rounded-xl font-semibold shadow-md hover:bg-blue-600 transition-all ${
            loading ? "opacity-50 cursor-not-allowed" : ""
          }`}
          onClick={handleSignup}
          disabled={loading}
        >
          {loading ? "Signing up..." : "Signup"}
        </motion.button>
        <p className="text-center text-gray-600">Already have an account?</p>
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          className="w-full p-4 bg-gray-500 text-white rounded-xl font-semibold shadow-md hover:bg-gray-600 transition-all"
          onClick={onBackToLogin}
        >
          Login
        </motion.button>
      </div>
    </motion.div>
  );
}