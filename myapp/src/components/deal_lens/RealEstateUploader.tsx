import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router";
import RealEstateResponses from "./RealEstateResponses";
import { useTheme } from "./ThemeContext";
import { Block } from "./Realestate_components/Utils/RComponentsUtils";
import { ArrowLeft } from "lucide-react";
import { isAddPropertyBlockedForCurrentUser } from "@/lib/property-access";

const createEmptyBlocks = (): Record<FileType, Block[]> => ({
  memorandum: [],
  t12: [],
  rent_roll: [],
});

const createEmptyFiles = (): Record<FileType, File | null> => ({
  memorandum: null,
  t12: null,
  rent_roll: null,
});

const createEmptyStatus = (): Record<FileType, string> => ({
  memorandum: "",
  t12: "",
  rent_roll: "",
});

type FileType = "memorandum" | "t12" | "rent_roll";

type DealEntry = {
  id: number | string;
  property_name?: string;
  memorandum?: Block[];
  t12?: Block[];
  rent_roll?: Block[];
  created_at?: string;
  updated_at?: string;
};

type RealEstateUploaderProps = {
  showBackButton?: boolean;
};

const RealEstateUploader: React.FC<RealEstateUploaderProps> = ({ showBackButton = true }) => {
  const API_URL = import.meta.env.VITE_API_URL;
  const navigate = useNavigate();
  const { theme } = useTheme();
  const isAddPropertyBlocked = isAddPropertyBlockedForCurrentUser();

  const [files, setFiles] = useState<Record<FileType, File | null>>(createEmptyFiles());

  const [status, setStatus] = useState<Record<FileType, string>>(createEmptyStatus());

  const [loading, setLoading] = useState(false);
  const [progressMessage, setProgressMessage] = useState("");
  const [responseBlocks, setResponseBlocks] = useState<Record<FileType, Block[]>>(createEmptyBlocks());

  const [propertyName, setPropertyName] = useState("");
  const [formError, setFormError] = useState("");

  const [deals, setDeals] = useState<DealEntry[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [dealsError, setDealsError] = useState<string | null>(null);

  const [selectedDeal, setSelectedDeal] = useState<DealEntry | null>(null);
  const [showUploader, setShowUploader] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const inputRefs: Record<FileType, React.RefObject<HTMLInputElement>> = {
    memorandum: useRef<HTMLInputElement>(null),
    t12: useRef<HTMLInputElement>(null),
    rent_roll: useRef<HTMLInputElement>(null),
  };

  const fetchDeals = useCallback(async () => {
    setDealsLoading(true);
    setDealsError(null);
    try {
      const result = await axios.get(`${API_URL}/api/deal_underwriting_data/`);
      const payload = Array.isArray(result.data)
        ? result.data
        : result.data?.data ?? [];
      setDeals(payload);
    } catch (error) {
      console.error("fetchDeals", error);
      setDealsError("Could not load properties.");
    } finally {
      setDealsLoading(false);
    }
  }, [API_URL]);

  useEffect(() => {
    fetchDeals();
  }, [fetchDeals]);

  const clearUploadInputs = () => {
    setFiles(createEmptyFiles());
    Object.values(inputRefs).forEach((ref) => {
      if (ref.current) ref.current.value = "";
    });
  };

  const resetForm = () => {
    clearUploadInputs();
    setStatus(createEmptyStatus());
    setPropertyName("");
    setFormError("");
    setProgressMessage("");
  };

  const handleReturnToLibrary = () => {
    setSelectedDeal(null);
    setResponseBlocks(createEmptyBlocks());
    setShowUploader(false);
    resetForm();
  };

  const handleStartAddProperty = () => {
    resetForm();
    setResponseBlocks(createEmptyBlocks());
    setSelectedDeal(null);
    setShowUploader(true);
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
    if (inputRefs[type].current) inputRefs[type].current.value = "";
  };

  const handleUpload = async () => {
    if (!propertyName.trim()) {
      setFormError("Please provide a property name before uploading.");
      return;
    }

    const hasSelectedFile = (Object.keys(files) as FileType[]).some((key) => !!files[key]);
    if (!hasSelectedFile) {
      setFormError("Select at least one document to upload.");
      return;
    }

    setFormError("");
    const formData = new FormData();
    formData.append("property_name", propertyName.trim());
    (Object.keys(files) as FileType[]).forEach((key) => {
      if (files[key]) formData.append(key, files[key] as File);
    });

    try {
      setLoading(true);
      setProgressMessage("Uploading the PDF...");
      setTimeout(() => setProgressMessage("Reading the PDF data..."), 10000);
      setTimeout(() => setProgressMessage("Extracting data from PDF..."), 20000);
      setTimeout(() => setProgressMessage("Formatting the data..."), 30000);
      setTimeout(() => setProgressMessage("Almost there..."), 50000);

      const res = await axios.post(`${API_URL}/api/upload_documents/`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const newResponses: Record<FileType, Block[]> = {
        memorandum: res.data.memorandum?.response ?? [],
        t12: res.data.t12?.response ?? [],
        rent_roll: res.data.rent_roll?.response ?? [],
      };

      setResponseBlocks(newResponses);
      await fetchDeals();

      const newStatus: Record<FileType, string> = { ...status };
      (Object.keys(files) as FileType[]).forEach((key) => {
        if (files[key]) newStatus[key] = "Uploaded";
      });
      setStatus(newStatus);

      if (res.status === 200) {
        setShowUploader(false);
        clearUploadInputs();
      }
    } catch (error) {
      console.error("upload error", error);
      const failedStatus: Record<FileType, string> = { ...status };
      (Object.keys(files) as FileType[]).forEach((key) => {
        if (files[key]) failedStatus[key] = "Upload failed";
      });
      setStatus(failedStatus);
      setProgressMessage("Upload failed. Please try again.");
    } finally {
      setTimeout(() => {
        setProgressMessage("");
        setLoading(false);
      }, 70000);
    }
  };

  const hasPendingFiles = useMemo(
    () => Object.values(files).some((file) => Boolean(file)),
    [files]
  );

  const hasUploadResponses =
    Boolean(
      responseBlocks.memorandum.length || responseBlocks.t12.length || responseBlocks.rent_roll.length
    );

  if (selectedDeal) {
    const dealResponses: Record<FileType, Block[]> = {
      memorandum: selectedDeal.memorandum ?? [],
      t12: selectedDeal.t12 ?? [],
      rent_roll: selectedDeal.rent_roll ?? [],
    };

    return renderResponsesShell(
      <RealEstateResponses
        responses={dealResponses}
        titleText={selectedDeal.property_name ?? "Property Response"}
        embedded
        showBackButton={false}
      />,
      { showHeader: false }
    );
  }

  if (hasUploadResponses) {
    return renderResponsesShell(
      <RealEstateResponses
        responses={responseBlocks}
        titleText={propertyName || "Upload Response"}
        embedded
        showBackButton={false}
      />,
      { showHeader: false }
    );
  }

  if (showUploader) {
    return renderUploadView();
  }

  return renderDealList();

  function renderDealList() {
    const filteredDeals = deals.filter((deal) =>
      (deal.property_name ?? "").toLowerCase().includes(searchTerm.trim().toLowerCase())
    );

    const statusFor = (hasValue: boolean) => (hasValue ? "ready" : "pending");

    const badgeClasses: Record<string, string> = {
      ready: "bg-emerald-500/20 text-emerald-300 border border-emerald-400",
      pending: "bg-amber-500/15 text-amber-200 border border-amber-400",
      error: "bg-red-500/10 text-red-300 border border-red-400",
    };

    const statusLabel = (type: string) => {
      switch (type) {
        case "ready":
          return "Ready";
        case "pending":
          return "Pending";
        default:
          return "Error";
      }
    };

    return (
      <div className="min-h-screen w-full bg-[#05050d] text-white">
        {renderGlobalBackButton()}
        <div className="mx-auto w-full max-w-6xl px-4 py-12 lg:px-0 lg:py-16">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Deal Lens</p>
              <h1 className="mt-2 text-4xl font-semibold text-white">Property Intelligence Library</h1>
              <p className="mt-2 text-sm text-white/70">
                Click a property to preview its stored memorandum, T12, and rent roll responses.
              </p>
            </div>
            {!isAddPropertyBlocked ? (
              <button
                onClick={handleStartAddProperty}
                className="rounded-full bg-gradient-to-r from-purple-500 to-indigo-500 px-6 py-3 text-sm font-semibold uppercase tracking-wider text-white shadow-[0_10px_40px_rgba(59,7,145,0.5)] transition hover:opacity-90"
              >
                + Add Property
              </button>
            ) : null}
          </div>

          <div className="mt-8 flex flex-col gap-4">
            <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white/60">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search properties..."
                className="w-full bg-transparent text-white placeholder:text-white/40 focus:outline-none"
              />
            </div>

            <div className="space-y-4 rounded-[30px] border border-white/5 bg-[#05050d] p-6 shadow-[0_30px_80px_rgba(0,0,0,0.7)]">
              {dealsLoading ? (
                <p className="text-center text-sm text-white/60">Refreshing deals...</p>
              ) : dealsError ? (
                <p className="text-center text-sm text-red-400">{dealsError}</p>
              ) : !filteredDeals.length ? (
                <div className="rounded-2xl border border-dashed border-white/20 bg-white/5 p-6 text-center text-sm text-white/70">
                  No properties match that search term yet.
                </div>
              ) : (
                filteredDeals.map((deal) => {
                  const memoStatus = statusFor(Boolean(deal.memorandum?.length));
                  const t12Status = statusFor(Boolean(deal.t12?.length));
                  const rentRollStatus = statusFor(Boolean(deal.rent_roll?.length));
                  return (
                    <button
                      key={`${deal.id}-${deal.property_name}`}
                      onClick={() => setSelectedDeal(deal)}
                      className="group relative w-full rounded-[28px] border border-white/10 bg-[#08090f] pr-6 pl-10 py-5 text-left transition hover:border-white/40"
                    >
                      <span className="pointer-events-none absolute inset-y-4 left-5 w-[4px] rounded-full bg-gradient-to-b from-purple-400 via-indigo-500 to-blue-400 opacity-0 transition group-hover:opacity-100" />
                      <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                        <div>
                          <p className="text-2xl font-semibold text-white">{deal.property_name ?? `Property ${deal.id}`}</p>
                          <p className="text-sm text-white/60">
                            Created {formatDate(deal.created_at)}
                          </p>
                        </div>
                        <span className="text-md font-semibold text-indigo-300 opacity-0 transition group-hover:opacity-100">
                          View insights →
                        </span>
                      </div>
                      <div className="mt-4 flex flex-wrap gap-4 text-xs text-white/70">
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold uppercase  text-white/90">Memorandum</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${badgeClasses[memoStatus]}`}>
                            {statusLabel(memoStatus)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold uppercase  text-white/90">T12</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${badgeClasses[t12Status]}`}>
                            {statusLabel(t12Status)}
                          </span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-[11px] font-semibold uppercase  text-white/90">Rent Roll</span>
                          <span className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] ${badgeClasses[rentRollStatus]}`}>
                            {statusLabel(rentRollStatus)}
                          </span>
                        </div>
                      </div>
                    </button>
                  );
                })
              )}
            </div>
            {/* <p className="pt-2 text-xs uppercase tracking-[0.4em] text-white/50">
              {filteredDeals.length} Properties
            </p> */}
          </div>
        </div>
      </div>
    );
  }

  function renderUploadView() {
    const hasFiles = hasPendingFiles;

    return (
      <div
        className={`flex min-h-screen w-full items-center justify-center px-4 py-8 ${
          theme === "dark" ? "bg-gradient-to-b from-[#030513] to-[#050c21]" : "bg-gray-100"
        }`}
      >
        {renderGlobalBackButton()}
        <div className="w-full max-w-2xl">
          <div className="relative space-y-4 rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e182d] to-[#0d1d29] p-8 pt-10 shadow-[0_25px_60px_rgba(5,7,18,0.9)] text-white">
            <button
              type="button"
              aria-label="Cancel and return to property list"
              onClick={handleReturnToLibrary}
              className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-lg font-semibold text-white transition hover:bg-white/20"
            >
              X
            </button>
            <div className="flex flex-col gap-3">
              <p className="text-sm uppercase tracking-[0.4em] text-blue-300">Upload</p>
              <h2 className="text-3xl font-bold">Upload Property Documents</h2>
              <p className="text-sm text-gray-300">
                Upload the Offering Memorandum, T12 financials, and Rent Roll. Our AI will analyze the documents and generate underwriting insights.
              </p>
              <button
                onClick={handleReturnToLibrary}
                className="text-sm font-medium text-blue-300 hover:text-blue-100"
              >
                Back to property list
              </button>
            </div>

            <div>
              <label className="text-m font-semibold text-white">
                Property Name
              </label>
              <input
                type="text"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
                placeholder="Enter the property name"
                className="mt-2 w-full rounded-2xl border border-white/20 bg-white/5 px-4 py-3 text-white placeholder:text-gray-400 focus:border-blue-400 focus:outline-none"
              />
              {formError && <p className="mt-2 text-xs text-red-400">{formError}</p>}
            </div>

            <div className="space-y-4">
              {renderFileCard("Memorandum", "memorandum")}
              {renderFileCard("T12", "t12")}
              {renderFileCard("Rent Roll", "rent_roll")}
            </div>

            <div className="space-y-3">
              {(Object.keys(files) as FileType[])
                .filter((key) => files[key])
                .map((key) => (
                  <div
                    key={key}
                    className="flex items-center justify-between rounded-xl border border-gray-700 bg-white/5 px-4 py-2 text-sm"
                  >
                    <span className="truncate text-xs uppercase tracking-wide text-white">
                      {files[key]?.name}
                    </span>
                    <button
                      onClick={() => handleRemoveFile(key)}
                      className="text-xs font-semibold text-red-400 hover:text-red-300"
                    >
                      Remove
                    </button>
                  </div>
                ))}

              {loading && (
                <div className="text-center text-sm text-blue-100">
                  {progressMessage || "Processing uploads..."}
                </div>
              )}

              <button
                onClick={handleUpload}
                disabled={loading || !hasFiles || !propertyName.trim()}
                className={`w-full rounded-2xl px-4 py-3 text-center text-base font-semibold transition ${
                  loading || !hasFiles || !propertyName.trim()
                    ? "bg-blue-500/60 text-white"
                    : "bg-blue-600 text-white hover:bg-blue-700"
                }`}
              >
                {loading ? "Processing..." : "Upload Selected"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  type ResponseShellOptions = {
    heading?: string;
    showHeader?: boolean;
  };

  function renderResponsesShell(content: React.ReactNode, options: ResponseShellOptions = {}) {
    const showHeader = options.showHeader ?? true;

    return (
      <div className={`min-h-screen w-full ${theme === "dark" ? "bg-gray-950 text-white" : "bg-gray-100 text-gray-900"}`}>
        {renderGlobalBackButton()}
        <div className="mx-auto w-full max-w-6xl px-4 py-12">
          <div className=" rounded-3xl border border-white/10 bg-gradient-to-b from-[#0e182d] to-[#0d1d29] p-6 shadow-[0_25px_60px_rgba(5,7,18,0.85)] relative">

            {!showHeader && (
              <div className="absolute left-4 top-4">
                <button
                  onClick={handleReturnToLibrary}
                  className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
                >
                  <ArrowLeft>back</ArrowLeft>
                </button>
              </div>
            )}
            {showHeader && (
              <div className="flex flex-col gap-4 lg:items-center lg:flex-row lg:justify-between">
                <div>
                  <p className="text-sm font-semibold uppercase tracking-[0.3em] text-blue-400">Deal Lens</p>
                  <h1 className="mt-1 text-3xl font-bold">{options.heading ?? "Property Intelligence Library"}</h1>
                  <p className={`mt-2 text-sm ${theme === "dark" ? "text-gray-300" : "text-gray-600"}`}>
                    Click a property to preview its stored memorandum, T12, and rent roll responses.
                  </p>
                </div>
                <div className="flex gap-3">
                  <button
                    onClick={handleReturnToLibrary}
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-white/20"
                  >
                    Back to list
                  </button>
                  {!isAddPropertyBlocked ? (
                    <button
                      onClick={handleStartAddProperty}
                      className="rounded-full bg-blue-500 px-5 py-2 text-xs font-semibold uppercase tracking-wide text-white shadow-lg transition hover:bg-blue-600"
                    >
                      + Add Property
                    </button>
                  ) : null}
                </div>
              </div>
            )}

            <div className={showHeader ? "mt-10" : "pt-10"}>
              {content}
            </div>
          </div>
        </div>
      </div>
    );
  }

  function renderGlobalBackButton() {
    if (!showBackButton) return null;

    return (
      <button
        onClick={() => navigate("/", { state: { scrollTo: "#platform" } })}
        className={`fixed top-4 left-4 z-50 rounded-lg px-4 py-2 text-sm font-semibold transition ${
          theme === "dark"
            ? "bg-gray-700 text-white hover:bg-gray-600"
            : "bg-gray-200 text-black hover:bg-gray-300"
        }`}
      >
        Back
      </button>
    );
  }

  function formatDate(value?: string) {
    if (!value) return "UNKNOWN";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.valueOf())) return "UNKNOWN";
    const day = parsed.getDate().toString().padStart(2, "0");
    const month = parsed.toLocaleString("en-US", { month: "short" }).toUpperCase();
    const year = parsed.getFullYear();
    return `${day} ${month} ${year}`;
  }

  function renderFileCard(label: string, type: FileType) {
    return (
      <div
        className={`rounded-2xl border px-4 py-5 transition-colors ${
          theme === "dark"
            ? "border-white/10 bg-white/5 text-white"
            : "border-gray-200 bg-white text-gray-800"
        }`}
      >
        <p className="font-semibold mb-2">{label}</p>
        <div
          className={`cursor-pointer rounded-2xl border-2 border-dashed p-4 text-center text-sm transition ${
            files[type]
              ? "border-emerald-400 bg-emerald-500/10 text-emerald-300"
              : theme === "dark"
                ? "border-gray-600 hover:border-blue-400"
                : "border-gray-300 hover:border-blue-500"
          }`}
          onClick={() => inputRefs[type].current?.click()}
        >
          {files[type] ? (
            <p className="text-sm font-medium text-emerald-400">{files[type]?.name}</p>
          ) : (
            <p className={theme === "dark" ? "text-gray-400" : "text-gray-500"}>
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
            className={`mt-2 text-xs ${
              status[type].includes("failed") || status[type].includes("Invalid")
                ? "text-red-400"
                : "text-emerald-300"
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
