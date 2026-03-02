import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { isUserLoggedIn } from "@/lib/auth";

export const useLoginGuard = () => {
  const navigate = useNavigate();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [requestedPath, setRequestedPath] = useState<string>("/");

  const guardNavigation = (path: string) => {
    if (isUserLoggedIn()) {
      navigate(path);
      return;
    }

    setRequestedPath(path);
    setIsModalOpen(true);
  };

  const goToLogin = () => {
    setIsModalOpen(false);
    navigate("/login", { state: { from: requestedPath } });
  };

  return {
    isModalOpen,
    setIsModalOpen,
    guardNavigation,
    goToLogin,
  };
};
