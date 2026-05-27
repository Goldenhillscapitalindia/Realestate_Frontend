import React, { useEffect, useState } from "react";
import { ArrowRight, FileText } from "lucide-react";
import IcMemoIndex from "../ic-memo/Index";
import { IcMemoTemplateData } from "../ic-memo/types";
import { icMemoMockData } from "../ic-memo/mockData";
import { authClient } from "@/lib/auth-api";
import { isDemoMode } from "@/lib/demo-mode";

type PfDemoIcMemoProps = {
  hasStarted: boolean;
  onGenerate: () => void;
  onBack: () => void;
  data?: IcMemoTemplateData | null;
};

const PfDemoIcMemo: React.FC<PfDemoIcMemoProps> = ({ hasStarted, onGenerate, onBack, data }) => {
  const [memoData, setMemoData] = useState<IcMemoTemplateData | null>(data ?? null);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");

  useEffect(() => {
  if (!hasStarted) return;
  let isMounted = true;

  const load = async () => {
    setStatus("loading");
    if (isDemoMode()) {
      setMemoData(icMemoMockData);
      setStatus("idle");
      return;
    }

    try {
      const response = await authClient.post<{ data: IcMemoTemplateData }>(
        "/api/get_icmemo_data_user_view/",
        {}
      );

      if (!isMounted) return;

      const baseData = response.data?.data ?? null;
      setMemoData(baseData);
      setStatus("idle");

      authClient
        .post<{ data: IcMemoTemplateData }>("/api/get_icmemo_insights/", {})
        .then((res) => {
          if (!isMounted) return;

          const insights = res.data?.data;
          if (!insights) return;

          setMemoData((prev) => {
            if (!prev) return prev;
            return {
              ...prev,
              ...insights,
            };
          });
        })
        .catch(() => {});
    } catch {
      if (!isMounted) return;
      setStatus("error");
      setMemoData(data ?? null);
    }
  };

  load();
  return () => {
    isMounted = false;
  };
}, [data, hasStarted]);


  if (hasStarted) {
    if (status === "loading" && !memoData) {
      return <div className="px-6 py-10 text-sm text-slate-500">Loading IC memo...</div>;
    }

    if (status === "error" && !memoData) {
      return <div className="px-6 py-10 text-sm text-rose-600">Unable to load IC memo right now.</div>;
    }

    return <IcMemoIndex data={memoData ?? null} onBack={onBack} />;
  }

  return (
    <div className="flex min-h-[calc(100vh-96px)] items-center justify-center px-6 py-10">
      <div className="w-full max-w-3xl rounded-[32px] border border-slate-200 bg-white p-10 text-center shadow-[0_24px_80px_rgba(15,23,42,0.08)]">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-[#e9f0ff] text-[#22327f]">
          <FileText className="h-8 w-8" />
        </div>
        <p className="text-sm font-semibold uppercase tracking-[0.28em] text-[#5b6aa5]">
          Investment Committee Intelligence Memo
        </p>
        {/* <h2 className="mt-3 text-3xl font-semibold text-slate-900">
          Build your investment committee memo
        </h2> */}
        <p className="mt-4 text-base leading-7 text-slate-600">
          Designed to structure institutional investment decisions through standardized,
          <br />
          intelligence-backed committee workflows.
        </p>
        <div className="mt-8 flex items-center justify-center gap-5">
          <span className="text-base font-semibold text-slate-700">
            Portfolio intelligence
          </span>
          <ArrowRight className="h-5 w-5" />
          <button
            type="button"
            onClick={onGenerate}
            className="inline-flex items-center gap-3 rounded-2xl bg-[#0fa77d] px-7 py-4 text-base font-semibold text-white shadow-[0_16px_30px_rgba(15,167,125,0.24)] transition hover:bg-[#0c8f6b]"
          >
            <span>Generate Your IC Intelligence Memo</span>
            {/* <ArrowRight className="h-5 w-5" /> */}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PfDemoIcMemo;
