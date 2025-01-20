import React, { useState } from "react";
import { Modal } from "./Modal";
import { Lead } from "../types";
import { X, Trash2, Edit } from "lucide-react";

type Template = {
  id: string;
  name: string;
  subject: string;
  content: string;
};

type Props = {
  leads: Lead[];
};

export const EmailTemplate: React.FC<Props> = ({ leads }) => {
  const [showNewTemplate, setShowNewTemplate] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [editingTemplate, setEditingTemplate] = useState<Template | null>(null);
  const [templateToDelete, setTemplateToDelete] = useState<Template | null>(
    null
  );
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem("email-templates");
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
  });

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

  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
  };

  const deleteTemplate = () => {
    if (!templateToDelete) return;

    const updatedTemplates = templates.filter(
      (t) => t.id !== templateToDelete.id
    );
    setTemplates(updatedTemplates);
    localStorage.setItem("email-templates", JSON.stringify(updatedTemplates));
    setSuccessMessage("Template deleted successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    setTemplateToDelete(null);
  };

  const startEditingTemplate = (template: Template) => {
    setEditingTemplate(template);
    setNewTemplate({
      name: template.name,
      subject: template.subject,
      content: template.content,
    });
    setShowNewTemplate(true);
  };

  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content)
      return;

    let updatedTemplates;
    if (editingTemplate) {
      // Update existing template
      updatedTemplates = templates.map((t) =>
        t.id === editingTemplate.id ? { ...editingTemplate, ...newTemplate } : t
      );
      setSuccessMessage("Template updated successfully!");
    } else {
      // Create new template
      const template: Template = {
        id: crypto.randomUUID(),
        ...newTemplate,
      };
      updatedTemplates = [...templates, template];
      setSuccessMessage("Template created successfully!");
    }

    setTemplates(updatedTemplates);
    localStorage.setItem("email-templates", JSON.stringify(updatedTemplates));
    setShowNewTemplate(false);
    setEditingTemplate(null);
    setNewTemplate({ name: "", subject: "", content: "" });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const sendEmail = (template: Template) => {
    console.log("Sending email:", {
      template,
      recipients: selectedLeads.map((lead) => lead.email),
    });
    setSuccessMessage("Email sent successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
    setSelectedTemplate(null);
    setSelectedLeads([]);
  };

  return (
    <div className="space-y-6">
      {showSuccess && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg"
          role="alert"
        >
          <span className="block sm:inline">{successMessage}</span>
          <button
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            onClick={() => setShowSuccess(false)}
          >
            <X className="p-2 h-4 w-4" />
          </button>
        </div>
      )}

      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
        <button
          onClick={() => {
            setEditingTemplate(null);
            setNewTemplate({ name: "", subject: "", content: "" });
            setShowNewTemplate(true);
          }}
          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
        >
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-green-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => startEditingTemplate(template)}
                  className="p-1 text-gray-500 hover:text-green-600 transition-colors"
                  title="Edit template"
                >
                  <Edit className="h-4 w-4" />
                </button>
                <button
                  onClick={() => handleDeleteClick(template)}
                  className="p-1 text-gray-500 hover:text-red-600 transition-colors"
                  title="Delete template"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
                <button
                  onClick={() => setSelectedTemplate(template)}
                  className="px-3 py-1 text-sm text-green-600 hover:text-green-800"
                >
                  Use Template
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* New/Edit Template Modal */}
      <Modal
        isOpen={showNewTemplate}
        onClose={() => {
          setShowNewTemplate(false);
          setEditingTemplate(null);
          setNewTemplate({ name: "", subject: "", content: "" });
        }}
        title={
          editingTemplate ? "Edit Email Template" : "Create Email Template"
        }
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Template Name
            </label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, name: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Subject
            </label>
            <input
              type="text"
              value={newTemplate.subject}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, subject: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">
              Content
            </label>
            <textarea
              rows={6}
              value={newTemplate.content}
              onChange={(e) =>
                setNewTemplate({ ...newTemplate, content: e.target.value })
              }
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500"
              placeholder="Use {{name}}, {{company}}, etc. for dynamic content"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => {
                setShowNewTemplate(false);
                setEditingTemplate(null);
                setNewTemplate({ name: "", subject: "", content: "" });
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
            >
              {editingTemplate ? "Update Template" : "Save Template"}
            </button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!templateToDelete}
        onClose={() => setTemplateToDelete(null)}
        title="Delete Template"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Are you sure you want to delete the template "
            {templateToDelete?.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setTemplateToDelete(null)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={deleteTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
            >
              Delete Template
            </button>
          </div>
        </div>
      </Modal>

      {/* Send Email Modal */}
      <Modal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        title="Send Email"
      >
        {selectedTemplate && (
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
                value={selectedTemplate.subject}
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
                value={selectedTemplate.content}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
              />
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setSelectedTemplate(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => sendEmail(selectedTemplate)}
                disabled={selectedLeads.length === 0}
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Email ({selectedLeads.length} recipients)
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};
