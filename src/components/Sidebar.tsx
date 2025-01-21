import React, { useState } from "react";
import {
  Grid,
  List,
  Calendar,
  PieChart,
  Filter,
  ChevronDown,
  ChevronUp,
  Trash2,
  Mail,
  LogOut,
} from "lucide-react";
import { Lead, SavedFilter } from "../types";
import { signOut } from "firebase/auth";
import { auth } from "../config/firebaseConfig";
import { useNavigate } from "react-router-dom";

type Props = {
  leads: Lead[];
  onViewChange: (view: string) => void;
  currentView: string;
  savedFilters: SavedFilter[];
  onApplyFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
};

export const Sidebar: React.FC<Props> = ({
  leads,
  onViewChange,
  currentView,
  savedFilters,
  onApplyFilter,
  onDeleteFilter,
}) => {
  const [showFilters, setShowFilters] = useState(false);

  // const stats = {
  //   totalLeads: leads.length,
  //   totalValue: leads.reduce((sum, lead) => sum + lead.value, 0),
  //   industries: [...new Set(leads.map((lead) => lead.industry))].length,
  //   sources: [...new Set(leads.map((lead) => lead.source))].length,
  // };

  const views = [
    { id: "all", label: "All Leads", icon: List },
    { id: "grid", label: "Grid View", icon: Grid },
    { id: "calendar", label: "Calendar", icon: Calendar },
    { id: "analytics", label: "Analytics", icon: PieChart },
    { id: "email", label: "Email Templates", icon: Mail },
  ];
  const navigate = useNavigate();
  const statuses = Array.from(new Set(leads.map((lead) => lead.status)));
  const statusCounts = statuses.reduce((acc, status) => {
    acc[status] = leads.filter((lead) => lead.status === status).length;
    return acc;
  }, {} as Record<string, number>);
  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Navigate to login screen
  };
  return (
    <div
      className="w-64 bg-green-900 shadow-lg text-green-100 h-screen fixed left-0 top-0 flex flex-col overflow-y-auto
  [&::-webkit-scrollbar]:w-2 
  [&::-webkit-scrollbar-track]:rounded-full
  [&::-webkit-scrollbar-track]:bg-green-200
  [&::-webkit-scrollbar-thumb]:rounded-full
  [&::-webkit-scrollbar-thumb]:bg-green-500"
    >
      <div className="p-6 border-b border-gray-700">
        <h2 className="text-xl font-semibold mb-2 text-green-100">
          CRM System
        </h2>
        <p className="text-sm text-green-100">Welcome back, Admin</p>
      </div>

      <div className="flex-1">
        <div className="p-4">
          <div className="mb-8">
            <h3 className="text-sm font-medium text-green-100 mb-3">VIEWS</h3>
            <nav className="space-y-1">
              {views.map((view) => {
                const Icon = view.icon;
                return (
                  <button
                    key={view.id}
                    onClick={() => onViewChange(view.id)}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-lg transition-colors ${
                      currentView === view.id
                        ? "bg-green-100 text-green-900 opacity-80"
                        : "text-green-100 hover:bg-green-700"
                    }`}
                  >
                    <Icon
                      className={`w-5 h-5 mr-3 ${
                        currentView === view.id
                          ? "text-green-900"
                          : "text-green-100"
                      }`}
                    />
                    {view.label}
                  </button>
                );
              })}
            </nav>
          </div>

          <div className="mb-8">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="w-full flex items-center justify-between text-sm font-medium text-green-100 mb-3"
            >
              <div className="flex items-center text-green-100">
                <Filter className="w-4 h-4 mr-2 text-green-100" />
                SAVED FILTERS
              </div>
              {showFilters ? (
                <ChevronUp className="w-4 h-4 text-green-100" />
              ) : (
                <ChevronDown className="w-4 h-4 text-green-100" />
              )}
            </button>
            {showFilters && (
              <div className="space-y-1">
                {savedFilters.length === 0 ? (
                  <p className="text-sm text-green-100 px-3 py-2">
                    No saved filters
                  </p>
                ) : (
                  savedFilters.map((filter) => (
                    <div
                      key={filter.id}
                      className="flex items-center justify-between px-3 py-2 text-sm text-green-100 hover:bg-green-700 rounded-lg group"
                    >
                      <button
                        onClick={() => onApplyFilter(filter)}
                        className="flex-1 text-left"
                      >
                        {filter.name}
                      </button>
                      <button
                        onClick={() => onDeleteFilter(filter.id)}
                        className="opacity-0 group-hover:opacity-100 text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          <div className="mb-8">
            <h3 className="text-sm font-medium text-green-100 mb-3">STATUS</h3>
            <div className="space-y-2">
              {Object.entries(statusCounts).map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between p-2 rounded-lg hover:bg-green-700"
                >
                  <div className="flex items-center">
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${
                        status === "New"
                          ? "bg-blue-400"
                          : status === "In Progress"
                          ? "bg-yellow-400"
                          : "bg-green-400"
                      }`}
                    />
                    <span className="text-sm text-green-100">{status}</span>
                  </div>
                  <span className="text-sm font-medium text-green-100">
                    {count}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-green-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="text-green-100 flex items-center hover:text-white hover:bg-red-700 rounded-lg p-2"
          >
            <LogOut className="w-5 h-5 mr-2 text-green-100" />
            Logout
          </button>
        </div>
      </div>
    </div>
  );
};
