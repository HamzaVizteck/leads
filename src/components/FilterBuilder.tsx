import React, { useState } from "react";
import { Filter, Lead, SavedFilter } from "../types";
import { Plus, Save, X, Download, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { ActiveFiltersModal } from "./ActiveFiltersModal";

type Props = {
  filters: Filter[];
  onAddFilter: () => void;
  onRemoveFilter: (id: string) => void;
  onFilterChange: (filter: Filter) => void;
  savedFilters: SavedFilter[];
  activeFilterIds: string[];
  onApplyFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
  selectedLeads: string[];
  saveAndActivateFilter: (name: string, filters: Filter[]) => void;
  customFields: Array<{ key: keyof Lead; label: string }>;
  operators: Array<{
    value: string;
    label: string;
    type: "all" | "string" | "number";
  }>;
};

export const FilterBuilder: React.FC<Props> = ({
  filters,
  onAddFilter,
  onRemoveFilter,
  onFilterChange,
  savedFilters,
  activeFilterIds,
  onApplyFilter,
  onDeleteFilter,
  selectedLeads,
  saveAndActivateFilter,
  customFields,
  operators,
}) => {
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [filterName, setFilterName] = useState("");
  const [showCustomFieldsModal, setShowCustomFieldsModal] = useState(false);
  const [showActiveFiltersModal, setShowActiveFiltersModal] = useState(false);

  const handleSaveFilter = () => {
    if (filterName.trim()) {
      const validFilters = filters.filter((f) => f.value.trim() !== "");
      if (validFilters.length > 0) {
        saveAndActivateFilter(filterName, validFilters);
        setFilterName("");
        setShowSaveDialog(false);
      } else {
        alert("Please add at least one filter with a value");
      }
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <div className="flex space-x-3">
          <button
            onClick={() => setShowCustomFieldsModal(true)}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            Customize Fields
          </button>
          <button
            onClick={onAddFilter}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <Plus className="w-4 h-4 inline-block mr-2" />
            Add Filter
          </button>
          {filters.length > 0 && (
            <button
              onClick={() => setShowSaveDialog(true)}
              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
            >
              <Save className="w-4 h-4 mr-2" />
              Save Filter
            </button>
          )}
        </div>
        <div className="flex space-x-3">
          <button
            disabled={selectedLeads.length === 0}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
              selectedLeads.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-600 hover:bg-green-700"
            }`}
          >
            <Download className="w-4 h-4 mr-2" />
            Export
          </button>
          <button
            disabled={selectedLeads.length === 0}
            className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 ${
              selectedLeads.length === 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            <Trash2 className="w-4 h-4 mr-2" />
            Delete
          </button>
        </div>
      </div>

      {/* Active Filters */}
      {filters.map((filter) => (
        <div key={filter.id} className="flex items-center space-x-4">
          <select
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={filter.field}
            onChange={(e) =>
              onFilterChange({ ...filter, field: e.target.value as keyof Lead })
            }
          >
            {customFields.map((field) => (
              <option key={field.key} value={field.key}>
                {field.label}
              </option>
            ))}
          </select>

          <select
            className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={filter.operator}
            onChange={(e) =>
              onFilterChange({
                ...filter,
                operator: e.target.value as Filter["operator"],
              })
            }
          >
            {operators
              .filter((op) => {
                if (filter.field === "value") {
                  return op.type === "number" || op.type === "all";
                }
                return op.type === "string" || op.type === "all";
              })
              .map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
          </select>

          <input
            type={filter.field === "value" ? "number" : "text"}
            className="block w-64 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            value={filter.value}
            onChange={(e) =>
              onFilterChange({ ...filter, value: e.target.value })
            }
            placeholder="Filter value..."
          />

          <button
            onClick={() => onRemoveFilter(filter.id)}
            className="text-red-600 hover:text-red-800 p-2"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      ))}

      {/* Saved Filters Section */}
      {savedFilters.length > 0 && (
        <div className="mb-6">
          <h3 className="text-sm font-medium text-gray-700 mb-2">
            Saved Filters
          </h3>
          <div className="flex space-x-2">
            {savedFilters.map((filter) => (
              <button
                key={filter.id}
                onClick={() => onApplyFilter(filter)}
                className={`flex items-center justify-between bg-gray-50 px-4 py-2 rounded-full transition-colors ${
                  activeFilterIds.includes(filter.id)
                    ? "bg-green-300 text-green-600"
                    : "bg-green-100 text-green-900 hover:bg-green-200"
                }`}
              >
                <span className="text-sm">{filter.name}</span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onDeleteFilter(filter.id);
                  }}
                  className="text-gray-500 items-center ml-3 hover:text-red-500"
                >
                  <X className="w-4 h-4" />
                </button>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Save Filter Modal */}
      <Modal
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        title="Save Filter"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Filter Name
            </label>
            <input
              type="text"
              className="block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filterName}
              onChange={(e) => setFilterName(e.target.value)}
              placeholder="Enter filter name..."
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowSaveDialog(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSaveFilter}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              Save
            </button>
          </div>
        </div>
      </Modal>

      {/* Custom Fields Modal */}
      <Modal
        isOpen={showCustomFieldsModal}
        onClose={() => setShowCustomFieldsModal(false)}
        title="Customize Fields"
      >
        <div className="space-y-4">
          <div className="space-y-2">
            {customFields.map((field) => (
              <div
                key={field.key}
                className="flex items-center justify-between py-2"
              >
                <span className="text-sm text-gray-700">{field.label}</span>
                {!["id", "name", "company"].includes(field.key) && (
                  <button
                    onClick={() => {}}
                    className="text-red-600 hover:text-red-800"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-gray-200">
            <button
              onClick={() => {}}
              className="flex items-center text-sm text-green-600 hover:text-green-800"
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Custom Field
            </button>
          </div>
          <div className="flex justify-end">
            <button
              onClick={() => setShowCustomFieldsModal(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Close
            </button>
          </div>
        </div>
      </Modal>

      {/* Active Filters Modal */}
      <ActiveFiltersModal
        isOpen={showActiveFiltersModal}
        onClose={() => setShowActiveFiltersModal(false)}
        filters={filters}
        onFilterChange={onFilterChange}
        onRemoveFilter={onRemoveFilter}
        customFields={customFields}
        operators={operators}
      />
    </div>
  );
};
