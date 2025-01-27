import React, { useState } from "react";
import {
  List,
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
import { ConfirmationModal } from "./ConfirmationModal"; // Import your modal component

type Props = {
  leads: Lead[];
  onViewChange: (view: string) => void;
  currentView: string;
  savedFilters: SavedFilter[];
  onApplyFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
};

export const Sidebar: React.FC<Props> = ({
  onViewChange,
  currentView,
  savedFilters,
  onApplyFilter,
  onDeleteFilter,
}) => {
  const [showFilters, setShowFilters] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedFilterId, setSelectedFilterId] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state

  const navigate = useNavigate();

  const views = [
    { id: "all", label: "All Leads", icon: List },
    { id: "email", label: "Email Templates", icon: Mail },
  ];

  const handleLogout = async () => {
    await signOut(auth);
    navigate("/"); // Navigate to login screen
  };

  const handleDeleteClick = (id: string) => {
    console.log("Delete button clicked for filter ID:", id);
    setSelectedFilterId(id); // Set the filter ID to delete
    setIsModalOpen(true); // Open the modal
  };

  const handleConfirmDelete = () => {
    if (selectedFilterId) {
      onDeleteFilter(selectedFilterId); // Call the delete function
      setSuccessMessage("Filter deleted successfully!"); // Set the success message
    }
    setIsModalOpen(false); // Close the modal
    setSelectedFilterId(null); // Reset the selected filter ID
    setTimeout(() => setSuccessMessage(null), 3000); // Hide success message after 3 seconds
  };

  const handleCancelDelete = () => {
    setIsModalOpen(false); // Close the modal
    setSelectedFilterId(null); // Reset the selected filter ID
  };

  return (
    <div
      className="w-64 bg-green-900 shadow-lg text-green-100 h-screen z-50 fixed left-0 top-0 flex flex-col overflow-y-auto 
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
                        onClick={() => handleDeleteClick(filter.id)}
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

          {/* Success Message */}
          {successMessage && (
            <div className="mt-4 p-3 bg-green-600 text-white rounded-lg">
              {successMessage}
            </div>
          )}
        </div>
      </div>

      <div className="p-4 border-t border-green-700">
        <div className="flex items-center space-x-4">
          <button
            onClick={handleLogout}
            className="text-green-100 w-full flex items-center hover:text-white hover:bg-red-700 rounded-lg p-2"
          >
            <LogOut className="w-5 h-5 mr-2 text-green-100" />
            Logout
          </button>
        </div>
      </div>

      {/* Confirmation Modal */}
      {isModalOpen && (
        <ConfirmationModal
          title="Confirm Delete"
          message="Are you sure you want to delete this filter? This action cannot be undone."
          onConfirm={handleConfirmDelete}
          onClose={handleCancelDelete}
          isOpen={isModalOpen}
        />
      )}
    </div>
  );
};
