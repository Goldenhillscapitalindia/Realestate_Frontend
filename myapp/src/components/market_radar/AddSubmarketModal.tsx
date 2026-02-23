import React, { useEffect, useState } from "react";

type AddSubmarketModalProps = {
  open: boolean;
  loading: boolean;
  error: string | null;
  onClose: () => void;
  onSubmit: (payload: FormData) => Promise<void>;
};

const AddSubmarketModal: React.FC<AddSubmarketModalProps> = ({
  open,
  loading,
  error,
  onClose,
  onSubmit,
}) => {
  const [region, setRegion] = useState("");
  const [submarketName, setSubmarketName] = useState("");
  const [latitude, setLatitude] = useState("");
  const [longitude, setLongitude] = useState("");
  const [constructionType, setConstructionType] = useState("");
  const [submarketPdf, setSubmarketPdf] = useState<File | null>(null);
  const [capitalPdf, setCapitalPdf] = useState<File | null>(null);

  useEffect(() => {
    if (!open) return;
    setRegion("");
    setSubmarketName("");
    setLatitude("");
    setLongitude("");
    setConstructionType("");
    setSubmarketPdf(null);
    setCapitalPdf(null);
  }, [open]);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData();
    formData.append("region", region);
    formData.append("sub_market_name", submarketName);
    formData.append("latitude", latitude);
    formData.append("longitude", longitude);
    formData.append("construction_type", constructionType);
    if (submarketPdf) {
      formData.append("submarket_pdf", submarketPdf);
    }
    if (capitalPdf) {
      formData.append("capital_pdf", capitalPdf);
    }
    await onSubmit(formData);
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 px-4 py-8">
      <div
        className="w-full max-w-xl rounded-2xl border border-slate-200 p-6 text-black shadow-[0_30px_60px_rgba(15,23,42,0.2)]"
        style={{
          background:
            "linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(245,247,255,0.98) 100%)",
        }}
      >
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold">Add Submarket</h3>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-slate-200 px-3 py-1 text-xs text-black hover:border-slate-300 hover:text-black"
            disabled={loading}
          >
            Close
          </button>
        </div>

        <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-black">
              Region
              <input
                type="text"
                value={region}
                onChange={(event) => setRegion(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:border-slate-300 focus:outline-none"
                required
              />
            </label>
            <label className="text-xs text-black">
              Submarket Name
              <input
                type="text"
                value={submarketName}
                onChange={(event) => setSubmarketName(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:border-slate-300 focus:outline-none"
                required
              />
            </label>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-black">
              Latitude
              <input
                type="text"
                value={latitude}
                onChange={(event) => setLatitude(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:border-slate-300 focus:outline-none"
                required
              />
            </label>
            <label className="text-xs text-black">
              Longitude
              <input
                type="text"
                value={longitude}
                onChange={(event) => setLongitude(event.target.value)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:border-slate-300 focus:outline-none"
                required
              />
            </label>
          </div>

          <label className="text-xs text-black">
            Construction Type
            <select
              value={constructionType}
              onChange={(event) => setConstructionType(event.target.value)}
              className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm text-black focus:border-slate-300 focus:outline-none"
              required
            >
              <option value="" disabled>
                Select type
              </option>
              <option value="multi_family">Multi_Family</option>
              <option value="Industrial">Industrial</option>
            </select>
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="text-xs text-black">
              Submarket PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setSubmarketPdf(event.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-black file:mr-2 file:rounded-md file:border-0 file:bg-violet-100 file:px-3 file:py-1 file:text-xs file:text-violet-700"
              />
            </label>
            <label className="text-xs text-black">
              Capital PDF
              <input
                type="file"
                accept="application/pdf"
                onChange={(event) => setCapitalPdf(event.target.files?.[0] ?? null)}
                className="mt-2 w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-black file:mr-2 file:rounded-md file:border-0 file:bg-violet-100 file:px-3 file:py-1 file:text-xs file:text-violet-700"
              />
            </label>
          </div>

          {error && <p className="text-xs text-red-500">{error}</p>}

          <div className="flex items-center justify-end gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="rounded-full border border-slate-200 px-4 py-2 text-xs text-black hover:border-slate-300 hover:text-black"
              disabled={loading}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-full border border-violet-300 bg-violet-50 px-5 py-2 text-xs font-semibold text-violet-700 hover:border-violet-400"
              disabled={loading}
            >
              {loading ? "Submitting..." : "Submit"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AddSubmarketModal;
