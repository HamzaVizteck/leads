import React, { useEffect, useRef, useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import { signOut } from "firebase/auth";
import { useAuth } from "../context/AuthContext";

export const Header: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [userName, setUserName] = useState("");
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const navigate = useNavigate();
  const { currentUser } = useAuth();

  useEffect(() => {
    if (currentUser?.email) {
      // Get the part before @ in the email
      const emailUsername = currentUser.email.split("@")[0];
      // Capitalize first letter and replace dots/underscores with spaces
      const formattedName = emailUsername
        .split(/[._]/)
        .map((word: string) => word.charAt(0).toUpperCase() + word.slice(1))
        .join(" ");
      setUserName(formattedName);
    }
  }, [currentUser]);

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/");
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowProfileMenu(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((word) => word[0])
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="h-16 bg-green-900 border-b shadow-lg border-gray-200 fixed top-0 right-0 left-64 z-40">
      <div className="h-full px-6 flex items-center justify-end">
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-full hover:bg-green-100 relative flex items-center justify-center group"
          ></button>
        </div>
        <p className="text-sm text-green-100">Welcome back, {userName}!</p>

        {/* Profile Menu */}
        <div className="relative ml-4" ref={dropdownRef}>
          <button
            onClick={() => {
              setShowProfileMenu((prev) => !prev);
            }}
            className="flex items-center space-x-2 text-green-100 hover:bg-green-100 hover:text-green-900 rounded-lg p-2 z-40"
          >
            <div className="w-8 h-8 bg-green-900 text-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-100 text-sm font-medium">
                {getInitials(userName)}
              </span>
            </div>
            <span className="text-sm font-medium">{userName}</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-green-100 rounded-lg shadow-lg border border-gray-200 z-50">
              <div className="py-1">
                <button
                  onClick={handleLogout}
                  className="w-full px-4 py-2 text-sm text-green-900 hover:bg-green-900 hover:text-green-100 flex items-center"
                >
                  <LogOut className="w-4 h-4 mr-2" />
                  Logout
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
