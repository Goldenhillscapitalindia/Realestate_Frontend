import { Helmet } from "react-helmet-async";
import { ScrollReveal } from "./ScrollReveal";

const faqItems = [
  {
    question: "What is Asset72?",
    answer:
      "Asset72 is an AI-powered real estate portfolio intelligence platform by Golden Hills. It helps institutional investors and operating teams analyze property and portfolio performance faster.",
  },
  {
    question: "What data does Asset72 analyze?",
    answer:
      "Asset72 analyzes T12s, rent rolls, NOI, occupancy, and market signals to surface portfolio risk, pricing insights, and operational performance trends.",
  },
  {
    question: "Who is Asset72 for?",
    answer:
      "Asset72 is built for institutional investors, capital allocators, asset managers, and real estate operating teams that need faster investment and portfolio intelligence.",
  },
];

const faqSchema = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: faqItems.map((item) => ({
    "@type": "Question",
    name: item.question,
    acceptedAnswer: {
      "@type": "Answer",
      text: item.answer,
    },
  })),
};

const HomeFaq = () => {
  return (
    <section
      id="faq"
      className="relative overflow-hidden bg-[#f7f9fc] px-6 py-20 md:px-10"
    >
      <Helmet>
        <script type="application/ld+json">{JSON.stringify(faqSchema)}</script>
      </Helmet>

      <div className="absolute inset-0 pointer-events-none opacity-[0.04]">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "radial-gradient(circle at top left, rgba(15,29,47,0.85) 1px, transparent 1px)",
            backgroundSize: "24px 24px",
          }}
        />
      </div>

      <div className="relative mx-auto max-w-5xl">
        <ScrollReveal variant="up">
          <div className="mx-auto mb-12 max-w-3xl text-center">
            <p className="mb-4 text-[11px] font-semibold uppercase tracking-[0.3em] text-[#1ebc9a]">
              FAQ
            </p>
            <h2 className="font-display text-[2rem] font-extrabold tracking-tight text-[#0f1d2f] md:text-[2.35rem] lg:text-[2.8rem]">
              Answers AI engines and investors can read clearly
            </h2>
            <p className="mt-4 text-[15px] leading-7 text-[#526277] md:text-[16px]">
              A short factual overview of what Asset72 does, what data it analyzes,
              and who it is built for.
            </p>
          </div>
        </ScrollReveal>

        <div className="grid gap-5">
          {faqItems.map((item, index) => (
            <ScrollReveal key={item.question} delay={index * 70} variant="up">
              <article
                className="rounded-3xl border border-[#d8e1ee] bg-white/90 p-7 shadow-[0_20px_60px_-45px_rgba(15,29,47,0.45)]"
              >
                <h3 className="text-[1.15rem] font-semibold text-[#0f1d2f] md:text-[1.25rem]">
                  {item.question}
                </h3>
                <p className="mt-3 text-[15px] leading-7 text-[#526277] md:text-[16px]">
                  {item.answer}
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HomeFaq;
