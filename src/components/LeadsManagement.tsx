import React, { useState, useEffect } from "react";
import { useLeads } from "./LeadsProvider";
import { LeadTable } from "./LeadTable";
import { FilterBuilder } from "./FilterBuilder";
import { Sidebar } from "./Sidebar";
import { Users, Search } from "lucide-react";
import { EmailTemplate } from "./EmailTemplate";
import { FilterField } from "../types";
import { Header } from "./Header";

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
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const resetSelectedLeads = () => {
    setSelectedLeads([]);
  };

  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 3000);
  };

  const handleViewChange = (view: string) => {
    setCurrentView(view);
  };

  const handleSelectLeads = (ids: string[]) => {
    console.log("Selected leads updated:", ids);
    setSelectedLeads(ids);
  };

  useEffect(() => {
    console.log("LeadsManagement rendered");
  }, []);

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
      <div className="flex-1 pl-64 bg-gray-100 flex flex-col h-screen">
        {/* Fixed Header */}
        <Header />

        {/* Fixed Leads Management Header */}
        <div className="fixed top-16 left-64 right-0 bg-gray-100 z-30">
          <div className="px-6 py-4 border-b max-w-full sm:max-w-[768px] md:max-w-[1024px] lg:max-w-[1228px] mx-auto">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-green-600 mr-3" />
                <h1 className="text-xl md:text-2xl font-bold text-gray-900">
                  Leads Management
                </h1>
              </div>

              {(currentView === "all" || currentView === "grid") && (
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
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
                  <div className="relative w-full sm:w-auto">
                    <input
                      type="text"
                      id="search"
                      placeholder="Search leads..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    />
                    <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
                  </div>
                </div>
              )}
            </div>
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
        </div>

        {/* Fixed Filter Builder */}
        {currentView !== "email" && (
          <div className="fixed top-32 left-64 right-0 bg-gray-100 z-20">
            <div className="px-6 py-4 border-b max-w-full sm:max-w-[768px] md:max-w-[1024px] lg:max-w-[1228px] mx-auto">
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
          </div>
        )}

        {/* Scrollable Content Area */}
        <div className="flex-1 overflow-auto h-[calc(100vh-16rem)] mt-32">
          <div className="px-6">
            {/* Conditional rendering for email view */}
            {currentView === "email" ? (
              <div className="email-view">
                <EmailTemplate leads={filteredLeads} />
              </div>
            ) : (
              <div className="overflow-auto mt-32">
                <LeadTable
                  leads={filteredLeads}
                  selectedLeads={selectedLeads}
                  onSelectLeads={handleSelectLeads}
                  onViewChange={handleViewChange}
                  onSuccessMessage={showSuccessMessage}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
