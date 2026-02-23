// src/components/RealEstateUploader.tsx
import React, { useState, useRef } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import RealEstateResponses from "./RealEstateResponses";
import { useTheme } from "./ThemeContext";
import { Block } from "./Realestate_components/Utils/RComponentsUtils";

type FileType = "memorandum" | "t12" | "rent_roll";

const RealEstateUploader: React.FC = () => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { theme } = useTheme();

  const [files, setFiles] = useState<Record<FileType, File | null>>({
    memorandum: null,
    t12: null,
    rent_roll: null,
  });

  const [status, setStatus] = useState<Record<FileType, string>>({
    memorandum: "",
    t12: "",
    rent_roll: "",
  });

  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState(""); // 🔥 new state for engaging messages

  const [responseBlocks, setResponseBlocks] = useState<Record<FileType, Block[]>>({
    memorandum: [],
    t12: [],
    rent_roll: [],
  });

  const inputRefs: Record<FileType, React.RefObject<HTMLInputElement>> = {
    memorandum: useRef<HTMLInputElement>(null),
    t12: useRef<HTMLInputElement>(null),
    rent_roll: useRef<HTMLInputElement>(null),
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, type: FileType) => {
    if (e.target.files?.[0]) {
      const file = e.target.files[0];
      if (file.type === "application/pdf") {
        setFiles((prev) => ({ ...prev, [type]: file }));
        setStatus((prev) => ({ ...prev, [type]: "" }));
      } else {
        setStatus((prev) => ({ ...prev, [type]: "Invalid file type. Only PDF allowed." }));
      }
    }
  };

  const handleRemoveFile = (type: FileType) => {
    setFiles((prev) => ({ ...prev, [type]: null }));
    setStatus((prev) => ({ ...prev, [type]: "" }));
    if (inputRefs[type].current) inputRefs[type].current.value = ""; // reset input
  };

