import React, { useState } from "react";
import { createUserWithEmailAndPassword } from "firebase/auth";
import { auth, db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { Link, useNavigate } from "react-router-dom";
import bgImage from "../assets/images/bg-login.jpg";
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
    <div className="flex h-screen">
      {/* Left side background */}
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
          onSubmit={handleSignUp}
          className="bg-white shadow-lg rounded-lg p-10 w-1/2 "
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
