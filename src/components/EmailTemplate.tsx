import React, { useState } from 'react';
import { Modal } from './Modal';
import { Lead } from '../types';

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
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [templates, setTemplates] = useState<Template[]>(() => {
    const saved = localStorage.getItem('email-templates');
    return saved ? JSON.parse(saved) : [];
  });
  const [selectedLeads, setSelectedLeads] = useState<Lead[]>([]);

  const [newTemplate, setNewTemplate] = useState({
    name: '',
    subject: '',
    content: '',
  });

  const saveTemplate = () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content) return;

    const template: Template = {
      id: crypto.randomUUID(),
      ...newTemplate,
    };

    const updatedTemplates = [...templates, template];
    setTemplates(updatedTemplates);
    localStorage.setItem('email-templates', JSON.stringify(updatedTemplates));
    setShowNewTemplate(false);
    setNewTemplate({ name: '', subject: '', content: '' });
  };

  const sendEmail = (template: Template) => {
    // In a real app, this would send the email through your backend
    console.log('Sending email:', {
      template,
      recipients: selectedLeads.map(lead => lead.email),
    });
    alert('Email sent successfully!');
    setSelectedTemplate(null);
    setSelectedLeads([]);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-semibold text-gray-900">Email Templates</h2>
        <button
          onClick={() => setShowNewTemplate(true)}
          className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
        >
          Create Template
        </button>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {templates.map((template) => (
          <div
            key={template.id}
            className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-indigo-300 transition-colors"
          >
            <div className="flex justify-between items-start">
              <div>
                <h3 className="font-medium text-gray-900">{template.name}</h3>
                <p className="text-sm text-gray-500 mt-1">{template.subject}</p>
              </div>
              <button
                onClick={() => setSelectedTemplate(template)}
                className="px-3 py-1 text-sm text-indigo-600 hover:text-indigo-800"
              >
                Use Template
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* New Template Modal */}
      <Modal
        isOpen={showNewTemplate}
        onClose={() => setShowNewTemplate(false)}
        title="Create Email Template"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Template Name</label>
            <input
              type="text"
              value={newTemplate.name}
              onChange={(e) => setNewTemplate({ ...newTemplate, name: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Subject</label>
            <input
              type="text"
              value={newTemplate.subject}
              onChange={(e) => setNewTemplate({ ...newTemplate, subject: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Content</label>
            <textarea
              rows={6}
              value={newTemplate.content}
              onChange={(e) => setNewTemplate({ ...newTemplate, content: e.target.value })}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              placeholder="Use {{name}}, {{company}}, etc. for dynamic content"
            />
          </div>
          <div className="flex justify-end space-x-3">
            <button
              onClick={() => setShowNewTemplate(false)}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              onClick={saveTemplate}
              className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
            >
              Save Template
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
              <label className="block text-sm font-medium text-gray-700">Recipients</label>
              <select
                multiple
                value={selectedLeads.map(l => l.id.toString())}
                onChange={(e) => {
                  const selectedOptions = Array.from(e.target.selectedOptions);
                  const selectedIds = selectedOptions.map(opt => parseInt(opt.value));
                  setSelectedLeads(leads.filter(lead => selectedIds.includes(lead.id)));
                }}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              >
                {leads.map((lead) => (
                  <option key={lead.id} value={lead.id}>
                    {lead.name} ({lead.email})
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Subject</label>
              <input
                type="text"
                value={selectedTemplate.subject}
                readOnly
                className="mt-1 block w-full rounded-md border-gray-300 bg-gray-50"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Content</label>
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
                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Send Email
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};