import type { ReactNode } from "react";
import { useEffect } from "react";
import { CheckCircle2, ShieldCheck } from "lucide-react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Seo from "@/components/Seo";

const Section = ({ title, children }: { title: string; children: ReactNode }) => (
  <section className="mb-10">
    <h2 className="text-xl font-semibold text-[#0F172A] mb-3">{title}</h2>
    <div className="text-[#64748B] leading-relaxed space-y-3">{children}</div>
  </section>
);

const PrivacyPolicyPage = () => {
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "smooth" });
  }, []);

  return (
    <div className="min-h-screen bg-[linear-gradient(180deg,_#f8fafc_0%,_#f1f5f9_45%,_#ffffff_100%)]">
      <Seo
        title="Privacy Policy | Asset72"
        description="Read the Asset72 privacy policy to understand how platform data, uploaded documents, and user information are handled."
        canonicalPath="/privacy-policy"
      />
      <Navbar />
      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-72 bg-[radial-gradient(circle_at_top,_rgba(15,118,110,0.12),_transparent_65%)] pointer-events-none" />
        <div className="max-w-4xl mx-auto px-6 pt-28 pb-20">
          <div className="mb-10 rounded-[28px] border border-white/70 bg-white/85 p-8 shadow-[0_24px_80px_rgba(15,23,42,0.08)] backdrop-blur md:p-10">
            <div className="flex flex-col gap-8 border-b border-[#E2E8F0] pb-10 md:flex-row md:items-end md:justify-between">
              <div className="max-w-2xl">
                <span className="inline-flex items-center gap-2 rounded-full border border-[#CCFBF1] bg-[#F0FDFA] px-4 py-1.5 text-xs font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                  <ShieldCheck size={14} />
                  Privacy Policy
                </span>
                <h1 className="mt-5 text-4xl font-semibold tracking-tight text-[#0F172A] md:text-5xl">
                  Privacy built into the platform experience
                </h1>
                <p className="mt-5 text-lg leading-8 text-[#64748B]">
                  Asset72, developed by Golden Hills Capital India Pvt Ltd, respects your privacy
                  and is committed to protecting the information you share with us.
                </p>
              </div>
              <div className="rounded-2xl border border-[#CCFBF1] bg-[linear-gradient(135deg,_#F0FDFA,_#ECFEFF)] p-6 md:max-w-xs">
                <p className="text-sm font-semibold uppercase tracking-[0.2em] text-[#0F766E]">
                  Core Principle
                </p>
                <p className="mt-3 text-base leading-7 text-[#334155]">
                  Data is used to operate, secure, and improve the platform, not for advertising.
                </p>
              </div>
            </div>

            <div className="mt-8 grid gap-4 md:grid-cols-2">
              {[
                "Clear explanation of what data we collect",
                "Limited use of uploaded information",
                "Security-focused handling of platform data",
                "Trusted providers held to protection standards",
              ].map((item) => (
                <div
                  key={item}
                  className="flex items-start gap-3 rounded-2xl border border-[#E2E8F0] bg-[#F8FAFC] px-4 py-4"
                >
                  <CheckCircle2 className="mt-0.5 text-[#0F766E]" size={18} />
                  <p className="text-sm leading-6 text-[#475569]">{item}</p>
                </div>
              ))}
            </div>

            <div className="mt-10">
              <Section title="Information We Collect">
                <p>We may collect limited information such as:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Name and email address</li>
                  <li>Organization information</li>
                  <li>
                    Documents uploaded to the platform (such as Offering Memorandums, Rent Rolls,
                    and T12 financials)
                  </li>
                  <li>Basic usage data to improve platform performance</li>
                </ul>
              </Section>

              <Section title="How We Use Information">
                <p>Information is used only to:</p>
                <ul className="list-disc pl-6 space-y-1">
                  <li>Provide analysis and insights within the platform</li>
                  <li>Process uploaded real estate documents</li>
                  <li>Improve the functionality and performance of our services</li>
                  <li>Maintain platform security</li>
                </ul>
                <p>We do not sell or share your data for advertising purposes.</p>
              </Section>

              <Section title="Data Security">
                <p>
                  Uploaded documents and user data are treated as confidential and stored using
                  appropriate security measures to protect against unauthorized access.
                </p>
              </Section>

              <Section title="Third-Party Services">
                <p>
                  We may use trusted infrastructure providers for hosting and platform operations.
                  These providers are required to maintain appropriate data protection standards.
                </p>
              </Section>

              <Section title="Changes to This Policy">
                <p>
                  We may update this Privacy Policy from time to time. Updates will be posted on
                  this page.
                </p>
              </Section>
            </div>

            <section className="pt-6 border-t border-[#E2E8F0]">
              <h2 className="text-xl font-semibold text-[#0F172A] mb-3">Contact</h2>
              <p className="text-[#64748B] leading-relaxed">
                For privacy-related questions, please contact:
                <br />
                <span className="text-[#0F172A] font-medium">Golden Hills Capital India Pvt Ltd</span>
                <br />
                <a href="mailto:asset72@ghills.ai" className="text-[#0F766E] hover:underline">
                  asset72@ghills.ai
                </a>
              </p>
            </section>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
};

export default PrivacyPolicyPage;
