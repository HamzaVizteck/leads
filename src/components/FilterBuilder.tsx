import React, { useState, useEffect } from "react";
import { Filter, Lead } from "../types";
import { Plus, Trash2, FilterX as FilterIcon } from "lucide-react";
import FilterModal from "./FilterModal";
import FilterPill from "./FilterPill";
import { CSVImport } from "./CSVImport";
import { useLeads } from "./LeadsProvider";
import { ConfirmationModal } from "./ConfirmationModal";

type Props = {
  filters: Filter[];
  onAddFilter: (field: {
    key: keyof Lead;
    label: string;
    type: "search" | "dropdown" | "number";
    filterName: string;
  }) => void;
  onRemoveFilter: (id: string) => void;
  onFilterChange: (filter: Filter) => void;
  selectedLeads: string[];
  onImportCSV: (importedLeads: Lead[]) => void;
  setFilters: (filters: Filter[]) => void;
};

export const FilterBuilder: React.FC<Props> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
  selectedLeads,
  onImportCSV,
  setFilters,
}) => {
  const { deleteLeads } = useLeads();
  const [showAddFilterModal, setShowAddFilterModal] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);

  useEffect(() => {
    resetFilters(); // Reset filters on full page reload
  }, []); // Empty dependency array to run only on mount

  const handleDelete = () => {
    setShowDeleteConfirmation(true);
  };

  const handleConfirmDelete = () => {
    deleteLeads(selectedLeads);
    setShowDeleteConfirmation(false);
  };

  const resetFilters = () => {
    const resetFilters = filters.map((filter) => {
      // Reset the value based on the filter type
      if (filter.type === "dropdown") {
        return { ...filter, value: "" }; // Reset dropdown value to an empty string
      } else if (filter.type === "number") {
        return { ...filter, value: 0 }; // Reset number value to 0
      } else {
        return { ...filter, value: "" }; // Reset other types to empty string
      }
    });

    setFilters(resetFilters); // Update the filters with reset values
  };

  return (
    <div className="space-y-4 container mx-auto bg-white p-4 rounded-md">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowAddFilterModal(true)}
            title="Add Filter"
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Add Filter
          </button>
        </div>
        <div className="flex space-x-3">
          <button
            onClick={resetFilters}
            className="p-2 text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            title="Reset Filters" // Tooltip text on hover
          >
            <FilterIcon className="w-4 h-4" />
          </button>
          <CSVImport onImport={onImportCSV} />
          <button
            onClick={handleDelete}
            disabled={selectedLeads.length === 0}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
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

      {/* Active Filters Display */}
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => (
          <FilterPill
            key={filter.id}
            filter={filter}
            onRemove={onRemoveFilter}
            onUpdate={onFilterChange}
          />
        ))}
      </div>

      {/* Filter Modal */}
      <FilterModal
        isOpen={showAddFilterModal}
        onClose={() => setShowAddFilterModal(false)}
        onAddFilter={onAddFilter}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={showDeleteConfirmation}
        onClose={() => setShowDeleteConfirmation(false)}
        onConfirm={handleConfirmDelete}
        title="Delete Leads"
        message={`Are you sure you want to delete ${selectedLeads.length} selected lead(s)? This action cannot be undone.`}
      />
    </div>
  );
};
