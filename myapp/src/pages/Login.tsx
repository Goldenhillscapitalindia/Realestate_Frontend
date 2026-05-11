import { FormEvent, useEffect, useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { setAuthSession, setAuthUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import PasswordInput from "@/components/auth/PasswordInput";
import { setDemoMode } from "@/lib/demo-mode";

const REMEMBERED_LOGIN_KEY = "remembered_login_identifier";
const API_URL = import.meta.env.VITE_API_URL;

const Login = () => {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState("");

  const [password, setPassword] = useState("");
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getApiErrorMessage = (fallback: string, err: unknown): string => {
    if (axios.isAxiosError(err)) {
      const data = err.response?.data;
      if (typeof data === "string" && data.trim()) return data;
      if (data && typeof data === "object") {
        const first = Object.values(data)[0];
        if (Array.isArray(first) && first.length && typeof first[0] === "string") {
          return first[0];
        }
        if (typeof first === "string") return first;
      }
    }
    if (err instanceof Error && err.message) return err.message;
    return fallback;
  };

  const handleSignIn = async (event: FormEvent) => {
    event.preventDefault();

    if (!identifier.trim() || !password.trim()) {
      setError("Please enter email/username and password.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const response = await axios.post(
        `${API_URL}/api/auth/login/`,
        {
          identifier: identifier.trim(),
          password: password.trim(),
        },
        {
          withCredentials: true,
        },
      );

      const responseData = response.data ?? {};
      const user = responseData.user;
      const accessToken = responseData.tokens?.access;
      const sessionId = responseData.session_id;

      if (!user || !accessToken || !sessionId) {
        throw new Error("Invalid login response from server.");
      }

      if (rememberMe) {
        window.localStorage.setItem(REMEMBERED_LOGIN_KEY, identifier.trim());
      } else {
        window.localStorage.removeItem(REMEMBERED_LOGIN_KEY);
      }

      setAuthSession({
        accessToken,
        sessionId,
        user,
      });
      setAuthUser(user);
      setDemoMode(false);

      navigate("/", { replace: true });
    } catch (err) {
      setError(getApiErrorMessage("Login failed. Please try again.", err));
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    const rememberedIdentifier = window.localStorage.getItem(REMEMBERED_LOGIN_KEY);
    if (rememberedIdentifier) {
      setIdentifier(rememberedIdentifier);
      setRememberMe(true);
    }
  }, []);

  const glassInputClass =
    "h-12 border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 transition-colors duration-150 hover:border-slate-400 focus-visible:border-[#5a68bf] focus-visible:ring-0 focus-visible:ring-offset-0 focus-visible:shadow-none";

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      <main className="relative flex min-h-[calc(100vh-360px)] items-center justify-center overflow-hidden px-6 pb-16 pt-28">
        <div
          className="absolute inset-0"
          style={{
            backgroundImage:
              "linear-gradient(180deg, #eef2f8 0%, #e9eef6 100%)",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-[#dbe4f2]/70" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage:
              "radial-gradient(circle at 20% 20%, rgba(59,130,246,0.14), transparent 35%), radial-gradient(circle at 80% 75%, rgba(99,102,241,0.12), transparent 38%)",
          }}
        />
        <div className="absolute left-[-120px] top-[8%] h-72 w-72 rounded-full bg-sky-200/35 blur-3xl" />
        <div className="absolute right-[-120px] top-[35%] h-80 w-80 rounded-full bg-indigo-200/35 blur-3xl" />

        <div className="font-auth relative z-10 w-full max-w-[560px] rounded-3xl border border-white/50 bg-white/60 p-8 shadow-[0_18px_45px_rgba(15,23,42,0.18)] ring-1 ring-white/35 backdrop-blur-xl sm:p-10">
          <h1 className="mb-7 text-center text-2xl font-semibold tracking-tight text-[#3a4da5]">
            Login to Continue
          </h1>

          <form onSubmit={handleSignIn} className="space-y-5">
            <Input
              className={glassInputClass}
              type="text"
              placeholder="Email or Username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              disabled={isSubmitting}
            />

            <PasswordInput
              className={glassInputClass}
              placeholder="Password"
              value={password}
              onChange={setPassword}
              disabled={isSubmitting}
            />
            {/* <div className="flex items-center justify-between text-sm">
              <label className="inline-flex items-center gap-2 text-slate-600">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-slate-300 text-[#1e2f73] focus:ring-[#1e2f73]"
                  checked={rememberMe}
                  disabled={isSubmitting}
                  onChange={(e) => setRememberMe(e.target.checked)}
                />
                Remember me
              </label>
              <button
                type="button"
                className="font-medium text-[#c24150] hover:underline"
                disabled={isSubmitting}
                onClick={() => {
                  setForgotOpen(true);
                  setForgotError("");
                  setForgotSuccess("");
                  setForgotEmail(identifier);
                }}
              >
                Forgot Password?
              </button>
            </div> */}

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <Button
                type="button"
                variant="outline"
                className="border-[#D1D5DB] bg-[#F3F4F6] text-[#374151] hover:bg-[#E5E7EB]"
                disabled={isSubmitting}
                onClick={() => {
                  setError("");
                  navigate("/");
                }}
              >
                Cancel
              </Button>
              <Button
                className="bg-[#1e2f73] text-white hover:bg-[#233889]"
                type="submit"
                disabled={isSubmitting}
              >
                Sign in
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-sm text-slate-500">
            Use the login credentials provided by the admin to access this application.
          </div>
        </div>
      </main>
      <Footer />
    </div>

  );
};

export default Login;
