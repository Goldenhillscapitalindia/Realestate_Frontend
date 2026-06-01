import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router";
import AccessBlockedModal from "./AccessBlockedModal";
import { isUserLoggedIn } from "@/lib/auth";
import { isDemoMode } from "@/lib/demo-mode";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  if (typeof window === "undefined") {
    return <>{children}</>;
  }

  const navigate = useNavigate();
  const location = useLocation();
  const hasAccess = isUserLoggedIn() || isDemoMode();
  const [isModalOpen, setIsModalOpen] = useState(!hasAccess);

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <div className="relative min-h-screen">
      <AccessBlockedModal
        open={isModalOpen}
        onOpenChange={setIsModalOpen}
        onGoToLogin={() =>
          navigate("/login", {
            state: { from: `${location.pathname}${location.search}${location.hash}` },
          })
        }
      />
    </div>
  );
};

export default ProtectedRoute;
