import React, { useState, useMemo, useEffect, useCallback } from "react";
import { Lead } from "../types";
import {
  TableIcon,
  Edit2,
  Download,
  Trash2,
  Mail,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";
import { Modal } from "./Modal";
import { useLeads } from "./LeadsProvider";
import { ConfirmationModal } from "./ConfirmationModal";
import {
  collection,
  getDocs,
  Timestamp,
  query,
  doc,
  getDoc,
} from "firebase/firestore"; // Import Firestore functions and Timestamp
import { useAuth } from "../context/AuthContext"; // Import your authentication context
import { db } from "../config/firebaseConfig"; // Import your Firestore config
import Papa from "papaparse"; // Import PapaParse for CSV parsing
import Loader from "./Loader";

export interface LeadTableProps {
  leads: Lead[];
  selectedLeads: string[];
  onSelectLeads: (ids: string[]) => void;
  onViewChange: (view: string) => void;
  onSuccessMessage: (message: string) => void;
}

interface CSVRow {
  [key: string]: string | number | null;
}

export const LeadTable: React.FC<LeadTableProps> = ({
  leads,
  selectedLeads,
  onSelectLeads,
  onViewChange,
}) => {
  const { updateLead, deleteLeads, updateLeads, setLeads } = useLeads();
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  const [hasEdits, setHasEdits] = useState(false);
  const [deletingLeadId, setDeletingLeadId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const { currentUser } = useAuth(); // Get the current user from context

  const fetchLeadsFromFirebase = useCallback(async () => {
    const userLeads: Lead[] = [];
    const tempLeads: Lead[] = [];

    // Fetch user-specific leads from the user's document
    const userDocRef = doc(db, "users", currentUser.uid);
    const userDoc = await getDoc(userDocRef);
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (userData.csvFile && userData.csvFile.url) {
        // Fetch the CSV from the URL
        const response = await fetch(userData.csvFile.url);
        const csvText = await response.text();

        // Parse the CSV data
        Papa.parse(csvText, {
          header: true,
          dynamicTyping: true,
          complete: (results) => {
            const parsedLeads = (results.data as CSVRow[])
              .filter((row) =>
                Object.values(row).some((val) => val !== null && val !== "")
              )
              .map((row, index) => {
                const processedRow: Partial<Lead> = {
                  id: Date.now() + index,
                };

                Object.entries(row).forEach(([key, value]) => {
                  if (value != null) {
                    const cleanKey = key
                      .trim()
                      .replace(/\s+/g, "_")
                      .toLowerCase();
                    processedRow[cleanKey as keyof Lead] = value;
                  }
                });

                return processedRow as Lead;
              });
            userLeads.push(...parsedLeads);
          },
        });
      }
    }

    // Fetch tempLeads if no user-specific leads are found
    if (userLeads.length === 0) {
      const tempLeadsQuery = query(collection(db, "tempLeads"));
      const tempLeadsSnapshot = await getDocs(tempLeadsQuery);
      tempLeadsSnapshot.forEach((doc) => {
        const data = doc.data();
        const lead: Lead = {
          ...data,
          id: parseInt(doc.id),
        };
        tempLeads.push(lead);
      });
    }

    return userLeads.length > 0 ? userLeads : tempLeads; // Return user leads or temp leads
  }, [currentUser]);

  useEffect(() => {
    const loadLeads = async () => {
      setLoading(true);
      try {
        const fetchedLeads = await fetchLeadsFromFirebase();
        updateLeads(fetchedLeads); // Update state with fetched leads
      } catch (error) {
        console.error("Error fetching leads:", error);
      } finally {
        setLoading(false);
      }
    };
    loadLeads();
  }, [fetchLeadsFromFirebase, updateLeads]);

  useEffect(() => {
    // Set loading to false when leads are updated
    setLoading(false);
  }, [leads]);

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
  const [recordsPerPage, setRecordsPerPage] = useState(10);
  const indexOfLastLead = currentPage * recordsPerPage;
  const indexOfFirstLead = indexOfLastLead - recordsPerPage;
  const currentLeads = leads.slice(indexOfFirstLead, indexOfLastLead);
  const totalPages = Math.ceil(leads.length / recordsPerPage);

  const handleSelectResultsPerPage = (
    e: React.ChangeEvent<HTMLSelectElement>
  ) => {
    setRecordsPerPage(Number(e.target.value)); // Update records per page
    setCurrentPage(1); // Reset to first page when results per page change
  };

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    e.stopPropagation();
    if (e.target.checked) {
      // Select all leads on the current page
      const currentPageLeadIds = currentLeads.map((lead) => lead.id.toString());
      onSelectLeads(currentPageLeadIds);
    } else {
      // Deselect all leads
      onSelectLeads([]);
    }
  };

  const handleSelectLead = (
    e: React.ChangeEvent<HTMLInputElement>,
    leadId: string
  ) => {
    e.stopPropagation();
    const id = leadId.toString();

    if (e.target.checked) {
      // Add the lead to selected leads
      onSelectLeads([...selectedLeads, id]);
    } else {
      // Remove the lead from selected leads
      onSelectLeads(selectedLeads.filter((selectedId) => selectedId !== id));
    }
  };

  const handleEditClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    // Ensure lastContact is a Date object when setting editingLead
    const leadToEdit = {
      ...lead,
      lastContact:
        lead.lastContact instanceof Timestamp
          ? lead.lastContact.toDate()
          : lead.lastContact,
    };
    setEditingLead(leadToEdit);
  };

  const handleUpdateLead = async () => {
    if (editingLead) {
      setIsSaving(true);
      try {
        // Create a new object with the updated values without lastContact
        const updatedLead = {
          ...editingLead, // Keep all other fields
          // lastContact is not included
        };

        // Log the updated lead to the console
        console.log("Updated Lead:", updatedLead);

        // Update the lead
        await updateLead(updatedLead as Lead); // Ensure updatedLead is of type Lead

        // Update the local state
        const updatedLeads = leads.map((lead) =>
          lead.id === updatedLead.id ? updatedLead : lead
        );

        // Update both states
        setLeads(updatedLeads);
        updateLeads(updatedLeads);

        setEditingLead(null);
        showSuccessMessage("Changes saved successfully!");
        setHasEdits(true); // Mark that we have edits
      } catch (error) {
        console.error("Error saving changes:", error);
      } finally {
        setIsSaving(false);
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
    setTimeout(() => setSuccessMessage(null), 5000); // Clear the message after 5 seconds
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

  // Example of converting a Firestore timestamp to a readable date
  const formatTimestamp = (timestamp: {
    seconds: number;
    nanoseconds: number;
  }) => {
    const date = new Date(timestamp.seconds * 1000); // Convert seconds to milliseconds
    return date.toLocaleString(); // Format the date as needed
  };

  // Render loader or table based on loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader />
        <p>Loading...</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow-md">
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <TableIcon className="w-12 h-12 mb-2" />
          <p>No leads found for the criteria.</p>
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
                        currentLeads.length > 0 &&
                        currentLeads.every((lead) =>
                          selectedLeads.includes(lead.id.toString())
                        )
                      }
                      onChange={handleSelectAll}
                      className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
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
                        className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded cursor-pointer"
                      />
                    </td>
                    {tableHeaders.map((header) => (
                      <td
                        key={header.key}
                        className="px-6 py-4 whitespace-nowrap text-sm min-w-0 truncate"
                      >
                        {header.key === "lastContact"
                          ? formatTimestamp(
                              lead[header.key] as {
                                seconds: number;
                                nanoseconds: number;
                              }
                            )
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
          <div className="flex justify-start ml-4 items-center border-2 w-full">
            {/* Results per page selector */}
            <div className="flex items-center">
              <label className="text-sm p-2 font-medium text-gray-700 dark:text-gray-400 mr-2">
                Show
              </label>
              <select
                value={recordsPerPage}
                onChange={handleSelectResultsPerPage}
                className="px-3 py-2 text-sm text-gray-900 bg-white border border-gray-300 rounded-md focus:ring-green-500 focus:border-green-500 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:focus:ring-green-500 dark:focus:border-green-500"
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={25}>25</option>
                <option value={50}>50</option>
                <option value={100}>100</option>
              </select>
              <span className="text-sm font-medium mr-3 text-gray-700 dark:text-gray-400 ml-2">
                results
              </span>
            </div>

            {/* Help text */}
            <span className="text-sm text-gray-700 dark:text-gray-400">
              Showing{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {indexOfFirstLead + 1}
              </span>{" "}
              to{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {Math.min(indexOfLastLead, leads.length)}
              </span>{" "}
              of{" "}
              <span className="font-semibold text-gray-900 dark:text-white">
                {leads.length}
              </span>{" "}
              Entries
            </span>

            {/* Pagination buttons */}
            <div className="inline-flex mt-2 xs:mt-0">
              <button
                onClick={handlePreviousPage}
                disabled={currentPage === 1}
                className={`flex items-center ml-3 mr-3 mb-2 justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 rounded-s hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                  currentPage === 1 ? "cursor-not-allowed bg-gray-300" : ""
                }`}
              >
                <ArrowLeft size={16} />
              </button>
              <button
                onClick={handleNextPage}
                disabled={currentPage === totalPages}
                className={`flex items-center ml-3 mr-3 mb-2 justify-center px-3 h-8 text-sm font-medium text-white bg-gray-800 border-0 border-s border-gray-700 rounded-e hover:bg-gray-900 dark:bg-gray-800 dark:border-gray-700 dark:text-gray-400 dark:hover:bg-gray-700 dark:hover:text-white ${
                  currentPage === totalPages
                    ? "cursor-not-allowed bg-gray-300"
                    : ""
                }`}
              >
                <ArrowRight size={16} />
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
            <div className="max-h-[600px] overflow-y-auto">
              {tableHeaders.map((header) => (
                <div key={header.key} className="mt-4">
                  <label
                    htmlFor={`edit-${header.key}`}
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    {header.label}
                  </label>
                  {header.key === "lastContact" ? (
                    <input
                      type="date"
                      id={`edit-${header.key}`}
                      name={`edit-${header.key}`}
                      value={
                        editingLead.lastContact
                          ? new Date(editingLead.lastContact)
                              .toISOString()
                              .split("T")[0]
                          : ""
                      }
                      onChange={(e) =>
                        setEditingLead({
                          ...editingLead,
                          lastContact: new Date(e.target.value),
                        })
                      }
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    />
                  ) : (
                    <input
                      type={
                        typeof editingLead[header.key as keyof Lead] ===
                        "number"
                          ? "number"
                          : "text"
                      }
                      id={`edit-${header.key}`}
                      name={`edit-${header.key}`}
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
                      className="mt-1 block w-full px-3 py-2 bg-white border-2 border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 text-gray-900"
                    />
                  )}
                </div>
              ))}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border-2 border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLead}
                disabled={isSaving}
                className={`px-4 py-2 text-sm font-medium text-white rounded-md ${
                  isSaving
                    ? "bg-green-400 cursor-not-allowed"
                    : "bg-green-600 hover:bg-green-700"
                } focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500`}
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
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
