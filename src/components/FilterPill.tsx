import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Filter, Lead, NumberCondition } from "../types";
import { leads } from "../data/leads";

interface FilterPillProps {
  filter: Filter;
  onRemove: (id: string) => void;
  onUpdate: (filter: Filter) => void;
}

export default function FilterPill({ filter, onUpdate }: FilterPillProps) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const [allConditions] = useState<NumberCondition[]>(() => {
    // Initialize with the conditions that were added when creating the filter
    if (filter.type === "number" && Array.isArray(filter.value)) {
      return filter.value as NumberCondition[];
    }
    return [];
  });

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const uniqueValues = Array.from(
    new Set(leads.map((lead) => String(lead[filter.field])))
  );

  const handleSelectCondition = (selectedCondition: NumberCondition) => {
    if (filter.type === "number") {
      const currentConditions = filter.value as NumberCondition[];
      const isSelected = currentConditions.some(
        (c) =>
          c.operator === selectedCondition.operator &&
          c.value === selectedCondition.value
      );

      const updatedConditions = isSelected
        ? currentConditions.filter(
            (c) =>
              !(
                c.operator === selectedCondition.operator &&
                c.value === selectedCondition.value
              )
          )
        : [...currentConditions, selectedCondition];

      onUpdate({
        ...filter,
        value: updatedConditions,
      });
    }
  };

  const isConditionSelected = (condition: NumberCondition) => {
    if (!Array.isArray(filter.value)) return false;
    return (filter.value as NumberCondition[]).some(
      (c) => c.operator === condition.operator && c.value === condition.value
    );
  };

  const getActiveConditions = () => {
    if (!Array.isArray(filter.value)) return [];
    return filter.value as NumberCondition[];
  };

  const isDateField = (field: keyof Lead) => {
    return (
      typeof leads[0][field] === "string" && !isNaN(Date.parse(leads[0][field]))
    );
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div className="flex items-center gap-2 bg-green-50 border rounded-full px-4 py-2 shadow-lg">
        <span className="font-medium capitalize">{filter.field}:</span>

        {filter.type === "search" && (
          <>
            {isDateField(filter.field) ? (
              <input
                type="date"
                value={filter.value as string}
                onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
                className="outline-none bg-transparent"
                placeholder={`Select date for ${filter.field}...`}
              />
            ) : (
              <input
                type="text"
                value={filter.value as string}
                onChange={(e) => onUpdate({ ...filter, value: e.target.value })}
                className="outline-none bg-transparent"
                placeholder={`Search ${filter.field}...`}
              />
            )}
          </>
        )}

        {filter.type === "dropdown" && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1"
          >
            {Array.isArray(filter.value) && filter.value.length > 0 ? (
              <span className="text-sm text-gray-700">
                {filter.value.join(", ")}
              </span>
            ) : (
              "Select options"
            )}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}

        {filter.type === "number" && (
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="flex items-center gap-1"
          >
            {Array.isArray(filter.value) && filter.value.length > 0 ? (
              <span className="text-sm text-gray-700">
                {getActiveConditions()
                  .map(
                    (condition) => `${condition.operator} ${condition.value}`
                  )
                  .join(", ")}
              </span>
            ) : (
              "Select conditions"
            )}
            {isOpen ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
          </button>
        )}
      </div>

      {filter.type === "dropdown" && isOpen && (
        <div className="absolute top-full mt-2 w-48 bg-white border rounded-lg shadow-lg z-10">
          <div className="p-2 max-h-60 overflow-y-auto">
            {uniqueValues.map((value) => (
              <label
                key={value}
                className="flex items-center p-2 hover:bg-gray-50"
              >
                <input
                  type="checkbox"
                  checked={
                    Array.isArray(filter.value) &&
                    (filter.value as string[]).includes(value)
                  }
                  onChange={(e) => {
                    const values = (filter.value as string[]) || [];
                    const newValues = e.target.checked
                      ? [...values, value]
                      : values.filter((v) => v !== value);
                    onUpdate({ ...filter, value: newValues });
                  }}
                  className="mr-2"
                />
                {value}
              </label>
            ))}
          </div>
        </div>
      )}

      {filter.type === "number" && isOpen && (
        <div className="absolute top-full mt-2 w-72 bg-white border rounded-lg shadow-lg z-10">
          <div className="p-4">
            {allConditions.map((condition, index) => (
              <div key={index} className="flex items-center gap-2 mb-2">
                <label className="flex items-center p-2 hover:bg-gray-50 w-full">
                  <input
                    type="checkbox"
                    checked={isConditionSelected(condition)}
                    onChange={() => handleSelectCondition(condition)}
                    className="mr-2"
                  />
                  <span className="text-sm">
                    {condition.operator} {condition.value}
                  </span>
                </label>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
