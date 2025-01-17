import React, { useRef, useState } from "react";
import { FileSpreadsheet, Loader } from "lucide-react";
import { Lead } from "../types";
import Papa from "papaparse";
import { db } from "../config/firebaseconfig";
import { collection, addDoc } from "firebase/firestore";

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
}

export const CSVImport: React.FC<Props> = ({ onImport }) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileSelect = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    try {
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

            // Save CSV URL to Firestore
            try {
              await addDoc(collection(db, "csv_files"), {
                url: csvUrl,
                filename: file.name,
                uploadedAt: new Date().toISOString(),
              });
            } catch (firestoreError) {
              console.error("Firestore error:", firestoreError);
              // Continue with import even if Firestore save fails
            }

            // Process the leads
            const leads: Lead[] = results.data
              .filter((row: CSVRow) => Object.values(row).some((val) => val))
              .map((row: CSVRow, index: number) => ({
                id: Date.now() + index,
                name: row.name || "",
                company: row.company || "",
                email: row.email || "",
                phone: row.phone || "",
                status: row.status || "",
                source: row.source || "",
                industry: row.industry || "",
                lastContact: new Date().toISOString().split("T")[0],
                value: parseFloat(row.value) || 0,
              }));

            onImport(leads);

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
              .map((row: CSVRow, index: number) => ({
                id: Date.now() + index,
                name: row.name || "",
                company: row.company || "",
                email: row.email || "",
                phone: row.phone || "",
                status: row.status || "",
                source: row.source || "",
                industry: row.industry || "",
                lastContact: new Date().toISOString().split("T")[0],
                value: parseFloat(row.value) || 0,
              }));

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
    </div>
  );
};
