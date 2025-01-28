import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Link } from "react-router-dom"; // Import Link for navigation
import bgImage from "../assets/images/bg-login.jpg"; // Import the background image

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
    <div className="flex h-screen">
      {/* Left side background with image */}
      <div
        className="w-1/2 flex items-center justify-center bg-cover p-2 bg-center relative"
        style={{
          backgroundImage: `url(${bgImage})`,
          backgroundSize: "90%",
          backgroundRepeat: "no-repeat",
        }} // Prevent the image from repeating
      >
        <h1 className="absolute top-8 text-center text-green-900 text-3xl font-bold font-serif">
          Leads Maestro
        </h1>
        <p className="absolute top-20 text-center text-green-700 text-sm font-bold font-serif">
          Orchestrating Your Success, One Lead at a Time.
        </p>
      </div>
      {/* Right side form */}
      <div className="w-1/2 flex items-center justify-center bg-gradient-to-br from-green-900 via-green-500 to-green-900">
        <form
          onSubmit={handleLogin}
          className="bg-white shadow-lg rounded-lg p-10 w-1/2 "
        >
          {error && <p className="text-red-500">{error}</p>}
          <p className="mb-4 text-center">Please login to your account</p>

          {/* Username input */}
          <div className="mb-4">
            <label className="block mb-2  items-center">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="border rounded w-full px-3 py-2"
            />
          </div>

          {/* Password input */}
          <div className="mb-4">
            <label className="block mb-2  items-center">Password</label>
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
      </div>
    </div>
  );
};

export default Login;
