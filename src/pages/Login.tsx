import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import { signInWithEmailAndPassword } from "firebase/auth";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    console.log("Attempting login with:", email, password); // Debugging output

    try {
      // Use the email and password entered by the user
      await signInWithEmailAndPassword(auth, email, password);
      navigate("/leads"); // Redirect to leads management page
    } catch (err) {
      console.error("Firebase Auth Error:", err); // Log the error for debugging
      setError("Login failed. Please try again.");
    }
  };

  return (
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
        <button
          type="submit"
          className="bg-green-500 text-white rounded px-4 py-2"
        >
          Login
        </button>
      </form>
    </div>
  );
};

export default Login;
