import React, { useRef, useState } from "react";
import { FileSpreadsheet, Loader, X } from "lucide-react";
import { Lead } from "../types";
import Papa from "papaparse";
import { db } from "../config/firebaseConfig";
import { doc, setDoc } from "firebase/firestore";
import { detectFieldType } from "../utils/fieldUtils";
import { useAuth } from "../context/AuthContext";
import { useLeads } from "./LeadsProvider";
import { Timestamp } from "firebase/firestore";

interface CSVRow {
  [key: string]: string | number | boolean | null;
}

type Props = {
  onImport: (leads: Lead[]) => void;
};

export const CSVImport: React.FC<Props> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const { currentUser } = useAuth();
  const { updateLeads, setFilters, setSavedFilters } = useLeads();

  if (!currentUser) {
    return <div>Please log in to upload a CSV.</div>;
  }

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    setShowSuccess(false);

    try {
      // Upload to Cloudinary
      const formData = new FormData();
      formData.append("file", file);
      formData.append("upload_preset", "leads_csv");

      const response = await fetch(
        `https://api.cloudinary.com/v1_1/dbnvspmk7/raw/upload`,
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

      // Store the CSV URL in the user's document and reset filters
      const userDocRef = doc(db, "users", currentUser.uid);
      await setDoc(
        userDocRef,
        {
          csvFile: {
            url: csvUrl,
            filename: file.name,
            uploadedAt: new Date().toISOString(),
          },
          filters: [], // Reset active filters
          savedFilters: [], // Reset saved filters
        },
        { merge: true }
      );

      // Reset filters in the application state
      setFilters([]);
      setSavedFilters([]); // Reset saved filters in state

      Papa.parse<CSVRow>(file, {
        header: true,
        dynamicTyping: true,
        complete: (results) => {
          const leads: Lead[] = results.data
            .filter((row) => Object.values(row).some((val) => val))
            .map((row, index) => {
              const processedRow: Partial<Lead> = { id: Date.now() + index };

              Object.entries(row).forEach(([key, value]) => {
                if (value != null) {
                  const cleanKey = key
                    .trim()
                    .replace(/\s+/g, "_")
                    .toLowerCase();
                  const fieldType = detectFieldType(value);

                  switch (fieldType) {
                    case "date":
                      if (
                        typeof value === "string" ||
                        typeof value === "number"
                      ) {
                        processedRow[cleanKey] = new Timestamp(
                          new Date(value).getTime() / 1000,
                          0
                        );
                      }
                      break;
                    case "number":
                      processedRow[cleanKey] = Number(value);
                      break;
                    default:
                      processedRow[cleanKey] = value;
                  }
                }
              });

              return processedRow as Lead;
            });

          updateLeads(leads);
          onImport(leads);

          setSuccessMessage("CSV uploaded and filters cleared!");
          setShowSuccess(true);
          setTimeout(() => setShowSuccess(false), 5000);

          if (fileInputRef.current) {
            fileInputRef.current.value = "";
          }
        },
        error: (error: Papa.ParseError) => {
          console.error("Error parsing CSV:", error);
          alert("Error parsing CSV file. Please check the format.");
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
        className="flex items-center px-4 py-2 bg-green-500 border border-green-300 rounded-md shadow-sm text-sm font-medium text-white hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isLoading ? (
          <Loader className="w-5 h-5 mr-2 text-white animate-spin" />
        ) : (
          <FileSpreadsheet className="w-5 h-5 mr-2 text-white" />
        )}
        {isLoading ? "Importing..." : "Import CSV"}
      </button>

      {showSuccess && (
        <div
          className="fixed top-16 right-0 z-50 flex items-center bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded shadow-lg"
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
    </div>
  );
};
