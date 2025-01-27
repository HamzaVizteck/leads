import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";

const SignUp = () => {
  const [name, setName] = useState(""); // Added name state
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      setLoading(false);
      return;
    }

    console.log("Attempting sign-up with:", name, email, password);

    try {
      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(
        auth,
        email,
        password
      );
      const user = userCredential.user;

      // Log user data to check
      console.log("Created user:", user);

      // Create a document in the Firestore "users" collection
      await setDoc(doc(db, "users", user.uid), {
        name, // Store the user's name
        email: user.email, // Ensure email is correctly passed
        filters: [],
        createdAt: new Date(), // Timestamp for creation
      });

      setLoading(false); // Reset loading state after sign-up attempt

      // Navigate to Leads page with success message
      navigate("/leads", {
        state: { successMessage: "Account created successfully!" },
      });
    } catch (err) {
      console.error("Firebase Auth Error:", err);
      setLoading(false);
      setError("Error creating account. Please try again.");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center justify-center h-screen bg-gradient-to-br from-green-900 via-green-500 to-green-900">
        <form
          onSubmit={handleSignUp}
          className="bg-green-100 p-6 rounded shadow-lg w-80"
        >
          <h2 className="text-xl mb-4">Sign Up</h2>
          {error && <p className="text-red-500">{error}</p>}
          {/* Name input */}
          <div className="mb-4">
            <label className="block mb-2">Full Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="border rounded w-full px-3 py-2"
            />
          </div>
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
          <div className="mb-4">
            <label className="block mb-2">Confirm Password</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              className="border rounded w-full px-3 py-2"
            />
          </div>
          {/* Already have an account link */}
          <div className="text-center mt-4 mb-2">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link
                to="/"
                className="text-green-500 hover:underline font-medium"
              >
                Login here.
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
            {loading ? "Signing up..." : "Sign Up"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default SignUp;
