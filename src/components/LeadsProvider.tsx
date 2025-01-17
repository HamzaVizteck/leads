import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import { Filter, Lead, SavedFilter } from "../types";
import { leads as initialLeads } from "../data/leads";

const SAVED_FILTERS_KEY = "crm-saved-filters";
const ACTIVE_FILTERS_KEY = "crm-active-filters";

interface LeadsContextType {
  leads: Lead[];
  filters: Filter[];
  savedFilters: SavedFilter[];
  activeFilterIds: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addFilter: () => void;
  removeFilter: (id: string) => void;
  updateFilter: (filter: Filter) => void;
  saveFilter: (name: string) => void;
  toggleSavedFilter: (savedFilter: SavedFilter) => void;
  deleteSavedFilter: (id: string) => void;
  handleImportCSV: (importedLeads: Lead[]) => void;
  filteredLeads: Lead[];
  saveAndActivateFilter: (name: string, filters: Filter[]) => void;
  customFields: Array<{
    key: keyof Lead;
    label: string;
    type: "string" | "number" | "all";
  }>;
  operators: Array<{
    value: string;
    label: string;
    type: "string" | "number" | "all";
  }>;
  deleteLeads: (leadIds: string[]) => void;
}

const LeadsContext = createContext<LeadsContextType | undefined>(undefined);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
};

export const LeadsProvider = ({ children }: { children: ReactNode }) => {
  const [leads, setLeads] = useState<Lead[]>(initialLeads);
  const [filters, setFilters] = useState<Filter[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem(SAVED_FILTERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>(() => {
    const active = localStorage.getItem(ACTIVE_FILTERS_KEY);
    return active ? JSON.parse(active) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");

  const customFields: Array<{
    key: keyof Lead;
    label: string;
    type: "string" | "number" | "all";
  }> = [
    { key: "name", label: "Name", type: "string" },
    { key: "company", label: "Company", type: "string" },
    { key: "status", label: "Status", type: "string" },
    { key: "industry", label: "Industry", type: "string" },
    { key: "source", label: "Source", type: "string" },
    { key: "value", label: "Value", type: "number" },
  ];

  const operators: Array<{
    value: string;
    label: string;
    type: "string" | "number" | "all";
  }> = [
    { value: "equals", label: "Equals (=)", type: "all" },
    { value: "contains", label: "Contains", type: "string" },
    { value: "greater", label: "Greater than (>)", type: "number" },
    {
      value: "greaterEqual",
      label: "Greater than or equal to (≥)",
      type: "number",
    },
    { value: "less", label: "Less than (<)", type: "number" },
    { value: "lessEqual", label: "Less than or equal to (≤)", type: "number" },
  ];

  useEffect(() => {
    localStorage.setItem(SAVED_FILTERS_KEY, JSON.stringify(savedFilters));
  }, [savedFilters]);

  useEffect(() => {
    localStorage.setItem(ACTIVE_FILTERS_KEY, JSON.stringify(activeFilterIds));
  }, [activeFilterIds]);

  const addFilter = () => {
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      field: "name",
      operator: "contains",
      value: "",
    };
    setFilters((prev) => [...prev, newFilter]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
  };

  const updateFilter = (updatedFilter: Filter) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === updatedFilter.id ? updatedFilter : f))
    );
  };

  const saveFilter = (name: string) => {
    const newSavedFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name,
      filters: [...filters],
    };
    setSavedFilters((prev) => [...prev, newSavedFilter]);
    setActiveFilterIds((prev) => [...prev, newSavedFilter.id]);
  };

  const toggleSavedFilter = (savedFilter: SavedFilter) => {
    setActiveFilterIds((prev) => {
      if (prev.includes(savedFilter.id)) {
        return prev.filter((id) => id !== savedFilter.id);
      }
      return [...prev, savedFilter.id];
    });
  };

  const deleteSavedFilter = (id: string) => {
    const filterToDelete = savedFilters.find((f) => f.id === id);
    if (filterToDelete) {
      setFilters(
        filters.filter(
          (f) => !filterToDelete.filters.some((sf) => sf.id === f.id)
        )
      );
    }
    setSavedFilters(savedFilters.filter((f) => f.id !== id));
    setActiveFilterIds((prev) => prev.filter((activeId) => activeId !== id));
  };

  const handleImportCSV = (importedLeads: Lead[]) => {
    setLeads([...leads, ...importedLeads]);
  };

  const filteredLeads = useMemo(() => {
    // Get all active filters (both current and saved)
    const activeFilters = [
      ...savedFilters
        .filter((sf) => activeFilterIds.includes(sf.id))
        .flatMap((sf) => sf.filters),
      ...filters.filter((f) => f.value.trim() !== ""), // Include current filters that have a value
    ];

    return leads.filter((lead) => {
      const matchesSearch =
        searchQuery === "" ||
        Object.values(lead).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );

      const matchesFilters =
        activeFilters.length === 0 ||
        activeFilters.every((filter) => {
          const value = lead[filter.field];
          const filterValue = filter.value;

          if (filter.field === "value") {
            const numValue = Number(value);
            const numFilterValue = Number(filterValue);

            switch (filter.operator) {
              case "greater":
                return numValue > numFilterValue;
              case "greaterEqual":
                return numValue >= numFilterValue;
              case "less":
                return numValue < numFilterValue;
              case "lessEqual":
                return numValue <= numFilterValue;
              case "equals":
                return numValue === numFilterValue;
              default:
                return true;
            }
          }

          if (filter.operator === "contains") {
            return String(value)
              .toLowerCase()
              .includes(filterValue.toLowerCase());
          }

          if (filter.operator === "equals") {
            return String(value).toLowerCase() === filterValue.toLowerCase();
          }

          return true;
        });

      return matchesSearch && matchesFilters;
    });
  }, [filters, savedFilters, activeFilterIds, leads, searchQuery]);

  const saveAndActivateFilter = (name: string, currentFilters: Filter[]) => {
    const filtersToSave = currentFilters.map((filter) => ({
      ...filter,
      id: crypto.randomUUID(),
    }));

    const newFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name,
      filters: filtersToSave,
    };

    setSavedFilters((prev) => [...prev, newFilter]);
    setActiveFilterIds((prev) => [...prev, newFilter.id]);
    setFilters([]); // Clear current filters since we're saving them
  };

  const deleteLeads = (leadIds: string[]) => {
    setLeads((prevLeads) =>
      prevLeads.filter((lead) => !leadIds.includes(lead.id.toString()))
    );
  };

  const value = {
    leads,
    filters,
    savedFilters,
    activeFilterIds,
    searchQuery,
    setSearchQuery,
    addFilter,
    removeFilter,
    updateFilter,
    saveFilter,
    toggleSavedFilter,
    deleteSavedFilter,
    handleImportCSV,
    filteredLeads,
    saveAndActivateFilter,
    customFields,
    operators,
    deleteLeads,
  };

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
};
