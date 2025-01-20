import {
  createContext,
  useState,
  useContext,
  useEffect,
  ReactNode,
  useMemo,
} from "react";
import {
  Filter,
  Lead,
  SavedFilter,
  FilterField,
  NumberCondition,
} from "../types";
import { leads as initialLeads } from "../data/leads";
import { db } from "../config/firebaseConfig";
import { collection, query, getDocs } from "firebase/firestore";

const SAVED_FILTERS_KEY = "crm-saved-filters";
const ACTIVE_FILTERS_KEY = "crm-active-filters";
const LEADS_STORAGE_KEY = "crm-leads-data";

interface LeadsContextType {
  leads: Lead[];
  filters: Filter[];
  savedFilters: SavedFilter[];
  activeFilterIds: string[];
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  addFilter: (field: FilterField & { filterName: string }) => void;
  removeFilter: (id: string) => void;
  updateFilter: (filter: Filter) => void;
  saveFilter: (name: string) => void;
  onApplyFilter: (savedFilter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
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
  addCustomField: (field: {
    key: keyof Lead;
    label: string;
    type: "string" | "number" | "all";
  }) => void;
  removeCustomField: (key: keyof Lead) => void;
  setLeads: React.Dispatch<React.SetStateAction<Lead[]>>;
  updateLead: (updatedLead: Lead) => void;
  setFilters: (filters: Filter[]) => void;
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
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem(LEADS_STORAGE_KEY);
    return savedLeads ? JSON.parse(savedLeads) : initialLeads;
  });
  const [filters, setFilters] = useState<Filter[]>(() => {
    const savedFilters = localStorage.getItem(SAVED_FILTERS_KEY);
    if (savedFilters) {
      const parsed = JSON.parse(savedFilters);
      // Get all filters from saved filters
      const allFilters = parsed.flatMap((sf: SavedFilter) => sf.filters);
      return allFilters;
    }
    return [];
  });
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>(() => {
    const saved = localStorage.getItem(SAVED_FILTERS_KEY);
    return saved ? JSON.parse(saved) : [];
  });
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>(() => {
    const active = localStorage.getItem(ACTIVE_FILTERS_KEY);
    return active ? JSON.parse(active) : [];
  });
  const [searchQuery, setSearchQuery] = useState("");

  const [customFields, setCustomFields] = useState<
    Array<{ key: keyof Lead; label: string; type: "string" | "number" | "all" }>
  >([
    { key: "name", label: "Name", type: "string" },
    { key: "company", label: "Company", type: "string" },
    { key: "email", label: "Email", type: "string" },
    { key: "phone", label: "Phone", type: "string" },
    { key: "status", label: "Status", type: "string" },
    { key: "source", label: "Source", type: "string" },
    { key: "industry", label: "Industry", type: "string" },
    { key: "value", label: "Value", type: "number" },
  ]);

  const addCustomField = (field: {
    key: keyof Lead;
    label: string;
    type: "string" | "number" | "all";
  }) => {
    setCustomFields((prev) => [...prev, field]);
  };

  const removeCustomField = (key: keyof Lead) => {
    setCustomFields((prev) => prev.filter((field) => field.key !== key));
  };

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

  useEffect(() => {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  // Check if there are any CSV files in Firebase
  useEffect(() => {
    const checkCSVFiles = async () => {
      const q = query(collection(db, "csv_files"));
      const querySnapshot = await getDocs(q);

      // If no CSV files exist, reset to default data
      if (querySnapshot.empty) {
        setLeads(initialLeads);
        localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(initialLeads));
      }
    };

    checkCSVFiles();
  }, []);

  // Save leads to localStorage whenever they change
  useEffect(() => {
    localStorage.setItem(LEADS_STORAGE_KEY, JSON.stringify(leads));
  }, [leads]);

  const addFilter = (field: FilterField & { filterName: string }) => {
    const newFilter: Filter = {
      id: crypto.randomUUID(),
      name: field.label,
      field: field.key,
      type: field.type,
      value:
        field.value ||
        (field.type === "number" ? [] : field.type === "dropdown" ? [] : ""),
    };
    setFilters((prev) => [...prev, newFilter]);

    // Save as a new saved filter
    const newSavedFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name: field.filterName,
      filters: [newFilter],
    };
    setSavedFilters((prev) => [...prev, newSavedFilter]);
    setActiveFilterIds((prev) => [...prev, newSavedFilter.id]);
  };

  const removeFilter = (id: string) => {
    setFilters(filters.filter((f) => f.id !== id));
    // Remove this filter from saved filters if it exists
    setSavedFilters((prev) =>
      prev.filter((sf) => !sf.filters.some((f) => f.id === id))
    );
    setActiveFilterIds((prev) =>
      prev.filter(
        (activeId) =>
          !savedFilters
            .find((sf) => sf.id === activeId)
            ?.filters.some((f) => f.id === id)
      )
    );
  };

  const updateFilter = (updatedFilter: Filter) => {
    setFilters((prev) =>
      prev.map((f) => (f.id === updatedFilter.id ? updatedFilter : f))
    );
    // Update the filter in saved filters if it exists
    setSavedFilters((prev) =>
      prev.map((sf) => ({
        ...sf,
        filters: sf.filters.map((f) =>
          f.id === updatedFilter.id ? updatedFilter : f
        ),
      }))
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
    setLeads(importedLeads);
  };

  const filteredLeads = useMemo(() => {
    return leads.filter((lead) => {
      // First apply search query across all fields
      const matchesSearch =
        searchQuery === "" ||
        Object.values(lead).some((value) =>
          String(value).toLowerCase().includes(searchQuery.toLowerCase())
        );

      // Then apply filters
      const matchesFilters = filters.every((filter) => {
        const value = lead[filter.field];

        if (filter.type === "search") {
          const searchValue = filter.value as string;
          return (
            searchValue === "" ||
            String(value).toLowerCase().includes(searchValue.toLowerCase())
          );
        }

        if (filter.type === "dropdown") {
          const selectedValues = filter.value as string[];
          return (
            selectedValues.length === 0 ||
            selectedValues.includes(String(value))
          );
        }

        if (filter.type === "number") {
          const conditions = filter.value as NumberCondition[];
          if (conditions.length === 0) return true;

          return conditions.every((condition) => {
            const numValue = Number(value);
            switch (condition.operator) {
              case "=":
                return numValue === condition.value;
              case ">":
                return numValue > condition.value;
              case "<":
                return numValue < condition.value;
              case ">=":
                return numValue >= condition.value;
              case "<=":
                return numValue <= condition.value;
              default:
                return true;
            }
          });
        }

        return true;
      });

      return matchesSearch && matchesFilters;
    });
  }, [leads, filters, searchQuery]);

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

  const updateLead = (updatedLead: Lead) => {
    setLeads((prev) =>
      prev.map((lead) => (lead.id === updatedLead.id ? updatedLead : lead))
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
    onApplyFilter: toggleSavedFilter,
    onDeleteFilter: deleteSavedFilter,
    handleImportCSV,
    filteredLeads,
    saveAndActivateFilter,
    customFields,
    operators,
    deleteLeads,
    addCustomField,
    removeCustomField,
    setLeads,
    updateLead,
    setFilters,
  };

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
};
