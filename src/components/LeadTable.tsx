import React, { useState } from "react";
import { Lead } from "../types";
import { TableIcon, Edit2, Trash2 } from "lucide-react";
import { Modal } from "./Modal";

type Props = {
  leads: Lead[];
  onSelectionChange: (selectedIds: string[]) => void;
  onUpdateLead: (updatedLead: Lead) => void;
  onDeleteLead: (leadId: number) => void;
};

const STATUS_OPTIONS = ["New", "In Progress", "Closed"] as const;
type LeadStatus = (typeof STATUS_OPTIONS)[number];

export const LeadTable: React.FC<Props> = ({
  leads,
  onSelectionChange,
  onUpdateLead,
  onDeleteLead,
}) => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = e.target.checked
      ? leads.map((lead) => lead.id.toString())
      : [];
    setSelectedLeads(newSelected);
    onSelectionChange(newSelected);
  };

  const handleSelectOne = (e: React.MouseEvent, id: number) => {
    // Stop propagation to prevent row click when checking checkbox
    e.stopPropagation();
    const idString = id.toString();
    const newSelected = selectedLeads.includes(idString)
      ? selectedLeads.filter((leadId) => leadId !== idString)
      : [...selectedLeads, idString];
    setSelectedLeads(newSelected);
    onSelectionChange(newSelected);
  };

  const handleEditClick = (e: React.MouseEvent, lead: Lead) => {
    e.stopPropagation();
    setEditingLead(lead);
  };

  const handleDeleteClick = (e: React.MouseEvent, leadId: number) => {
    e.stopPropagation();
    if (window.confirm("Are you sure you want to delete this lead?")) {
      onDeleteLead(leadId);
    }
  };

  const handleUpdateLead = () => {
    if (editingLead) {
      onUpdateLead(editingLead);
      setEditingLead(null);
    }
  };

  const handleRowClick = (lead: Lead) => {
    setEditingLead(lead);
  };

  return (
    <div className="overflow-x-auto bg-white rounded-lg shadow">
      {leads.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-8 text-gray-500">
          <TableIcon className="w-12 h-12 mb-2" />
          <p>No leads found matching your criteria</p>
        </div>
      ) : (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider w-12">
                <input
                  type="checkbox"
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  checked={selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                />
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Name
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Company
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Value
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Last Contact
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr
                key={lead.id}
                className="hover:bg-gray-50 cursor-pointer"
                onClick={() => handleRowClick(lead)}
              >
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={selectedLeads.includes(lead.id.toString())}
                    onChange={(e) => e.stopPropagation()}
                    onClick={(e) => handleSelectOne(e, lead.id)}
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
                        ? "bg-blue-200 text-blue-800"
                        : lead.status === "In Progress"
                        ? "bg-yellow-100 text-yellow-800"
                        : "bg-green-200 text-green-600"
                    }`}
                  >
                    {lead.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  ${lead.value.toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(lead.lastContact).toLocaleDateString()}
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
                      onClick={(e) => handleDeleteClick(e, lead.id)}
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
                onChange={(e) =>
                  setEditingLead({ ...editingLead, email: e.target.value })
                }
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
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
            <div className="flex justify-end space-x-3 pt-4">
              <button
                onClick={() => setEditingLead(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateLead}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Save Changes
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
