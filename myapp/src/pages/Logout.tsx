import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { clearUserLogin } from "@/lib/auth";

const Logout = () => {
  const navigate = useNavigate();

  useEffect(() => {
    clearUserLogin();
  }, []);

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-360px)] items-center justify-center overflow-hidden px-6 pb-16 pt-28">
        <div
          className="absolute inset-0"
          style={{ backgroundImage: "linear-gradient(180deg, #eef2f8 0%, #e9eef6 100%)" }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#dbe4f2]/70" />
        <div className="relative z-10 w-full max-w-md rounded-3xl border border-white/50 bg-white/70 p-8 text-center shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-white/35 backdrop-blur-xl">
          <h1 className="font-auth text-3xl font-semibold tracking-tight text-[#3a4da5]">Logged Out</h1>
          <p className="mt-3 text-slate-600">
            You have been signed out successfully.
          </p>
          <Button
            className="mt-6 bg-[#1e2f73] text-white hover:bg-[#233889]"
            onClick={() => navigate("/login")}
          >
            Go to Login
          </Button>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Logout;
