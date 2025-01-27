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
import { leads as initialLeads } from "../data/leads.ts";
import { db } from "../config/firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { useAuth } from "../context/AuthContext";

const LEADS_STORAGE_KEY = "crm-leads-data";

export interface LeadsContextType {
  leads: Lead[];
  filters: Filter[];
  savedFilters: SavedFilter[];
  setFilters: (filters: Filter[]) => void;
  setSavedFilters: (filters: SavedFilter[]) => void;
  addFilter: (filter: Filter) => void;
  removeFilter: (id: string) => void;
  updateFilter: (filter: Filter) => void;
  onApplyFilter: (filter: SavedFilter) => void;
  onDeleteFilter: (id: string) => void;
  updateLead: (lead: Lead) => Promise<void>;
  deleteLeads: (leadIds: string[]) => void;
  updateLeads: (leads: Lead[]) => void;
  setLeads: (leads: Lead[]) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  filteredLeads: Lead[];
  activeFilterIds: string[];
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
  addCustomField: (field: {
    key: keyof Lead;
    label: string;
    type: "string" | "number" | "all";
  }) => void;
  removeCustomField: (key: keyof Lead) => void;
  userName: string;
}

const LeadsContext = createContext<LeadsContextType | null>(null);

export const useLeads = () => {
  const context = useContext(LeadsContext);
  if (!context) {
    throw new Error("useLeads must be used within a LeadsProvider");
  }
  return context;
};

export const LeadsProvider: React.FC<{ children: ReactNode }> = ({
  children,
}) => {
  const { currentUser } = useAuth();
  const [leads, setLeads] = useState<Lead[]>(() => {
    const savedLeads = localStorage.getItem(LEADS_STORAGE_KEY);
    return savedLeads ? JSON.parse(savedLeads) : initialLeads;
  });
  const [filters, setFilters] = useState<Filter[]>([]);
  const [savedFilters, setSavedFilters] = useState<SavedFilter[]>([]);
  const [activeFilterIds, setActiveFilterIds] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [userName, setUserName] = useState<string>("");

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

  // Fetch saved filters from Firebase when user logs in
  useEffect(() => {
    const fetchSavedFilters = async () => {
      if (!currentUser) return;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        if (userData.filters) {
          setSavedFilters(userData.filters);
          // Extract all filters from saved filters
          const allFilters = userData.filters.flatMap(
            (sf: SavedFilter) => sf.filters
          );
          setFilters(allFilters);
        }
      }
    };

    fetchSavedFilters();
  }, [currentUser]);

  // Save filters to Firebase
  const saveFiltersToFirebase = async (updatedSavedFilters: SavedFilter[]) => {
    if (!currentUser) return;

    const userDocRef = doc(db, "users", currentUser.uid);
    await updateDoc(userDocRef, {
      filters: updatedSavedFilters,
    });
  };

  const addFilter = async (field: FilterField & { filterName: string }) => {
    if (!currentUser) return;

    const newFilter: Filter = {
      id: crypto.randomUUID(),
      name: field.label,
      field: field.key,
      type: field.type,
      value:
        field.value ||
        (field.type === "number" ? [] : field.type === "dropdown" ? [] : ""),
    };

    // Ensure that the value for number type is always an array
    if (field.type === "number" && !Array.isArray(newFilter.value)) {
      newFilter.value = [];
    }

    const newSavedFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name: field.filterName,
      filters: [newFilter],
    };

    // Update local state
    setFilters((prev) => [...prev, newFilter]);
    setSavedFilters((prev) => {
      const updated = [...prev, newSavedFilter];
      // Save to Firebase
      saveFiltersToFirebase(updated);
      return updated;
    });
    setActiveFilterIds((prev) => [...prev, newSavedFilter.id]);
  };

  const removeFilter = async (id: string) => {
    if (!currentUser) return;

    // Remove from local filters
    setFilters(filters.filter((f) => f.id !== id));

    // Remove from saved filters
    setSavedFilters((prev) => {
      const updated = prev.filter((sf) => !sf.filters.some((f) => f.id === id));
      // Save to Firebase
      saveFiltersToFirebase(updated);
      return updated;
    });

    setActiveFilterIds((prev) =>
      prev.filter(
        (activeId) =>
          !savedFilters
            .find((sf) => sf.id === activeId)
            ?.filters.some((f) => f.id === id)
      )
    );
  };

  const updateFilter = async (updatedFilter: Filter) => {
    if (!currentUser) return;

    // Update local filters
    setFilters((prev) =>
      prev.map((f) => (f.id === updatedFilter.id ? updatedFilter : f))
    );

    // Update saved filters
    setSavedFilters((prev) => {
      const updated = prev.map((sf) => ({
        ...sf,
        filters: sf.filters.map((f) =>
          f.id === updatedFilter.id ? updatedFilter : f
        ),
      }));
      // Save to Firebase
      saveFiltersToFirebase(updated);
      return updated;
    });
  };

  const saveFilter = async (name: string) => {
    if (!currentUser) return;

    const newSavedFilter: SavedFilter = {
      id: crypto.randomUUID(),
      name,
      filters: [...filters],
    };

    // Update local state
    setSavedFilters((prev) => {
      const updated = [...prev, newSavedFilter];
      // Save to Firebase
      saveFiltersToFirebase(updated);
      return updated;
    });
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

  const onDeleteFilter = async (id: string) => {
    if (!currentUser) return;

    const filterToDelete = savedFilters.find((f) => f.id === id);
    if (filterToDelete) {
      setFilters(
        filters.filter(
          (f) => !filterToDelete.filters.some((sf) => sf.id === f.id)
        )
      );
    }

    // Update local state
    setSavedFilters((prev) => {
      const updated = prev.filter((f) => f.id !== id);
      // Save to Firebase
      saveFiltersToFirebase(updated);
      return updated;
    });
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

          // Ensure conditions is an array
          const validConditions = Array.isArray(conditions) ? conditions : [];

          return validConditions
            .filter((condition) => condition.isActive) // Only consider active conditions
            .every((condition) => {
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

  const updateLeads = (newLeads: Lead[]) => {
    setLeads(newLeads);
  };

  useEffect(() => {
    const fetchUserData = async () => {
      if (!currentUser) return;

      const userDocRef = doc(db, "users", currentUser.uid);
      const userDoc = await getDoc(userDocRef);

      if (userDoc.exists()) {
        const userData = userDoc.data();
        console.log("Fetched User Data:", userData); // Log the fetched data
        setUserName(userData.name || "User"); // Set user name or default to "User"
      } else {
        console.log("User document does not exist.");
      }
    };

    fetchUserData();
  }, [currentUser]);

  useEffect(() => {
    console.log("User Name State Updated:", userName);
  }, [userName]);

  const value = {
    leads,
    filters,
    savedFilters,
    setFilters,
    setSavedFilters,
    addFilter,
    removeFilter,
    updateFilter,
    onApplyFilter: toggleSavedFilter,
    onDeleteFilter,
    updateLead,
    deleteLeads,
    updateLeads,
    setLeads,
    searchQuery,
    setSearchQuery,
    filteredLeads,
    activeFilterIds,
    customFields,
    operators,
    addCustomField,
    removeCustomField,
    userName,
  };

  return (
    <LeadsContext.Provider value={value}>{children}</LeadsContext.Provider>
  );
};
