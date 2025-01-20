import React, { useState } from "react";
import { Bell, Settings, LogOut, User, ChevronDown } from "lucide-react";

type Notification = {
  id: string;
  message: string;
  time: string;
  read: boolean;
};

export const Header: React.FC = () => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);

  // Mock notifications - in a real app, these would come from a backend
  const notifications: Notification[] = [
    {
      id: "1",
      message: "New lead assigned: Tech Solutions Inc",
      time: "5 minutes ago",
      read: false,
    },
    {
      id: "2",
      message: "Meeting reminder: Client presentation at 2 PM",
      time: "1 hour ago",
      read: false,
    },
    {
      id: "3",
      message: "Lead status updated: Marketing Pro",
      time: "3 hours ago",
      read: true,
    },
  ];

  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <header className="h-16 bg-green-900 border-b shadow-lg border-gray-200 fixed top-0 right-0 left-64 z-50">
      <div className="h-full px-6 flex items-center justify-end">
        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => {
              setShowNotifications(!showNotifications);
              setShowProfileMenu(false);
            }}
            className="p-2 rounded-full hover:bg-green-100 relative flex items-center justify-center group"
          >
            <Bell
              className={`w-6 h-6 ${
                showNotifications ? "text-green-900" : "text-green-100"
              } group-hover:text-green-900`}
            />
            {unreadCount > 0 && (
              <span className="absolute top-1 right-1 bg-red-500 text-green-100 text-xs w-4 h-4 flex items-center justify-center rounded-full">
                {unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-green-100 rounded-lg shadow-lg border border-gray-200 z-60">
              <div className="p-4 border-b border-gray-200">
                <h3 className="font-semibold text-green-900">Notifications</h3>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {notifications.map((notification) => (
                  <div
                    key={notification.id}
                    className={`p-4 border-b border-gray-100 hover:bg-gray-50 ${
                      !notification.read ? "bg-blue-50" : ""
                    }`}
                  >
                    <p className="text-sm text-gray-800">
                      {notification.message}
                    </p>
                    <p className="text-xs text-gray-500 mt-1">
                      {notification.time}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Profile Menu */}
        <div className="relative ml-4">
          <button
            onClick={() => {
              setShowProfileMenu(!showProfileMenu);
              setShowNotifications(false);
            }}
            className="flex items-center space-x-2 text-green-100 hover:bg-green-100 hover:text-green-900 rounded-lg p-2 z-50"
          >
            <div className="w-8 h-8 bg-green-900 text-green-100 rounded-full flex items-center justify-center">
              <span className="text-green-100 text-sm font-medium">JD</span>
            </div>
            <span className="text-sm font-medium">John Doe</span>
            <ChevronDown className="w-4 h-4" />
          </button>
          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-green-100 rounded-lg shadow-lg border border-gray-200 z-60">
              <div className="py-1">
                <button className="w-full px-4 py-2 text-sm text-green-900 hover:bg-green-900 hover:text-green-100 flex items-center">
                  <User className="w-4 h-4 mr-2" />
                  Profile
                </button>
                <button className="w-full px-4 py-2 text-sm text-green-900 hover:bg-green-900 hover:text-green-100 flex items-center">
                  <Settings className="w-4 h-4 mr-2" />
                  Settings
                </button>
                <button className="w-full px-4 py-2 text-sm text-green-900 hover:bg-green-900 hover:text-green-100 flex items-center">
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
