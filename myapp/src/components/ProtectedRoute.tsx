import type { ReactNode } from "react";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AccessBlockedModal from "./AccessBlockedModal";
import { isUserLoggedIn } from "@/lib/auth";

type ProtectedRouteProps = {
  children: ReactNode;
};

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isModalOpen, setIsModalOpen] = useState(!isUserLoggedIn());

  if (isUserLoggedIn()) {
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
