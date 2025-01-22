import React, { useState } from "react";
import { Lead } from "../types";
import { TableIcon, Edit2, Download, Trash2 } from "lucide-react";
import { Modal } from "./Modal";
import { useLeads } from "./LeadsProvider";
import { ConfirmationModal } from "./ConfirmationModal";

interface Props {
  leads: Lead[];
  selectedLeads: string[];
  onSelectLeads: (selectedIds: string[]) => void;
}

const STATUS_OPTIONS = ["New", "In Progress", "Closed"] as const;
type LeadStatus = (typeof STATUS_OPTIONS)[number];

export const LeadTable: React.FC<Props> = ({
  leads,
  selectedLeads,
  onSelectLeads,
}) => {
  const { updateLead, deleteLeads } = useLeads();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [hasEdits, setHasEdits] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const recordsPerPage = 10;

  // Calculate the index of the last lead on the current page
  const indexOfLastLead = currentPage * recordsPerPage;
  // Calculate the index of the first lead on the current page
  const indexOfFirstLead = indexOfLastLead - recordsPerPage;
  // Get the current leads to display
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);

  // Calculate total pages
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
    const selectedLead = leads.find((lead) => lead.id.toString() === leadId);
    if (selectedLead) {
      console.log(
        "Selected Lead Date:",
        new Date(selectedLead.lastContact).toString()
      );
    }

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

  const handleUpdateLead = () => {
    if (editingLead) {
      updateLead(editingLead);
      setHasEdits(true);
      setEditingLead(null);
    }
  };

  const handleRowClick = (lead: Lead) => {
    setEditingLead(lead);
  };

  const handleExport = () => {
    // If there are edits, export all leads, otherwise export only selected leads
    const dataToExport = hasEdits
      ? leads
      : leads.filter((lead) => selectedLeads.includes(lead.id.toString()));

    // Convert to CSV
    const headers = [
      "name",
      "email",
      "company",
      "industry",
      "status",
      "value",
      "lastContact",
    ];
    const csvContent = [
      headers.join(","),
      ...dataToExport.map((lead) =>
        headers
          .map((header) => {
            const value = lead[header as keyof Lead];
            // Handle special cases like dates and numbers
            if (header === "lastContact") {
              return new Date(value as string).toLocaleDateString();
            }
            if (header === "value") {
              return `"$${(value as number).toLocaleString()}"`;
            }
            // Escape quotes and wrap in quotes if contains comma
            const stringValue = String(value);
            return stringValue.includes(",")
              ? `"${stringValue.replace(/"/g, '""')}"`
              : stringValue;
          })
          .join(",")
      ),
    ].join("\n");

    // Create and trigger download
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

    // Reset states after export
    setHasEdits(false);
    onSelectLeads([]);
  };

  const handleDeleteClick = (e: React.MouseEvent, leadId: string) => {
    e.stopPropagation();
    setDeletingLeadId(leadId);
  };

  const handleConfirmDelete = () => {
    if (deletingLeadId) {
      deleteLeads([deletingLeadId]);
      setDeletingLeadId(null);
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

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <TableIcon className="w-12 h-12 mb-2" />
          <p>No leads found matching your criteria</p>
        </div>
      ) : (
        <>
          <div className="p-4 border-b flex justify-end">
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
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left">
                  <input
                    type="checkbox"
                    checked={
                      selectedLeads.length === leads.length && leads.length > 0
                    }
                    onChange={handleSelectAll}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Name
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Company
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Status
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Value
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                >
                  Last Contact
                </th>
                <th
                  scope="col"
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
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
                    className="px-6 py-4 whitespace-nowrap"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <input
                      type="checkbox"
                      checked={selectedLeads.includes(lead.id.toString())}
                      onChange={(e) => handleSelectLead(e, lead.id.toString())}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    />
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex flex-col">
                      <div className="text-sm font-medium text-gray-900">
                        {lead.name}
                      </div>
                      <div className="text-sm text-gray-500">{lead.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{lead.company}</div>
                    <div className="text-sm text-gray-500">{lead.industry}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full 
                      ${
                        lead.status === "New"
                          ? "bg-blue-100 text-blue-800"
                          : lead.status === "In Progress"
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {lead.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    ${lead.value.toLocaleString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(lead.lastContact).toLocaleDateString("en-GB")}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
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

          {/* Pagination Controls */}

          <div className="flex justify-between items-center m-4">
            <span className="text-sm text-gray-700">
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
                  // Show first few pages, last page, and a few pages around the current one
                  const showFirstPages = page <= 9;
                  const showLastPage = page === totalPages;
                  const showAroundCurrent = Math.abs(currentPage - page) <= 2;

                  return showFirstPages || showLastPage || showAroundCurrent;
                })
                .map((page, idx, arr) => {
                  const isEllipsis = idx > 0 && arr[idx] > arr[idx - 1] + 1; // Check for skipped pages
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

      {/* Edit Lead Modal */}
      <Modal
        isOpen={!!editingLead}
        onClose={() => setEditingLead(null)}
        title="Edit Lead"
      >
        {editingLead && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Name
              </label>
              <input
                type="text"
                value={editingLead.name}
                onChange={(e) =>
                  setEditingLead({ ...editingLead, name: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                value={editingLead.email}
                readOnly
                className="mt-1 text-gray-600 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Company
              </label>
              <input
                type="text"
                value={editingLead.company}
                onChange={(e) =>
                  setEditingLead({ ...editingLead, company: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Status
              </label>
              <select
                value={editingLead.status}
                onChange={(e) =>
                  setEditingLead({
                    ...editingLead,
                    status: e.target.value as LeadStatus,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              >
                {STATUS_OPTIONS.map((status) => (
                  <option key={status} value={status}>
                    {status}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Value
              </label>
              <input
                type="number"
                value={editingLead.value}
                onChange={(e) =>
                  setEditingLead({
                    ...editingLead,
                    value: parseFloat(e.target.value) || 0,
                  })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              />
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
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 border border-transparent rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        isOpen={!!deletingLeadId}
        onClose={() => setDeletingLeadId(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Lead"
        message="Are you sure you want to delete this lead? This action cannot be undone."
      />
    </div>
  );
};
