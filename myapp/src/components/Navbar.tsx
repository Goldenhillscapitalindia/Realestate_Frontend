import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { LogOut, Menu, X } from "lucide-react";
import AccessBlockedModal from "./AccessBlockedModal";
import { useLoginGuard } from "@/hooks/use-login-guard";
import {
  clearUserLogin,
  getAccessToken,
  getAuthUser,
  isUserLoggedIn,
} from "@/lib/auth";
import { logoutRequest } from "@/lib/auth-api";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

const navLinks = [
  { label: "Platform", href: "#platform" },
  { label: "Solutions", href: "#solutions" },
  { label: "Use Cases", href: "#use-cases" },
  { label: "AI Intelligence", href: "#ai" },
  { label: "Why Vertex", href: "#why" },
];

const profileAvatarThemes = [
  { bg: "bg-[#0f6d84]", hover: "hover:bg-[#0c5b6f]" }, // teal
  { bg: "bg-[#1e2f73]", hover: "hover:bg-[#1a285f]" }, // navy
  { bg: "bg-[#2b4fa3]", hover: "hover:bg-[#24448d]" }, // royal blue
  { bg: "bg-[#365b7e]", hover: "hover:bg-[#2f4f6d]" }, // steel blue
  { bg: "bg-[#5a3f9e]", hover: "hover:bg-[#4e3588]" }, // indigo
  { bg: "bg-[#0f766e]", hover: "hover:bg-[#0d635c]" }, // emerald-teal
];

const getAvatarTheme = (value: string) => {
  if (!value) return profileAvatarThemes[0];
  let hash = 0;
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) % 2147483647;
  }
  return profileAvatarThemes[Math.abs(hash) % profileAvatarThemes.length];
};

const Navbar = () => {
  const navigate = useNavigate();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggedIn, setLoggedIn] = useState(isUserLoggedIn());
  const [profileName, setProfileName] = useState("User");
  const [logoutDialogOpen, setLogoutDialogOpen] = useState(false);
  const { isModalOpen, setIsModalOpen, guardNavigation, goToLogin } = useLoginGuard();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const syncAuthState = () => {
      setLoggedIn(isUserLoggedIn());
      const user = getAuthUser();
      const nameValue =
        (typeof user?.username === "string" && user.username) ||
        (typeof user?.name === "string" && user.name) ||
        (typeof user?.email === "string" && user.email) ||
        "User";
      setProfileName(nameValue);
    };
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
      setProfileName("User");
      setLogoutDialogOpen(false);
      navigate("/logout");
    }
  };

  const profileInitial = profileName.trim().charAt(0).toUpperCase() || "U";
  const profileTheme = getAvatarTheme(profileName.trim().toLowerCase());

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
          {loggedIn ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button
                  type="button"
                  className={`flex h-11 w-11 items-center justify-center rounded-full text-xl font-semibold text-white transition-colors ${profileTheme.bg} ${profileTheme.hover}`}
                  aria-label="Open profile menu"
                >
                  {profileInitial}
                </button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuLabel className="truncate">{profileName}</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem
                  onClick={() => setLogoutDialogOpen(true)}
                  className="cursor-pointer text-red-600 focus:text-red-600"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button
              variant="heroOutline"
              size="default"
              onClick={() => navigate("/login")}
            >
              Login
            </Button>
          )}
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
                setLogoutDialogOpen(true);
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
      <AlertDialog open={logoutDialogOpen} onOpenChange={setLogoutDialogOpen}>
        <AlertDialogContent className="max-w-[520px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-2xl font-semibold text-slate-900">
              Sign out of Vertex Real Estate?
            </AlertDialogTitle>
            <AlertDialogDescription className="text-base leading-relaxed text-slate-600">
              You are currently signed in as{" "}
              <span className="font-semibold text-slate-900">{profileName}</span>. You will need to log in again to continue.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>CANCEL</AlertDialogCancel>
            <AlertDialogAction
              className="bg-red-600 text-white hover:bg-red-700"
              onClick={() => {
                void handleLogout();
              }}
            >
              SIGN OUT
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </nav>
  );
};

export default Navbar;
