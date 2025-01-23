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
import { detectFieldType } from "../utils/fieldUtils";

type Props = {
  onImport: (leads: Lead[]) => void;
};

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

      Papa.parse<any>(file, {
        header: true,
        dynamicTyping: true,
        complete: async (results) => {
          try {
            const leads: Lead[] = results.data
              .filter((row) => Object.values(row).some((val) => val))
              .map((row, index) => {
                const processedRow: any = { id: Date.now() + index };

                Object.entries(row).forEach(([key, value]) => {
                  const cleanKey = key
                    .trim()
                    .replace(/\s+/g, "_")
                    .toLowerCase();

                  if (value != null) {
                    const fieldType = detectFieldType(value);
                    switch (fieldType) {
                      case "date":
                        processedRow[cleanKey] = new Date(value);
                        break;
                      case "number":
                        processedRow[cleanKey] = Number(value);
                        break;
                      case "boolean":
                        processedRow[cleanKey] = value === "true";
                        break;
                      default:
                        processedRow[cleanKey] = value;
                    }
                  }
                });

                return processedRow;
              });

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

            await deleteAllPreviousCSVs();

            try {
              await addDoc(collection(db, "csv_files"), {
                url: csvUrl,
                filename: file.name,
                uploadedAt: new Date().toISOString(),
              });
            } catch (firestoreError) {
              console.error("Firestore error:", firestoreError);
            }

            onImport(leads);
            setSuccessMessage(
              exists
                ? "CSV data replaced successfully!"
                : "CSV imported successfully!"
            );
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);

            if (fileInputRef.current) {
              fileInputRef.current.value = "";
            }
          } catch (error) {
            console.error("Error processing CSV data:", error);
            alert("Error processing CSV data. Please check the format.");
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
    </div>
  );
};
