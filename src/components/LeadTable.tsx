import React, { useState } from "react";
import { Lead } from "../types";
import { TableIcon } from "lucide-react";

type Props = {
  leads: Lead[];
  onSelectionChange: (selectedIds: string[]) => void;
};

export const LeadTable: React.FC<Props> = ({ leads, onSelectionChange }) => {
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSelected = e.target.checked
      ? leads.map((lead) => lead.id.toString())
      : [];
    setSelectedLeads(newSelected);
    onSelectionChange(newSelected);
  };

  const handleSelectOne = (id: number) => {
    const idString = id.toString();
    const newSelected = selectedLeads.includes(idString)
      ? selectedLeads.filter((leadId) => leadId !== idString)
      : [...selectedLeads, idString];
    setSelectedLeads(newSelected);
    onSelectionChange(newSelected);
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
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {leads.map((lead) => (
              <tr key={lead.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <input
                    type="checkbox"
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                    checked={selectedLeads.includes(lead.id.toString())}
                    onChange={() => handleSelectOne(lead.id)}
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
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
};
