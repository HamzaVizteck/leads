import React, { useState, useMemo } from "react";
import { X, Plus } from "lucide-react";
import { FilterField, Lead, FilterOperator, NumberCondition } from "../types";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFilter: (field: FilterField & { filterName: string }) => void;
  leads: Lead[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  isOpen,
  onClose,
  onAddFilter,
  leads,
}) => {
  const [selectedField, setSelectedField] = useState<keyof Lead | "">("");
  const [selectedType, setSelectedType] = useState<
    "search" | "dropdown" | "number" | "date"
  >("search");
  const [numberConditions, setNumberConditions] = useState<NumberCondition[]>(
    []
  );
  const [newCondition, setNewCondition] = useState<NumberCondition>({
    operator: "=",
    value: 0,
    isActive: true,
  });
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const fields = useMemo(() => {
    if (leads.length === 0) return [];
    const sampleLead = leads[0];
    return Object.entries(sampleLead)
      .filter(([key]) => key !== "id") // Exclude id field
      .map(([key, value]) => ({
        key: key as keyof Lead,
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        type: value instanceof Date ? "date" : typeof value,
      }));
  }, [leads]);

  const resetModal = () => {
    setSelectedField("");
    setSelectedType("search");
    setNumberConditions([]);
    setNewCondition({ operator: "=", value: 0, isActive: true });
  };

  const handleSubmit = () => {
    if (selectedField) {
      onAddFilter({
        key: selectedField as keyof Lead,
        label: fields.find((f) => f.key === selectedField)?.label || "",
        type: selectedType as "search" | "dropdown" | "number" | "date",
        filterName: `${
          selectedField.charAt(0).toUpperCase() + selectedField.slice(1)
        } Filter`,
        value: selectedType === "number" ? numberConditions : undefined,
      });
      setSuccessMessage("Filter added successfully!");
      setTimeout(() => setSuccessMessage(null), 3000); // Clear the message after 3 seconds
      onClose();
      resetModal();
    }
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  const handleAddCondition = () => {
    setNumberConditions([...numberConditions, newCondition]);
    setNewCondition({ operator: "=", value: 0, isActive: true });
  };

  const handleRemoveCondition = (index: number) => {
    setNumberConditions(numberConditions.filter((_, i) => i !== index));
  };

  const getAvailableFilterTypes = (field: keyof Lead) => {
    const fieldType = fields.find((f) => f.key === field)?.type;

    if (fieldType === "number") {
      return [
        { value: "search", label: "Search Bar" },
        { value: "number", label: "Number Conditions" },
      ];
    }
    if (fieldType === "date") {
      return [
        { value: "search", label: "Search Date" },
        { value: "date", label: "Date Conditions" },
      ];
    }
    return [
      { value: "search", label: "Search Bar" },
      { value: "dropdown", label: "Dropdown Selection" },
    ];
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-96 max-h-[80vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-semibold">Add Custom Filter</h2>
          <button
            onClick={handleClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

        {successMessage && (
          <div className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow">
            {successMessage}
          </div>
        )}

        <div className="space-y-6">
          {/* Field Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Select Field
            </label>
            <select
              value={selectedField}
              onChange={(e) => {
                const field = e.target.value as keyof Lead;
                setSelectedField(field);
                setSelectedType("search");
                setNumberConditions([]);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
            >
              <option value="">Choose a field...</option>
              {fields.map((field) => (
                <option key={field.key} value={field.key}>
                  {field.label}
                </option>
              ))}
            </select>
          </div>

          {/* Filter Type Selection */}
          {selectedField && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Filter Type
              </label>
              <select
                value={selectedType}
                onChange={(e) => {
                  setSelectedType(
                    e.target.value as "search" | "dropdown" | "number" | "date"
                  );
                  setNumberConditions([]);
                }}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
              >
                {getAvailableFilterTypes(selectedField).map((type) => (
                  <option key={type.value} value={type.value}>
                    {type.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Date Conditions */}
          {selectedType === "date" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Date Conditions
              </label>
              {/* Existing conditions */}
              {numberConditions.map((condition, index) => (
                <div
                  key={index}
                  className="flex items-center gap-2 bg-gray-50 p-2 rounded"
                >
                  <span className="text-sm font-medium">
                    {condition.operator}
                  </span>
                  <span className="text-sm">{condition.value}</span>
                  <button
                    onClick={() => handleRemoveCondition(index)}
                    className="ml-auto text-red-500 hover:text-red-700"
                  >
                    <X size={14} />
                  </button>
                </div>
              ))}

              {/* Add new date condition */}
              <div className="flex items-center gap-2">
                <select
                  value={newCondition.operator}
                  onChange={(e) =>
                    setNewCondition({
                      ...newCondition,
                      operator: e.target.value as FilterOperator,
                    })
                  }
                  className="px-2 py-1 border rounded"
                >
                  <option value="=">=</option>
                  <option value=">">Greater than </option>
                  <option value="<">Less than </option>
                  <option value=">=">Greater than =</option>
                  <option value="<=">Less than =</option>
                </select>
                <input
                  type="date"
                  value={newCondition.value}
                  onChange={(e) =>
                    setNewCondition({
                      ...newCondition,
                      value: new Date(e.target.value).getTime(), // Store as timestamp
                    })
                  }
                  className="px-2 py-1 border rounded w-24"
                />
                <button
                  onClick={handleAddCondition}
                  className="ml-auto rounded-lg p-1 bg-green-500 text-white hover:bg-green-700 flex items-center"
                >
                  <Plus size={16} />
                  <span className="text-sm text-white ml-1">Add</span>
                </button>
              </div>
            </div>
          )}

          {/* Preview */}
          {selectedField && (
            <div className="bg-gray-50 p-4 rounded-lg">
              <h3 className="text-sm font-medium text-gray-700 mb-2">
                Preview
              </h3>
              <div className="text-sm text-gray-600">
                <p>
                  Field:{" "}
                  <span className="font-medium">
                    {fields.find((f) => f.key === selectedField)?.label}
                  </span>
                </p>
                <p>
                  Type:{" "}
                  <span className="font-medium capitalize">{selectedType}</span>
                </p>
                <p>
                  Data Type:{" "}
                  <span className="font-medium capitalize">
                    {fields.find((f) => f.key === selectedField)?.type}
                  </span>
                </p>
                {selectedType === "date" && numberConditions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Conditions:{" "}
                    {numberConditions
                      .map(
                        (c) =>
                          `${c.operator} ${new Date(
                            c.value
                          ).toLocaleDateString()}`
                      )
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={!selectedField}
            className={`w-full py-2 px-4 rounded-lg text-white font-medium ${
              !selectedField
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-green-500 hover:bg-green-700"
            }`}
          >
            Add Filter
          </button>
        </div>
      </div>
    </div>
  );
};
