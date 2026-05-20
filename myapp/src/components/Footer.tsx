import { Link } from "react-router";
import { ArrowUpRight, Linkedin, Mail } from "lucide-react";

import asset72FooterLogo from "@/assets/asset72-footer-logo.svg";
import { productRoutes } from "@/lib/product-routes";


const footerLinks = {
  Product: [
    "Portfolio Intelligence",
    "AI Rent Intelligence",
    "Market Radar Signal",
    "Deal Lens",
  ],
  Company: ["About Us", "Contact"],
  Legal: ["Privacy Policy", "Terms of Use"],
  Platforms: ["LinkedIn", "Email"],
};

const footerRoutes: Record<string, { to?: string; state?: { scrollTo: string }; href?: string }> = {
  "Portfolio Intelligence": { to: productRoutes.portfolioIntelligence },
  "AI Rent Intelligence": { to: productRoutes.aiRentIntelligence },
  "Market Radar Signal": { to: productRoutes.marketRadar },
  "Deal Lens": { to: productRoutes.dealLens },
  "About Us": { to: "/", state: { scrollTo: "#about" } },
  Contact: { to: "/contact" },
  "Privacy Policy": { to: "/privacy-policy" },
  "Terms of Use": { to: "/terms-of-use" },
  LinkedIn: { href: "https://www.linkedin.com/company/asset72/" },
  Email: { href: "mailto:asset72@ghills.ai" },
};

const footerIcons: Record<string, typeof Linkedin> = {
  LinkedIn: Linkedin,
  Email: Mail,
};

const Footer = () => {
  return (
    <footer className="relative overflow-hidden text-background" style={{ background: "linear-gradient(180deg, #0c1a3a 0%, #0f2045 50%, #0c1a3a 100%)" }}>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_12%_18%,rgba(30,188,154,0.16),transparent_24%),radial-gradient(circle_at_88%_12%,rgba(78,122,214,0.18),transparent_22%)]" />
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/18 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-[1.45fr_0.9fr_0.9fr_0.9fr_0.9fr]">
          <div className="rounded-[30px] border border-white/10 bg-white/[0.04] p-7 backdrop-blur">
            <img
              src={asset72FooterLogo}
              alt="Asset72"
              className="-mb-5 h-[7rem] w-auto max-w-[26rem] object-contain"
            />
            <p className="mt-2 max-w-sm text-sm leading-7 text-background/62">
              Analyze in Minutes. Act with Conviction
            </p>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-background/40">Platform</div>
                <div className="mt-1 text-sm font-semibold text-white/90">Institutional-grade analytics</div>
              </div>
              <div className="rounded-2xl border border-white/8 bg-white/[0.03] px-4 py-3">
                <div className="text-[10px] uppercase tracking-[0.24em] text-background/40">Coverage</div>
                <div className="mt-1 text-sm font-semibold text-white/90">Portfolio, market, and deals</div>
              </div>
            </div>
          </div>

          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category} className="pt-2">
              <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-widest text-background/78">
                {category}
              </h4>

              {category === "Platforms" ? (
                <div className="space-y-3">
                  {links.map((link) => {
                    const Icon = footerIcons[link];
                    const route = footerRoutes[link];

                    return (
                      <a
                        key={link}
                        href={route?.href}
                        target="_blank"
                        rel="noopener noreferrer"
                        title={link}
                        className="group flex items-center justify-between rounded-2xl border border-white/10 bg-white/[0.04] px-4 py-3 text-background/68 transition-all duration-300 hover:border-white/20 hover:bg-white/[0.07] hover:text-white"
                      >
                        <span className="flex items-center gap-3 text-sm">
                          <Icon size={16} />
                          {link}
                        </span>
                        <ArrowUpRight className="h-4 w-4 opacity-60 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
                      </a>
                    );
                  })}
                </div>
              ) : (
                <ul className="space-y-3">
                  {links.map((link) => (
                    <li key={link}>
                      {footerRoutes[link]?.to ? (
                        <Link
                          to={footerRoutes[link].to}
                          state={footerRoutes[link].state}
                          className="group inline-flex items-center gap-2 text-sm text-background/55 transition-colors hover:text-background"
                        >
                          <span>{link}</span>
                          <ArrowUpRight className="h-3.5 w-3.5 opacity-0 transition-all duration-300 group-hover:opacity-70" />
                        </Link>
                      ) : (
                        <span className="text-sm text-background/55">{link}</span>
                      )}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/10 pt-8 text-sm text-background/40 md:flex-row md:items-center md:justify-between">
          <p>Copyright 2026 Asset72. All rights reserved.</p>
          <p>Portfolio intelligence for modern real estate.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
