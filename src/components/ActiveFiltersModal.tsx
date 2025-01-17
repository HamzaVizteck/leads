import React from "react";
import { Filter, Lead } from "../types";
import { Modal } from "./Modal";
import { X } from "lucide-react";

type Props = {
  isOpen: boolean;
  onClose: () => void;
  filters: Filter[];
  onFilterChange: (filter: Filter) => void;
  onRemoveFilter: (id: string) => void;
  customFields: Array<{ key: keyof Lead; label: string }>;
  operators: Array<{ value: string; label: string }>;
};

export const ActiveFiltersModal: React.FC<Props> = ({
  isOpen,
  onClose,
  filters,
  onFilterChange,
  onRemoveFilter,
  customFields,
  operators,
}) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Active Filters">
      <div className="space-y-4">
        {filters.map((filter) => (
          <div key={filter.id} className="flex items-center space-x-4">
            <select
              className="block w-40 rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              value={filter.field}
              onChange={(e) =>
                onFilterChange({
                  ...filter,
                  field: e.target.value as keyof Lead,
                })
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
              {operators.map((op) => (
                <option key={op.value} value={op.value}>
                  {op.label}
                </option>
              ))}
            </select>

            <input
              type="text"
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
      </div>
    </Modal>
  );
};
