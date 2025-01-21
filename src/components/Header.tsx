import React, { useState } from "react";
import { LogOut, ChevronDown } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { auth } from "../config/firebaseConfig";
import { signOut } from "firebase/auth";

export const Header: React.FC = () => {
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Navigate to login screen
  };

  return (
    <header className="h-16 bg-green-900 border-b shadow-lg border-gray-200 fixed top-0 right-0 left-64 z-50">
      <div className="h-full px-6 flex items-center justify-end">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-full hover:bg-green-100 relative flex items-center justify-center group"
          ></button>
        </div>

        {/* Profile Menu */}
        <div className="relative ml-4">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
            }}
            className="flex items-center space-x-2 text-green-100 hover:bg-green-100 hover:text-green-900 rounded-lg p-2 z-50"
          >
            <div className="w-8 h-8 bg-green-900 text-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-100 text-sm font-medium">AD</span>
            </div>
            <span className="text-sm font-medium">Admin</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-green-100 rounded-lg shadow-lg border border-gray-200 z-60">
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
