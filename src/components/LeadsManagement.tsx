import React, { useState } from "react";
import { useLeads } from "./LeadsProvider";
import { LeadTable } from "./LeadTable";
import { FilterBuilder } from "./FilterBuilder";
import { Sidebar } from "./Sidebar";
import { Users, Search } from "lucide-react";
import { EmailTemplate } from "./EmailTemplate";
import { GridView } from "./GridView";
import { CalendarView } from "./CalendarView";
import { AnalyticsView } from "./AnalyticsView";

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
  } = useLeads();

  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [currentView, setCurrentView] = useState("all");

  const renderView = () => {
    switch (currentView) {
      case "email":
        return <EmailTemplate leads={filteredLeads} />;
      case "grid":
        return <GridView leads={filteredLeads} />;
      case "calendar":
        return <CalendarView leads={filteredLeads} />;
      case "analytics":
        return <AnalyticsView leads={filteredLeads} />;
      case "all":
      default:
        return (
          <>
            <div className="mb-8 flex justify-between">
              <FilterBuilder
                filters={filters}
                onAddFilter={addFilter}
                onRemoveFilter={removeFilter}
                onFilterChange={updateFilter}
                selectedLeads={selectedLeads}
                onImportCSV={handleImportCSV}
                setFilters={setFilters}
              />
            </div>

            <LeadTable
              leads={filteredLeads}
              selectedLeads={selectedLeads}
              onSelectLeads={setSelectedLeads}
            />
          </>
        );
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex">
      <Sidebar
        leads={filteredLeads}
        currentView={currentView}
        onViewChange={setCurrentView}
        savedFilters={savedFilters}
        onApplyFilter={onApplyFilter}
        onDeleteFilter={onDeleteFilter}
      />

      <div className="flex-1 pl-64">
        <div className="container mx-auto px-4 py-8 pt-20">
          {/* Header Section */}
          <div className="flex items-center justify-between mb-8 bg-gray-100 sticky top-0 py-4 z-10">
            <div className="flex items-center">
              <Users className="w-8 h-8 text-green-600 mr-3" />
              <h1 className="text-2xl font-bold text-gray-900">
                {currentView === "email"
                  ? "Email Templates"
                  : "Leads Management"}
              </h1>
            </div>
            {currentView === "all" && (
              <div className="flex items-center gap-4">
                <div className="text-sm text-gray-500">
                  {filteredLeads.length} leads found
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

          {renderView()}
        </div>
      </div>
    </div>
  );
};
