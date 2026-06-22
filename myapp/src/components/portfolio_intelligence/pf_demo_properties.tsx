import React, { useCallback, useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, MapPin, Trash2 } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-api";
import { isDemoMode } from "@/lib/demo-mode";
import { isAddPropertyBlockedForCurrentUser } from "@/lib/property-access";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

import "./pf_demo_properties.css";

export type PropertyRecord = {
  property_name: string;
  submarket: string;
  region: string;
  address: string;
  location: string;
  class_type: string;
  units: number | string;
  occupancy: string;
  // rent_per_sqft: string;
  property_response: unknown;
};

type PfDemoPropertiesProps = {
  onSelectProperty?: (property: Pick<PropertyRecord, "property_name" | "submarket" | "region">) => void;
};

const getRowKey = (row: PropertyRecord) => `${row.property_name}-${row.submarket}-${row.region}`;

interface UploadedFile {
  name: string;
  size: number;
  file: File;
}

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function formatOccupancy(value: string | number | null | undefined) {
  if (value === null || value === undefined || value === "") return "-";

  const numericValue = typeof value === "number" ? value : Number(value);
  if (!Number.isFinite(numericValue)) return String(value);

  if (numericValue > 1) {
    return `${numericValue.toFixed(1)}%`;
  }

  return `${(numericValue * 100).toFixed(1)}%`;
}

function UploadZone({
  label,
  description,
  templateHref,
  templateName,
  uploaded,
  onUpload,
  onRemove,
  accept = ".xlsx,.xls,.csv",
  helperText = "Excel | Max 20 MB",
  showTemplate = true,
  footerText = "Use the template above to ensure correct file structure",
}: {
  label: string;
  description: string;
  templateHref: string;
  templateName: string;
  uploaded: UploadedFile | null;
  onUpload: (f: File) => void;
  onRemove: () => void;
  accept?: string;
  helperText?: string;
  showTemplate?: boolean;
  footerText?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files?.[0];
      if (file) onUpload(file);
    },
    [onUpload]
  );

  return (
    <div className="flex flex-col gap-3">
      <div className="flex min-h-[42px] flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-[15px] font-semibold text-[#101828]">{label}</p>
          <p className="mt-0.5 text-[12px] text-[#49648d]">{description}</p>
        </div>
        {showTemplate ? (
          <a
            href={templateHref}
            download={templateName}
            className="inline-flex items-center gap-1.5 rounded-xl border border-[#f1a5a5] px-4 py-2 text-[12px] font-semibold text-[#c62828] transition hover:bg-[#fff1f1]"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.1" strokeLinecap="round" strokeLinejoin="round">
              <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
              <polyline points="14 2 14 8 20 8" />
              <line x1="12" y1="18" x2="12" y2="12" />
              <polyline points="9 15 12 18 15 15" />
            </svg>
            Download Template
          </a>
        ) : (
          <div className="h-[38px]" aria-hidden="true" />
        )}
      </div>

      <div>
        {!uploaded ? (
          <div
            onDragEnter={() => setDragging(true)}
            onDragLeave={() => setDragging(false)}
            onDragOver={(e) => e.preventDefault()}
            onDrop={handleDrop}
            onClick={() => inputRef.current?.click()}
            className={`flex cursor-pointer items-center justify-center rounded-2xl border-2 border-dashed px-6 py-5 transition ${dragging
              ? "border-[#90aee8] bg-[#f3f8ff]"
              : "border-[#d7dfeb] bg-white hover:border-[#b9c8e6] hover:bg-[#fbfdff]"
              }`}
          >
            <div className="flex items-center gap-4 text-center sm:text-left">
              <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-[#edf1f6]">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#63799d" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="17 8 12 3 7 8" />
                  <line x1="12" y1="3" x2="12" y2="15" />
                </svg>
              </div>
              <div>
                <p className="text-[15px] font-semibold text-[#111c4e]">
                  Drop file or{" "}
                  <span className="underline decoration-dotted underline-offset-2">browse</span>
                </p>
                <p className="text-[12px] text-[#49648d]">{helperText}</p>
              </div>
            </div>
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) onUpload(file);
              }}
            />
          </div>
        ) : (
          <div className="flex items-center gap-3 rounded-2xl border border-[#d7dfeb] bg-[#fbfdff] px-4 py-3">
            <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-[#e9f5ef]">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#1d7c4d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <polyline points="9 12 11 14 15 10" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-[14px] font-semibold text-[#111c4e]">{uploaded.name}</p>
              <p className="text-[12px] text-[#49648d]">{fmtSize(uploaded.size)}</p>
            </div>
            <span className="rounded-full bg-[#eaf7f0] px-2.5 py-1 text-[11px] font-semibold text-[#1d7c4d]">
              Uploaded
            </span>
            <button
              type="button"
              onClick={onRemove}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#667085] transition hover:bg-[#fdecec] hover:text-[#b42318]"
              title="Remove file"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        )}
      </div>

      <p className="flex items-start gap-1.5 text-[12px] text-[#49648d]">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="10" />
          <line x1="12" y1="8" x2="12" y2="12" />
          <line x1="12" y1="16" x2="12.01" y2="16" />
        </svg>
        {footerText}
      </p>
    </div>
  );
}

