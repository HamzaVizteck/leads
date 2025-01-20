import React, { useRef, useState } from "react";
import { FileSpreadsheet, Loader, X } from "lucide-react";
import { Lead } from "../types";
import Papa from "papaparse";
import { db } from "../config/firebaseConfig";
import {
  collection,
  addDoc,
  query,
  where,
  getDocs,
  deleteDoc,
} from "firebase/firestore";

const CLOUDINARY_UPLOAD_PRESET = "leads_csv";
const CLOUDINARY_CLOUD_NAME = "dbnvspmk7";

type Props = {
  onImport: (leads: Lead[]) => void;
};

interface CSVRow {
  name: string;
  company: string;
  email: string;
  phone: string;
  status: string;
  source: string;
  industry: string;
  value: string;
  lastContact: string;
}

export const CSVImport: React.FC<Props> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const checkIfFileExists = async (filename: string) => {
    const q = query(
      collection(db, "csv_files"),
      where("filename", "==", filename)
    );
    const querySnapshot = await getDocs(q);
    return { exists: !querySnapshot.empty, docs: querySnapshot.docs };
  };

  const deleteAllPreviousCSVs = async () => {
    const q = query(collection(db, "csv_files"));
    const querySnapshot = await getDocs(q);
    const deletePromises = querySnapshot.docs.map((doc) => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
  };

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setShowSuccess(false);
    try {
      // Check if file already exists
      const { exists } = await checkIfFileExists(file.name);
      if (exists) {
        const confirmReplace = window.confirm(
          "This CSV was previously uploaded. Do you want to replace the existing data with this file?"
        );
        if (!confirmReplace) {
          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
          setIsLoading(false);
          return;
        }
      }

      // First parse the CSV to validate it before uploading
      Papa.parse<CSVRow>(file, {
        header: true,
        complete: async (results: Papa.ParseResult<CSVRow>) => {
          try {
            // Upload to Cloudinary using FormData
            const formData = new FormData();
            formData.append("file", file);
            formData.append("upload_preset", CLOUDINARY_UPLOAD_PRESET);

            const response = await fetch(
              `https://api.cloudinary.com/v1_1/${CLOUDINARY_CLOUD_NAME}/raw/upload`,
              {
                method: "POST",
                body: formData,
              }
            );

            if (!response.ok) {
              throw new Error("Upload to Cloudinary failed");
            }

            const data = await response.json();
            const csvUrl = data.secure_url;

            // Delete all previous CSV records
            await deleteAllPreviousCSVs();

            // Save new CSV URL to Firestore
            try {
              await addDoc(collection(db, "csv_files"), {
                url: csvUrl,
                filename: file.name,
                uploadedAt: new Date().toISOString(),
              });
            } catch (firestoreError) {
              console.error("Firestore error:", firestoreError);
            }

            // Process the leads
            const leads: Lead[] = results.data
              .filter((row: CSVRow) => Object.values(row).some((val) => val))
              .map((row: CSVRow, index: number) => {
                return {
                  id: Date.now() + index,
                  name: row.name || "",
                  company: row.company || "",
                  email: row.email || "",
                  phone: row.phone || "",
                  status: row.status || "",
                  source: row.source || "",
                  industry: row.industry || "",
                  lastContact: new Date(row.lastContact),
                  value: row.value
                    ? parseFloat(row.value.replace(/[$,]/g, "").trim())
                    : 0,
                };
              });

            onImport(leads);
            setSuccessMessage(
              exists
                ? "CSV data replaced successfully!"
                : "CSV imported successfully!"
            );
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);

            // Reset file input
            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (uploadError) {
            console.error("Upload error:", uploadError);
            alert(
              "Error uploading file to cloud storage. The leads will still be imported."
            );

            // Process leads even if upload fails
            const leads: Lead[] = results.data
              .filter((row: CSVRow) => Object.values(row).some((val) => val))
              .map((row: CSVRow, index: number) => {
                return {
                  id: Date.now() + index,
                  name: row.name || "",
                  company: row.company || "",
                  email: row.email || "",
                  phone: row.phone || "",
                  status: row.status || "",
                  source: row.source || "",
                  industry: row.industry || "",
                  lastContact: new Date(row.lastContact),
                  value: row.value
                    ? parseFloat(row.value.replace(/[$,]/g, "").trim())
                    : 0,
                };
              });

            onImport(leads);
          }
        },
        error: (error: Papa.ParseError) => {
          console.error("Error parsing CSV:", error);
          alert(
            "Error parsing CSV file. Please check the format and try again."
          );
        },
      });
    } catch (error) {
      console.error("Error handling file:", error);
      alert("Error processing file. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative">
      <input
        type="file"
        accept=".csv"
        onChange={handleFileSelect}
        ref={fileInputRef}
        className="hidden"
        disabled={isLoading}
      />
      <button
        onClick={() => fileInputRef.current?.click()}
        disabled={isLoading}
        className="flex items-center px-4 py-2 bg-white border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader className="w-5 h-5 mr-2 text-gray-400 animate-spin" />
        ) : (
          <FileSpreadsheet className="w-5 h-5 mr-2 text-gray-400" />
        )}
        {isLoading ? "Importing..." : "Import CSV"}
      </button>

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
    </div>
  );
};
