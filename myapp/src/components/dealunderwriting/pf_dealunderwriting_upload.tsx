import { useRef, useState } from "react";
import { ChevronLeft } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { authClient } from "@/lib/auth-api";

type UploadedFile = {
  name: string;
  size: number;
  file: File;
};

function fmtSize(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function UploadCard({
  label,
  accept,
  helperText,
  uploaded,
  onUpload,
  onRemove,
}: {
  label: string;
  accept: string;
  helperText: string;
  uploaded: UploadedFile | null;
  onUpload: (file: File) => void;
  onRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="rounded-3xl border border-[#d8e2f1] bg-[#f9fbff] p-5">
      <p className="mb-3 text-xl font-semibold text-[#102149]">{label}</p>
      {!uploaded ? (
        <div
          onClick={() => inputRef.current?.click()}
          className="flex cursor-pointer items-center justify-center rounded-2xl border border-dashed border-[#b9c8e6] bg-white px-6 py-8 text-center text-[#6a7f9f] transition hover:border-[#6f8fdb] hover:bg-[#f7faff]"
        >
          <div>
            <p className="text-base">Click to upload {label}</p>
            <p className="mt-1 text-sm">{helperText}</p>
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
        <div className="rounded-2xl border border-[#d8e2f1] bg-white px-4 py-4">
          <p className="truncate text-sm font-semibold text-[#102149]">{uploaded.name}</p>
          <p className="mt-1 text-sm text-[#6a7f9f]">{fmtSize(uploaded.size)}</p>
          <button
            type="button"
            onClick={onRemove}
            className="mt-3 text-sm font-semibold text-[#315ea8] transition hover:text-[#102149]"
          >
            Remove
          </button>
        </div>
      )}
    </div>
  );
}

export default function PfDealUnderwritingUpload({
  onBack,
  onSubmitted,
}: {
  onBack: () => void;
  onSubmitted: (propertyName: string) => Promise<void> | void;
}) {
  const { toast } = useToast();
  const [propertyName, setPropertyName] = useState("");
  const [memorandum, setMemorandum] = useState<UploadedFile | null>(null);
  const [rentRoll, setRentRoll] = useState<UploadedFile | null>(null);
  const [t12, setT12] = useState<UploadedFile | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const canSubmit =
    !!propertyName.trim() &&
    !!rentRoll &&
    !!t12 &&
    !submitting;

  const inputClass =
    "h-12 w-full rounded-2xl border border-[#d8e2f1] bg-white px-4 text-[15px] text-[#102149] placeholder:text-[#7f96b8] outline-none transition focus:border-[#6f8fdb]";

  const handleSubmit = async () => {
    if (!canSubmit) return;

    const formData = new FormData();
    formData.append("property_name", propertyName.trim());
    formData.append("rent_roll_document", rentRoll!.file);
    formData.append("t12_document", t12!.file);
    if (memorandum) {
      formData.append("memorandum_document", memorandum.file);
    }

    try {
      setSubmitting(true);
      await authClient.post("/api/user_properties/deal_add/", formData);
      await onSubmitted(propertyName.trim());
      toast({
        title: "Property uploaded",
        description: `${propertyName.trim()} was submitted successfully.`,
      });
    } catch {
      toast({
        title: "Upload failed",
        description: "Could not upload the property documents. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section className="mx-auto max-w-[1160px] rounded-[32px] border border-[#d8e2f1] bg-white px-8 py-10 text-[#102149] shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
      <div className="mb-8 flex items-center justify-between gap-4">
        <button
          type="button"
          onClick={onBack}
          className="inline-flex items-center gap-2 text-sm font-semibold text-[#315ea8] transition hover:text-[#102149]"
        >
          <ChevronLeft className="h-4 w-4" />
          Back to property list
        </button>
      </div>

      <div className="max-w-3xl">
        <p className="text-xs font-semibold uppercase tracking-[0.4em] text-[#4a78c2]">Upload</p>
        <h1 className="mt-3 text-5xl font-bold tracking-[-0.04em]">Upload Property Documents</h1>
        <p className="mt-4 text-lg leading-8 text-[#587091]">
          Upload the offering memorandum, T12 financials, and rent roll. The submitted property will open in the deal underwriting lens after upload.
        </p>
      </div>

      <div className="mt-10">
        <input className={inputClass} placeholder="Property name" value={propertyName} onChange={(e) => setPropertyName(e.target.value)} />
      </div>

      <div className="mt-8 grid gap-4 lg:grid-cols-3">
        <UploadCard
          label="Memorandum"
          accept=".pdf"
          helperText="PDF only"
          uploaded={memorandum}
          onUpload={(file) => setMemorandum({ name: file.name, size: file.size, file })}
          onRemove={() => setMemorandum(null)}
        />
        <UploadCard
          label="T12"
          accept=".xlsx,.xls,.csv,.pdf"
          helperText="Excel or PDF"
          uploaded={t12}
          onUpload={(file) => setT12({ name: file.name, size: file.size, file })}
          onRemove={() => setT12(null)}
        />
        <UploadCard
          label="Rent Roll"
          accept=".xlsx,.xls,.csv,.pdf"
          helperText="Excel or PDF"
          uploaded={rentRoll}
          onUpload={(file) => setRentRoll({ name: file.name, size: file.size, file })}
          onRemove={() => setRentRoll(null)}
        />
      </div>

      <button
        type="button"
        disabled={!canSubmit}
        onClick={handleSubmit}
        className={`mt-8 inline-flex h-14 items-center justify-center rounded-2xl px-8 text-lg font-semibold transition ${
          canSubmit ? "bg-[#3464b2] text-white hover:bg-[#4276ca]" : "cursor-not-allowed bg-white/10 text-[#8194b4]"
        }`}
      >
        {submitting ? "Submitting..." : "Upload Selected"}
      </button>
    </section>
  );
}
