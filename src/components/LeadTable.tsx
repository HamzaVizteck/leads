import React, { useState, useMemo } from "react";
import { Lead } from "../types";
import { TableIcon, Edit2, Download, Trash2, Mail } from "lucide-react";
import { Modal } from "./Modal";
import { useLeads } from "./LeadsProvider";
import { ConfirmationModal } from "./ConfirmationModal";

interface Props {
  leads: Lead[];
  selectedLeads: string[];
  onSelectLeads: (selectedIds: string[]) => void;
  onViewChange: (view: string) => void; // Add this line to accept the onViewChange prop
}

export const LeadTable: React.FC<Props> = ({
  leads,
  selectedLeads,
  onSelectLeads,
  onViewChange,
}) => {
  const { updateLead, deleteLeads } = useLeads();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [hasEdits, setHasEdits] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const recordsPerPage = 10;

  // Dynamic table headers based on lead data
  const tableHeaders = useMemo(() => {
    if (leads.length === 0) return [];
    const sampleLead = leads[0];
    return Object.keys(sampleLead)
      .filter((key) => key !== "id") // Exclude id from visible columns
      .map((key) => ({
        key,
        label:
          key.charAt(0).toUpperCase() + key.slice(1).replace(/([A-Z])/g, " $1"),
        visible: true,
      }));
  }, [leads]);

  // Calculate pagination
  const indexOfLastLead = currentPage * recordsPerPage;
  const indexOfFirstLead = indexOfLastLead - recordsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / recordsPerPage);
  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      onSelectLeads(leads.map((lead) => lead.id.toString()));
    } else {
      onSelectLeads([]);
    }
  };

  const handleSelectLead = (
    e: React.MouseEvent | React.ChangeEvent,
    leadId: string
  ) => {
    e.stopPropagation();
    if (selectedLeads.includes(leadId)) {
      onSelectLeads(selectedLeads.filter((id) => id !== leadId));
    } else {
      onSelectLeads([...selectedLeads, leadId]);
    }
  };

  const handleEditClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setEditingLead(lead);
  };

  const handleUpdateLead = async () => {
    if (editingLead) {
      setIsSaving(true); // Start saving
      try {
        await updateLead(editingLead); // Assuming `updateLead` is an async function
        setEditingLead(null); // Close the modal
        showSuccessMessage("Changes saved successfully!"); // Show success message
      } catch (error) {
        console.error("Error saving changes:", error); // Handle error (optional)
      } finally {
        setIsSaving(false); // Stop saving
      }
    }
  };

  const handleRowClick = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleExport = () => {
    const dataToExport = hasEdits
      ? leads
      : leads.filter((lead) => selectedLeads.includes(lead.id.toString()));

    const headers = tableHeaders
      .filter((header) => header.visible)
      .map((header) => header.key);

    const csvContent = [
      headers.join(","),
      ...dataToExport.map((lead) =>
        headers
          .map((header) => {
            const value = lead[header as keyof Lead];
            if (value instanceof Date) {
              return new Date(value).toLocaleDateString();
            }
            if (typeof value === "number") {
              return `"$${value.toLocaleString()}"`;
            }
            const stringValue = String(value);
            return stringValue.includes(",")
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute(
      "download",
      `leads_export_${new Date().toISOString().split("T")[0]}.csv`
    );
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    setHasEdits(false);
    onSelectLeads([]);
  };
  const showSuccessMessage = (message: string) => {
    setSuccessMessage(message);
    setTimeout(() => setSuccessMessage(null), 5000); // Clear the message after 3 seconds
  };

  const handleDeleteClick = (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation(); // Prevent event bubbling
    setDeletingLeadId(leadId); // Open the confirmation modal
  };

  const handleConfirmDelete = () => {
    if (deletingLeadId) {
      deleteLeads([deletingLeadId]); // Trigger deletion logic
      setDeletingLeadId(null); // Close the confirmation modal
      showSuccessMessage("Lead deleted successfully"); // Show success message
    }
  };

  const handleNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };
  const handleSendEmail = () => {
    // Switch view to "email" (Email Templates view)
    onViewChange("email"); // This will change the view to "Email Templates"
  };
  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <TableIcon className="w-12 h-12 mb-2" />
          <p>No leads found matching your criteria</p>
        </div>
      ) : (
        <>
          {/* Fixed Export Button */}
          <div className="p-4 border-b flex justify-start items-center sticky top-0 bg-white">
            <button
              onClick={handleSendEmail}
              disabled={selectedLeads.length === 0}
              className={`flex items-center px-4 py-2 mr-2 text-sm font-medium bg-blue-600
                   text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2  focus:ring-blue-500
                   ${
                     selectedLeads.length === 0
                       ? "bg-gray-400 cursor-not-allowed"
                       : "bg-blue-600 hover:bg-blue-700"
                   }`}
            >
              <Mail className="w-4 h-4 mr-2" />
              Send Email ({selectedLeads.length})
            </button>

            <button
              onClick={handleExport}
              disabled={selectedLeads.length === 0 && !hasEdits}
              className={`flex items-center px-4 py-2 text-sm font-medium text-white rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 ${
                selectedLeads.length === 0 && !hasEdits
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-green-600 hover:bg-green-700"
              }`}
            >
              <Download className="w-4 h-4 mr-2" />
              {hasEdits
                ? "Export saved edits"
                : `Export Selected (${selectedLeads.length})`}
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 table-auto table-layout-fixed">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left w-12">
                    <input
                      type="checkbox"
                      checked={
                        selectedLeads.length === leads.length &&
                        leads.length > 0
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </th>
                  {tableHeaders.map((header) => (
                    <th
                      key={header.key}
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-auto min-w-0 truncate"
                    >
                      {header.label}
                    </th>
                  ))}
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-32"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {currentLeads.map((lead) => (
                  <tr
                    key={lead.id}
                    className="hover:bg-gray-50 cursor-pointer"
                    onClick={() => handleRowClick(lead)}
                  >
                    <td
                      className="px-6 py-4 whitespace-nowrap w-12"
                      onClick={(e) => e.stopPropagation()}
                    >
                      <input
                        type="checkbox"
                        checked={selectedLeads.includes(lead.id.toString())}
                        onChange={(e) =>
                          handleSelectLead(e, lead.id.toString())
                        }
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                      />
                    </td>
                    {tableHeaders.map((header) => (
                      <td
                        key={header.key}
                        className="px-6 py-4 whitespace-nowrap text-sm min-w-0 truncate"
                      >
                        {header.key === "lastContact"
                          ? new Date(
                              lead[header.key] as Date
                            ).toLocaleDateString()
                          : header.key === "value"
                          ? `$${(lead[header.key] as number).toLocaleString()}`
                          : String(lead[header.key as keyof Lead])}
                      </td>
                    ))}
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 w-32">
                      <div className="flex items-center space-x-3">
                        <button
                          onClick={(e) => handleEditClick(e, lead)}
                          className="text-blue-600 hover:text-blue-900"
                          title="Edit lead"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={(e) =>
                            handleDeleteClick(e, lead.id.toString())
                          }
                          className="text-red-600 hover:text-red-900"
                          title="Delete lead"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-center items-center m-4">
            <span className="text-sm text-gray-700 p-4">
              Showing {indexOfFirstLead + 1} to{" "}
              {Math.min(indexOfLastLead, leads.length)} of {leads.length}{" "}
              results
            </span>
            <div className="flex items-center space-x-2">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`px-3 py-1 rounded-md ${
                  currentPage === 1
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                &lt;
              </button>
              {Array.from({ length: totalPages }, (_, index) => index + 1)
                .filter((page) => {
                  const showFirstPages = page <= 9;
                  const showLastPage = page === totalPages;
                  const showAroundCurrent = Math.abs(currentPage - page) <= 2;
                  return showFirstPages || showLastPage || showAroundCurrent;
                })
                .map((page, idx, arr) => {
                  const isEllipsis = idx > 0 && arr[idx] > arr[idx - 1] + 1;
                  return isEllipsis ? (
                    <span key={`ellipsis-${idx}`} className="px-2">
                      ...
                    </span>
                  ) : (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`px-3 py-1 rounded-md ${
                        currentPage === page
                          ? "bg-green-600 text-white"
                          : "bg-gray-200 hover:bg-gray-300"
                      }`}
                    >
                      {page}
                    </button>
                  );
                })}
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`px-3 py-1 rounded-md ${
                  currentPage === totalPages
                    ? "bg-gray-300 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700 text-white"
                }`}
              >
                &gt;
              </button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
      >
        {editingLead && (
          <div className="space-y-6">
            {" "}
            {/* Increased space between fields */}
            <div className="max-h-[600px] overflow-y-auto">
              {" "}
              {/* Scrollable container */}
              {tableHeaders.map((header) => (
                <div key={header.key} className="mt-2">
                  {" "}
                  {/* Added margin-top to each field */}
                  <label className="block text-sm font-medium text-gray-700">
                    {header.label}
                  </label>
                  {header.key === "lastContact" ? (
                    <input
                      type="date"
                      value={
                        new Date(editingLead[header.key] as Date)
                          .toISOString()
                          .split("T")[0]
                      }
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          [header.key]: new Date(e.target.value),
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  ) : (
                    <input
                      type={
                        typeof editingLead[header.key as keyof Lead] ===
                        "number"
                          ? "number"
                          : "text"
                      }
                      value={editingLead[header.key as keyof Lead]}
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          [header.key]:
                            typeof editingLead[header.key as keyof Lead] ===
                            "number"
                              ? parseFloat(e.target.value) || 0
                              : e.target.value,
                        })
                      }
                      className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLead}
                disabled={isSaving} // Disable button while saving
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isSaving
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                }`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
              {successMessage && (
                <div
                  className="fixed top-4 right-4 z-40 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow"
                  role="alert"
                >
                  {successMessage}
                </div>
              )}
            </div>
          </div>
        )}
      </Modal>

      <ConfirmationModal
        isOpen={!!deletingLeadId}
        onClose={() => setDeletingLeadId(null)}
        onConfirm={handleConfirmDelete} // Only trigger the confirmed delete function here
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />

      {successMessage && (
        <div
          className="fixed top-4 right-4 z-40 bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded shadow"
          role="alert"
        >
          {successMessage}
        </div>
      )}
    </div>
  );
};
