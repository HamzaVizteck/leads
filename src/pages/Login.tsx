import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom"; // Import Link for navigation

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false); // Track loading state

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true); // Set loading to true while login is in progress

    console.log("Attempting login with:", email, password); // Debugging output

    try {
      // Use the email and password entered by the user
      await signInWithEmailAndPassword(auth, email, password);
      setLoading(false); // Reset loading state after login attempt

      // Pass success message to LeadsManagement page through router state
      navigate("/leads", {
        state: { successMessage: "Login successful!" },
      });
    } catch (err) {
      console.error("Firebase Auth Error:", err); // Log the error for debugging
      setLoading(false); // Reset loading state after failure
      setError("Incorrect email or password. Please try again.");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-900 via-green-500 to-green-900">
        <form
          onSubmit={handleLogin}
          className="bg-green-100 p-6 rounded shadow-lg w-80"
        >
          <h2 className="text-xl mb-4">Login</h2>
          {error && <p className="text-red-500">{error}</p>}
          <div className="mb-4">
            <label className="block mb-2">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded w-full px-3 py-2"
            />
          </div>
          <div className="mb-4">
            <label className="block mb-2">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="border rounded w-full px-3 py-2"
            />
          </div>
          <div className="text-center mt-4 mb-2">
            <p className="text-sm text-gray-600">
              Don't have an account?{" "}
              <Link
                to="/signup"
                className="text-green-500 hover:underline font-medium"
              >
                Sign up here.
              </Link>
            </p>
          </div>
          <button
            type="submit"
            disabled={loading}
            className={`bg-green-500 text-white rounded px-4 py-2 ${
              loading ? "cursor-not-allowed opacity-50" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
        {/* Don't have an account link */}
      </div>
    </div>
  );
};

export default Login;
