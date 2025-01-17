import { useState } from "react";
import { UsersIcon, Search } from "lucide-react";
import { useLeads } from "./LeadsProvider";
import { LeadTable } from "./LeadTable";
import { GridView } from "./GridView";
import { CalendarView } from "./CalendarView";
import { AnalyticsView } from "./AnalyticsView";
import { FilterBuilder } from "./FilterBuilder";
import { Sidebar } from "./Sidebar";
import { CSVImport } from "./CSVImport";
import { EmailTemplate } from "./EmailTemplate";

export const LeadsManagement = () => {
  const [currentView, setCurrentView] = useState<string>("all");
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const {
    leads,
    filters,
    savedFilters,
    activeFilterIds,
    searchQuery,
    setSearchQuery,
    filteredLeads,
    addFilter,
    removeFilter,
    updateFilter,
    saveAndActivateFilter,
    toggleSavedFilter,
    deleteSavedFilter,
    handleImportCSV,
    customFields,
    operators,
    deleteLeads,
  } = useLeads();

  const handleDeleteLeads = () => {
    if (selectedLeads.length === 0) return;

    if (
      window.confirm(
        `Are you sure you want to delete ${selectedLeads.length} lead${
          selectedLeads.length > 1 ? "s" : ""
        }?`
      )
    ) {
      deleteLeads(selectedLeads);
      setSelectedLeads([]);
    }
  };

  const renderView = () => {
    switch (currentView) {
      case "grid":
        return <GridView leads={filteredLeads} />;
      case "calendar":
        return <CalendarView leads={filteredLeads} />;
      case "analytics":
        return <AnalyticsView leads={filteredLeads} />;
      case "email":
        return <EmailTemplate leads={filteredLeads} />;
      default:
        return (
          <LeadTable
            leads={filteredLeads}
            onSelectionChange={setSelectedLeads}
          />
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      <Sidebar
        leads={leads}
        currentView={currentView}
        onViewChange={setCurrentView}
        savedFilters={savedFilters}
        onApplyFilter={toggleSavedFilter}
        onDeleteFilter={deleteSavedFilter}
      />

      <div className="pl-64 pt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center">
              <UsersIcon className="w-8 h-8 text-green-900 mr-3" />
              <h1 className="text-2xl font-bold text-green-900">
                Leads Management
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <div className="relative">
                <input
                  type="text"
                  placeholder="Search leads..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-64 pl-10 pr-4 py-2 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <Search className="w-5 h-5 text-gray-400 absolute left-3 top-2.5" />
              </div>
              <CSVImport onImport={handleImportCSV} />
              <div className="text-sm text-gray-500">
                {filteredLeads.length} leads found
              </div>
            </div>
          </div>

          {currentView !== "analytics" && currentView !== "email" && (
            <div className="bg-white rounded-lg shadow p-6 mb-8">
              <FilterBuilder
                filters={filters}
                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                onFilterChange={updateFilter}
                savedFilters={savedFilters}
                activeFilterIds={activeFilterIds}
                onApplyFilter={toggleSavedFilter}
                onDeleteFilter={deleteSavedFilter}
                selectedLeads={selectedLeads}
                saveAndActivateFilter={saveAndActivateFilter}
                customFields={customFields}
                operators={operators}
                onDeleteSelected={handleDeleteLeads}
              />
            </div>
          )}

          {renderView()}
        </div>
      </div>
    </div>
  );
};
