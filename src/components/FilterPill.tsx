import { useState, useRef, useEffect } from "react";
import { ChevronDown, ChevronUp, X, Plus } from "lucide-react";
import { Filter, FilterOperator, Lead, NumberCondition } from "../types";
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
  const [numberConditions, setNumberConditions] = useState<NumberCondition[]>(
    []
  );
  const [newCondition, setNewCondition] = useState<NumberCondition>({
    operator: "=",
    value: 0,
    isActive: true,
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
    } else if (filter.type === "date") {
      // Handle date selection logic here
      const currentConditions = filter.value as NumberCondition[];
      const isSelected = currentConditions.some(
        (c) =>
          c.operator === selectedCondition.operator &&
          c.value === new Date(selectedCondition.value).getTime() // Ensure comparison is done with timestamps
      );

      const updatedConditions = isSelected
        ? currentConditions.filter(
            (c) =>
              !(
                c.operator === selectedCondition.operator &&
                c.value === new Date(selectedCondition.value).getTime()
              )
          )
        : [
            ...currentConditions,
            {
              ...selectedCondition,
              value: new Date(selectedCondition.value).getTime(),
            },
          ];

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

  const isDateField = (field: keyof Lead) => {
    const value = leads[0][field];
    return value instanceof Date;
  };

  const handleAddCondition = () => {
    const newConditionWithActive: NumberCondition = {
      ...newCondition,
      isActive: true,
    };
    setNumberConditions([...numberConditions, newConditionWithActive]);
    setNewCondition({ operator: "=", value: 0, isActive: true });

    // Update the filter in LeadsProvider
    onUpdate({
      ...filter,
      value: [...numberConditions, newConditionWithActive],
    });
  };

  const toggleConditionActive = (index: number) => {
    const updatedConditions = numberConditions.map((condition, i) =>
      i === index ? { ...condition, isActive: !condition.isActive } : condition
    );
    setNumberConditions(updatedConditions);

    // Update the filter in LeadsProvider
    onUpdate({
      ...filter,
      value: updatedConditions,
    });
  };

  const handleRemoveCondition = (index: number) => {
    setNumberConditions(numberConditions.filter((_, i) => i !== index));
  };

  console.log("Filter Type:", filter.type);
  console.log("Field Value:", leads[0][filter.field]);
  console.log("Is Date Field:", isDateField(filter.field));

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
          <div>
            <button
              onClick={() => setIsOpen(!isOpen)}
              className="flex items-center gap-1"
            >
              {numberConditions.length > 0 ? (
                <span className="text-sm text-gray-700">
                  {numberConditions
                    .filter((condition) => condition.isActive)
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

            {isOpen && (
              <div className="absolute top-full mt-2 w-72 bg-white border rounded-lg shadow-lg z-10">
                <div className="p-4">
                  {numberConditions.map((condition, index) => (
                    <div key={index} className="flex items-center gap-2 mb-2">
                      <input
                        type="checkbox"
                        checked={condition.isActive}
                        onChange={() => toggleConditionActive(index)}
                        className="mr-2"
                      />
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
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {filter.type === "date" && isOpen && (
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
                      {condition.operator}{" "}
                      {new Date(condition.value).toLocaleDateString()}
                    </span>
                  </label>
                </div>
              ))}
            </div>
          </div>
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
    </div>
  );
}
