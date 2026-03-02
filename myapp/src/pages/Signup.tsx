import { FormEvent, useCallback, useEffect, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import axios from "axios";
import { setAuthSession, setAuthUser } from "@/lib/auth";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { loadGoogleScript } from "@/lib/google/loadGoogleScript";
import {
  createNonce,
  decodeGoogleIdToken,
} from "@/lib/google/googleAuth";
import {
  googleLoginRequest,
  meRequest,
  signupRequest,
} from "@/lib/auth-api";
import PasswordInput from "@/components/auth/PasswordInput";

const Signup = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const fromPath = (location.state as { from?: string } | null)?.from ?? "/portfolio_intelligence";
  const googleButtonRef = useRef<HTMLDivElement | null>(null);
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [googleReady, setGoogleReady] = useState(false);
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

  const handleSignUp = async (event: FormEvent) => {
    event.preventDefault();
    if (!username.trim() || !email.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setIsSubmitting(true);
      setError("");

      const auth = await signupRequest({
        username,
        email,
        password,
        confirmPassword,
      });
      setAuthSession({
        accessToken: auth.accessToken,
        sessionId: auth.sessionId,
        user: auth.user ?? undefined,
      });

      const me = await meRequest({
        token: auth.accessToken,
        sessionId: auth.sessionId,
      });
      setAuthUser(me);

      navigate(fromPath, { replace: true });
    } catch (err) {
      setError(getApiErrorMessage("Sign up failed. Please try again.", err));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleGoogleSuccess = useCallback(
    async (idToken: string) => {
      try {
        setIsSubmitting(true);
        setError("");

        const decodedProfile = decodeGoogleIdToken(idToken);
        window.sessionStorage.setItem("google_id_token", idToken);
        window.sessionStorage.setItem("google_user_profile", JSON.stringify(decodedProfile));

        const googleAuth = await googleLoginRequest(idToken);
        setAuthSession({
          accessToken: googleAuth.accessToken,
          sessionId: googleAuth.sessionId,
          user: googleAuth.user ?? undefined,
        });

        const me = await meRequest({
          token: googleAuth.accessToken,
          sessionId: googleAuth.sessionId,
        });
        setAuthUser(me);

        navigate(fromPath, { replace: true });
      } catch (err) {
        setError(getApiErrorMessage("Google login failed. Please try again.", err));
      } finally {
        setIsSubmitting(false);
      }
    },
    [fromPath, navigate],
  );

  useEffect(() => {
    const clientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;
    if (!clientId) {
      setError("Google client ID is missing. Add VITE_GOOGLE_CLIENT_ID in .env");
      return;
    }

    let active = true;

    const init = async () => {
      try {
        await loadGoogleScript();
        if (!active || !window.google?.accounts?.id || !googleButtonRef.current) {
          return;
        }

        googleButtonRef.current.innerHTML = "";
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: async (response) => {
            if (!response.credential) {
              setError("Google login failed. Please try again.");
              return;
            }
            await handleGoogleSuccess(response.credential);
          },
          ux_mode: "popup",
          auto_select: false,
          nonce: createNonce(),
        });

        window.google.accounts.id.renderButton(googleButtonRef.current, {
          type: "standard",
          theme: "outline",
          size: "large",
          text: "continue_with",
          shape: "rectangular",
          logo_alignment: "left",
          width: 420,
        });

        setGoogleReady(true);
      } catch {
        if (active) {
          setError("Unable to load Google login. Please refresh and try again.");
        }
      }
    };

    init();

    return () => {
      active = false;
    };
  }, [handleGoogleSuccess]);

  const glassInputClass =
    "border-slate-300 bg-white text-slate-800 placeholder:text-slate-400 focus-visible:border-[#2b57b8] focus-visible:ring-[#2b57b8]";

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

        <div className="relative z-10 w-full max-w-xl rounded-3xl border border-slate-200 bg-white/95 p-7 shadow-xl backdrop-blur-sm sm:p-10">
          <h1 className="mb-6 text-center text-2xl font-bold text-[#1e2f73]">Sign up</h1>

          <form onSubmit={handleSignUp} className="space-y-4">
            <Input
              className={glassInputClass}
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
            <Input
              className={glassInputClass}
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isSubmitting}
            />
            <PasswordInput
              className={glassInputClass}
              placeholder="Create Password"
              value={password}
              onChange={setPassword}
              disabled={isSubmitting}
            />
            <PasswordInput
              className={glassInputClass}
              placeholder="Re-enter Password"
              value={confirmPassword}
              onChange={setConfirmPassword}
              disabled={isSubmitting}
            />

            {error ? <p className="text-sm text-red-600">{error}</p> : null}

            <div className="grid grid-cols-2 gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                className="border-slate-300 bg-white text-slate-700 hover:bg-slate-50"
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
                Sign up
              </Button>
            </div>
          </form>

          <div className="mt-5 text-center text-sm text-slate-600">
            Already signed in?{" "}
            <button
              type="button"
              className="font-semibold text-[#2b57b8] hover:underline"
              disabled={isSubmitting}
              onClick={() => {
                setError("");
                navigate("/login", {
                  state: { from: fromPath },
                });
              }}
            >
              Sign in
            </button>
          </div>

          <div className="mt-4 mb-4 flex items-center gap-3">
            <span className="h-px flex-1 bg-slate-300" />
            <span className="text-xs font-medium uppercase tracking-wider text-slate-500">OR</span>
            <span className="h-px flex-1 bg-slate-300" />
          </div>

          <div className="flex w-full justify-center">
            <div ref={googleButtonRef} />
          </div>
          {!googleReady ? (
            <p className="mt-2 text-center text-xs text-slate-500">Loading Google sign-in...</p>
          ) : null}
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Signup;
