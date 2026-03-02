import { Toaster } from "./components/ui/toaster";
import { Toaster as Sonner } from "./components/ui/sonner";
import { TooltipProvider } from "./components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import NotFound from "./pages/NotFound";
import MarketRadar from "./components/market_radar/MarketRadar";
import MarketRadarView from "./components/market-radar-view/components/MarketRadarView";
import PfDemo from "./components/portfolio_intelligence/pf_demo";
import PfPropertyInsights from "./components/portfolio_intelligence/pf_property_insights";
import RealEstateUploader from "./components/deal_lens/RealEstateUploader";
import Login from "./pages/Login";
import Signup from "./pages/Signup";
import Logout from "./pages/Logout";
import ProtectedRoute from "./components/ProtectedRoute";


const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />
          <Route path="/logout" element={<Logout />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
          <Route
            path="/portfolio_intelligence"
            element={
              <ProtectedRoute>
                <PfDemo />
              </ProtectedRoute>
            }
          />
          <Route
            path="/portfolio_intelligence/property-insights"
            element={
              <ProtectedRoute>
                <PfPropertyInsights />
              </ProtectedRoute>
            }
          />
          <Route
            path="/market_radar"
            element={
              <ProtectedRoute>
                <MarketRadar />
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
          <Route
            path="/deal_lens"
            element={
              <ProtectedRoute>
                <RealEstateUploader />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
