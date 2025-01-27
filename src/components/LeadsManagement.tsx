import React, { useState } from "react";
import { useLeads } from "./LeadsProvider";
import { LeadTable } from "./LeadTable";
import { FilterBuilder } from "./FilterBuilder";
import { Sidebar } from "./Sidebar";
import { Users, Search } from "lucide-react";
import { EmailTemplate } from "./EmailTemplate";
import { FilterField } from "../types";

export const LeadsManagement: React.FC = () => {
  const {
    filters,
    savedFilters,
    addFilter,
    removeFilter,
    updateFilter,
    onApplyFilter,
    onDeleteFilter,
    handleImportCSV,
    filteredLeads,
    searchQuery,
    setSearchQuery,
    setFilters,
    leads,
  } = useLeads();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState("all");
  const [successMessage, setSuccessMessage] = useState<string | null>(null); // Success message state

  // Reset the selection of leads
  const resetSelectedLeads = () => {
    setSelectedLeads([]); // Reset the selection
  };

  // Show success message and auto-clear it after 3 seconds
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000); // Clear the message after 3 seconds
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view); // Update the current view
  };

  const handleSelectLeads = (ids: string[]) => {
    setSelectedLeads(ids); // Update selected leads state
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      {/* Sidebar */}
      <Sidebar
        leads={leads}
        currentView={currentView}
        onViewChange={setCurrentView}
        savedFilters={savedFilters}
        onApplyFilter={onApplyFilter}
        onDeleteFilter={onDeleteFilter}
      />

      {/* Main Content */}
      <div className="flex-1 pl-64 bg-gray-100">
        <div className="container mx-auto px-4 py-8 pt-20">
          {/* Header */}
          <div className="flex items-center justify-between mb-8 bg-gray-100 sticky top-0 py-4 z-10 w-full max-w-[1228px] ">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                Leads Management
              </h1>
            </div>

            {(currentView === "all" || currentView === "grid") && (
              <div className="flex items-center gap-4">
                <div
                  className={`text-sm px-4 py-2 rounded-md ${
                    searchQuery ||
                    filters.some(
                      (filter) =>
                        filter.value &&
                        (typeof filter.value === "string"
                          ? filter.value.length > 0
                          : false)
                    )
                      ? "bg-green-100 border border-green-400 text-green-700"
                      : "bg-gray-100 border border-gray-300 text-gray-700"
                  }`}
                >
                  {filteredLeads.length} lead
                  {filteredLeads.length === 1 ? "" : "s"} found
                </div>
                <div className="relative z-20">
                  <input
                    type="text"
                    placeholder="Search leads..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                  />
                  <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                </div>
              </div>
            )}
          </div>

          {/* Success Message */}
          {successMessage && (
            <div
              className="fixed top-4 right-4 z-50 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow"
              role="alert"
            >
              {successMessage}
            </div>
          )}

          {/* Filter Builder */}
          {currentView !== "email" && (
            <div className="mb-8 w-full max-w-[1228px] ">
              <FilterBuilder
                filters={filters}
                onAddFilter={(filter) => {
                  const newFilter: FilterField & { filterName: string } = {
                    key: filter.key as string,
                    label: filter.label,
                    type: filter.type,
                    filterName: filter.filterName,
                  };
                  addFilter(newFilter);
                  showSuccessMessage("Filter added successfully!");
                }}
                onRemoveFilter={removeFilter}
                onFilterChange={updateFilter}
                selectedLeads={selectedLeads}
                resetSelectedLeads={resetSelectedLeads}
                onImportCSV={handleImportCSV}
                setFilters={setFilters}
                leads={filteredLeads}
              />
            </div>
          )}

          {/* Conditional rendering for email view */}
          {currentView === "email" ? (
            <div className="email-view">
              <EmailTemplate leads={filteredLeads} />
            </div>
          ) : (
            <div className="overflow-x-auto max-w-full">
              <LeadTable
                leads={filteredLeads}
                selectedLeads={selectedLeads}
                onSelectLeads={handleSelectLeads}
                onViewChange={handleViewChange}
                onSuccessMessage={showSuccessMessage} // Pass success message handler
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
