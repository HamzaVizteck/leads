import React, { useState, useEffect } from "react";
import { Filter, Lead } from "../types";
import { Plus, Trash2, FilterX as FilterIcon } from "lucide-react";
import { FilterModal } from "./FilterModal";
import { FilterPill } from "./FilterPill";
import { CSVImport } from "./CSVImport";
import { useLeads } from "./LeadsProvider";
import { ConfirmationModal } from "./ConfirmationModal";

type Props = {
  filters: Filter[];
  onAddFilter: (field: {
    key: keyof Lead;
    label: string;
    type: "search" | "dropdown" | "number" | "date";
    filterName: string;
  }) => void;
  onRemoveFilter: (id: string) => void;
  onFilterChange: (filter: Filter) => void;
  selectedLeads: string[];
  onImportCSV: (importedLeads: Lead[]) => void;
  setFilters: (filters: Filter[]) => void;
  resetSelectedLeads: () => void;
  leads: Lead[];
};

export const FilterBuilder: React.FC<Props> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
  selectedLeads,
  onImportCSV,
  setFilters,
  resetSelectedLeads,
  leads,
}) => {
  const { deleteLeads } = useLeads();
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    resetFilters();
  }, []);

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    if (selectedLeads.length > 0) {
      deleteLeads(selectedLeads);
      setShowDeleteConfirmation(false);
      showSuccessMessage("Lead(s) deleted successfully");
      resetSelectedLeads();
    }
  };

  const resetFilters = () => {
    const resetFilters = filters.map((filter) => {
      if (filter.type === "dropdown") {
        return { ...filter, value: "" };
      } else if (filter.type === "number") {
        return { ...filter, value: 0 };
      } else {
        return { ...filter, value: "" };
      }
    });

    setFilters(resetFilters);
  };

  return (
    <div className="bg-white p-4 rounded-md shadow-md">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
        <div className="w-full sm:w-auto">
          <button
            onClick={() => setShowAddFilterModal(true)}
            title="Add Filter"
            className="w-full sm:w-auto px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Add Filter
          </button>
        </div>
        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            onClick={resetFilters}
            className="w-full sm:w-auto p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title="Reset Filters"
          >
            <FilterIcon className="w-4 h-4 mx-auto sm:mx-0" />
          </button>
          <div className="w-full sm:w-auto">
            <CSVImport onImport={onImportCSV} />
          </div>
          <button
            onClick={handleDelete}
            disabled={selectedLeads.length === 0}
            className={`w-full sm:w-auto flex items-center justify-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              selectedLeads.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete {selectedLeads.length > 0 ? `(${selectedLeads.length})` : ""}
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterPill
            key={filter.id}
            filter={filter}
            onRemove={onRemoveFilter}
            onUpdate={onFilterChange}
            leads={leads}
          />
        ))}
      </div>

      <FilterModal
        isOpen={showAddFilterModal}
        onClose={() => setShowAddFilterModal(false)}
        onAddFilter={onAddFilter}
        leads={leads}
      />

      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Leads"
        message={`Are you sure you want to delete ${selectedLeads.length} selected lead(s)? This action cannot be undone.`}
      />

      {successMessage && (
        <div
          className="fixed top-12 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow"
          role="alert"
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};
