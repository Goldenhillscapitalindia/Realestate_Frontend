const footerLinks = {
  Product: [
    "Vertex Intelligence Platform",
    "Portfolio Intelligence",
    "Market Radar Signal",
    "Deal Lens",
  ],
  Company: ["About", "Blog & Insights", "Careers", "Contact"],
  Legal: ["Privacy Policy", "Terms of Use"],
};

const Footer = () => {
  return (
    <footer className="bg-foreground text-background">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
                <span className="text-accent-foreground font-display font-bold text-sm">V</span>
              </div>
              <span className="font-display font-bold text-lg">Vertex</span>
            </div>
            <p className="text-sm text-background/60 leading-relaxed">
              Intelligence that moves real estate decisions forward.
            </p>
          </div>

          {/* Links */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h4 className="font-display font-semibold text-sm uppercase tracking-widest mb-4 text-background/80">
                {category}
              </h4>
              <ul className="space-y-2.5">
                {links.map((link) => (
                  <li key={link}>
                    <a
                      href="#"
                      className="text-sm text-background/50 hover:text-background transition-colors"
                    >
                      {link}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-background/10 mt-12 pt-8">
          <p className="text-sm text-background/40 text-center">
            © 2026 Vertex Real Estate. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;