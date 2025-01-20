import { useState } from "react";
import { X, Plus } from "lucide-react";
import { FilterField, Lead, FilterOperator, NumberCondition } from "../types";
import { leads } from "../data/leads";

interface FilterModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddFilter: (field: FilterField & { filterName: string }) => void;
}

const isNumberField = (field: keyof Lead) => {
  return typeof leads[0][field] === "number";
};

export default function FilterModal({
  isOpen,
  onClose,
  onAddFilter,
}: FilterModalProps) {
  const [selectedField, setSelectedField] = useState<keyof Lead | "">("");
  const [selectedType, setSelectedType] = useState<
    "search" | "dropdown" | "number"
  >("search");
  const [numberConditions, setNumberConditions] = useState<NumberCondition[]>(
    []
  );
  const [newCondition, setNewCondition] = useState<NumberCondition>({
    operator: "=",
    value: 0,
  });

  const fields: Array<{ key: keyof Lead; label: string }> = [
    { key: "name", label: "Name" },
    { key: "email", label: "Email" },
    { key: "company", label: "Company" },
    { key: "status", label: "Status" },
    { key: "industry", label: "Industry" },
    { key: "value", label: "Value" },
    { key: "lastContact", label: "Last Contact" },
  ];

  const handleSubmit = () => {
    if (selectedField) {
      onAddFilter({
        key: selectedField,
        label: fields.find((f) => f.key === selectedField)?.label || "",
        type: selectedType,
        filterName: `${
          selectedField.charAt(0).toUpperCase() + selectedField.slice(1)
        } Filter`,
        value: selectedType === "number" ? numberConditions : undefined,
      });
      onClose();
      // Reset form
      setSelectedField("");
      setSelectedType("search");
      setNumberConditions([]);
      setNewCondition({ operator: "=", value: 0 });
    }
  };

  const handleAddCondition = () => {
    setNumberConditions([...numberConditions, newCondition]);
    setNewCondition({ operator: "=", value: 0 });
  };

  const handleRemoveCondition = (index: number) => {
    setNumberConditions(numberConditions.filter((_, i) => i !== index));
  };

  const getAvailableFilterTypes = (field: keyof Lead) => {
    if (isNumberField(field)) {
      return [
        { value: "search", label: "Search Bar" },
        { value: "number", label: "Number Conditions" },
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
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700"
          >
            <X size={20} />
          </button>
        </div>

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
                    e.target.value as "search" | "dropdown" | "number"
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

          {/* Number Conditions */}
          {selectedType === "number" && (
            <div className="space-y-4">
              <label className="block text-sm font-medium text-gray-700">
                Number Conditions
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

              {/* Add new condition */}
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
                  <option value=">">&gt;</option>
                  <option value="<">&lt;</option>
                  <option value=">=">&gt;=</option>
                  <option value="<=">&lt;=</option>
                </select>
                <input
                  type="number"
                  value={newCondition.value}
                  onChange={(e) =>
                    setNewCondition({
                      ...newCondition,
                      value: parseFloat(e.target.value) || 0,
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
                {selectedType === "dropdown" && (
                  <p className="text-xs text-gray-500 mt-1">
                    {
                      Array.from(
                        new Set(leads.map((lead) => lead[selectedField]))
                      ).length
                    }{" "}
                    options available
                  </p>
                )}
                {selectedType === "number" && numberConditions.length > 0 && (
                  <p className="text-xs text-gray-500 mt-1">
                    Conditions:{" "}
                    {numberConditions
                      .map((c) => `${c.operator} ${c.value}`)
                      .join(", ")}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            onClick={handleSubmit}
            disabled={
              !selectedField ||
              (selectedType === "number" && numberConditions.length === 0)
            }
            className={`w-full py-2 px-4 rounded-lg text-white font-medium
              ${
                selectedField &&
                (selectedType !== "number" || numberConditions.length > 0)
                  ? "bg-green-600 hover:bg-green-700"
                  : "bg-gray-300 cursor-not-allowed"
              }`}
          >
            Add Filter
          </button>
        </div>
      </div>
    </div>
  );
}
