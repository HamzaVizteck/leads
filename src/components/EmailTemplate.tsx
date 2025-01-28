import React, { useState, useEffect } from "react";
import { Modal } from "./Modal";
import { Lead } from "../types";
import { X, Trash2, Edit } from "lucide-react";
import { SendEmailModal } from "./SendEmailModal";
import { db } from "../config/firebaseConfig";
import { doc, setDoc, getDoc } from "firebase/firestore";
import { getAuth, onAuthStateChanged } from "firebase/auth";
import Loader from "./Loader";

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
  const [templates, setTemplates] = useState<Template[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [userId, setUserId] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [newTemplate, setNewTemplate] = useState({
    name: "",
    subject: "",
    content: "",
  });

  useEffect(() => {
    const auth = getAuth();
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUserId(user?.uid || null);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    const fetchTemplates = async () => {
      if (userId) {
        setLoading(true);
        const docRef = doc(db, "users", userId);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          setTemplates(docSnap.data().templates || []);
        }
        setLoading(false);
      }
    };
    fetchTemplates();
  }, [userId]);

  useEffect(() => {
    if (showNewTemplate || !!templateToDelete || !!selectedTemplate) {
      document.body.classList.add("modal-open");
    } else {
      document.body.classList.remove("modal-open");
    }
  }, [showNewTemplate, templateToDelete, selectedTemplate]);

  const handleDeleteClick = (template: Template) => {
    setTemplateToDelete(template);
  };

  const deleteTemplate = async () => {
    if (!templateToDelete) return;

    const updatedTemplates = templates.filter(
      (t) => t.id !== templateToDelete.id
    );
    setTemplates(updatedTemplates);

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      const existingData = userDocSnap.exists() ? userDocSnap.data() : {};

      await setDoc(
        userDocRef,
        {
          templates: updatedTemplates,
          csvFile: existingData.csvFile || null, // Preserve existing CSV data
        },
        { merge: true }
      );
    }

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

  const saveTemplate = async () => {
    if (!newTemplate.name || !newTemplate.subject || !newTemplate.content)
      return;

    let updatedTemplates;
    if (editingTemplate) {
      updatedTemplates = templates.map((t) =>
        t.id === editingTemplate.id ? { ...editingTemplate, ...newTemplate } : t
      );
      setSuccessMessage("Template updated successfully!");
    } else {
      const template: Template = {
        id: crypto.randomUUID(),
        ...newTemplate,
      };
      updatedTemplates = [...templates, template];
      setSuccessMessage("Template created successfully!");
    }

    setTemplates(updatedTemplates);

    if (userId) {
      const userDocRef = doc(db, "users", userId);
      const userDocSnap = await getDoc(userDocRef);
      const existingData = userDocSnap.exists() ? userDocSnap.data() : {};

      await setDoc(
        userDocRef,
        {
          templates: updatedTemplates,
          csvFile: existingData.csvFile || null, // Preserve existing CSV data
        },
        { merge: true }
      );
    }

    setShowNewTemplate(false);
    setEditingTemplate(null);
    setNewTemplate({ name: "", subject: "", content: "" });
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  const sendEmail = (template: Template, recipients: string[]) => {
    console.log("Sending email:", { template, recipients });
    setSuccessMessage("Email sent successfully!");
    setShowSuccess(true);
    setTimeout(() => setShowSuccess(false), 5000);
  };

  return (
    <div className="space-y-6">
      {loading && (
        <div className="flex items-center justify-center h-full">
          <Loader />
          <p>Loading...</p>
        </div>
      )}
      {showSuccess && (
        <div
          className="fixed top-4 right-4 z-50 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg"
          role="alert"
        >
          <span className="block sm:inline z-50">{successMessage}</span>
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
        {templates.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No templates created. Click create template to add a new template.
          </p>
        ) : (
          templates.map((template) => (
            <div
              key={template.id}
              className="bg-white p-4 rounded-lg shadow border border-gray-200 hover:border-green-300 transition-colors"
            >
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium text-gray-900">{template.name}</h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {template.subject}
                  </p>
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
          ))
        )}
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
              className="mt-1 block w-full rounded-md border-gray-400 shadow-md focus:border-green-500 focus:ring-green-500"
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
      <SendEmailModal
        isOpen={!!selectedTemplate}
        onClose={() => setSelectedTemplate(null)}
        template={selectedTemplate}
        leads={leads}
        onSendEmail={sendEmail}
      />
    </div>
  );
};
