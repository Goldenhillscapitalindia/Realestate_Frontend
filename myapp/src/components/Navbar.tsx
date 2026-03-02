import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Menu, X } from "lucide-react";
import AccessBlockedModal from "./AccessBlockedModal";
import { useLoginGuard } from "@/hooks/use-login-guard";
import { clearUserLogin, getAccessToken, isUserLoggedIn } from "@/lib/auth";
import { logoutRequest } from "@/lib/auth-api";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "AI Intelligence", href: "#ai" },
  { label: "Why Vertex", href: "#why" },
];

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isUserLoggedIn());
  const { isModalOpen, setIsModalOpen, guardNavigation, goToLogin } = useLoginGuard();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuthState = () => setLoggedIn(isUserLoggedIn());
    window.addEventListener("storage", syncAuthState);
    window.addEventListener("focus", syncAuthState);
    document.addEventListener("visibilitychange", syncAuthState);
    syncAuthState();

    return () => {
      window.removeEventListener("storage", syncAuthState);
      window.removeEventListener("focus", syncAuthState);
      document.removeEventListener("visibilitychange", syncAuthState);
    };
  }, []);

  const handleLogout = async () => {
    const token = getAccessToken();
    try {
      if (token) {
        await logoutRequest(token);
      }
    } finally {
      clearUserLogin();
      setLoggedIn(false);
      navigate("/");
    }
  };

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-card/90 backdrop-blur-lg border-b border-border shadow-sm"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between px-6 h-16 lg:h-18">
        <a href="#" className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-display font-bold text-sm">V</span>
          </div>
          <span className="font-display font-bold text-lg text-foreground">Vertex AI</span>
        </a>

        {/* Desktop Nav */}
        <div className="hidden lg:flex items-center gap-8">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="text-m font-medium text-[#2b0f66] hover:text-foreground transition-colors relative after:absolute after:bottom-[-4px] after:left-0 after:w-0 after:h-[2px] after:bg-accent after:transition-all hover:after:w-full"
              onClick={(event) => {
                if (!loggedIn) {
                  event.preventDefault();
                  setIsModalOpen(true);
                }
              }}
            >
              {link.label}
            </a>
          ))}
        </div>

        <div className="hidden lg:flex items-center gap-3">
          <Button
            variant="hero"
            size="default"
            onClick={() => guardNavigation("/portfolio_intelligence")}
          >
            Demo
          </Button>
          <Button
            variant="heroOutline"
            size="default"
            onClick={() => (loggedIn ? handleLogout() : navigate("/login"))}
          >
            {loggedIn ? "Logout" : "Login"}
          </Button>
        </div>

        {/* Mobile Toggle */}
        <button
          className="lg:hidden text-foreground"
          onClick={() => setMobileOpen(!mobileOpen)}
        >
          {mobileOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      {mobileOpen && (
        <div className="lg:hidden bg-card border-b border-border px-6 pb-6 space-y-4">
          {navLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              className="block text-sm font-medium text-muted-foreground hover:text-foreground"
              onClick={(event) => {
                if (!loggedIn) {
                  event.preventDefault();
                  setIsModalOpen(true);
                }
                setMobileOpen(false);
              }}
            >
              {link.label}
            </a>
          ))}
          <Button
            variant="hero"
            size="lg"
            className="w-full"
            onClick={() => {
              setMobileOpen(false);
              guardNavigation("/portfolio_intelligence");
            }}
          >
            Request a Demo
          </Button>
          <Button
            variant="heroOutline"
            size="lg"
            className="w-full"
            onClick={() => {
              setMobileOpen(false);
              if (loggedIn) {
                void handleLogout();
              } else {
                navigate("/login");
              }
            }}
          >
            {loggedIn ? "Logout" : "Login"}
          </Button>
        </div>
      )}

      <AccessBlockedModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onGoToLogin={goToLogin}
      />
    </nav>
  );
};

export default Navbar;
