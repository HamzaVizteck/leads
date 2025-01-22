import React, { useState } from "react";
import { Modal } from "./Modal";
import { Lead } from "../types";

type Template = {
  id: string;
  name: string;
  subject: string;
  content: string;
};

type Props = {
  isOpen: boolean;
  onClose: () => void;
  template: Template | null;
  leads: Lead[];
  onSendEmail: (template: Template, recipients: string[]) => void;
};

export const SendEmailModal: React.FC<Props> = ({
  isOpen,
  onClose,
  template,
  leads,
  onSendEmail,
}) => {
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);

  const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.checked) {
      setSelectedLeads(leads);
    } else {
      setSelectedLeads([]);
    }
  };

  const handleSelectLead = (lead: Lead) => {
    if (selectedLeads.find((l) => l.id === lead.id)) {
      setSelectedLeads(selectedLeads.filter((l) => l.id !== lead.id));
    } else {
      setSelectedLeads([...selectedLeads, lead]);
    }
  };

  const handleSend = () => {
    if (template) {
      const recipients = selectedLeads.map((lead) => lead.email);
      onSendEmail(template, recipients);
      setSelectedLeads([]);
      onClose();
    }
  };

  if (!template) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Send Email">
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Recipients
          </label>
          <div className="border rounded-md max-h-60 overflow-y-auto">
            <div className="p-2 border-b bg-gray-50">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={selectedLeads.length === leads.length}
                  onChange={handleSelectAll}
                  className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                />
                <span className="text-sm font-medium">Select All</span>
              </label>
            </div>
            <div className="p-2 space-y-2">
              {leads.map((lead) => (
                <label
                  key={lead.id}
                  className="flex items-center space-x-2 hover:bg-gray-50 p-1 rounded"
                >
                  <input
                    type="checkbox"
                    checked={selectedLeads.some((l) => l.id === lead.id)}
                    onChange={() => handleSelectLead(lead)}
                    className="h-4 w-4 text-green-600 focus:ring-green-500 border-gray-300 rounded"
                  />
                  <span className="text-sm">
                    {lead.name} ({lead.email})
                  </span>
                </label>
              ))}
            </div>
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Subject
          </label>
          <input
            type="text"
            value={template.subject}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700">
            Content
          </label>
          <textarea
            rows={6}
            value={template.content}
            readOnly
            className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
          />
        </div>
        <div className="flex justify-end space-x-3">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            onClick={handleSend}
            disabled={selectedLeads.length === 0}
            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send Email ({selectedLeads.length} recipients)
          </button>
        </div>
      </div>
    </Modal>
  );
};