function Section({
  step,
  title,
  subtitle,
  children,
}: {
  step: string;
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="overflow-hidden rounded-[20px] border border-[#d7dfeb] bg-white shadow-[0_10px_26px_rgba(15,23,42,0.08)]">
      <div className="flex items-center gap-3 bg-[#162a4c] px-6 py-5">
        <span className="flex h-7 w-7 flex-shrink-0 items-center justify-center rounded-full border border-white/25 bg-white/10 text-[12px] font-bold text-white">
          {step}
        </span>
        <div>
          <p className="text-[16px] font-semibold text-white">{title}</p>
          {subtitle ? <p className="text-[12px] text-[#c8d5eb]">{subtitle}</p> : null}
        </div>
      </div>
      <div className="p-6">{children}</div>
    </div>
  );
}

function Field({
  label,
  required,
  children,
}: {
  label: string;
  required?: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-2">
      <label className="text-[12px] font-semibold uppercase tracking-[0.08em] text-[#4e6790]">
        {label}
        {required ? <span className="ml-1 text-[#d49b3d]">*</span> : null}
      </label>
      {children}
    </div>
  );
}

function AddPropertyForm({ onBack }: { onBack: () => void }) {
  const { toast } = useToast();
  const [propertyName, setPropertyName] = useState("");
  const [location, setLocation] = useState("");
  const [submarket, setSubmarket] = useState("");
  const [assetClass, setAssetClass] = useState("");
  const [units, setUnits] = useState("");
  const [occupancy, setOccupancy] = useState("");
  const [rentRoll, setRentRoll] = useState<UploadedFile | null>(null);
  const [t12, setT12] = useState<UploadedFile | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const hasRequiredFields =
    !!propertyName.trim() &&
    !!location.trim() &&
    !!assetClass &&
    !!units &&
    !!occupancy;
  const canSubmit = hasRequiredFields && !!rentRoll && !!t12 && !submitting;
  const inputClass =
    "h-11 w-full rounded-2xl border border-[#cfd8e6] bg-[#f7f9fc] px-4 text-[15px] text-[#111c4e] placeholder:text-[#7c8ba5] outline-none transition focus:border-[#89a5db] focus:bg-white focus:ring-2 focus:ring-[#d8e5fb]";

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append("property_name", propertyName.trim());
    formData.append("location", location.trim());
    formData.append("submarket", submarket.trim());
    formData.append("asset_class", assetClass);
    formData.append("no_of_units", units);
    formData.append("occupancy_rate", occupancy);
    formData.append("t12_document", t12.file);
    formData.append("rent_roll_document", rentRoll.file);
    try {
      setSubmitting(true);
      await authClient.post("/api/user_properties/add/", formData);

      setSubmitted(true);
      toast({
        title: "Property Submitted Successfully",
        description: `${propertyName.trim() || "Your property"} has been submitted for review.`,
      });

      window.setTimeout(() => setSubmitted(false), 3000);
      onBack();
    } catch (error) {
      toast({
        title: "Property submission failed",
        description: "Could not submit the property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto w-full max-w-[1080px] px-1 pb-10 pt-2">
      <div className="mb-5 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl border border-[#d7dfeb] bg-white text-[#162a4c] transition hover:bg-[#f4f7fb]"
            aria-label="Back to properties"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>

          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-[#162a4c] text-white">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <polyline points="14 2 14 8 20 8" />
                <line x1="16" y1="13" x2="8" y2="13" />
                <line x1="16" y1="17" x2="8" y2="17" />
              </svg>
            </div>

            <div>
              <h1 className="text-[32px] font-bold tracking-[-0.03em] text-[#111c4e]">
                Property Submission
              </h1>
              <p className="text-[14px] text-[#49648d]">
                Complete all fields and upload documents to submit
              </p>
            </div>
          </div>

        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <Section step="1" title="Property Details" subtitle="Basic information about the asset">
          <div className="flex flex-col gap-4">
            <Field label="Property Name" required>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Riverfront Apartments"
                value={propertyName}
                onChange={(e) => setPropertyName(e.target.value)}
              />
            </Field>

            <Field label="Location" required>
              <div className="relative">
                <MapPin className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#6e7f9f]" />
                <input
                  type="text"
                  className={`${inputClass} pl-11`}
                  placeholder="City, State (e.g. Austin, TX)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>
            </Field>

            <Field label="Submarket" required>
              <input
                type="text"
                className={inputClass}
                placeholder="e.g. Downtown Austin"
                value={submarket}
                onChange={(e) => setSubmarket(e.target.value)}
              />
            </Field>

            <Field label="Asset Class" required>
              <Select value={assetClass} onValueChange={setAssetClass}>
                <SelectTrigger className="h-11 rounded-2xl border border-[#cfd8e6] bg-[#f7f9fc] px-4 text-[15px] text-[#111c4e] focus:border-[#89a5db] focus:ring-2 focus:ring-[#d8e5fb] focus:ring-offset-0">
                  <SelectValue placeholder="Select class - A through E" />
                </SelectTrigger>
                <SelectContent>
                  {["A", "B", "C", "D", "E"].map((cls) => (
                    <SelectItem key={cls} value={cls} className="hover:bg-[#e6edfb] focus:bg-[#e6edfb] cursor-pointer">
                      Class {cls}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        <Section step="2" title="Unit Information" subtitle="Capacity and occupancy metrics">
          <div className="flex flex-col gap-4">
            <Field label="No. of Units" required>
              <input
                type="number"
                min={1}
                className={inputClass}
                placeholder="e.g. 120"
                value={units}
                onChange={(e) => setUnits(e.target.value)}
              />
            </Field>

            <Field label="Occupancy Rate" required>
              <div className="relative">
                <input
                  type="number"
                  min={0}
                  max={100}
                  step={0.1}
                  className={`${inputClass} pr-10`}
                  placeholder="e.g. 94.5"
                  value={occupancy}
                  onChange={(e) => setOccupancy(e.target.value)}
                />
                <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-[16px] text-[#5d7195]">%</span>
              </div>
            </Field>

            <div className="mt-1 flex items-start gap-2 rounded-2xl border border-[#d7dfeb] bg-[#eef2f7] px-4 py-4">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#d49b3d" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mt-0.5 flex-shrink-0">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
              <p className="text-[13px] leading-7 text-[#49648d]">
                Physical occupancy reflects currently occupied units divided by total rentable units at time of submission.
              </p>
            </div>
          </div>
        </Section>
      </div>

      <div className="mt-5">
        <Section step="3" title="Supporting Documents" subtitle="Both files required to enable submission">
          <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
            <UploadZone
              label="Rent Roll"
              description="All units, tenants & lease terms"
              templateHref="/assets/Asset72_Rent_Roll_Template.xlsx"
              templateName="Asset72_Rent_Roll_Template.xlsx"
              uploaded={rentRoll}
              onUpload={(file) => setRentRoll({ name: file.name, size: file.size, file })}
              onRemove={() => setRentRoll(null)}
            />

            <UploadZone
              label="T12 Statement"
              description="Trailing 12-month income & expenses"
              templateHref="/assets/Asset72_T12_Template.xlsx"
              templateName="Asset72_T12_Template.xlsx"
              uploaded={t12}
              onUpload={(file) => setT12({ name: file.name, size: file.size, file })}
              onRemove={() => setT12(null)}
            />
          </div>
        </Section>
      </div>

      <div className="pb-4 pt-6">
        {!canSubmit ? (
          <div className="mb-3 flex items-center justify-center gap-2 text-center text-[13px] text-[#314f7a]">
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>
              {!rentRoll && !t12
                ? "Upload both the Rent Roll and T12 to enable submission"
                : !rentRoll
                  ? "Upload the Rent Roll to complete the required documents"
                  : "Upload the T12 statement to complete the required documents"}
            </span>
          </div>
        ) : null}

        <div className="flex justify-center">
          <button
            type="button"
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex h-12 w-full sm:w-auto px-6 items-center justify-center gap-2 rounded-2xl text-[15px] font-semibold transition ${canSubmit
              ? "bg-[#162a4c] text-white shadow-[0_12px_30px_rgba(22,42,76,0.24)] hover:-translate-y-0.5 hover:bg-[#1b335c]"
              : "cursor-not-allowed bg-[#d8deea] text-[#78879d]"
              }`}
          >
            {submitted ? (
              <>
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
                Submitted!
              </>
            ) : (
              <>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
                {submitting ? "Submitting..." : "Submit Property"}
              </>
            )}
          </button>
        </div>
        {canSubmit ? (
          <p className="mt-3 text-center text-[12px] text-[#49648d]">Ready to submit — all required documents uploaded</p>
        ) : null}
      </div>
    </section>
  );
}

const PfDemoProperties: React.FC<PfDemoPropertiesProps> = ({ onSelectProperty }) => {
  const { toast } = useToast();
  const [data, setData] = useState<PropertyRecord[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [showAddPropertyForm, setShowAddPropertyForm] = useState(false);
  const [deletingPropertyName, setDeletingPropertyName] = useState<string | null>(null);
  const isAddPropertyBlocked = isAddPropertyBlockedForCurrentUser();

  const loadProperties = useCallback(async (isActive = true) => {
    setStatus("loading");
    try {
      const response = isDemoMode()
        ? await authClient.post<{ data: PropertyRecord[] }>("/api/get_property_model_data/", { fetch: "all" })
        : await authClient.get<{ data: PropertyRecord[] }>("/api/get_property_model_data_user_view/", {
            params: { fetch: "all" },
          });

      if (isActive) {
        setData(response.data?.data ?? []);
        setStatus("idle");
      }
    } catch (error) {
      if (isActive) {
        setStatus("error");
      }
    }
  }, []);

  useEffect(() => {
    let isActive = true;

    loadProperties(isActive);
    return () => {
      isActive = false;
    };
  }, [loadProperties]);

  const rows = data;

  const handleRowClick = (row: PropertyRecord) => {
    if (onSelectProperty) {
      onSelectProperty({
        property_name: row.property_name,
        submarket: row.submarket,
        region: row.region,
      });
    }
  };

  const handleRowKeyDown = (event: React.KeyboardEvent<HTMLTableRowElement>, row: PropertyRecord) => {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      handleRowClick(row);
    }
  };

  const handleDeleteProperty = async (
    event: React.MouseEvent<HTMLButtonElement>,
    row: PropertyRecord
  ) => {
    event.stopPropagation();

    const propertyName = row.property_name?.trim();
    if (!propertyName) return;

    const confirmed = window.confirm(`Delete ${propertyName}?`);
    if (!confirmed) return;

    try {
      setDeletingPropertyName(propertyName);

      await authClient.post("/api/user_properties/delete/", {
        property_name: propertyName,
      });

      setData((current) =>
        current.filter(
          (item) => item.property_name?.toLowerCase() !== propertyName.toLowerCase()
        )
      );

      toast({
        title: "Property deleted",
        description: `${propertyName} was removed successfully.`,
      });
    } catch (error) {
      toast({
        title: "Delete failed",
        description: "Could not delete the property. Please try again.",
        variant: "destructive",
      });
    } finally {
      setDeletingPropertyName(null);
    }
  };

  const renderState = (message: string, tone: "neutral" | "error") => (
    <div className={`pf-properties__state ${tone === "error" ? "pf-properties__state--error" : ""}`}>
      {message}
    </div>
  );

  if (showAddPropertyForm) {
    return (
      <AddPropertyForm
        onBack={() => {
          setShowAddPropertyForm(false);
          void loadProperties(true);
        }}
      />
    );
  }

  return (
    <section className="pf-properties">
      {/* <div className="pf-properties__topbar" /> */}

      <div className="pf-properties__hero">
        <div className="pf-properties__hero-inner">
          <h1 className="pf-properties__title">Property Intelligence</h1>
          {!isDemoMode() && !isAddPropertyBlocked ? (
            <button
              type="button"
              className="pf-add-property-btn"
              onClick={() => setShowAddPropertyForm(true)}
            >
              Add Property
            </button>
          ) : null}
        </div>
      </div>

      <div className="pf-properties__body">
        <div className="pf-properties__table-shell">
          <table className="pf-properties__table">
            <thead className="pf-properties__head">
              <tr>
                <th scope="col">Property</th>
                <th scope="col">Location</th>
                <th scope="col">Class</th>
                <th scope="col">Units</th>
                <th scope="col">Occupancy</th>
                {/* <th scope="col">Rent/sqft</th> */}
                <th scope="col">
                  <span className="sr-only">Actions</span>
                </th>
              </tr>
            </thead>

            <tbody>
              {status === "loading" ? (
                <tr>
                  <td colSpan={7} className="pf-properties__state-cell">
                    {renderState("Loading...", "neutral")}
                  </td>
                </tr>
              ) : null}

              {status === "error" ? (
                <tr>
                  <td colSpan={7} className="pf-properties__state-cell">
                    {renderState("Failed to load properties.", "error")}
                  </td>
                </tr>
              ) : null}

              {status === "idle" && rows.length === 0 ? (
                <tr>
                  <td colSpan={7} className="pf-properties__state-cell">
                    {renderState("No properties available.", "neutral")}
                  </td>
                </tr>
              ) : null}

              {status === "idle"
                ? rows.map((row) => {
                  const rowKey = getRowKey(row);

                  return (
                    <tr
                      key={rowKey}
                      tabIndex={0}
                      role="button"
                      className="pf-properties__body-row"
                      onClick={() => handleRowClick(row)}
                      onKeyDown={(event) => handleRowKeyDown(event, row)}
                    >
                      <td className="pf-properties__cell pf-properties__cell--first">
                        <span className="pf-properties__property">{row.property_name || "-"}</span>
                      </td>
                      <td className="pf-properties__cell">
                        <span className="pf-properties__value">{row.location || "-"}</span>
                      </td>
                      <td className="pf-properties__cell">
                        <span className="pf-properties__value">{row.class_type || "-"}</span>
                      </td>
                      <td className="pf-properties__cell">
                        <span className="pf-properties__value">{row.units || "-"}</span>
                      </td>
                      <td className="pf-properties__cell">
                        <span className="pf-properties__value">{formatOccupancy(row.occupancy)}</span>
                      </td>
                      {/* <td className="pf-properties__cell">
                          <span className="pf-properties__value">{row.rent_per_sqft || "-"}</span>
                        </td> */}
                      <td className="pf-properties__cell pf-properties__cell--last pf-properties__arrow-cell">
                        <div className="flex items-center justify-end gap-3">
                          {!isDemoMode() ? (
                            <button
                              type="button"
                              onClick={(event) => handleDeleteProperty(event, row)}
                              disabled={deletingPropertyName === row.property_name}
                              className="inline-flex h-9 w-9 items-center justify-center rounded-lg text-[#b42318] transition hover:bg-[#fdecec] disabled:cursor-not-allowed disabled:opacity-60"
                              title="Delete property"
                              aria-label={`Delete ${row.property_name}`}
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          ) : null}
                          <ChevronRight className="pf-properties__arrow" strokeWidth={2.6} />
                        </div>
                      </td>
                    </tr>
                  );
                })
                : null}
            </tbody>
          </table>
        </div>
      </div>

    </section>
  );
};

export default PfDemoProperties;