const handleUpload = async () => {
  const formData = new FormData();
  (Object.keys(files) as FileType[]).forEach((key) => {
    if (files[key]) formData.append(key, files[key] as File);
  });

  if ([...formData.keys()].length === 0) return;

  try {
    setLoading(true);

    // Sequence of status updates
    setProgressMessage(" Uploading the PDF...");
    setTimeout(() => setProgressMessage(" Reading the PDF data..."), 10000);      // after 10s
    setTimeout(() => setProgressMessage(" Extracting data from PDF..."), 20000); // after 20s
    setTimeout(() => setProgressMessage(" Formatting the data..."), 30000);      // after 30s
    setTimeout(() => setProgressMessage(" Almost you are there..."), 50000);     // after 50s

    const res = await axios.post(`${API_URL}/api/upload_documents/`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });

    const newResponses: Record<FileType, Block[]> = {
      memorandum: res.data.memorandum?.response ?? [],
      t12: res.data.t12?.response ?? [],
      rent_roll: res.data.rent_roll?.response ?? [],
    };

    setResponseBlocks(newResponses);

    const newStatus: Record<FileType, string> = { ...status };
    (Object.keys(files) as FileType[]).forEach((key) => {
      if (files[key]) newStatus[key] = "Uploaded ✅";
    });
    setStatus(newStatus);
  } catch (error) {
    console.error(error);
    const newStatus: Record<FileType, string> = { ...status };
    (Object.keys(files) as FileType[]).forEach((key) => {
      if (files[key]) newStatus[key] = "Upload failed ❌";
    });
    setStatus(newStatus);
    setProgressMessage("❌ Upload failed. Please try again.");
  } finally {
    setTimeout(() => {
      setProgressMessage("");
      setLoading(false);
    }, 70000); // clear after ~70s total
  }
};

  if (
    responseBlocks.memorandum.length ||
    responseBlocks.t12.length ||
    responseBlocks.rent_roll.length
  ) {
    return (
      <RealEstateResponses
        responses={responseBlocks}
        onBack={() => setResponseBlocks({ memorandum: [], t12: [], rent_roll: [] })}
      />
    );
  }

  return (
    <div
      className={`flex justify-center items-center min-h-screen transition-colors ${theme === "dark" ? "bg-gray-900" : "bg-gray-100"
        }`}
    >
      {/* Back Button */}
      <button
            onClick={() => navigate("/", { state: { scrollTo: "#platform" } })}
        className={`fixed top-4 left-4 px-4 py-2 rounded-lg shadow-md z-50 ${theme === "dark"
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-gray-200 text-black hover:bg-gray-300"
          }`}
      >
        ← Back
      </button>

      {/* Main Card */}
      <div
        className={`w-full max-w-2xl p-8 rounded-2xl shadow-xl border transition-colors ${theme === "dark"
            ? "bg-gray-900 border-gray-800 text-white"
            : "bg-white border-gray-200 text-gray-800"
          }`}
      >
        <h2 className="text-3xl font-bold mb-6 text-center">
          Upload Real Estate Files (PDFs)
        </h2>

        <div className="grid gap-6">
          {renderFileCard("Memorandum", "memorandum")}
          {renderFileCard("T12", "t12")}
          {renderFileCard("Rent Roll", "rent_roll")}
        </div>

        {/* Uploaded Files Preview */}
        <div className="mt-6 space-y-2">
          {(Object.keys(files) as FileType[])
            .filter((key) => files[key])
            .map((key) => (
              <div
                key={key}
                className="flex items-center justify-between p-2 rounded-lg border text-black bg-blue-100 dark:bg-blue-800 border-gray-300 dark:border-gray-700"
              >
                <span className="text-sm">{files[key]?.name}</span>
                <button
                  onClick={() => handleRemoveFile(key)}
                  className="text-red-500 font-bold hover:text-red-700"
                >
                  ❌
                </button>
              </div>
            ))}
        </div>

        {/* Progress Indicator */}
        {loading && (
          <div className="mt-6 text-center animate-pulse">
            <p className="text-lg font-semibold">{progressMessage}</p>
          </div>
        )}

        <button
          onClick={handleUpload}
          disabled={loading || (!files.memorandum && !files.t12 && !files.rent_roll)}
          className={`mt-8 w-full px-4 py-3 font-semibold rounded-xl transition ${theme === "dark"
              ? "bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50"
              : "bg-blue-500 text-white hover:bg-blue-600 disabled:opacity-50"
            }`}
        >
          {loading ? "Processing..." : "Upload Selected"}
        </button>
      </div>
    </div>
  );

  function renderFileCard(label: string, type: FileType) {
    return (
      <div
        className={`p-4 rounded-xl shadow-md border transition-colors ${theme === "dark"
            ? "bg-gray-800 border-gray-700 text-white"
            : "bg-white border-gray-200 text-gray-800"
          }`}
      >
        <p className="font-semibold mb-2">{label}</p>
        <div
          className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition ${files[type]
              ? "border-green-400"
              : theme === "dark"
                ? "border-gray-500 hover:border-blue-400"
                : "border-gray-300 hover:border-blue-500"
            }`}
          onClick={() => inputRefs[type].current?.click()}
        >
          {files[type] ? (
            <p className="text-green-500">{files[type]?.name}</p>
          ) : (
            <p className={`${theme === "dark" ? "text-gray-400" : "text-gray-500"}`}>
              Click to upload {label} (PDF only)
            </p>
          )}
        </div>
        <input
          type="file"
          accept=".pdf"
          className="hidden"
          ref={inputRefs[type]}
          onChange={(e) => handleFileChange(e, type)}
        />
        {status[type] && (
          <p
            className={`mt-2 text-sm ${status[type].includes("failed") || status[type].includes("Invalid")
                ? "text-red-400"
                : "text-green-500"
              }`}
          >
            {status[type]}
          </p>
        )}
      </div>
    );
  }
};

export default RealEstateUploader;
