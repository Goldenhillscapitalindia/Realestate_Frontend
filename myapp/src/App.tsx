import { useEffect } from "react";
import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Routes, Route, useLocation } from "react-router";
import { Helmet, HelmetProvider } from "react-helmet-async";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import Contact from "./pages/Contact";
import Privacy from "./pages/Privacy";
import TermsOfUse from "./pages/TermsOfUse";
import ProtectedRoute from "./components/ProtectedRoute";
import { autoLogin } from "./lib/auth-api";
import { productRoutes } from "./lib/product-routes";
import MarketRadarView from "./components/market-radar-view/components/MarketRadarView";
import PfDemo from "./components/portfolio_intelligence/pf_demo";
import PfPropertyInsights from "./components/portfolio_intelligence/pf_property_insights";

const queryClient = new QueryClient();
const SITE_URL = "https://asset72.ghills.ai";
const noindexRoutePrefixes = ["/market_radar_view/"];
const noindexRoutePaths = new Set([
  "/ic_memo",
  "/login",
  "/signup",
  "/logout",
  `${productRoutes.portfolioIntelligence}/property-insights`,
  `${productRoutes.propertyIntelligence}/property-insights`,
]);

const RouteSeoManager = () => {
  const location = useLocation();
  const isNoindexRoute =
    noindexRoutePaths.has(location.pathname) ||
    noindexRoutePrefixes.some((prefix) => location.pathname.startsWith(prefix));

  if (!isNoindexRoute) {
    return null;
  }

  return (
    <Helmet>
      <meta name="robots" content="noindex, nofollow, noarchive" />
      <link rel="canonical" href={`${SITE_URL}/`} />
      <meta property="og:url" content={`${SITE_URL}/`} />
    </Helmet>
  );
};

const App = () => {
  useEffect(() => {
    console.log("App loaded - running autoLogin");
    autoLogin();
  }, []);
  return (
  <HelmetProvider>
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <RouteSeoManager />
        <Toaster />
        <Sonner />
        <Routes>
        <Route path="/" element={<Index />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/logout" element={<Logout />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/privacy-policy" element={<Privacy />} />
        <Route path="/terms-of-use" element={<TermsOfUse />} />
        <Route
          path={`${productRoutes.portfolioIntelligence}/*`}
          element={<PfDemo />}
        />
        <Route
          path={`${productRoutes.propertyIntelligence}/*`}
          element={<PfDemo />}
        />
        <Route
          path={productRoutes.aiRentIntelligence}
          element={<PfDemo />}
        />
        <Route
          path={productRoutes.marketRadar}
          element={<PfDemo />}
        />
        <Route
          path={`${productRoutes.dealLens}/*`}
          element={<PfDemo />}
        />
        <Route
          path={`${productRoutes.portfolioIntelligence}/property-insights`}
          element={
            <ProtectedRoute>
              <PfPropertyInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path={`${productRoutes.propertyIntelligence}/property-insights`}
          element={
            <ProtectedRoute>
              <PfPropertyInsights />
            </ProtectedRoute>
          }
        />
        <Route
          path="/ic_memo"
          element={
            <ProtectedRoute>
              <PfDemo />
            </ProtectedRoute>
          }
        />
        <Route
          path="/market_radar_view/:sub_market_name"
          element={
            <ProtectedRoute>
              <MarketRadarView />
            </ProtectedRoute>
          }
        />
        {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
        <Route path="*" element={<NotFound />} />
        </Routes>
      </TooltipProvider>
    </QueryClientProvider>
  </HelmetProvider>
  );
};

export default App;
