import React, { useState } from "react";
import { Button } from "@/components/ui/button.tsx";
import { AlertCircle } from "lucide-react";
import { signInWithPopup } from "firebase/auth";
import { auth, googleProvider } from "@/utils/firebase.ts";
import api from "@/utils/axios.ts";
import { useDispatch } from "react-redux";
import { setUserdata } from "@/redux/userSlice.ts";

export const Login: React.FC = () => {
  const dispatch = useDispatch();
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    setError(null);
    setLoading(true);
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const token = await result.user.getIdToken();
      const { data } = await api.post("/api/auth/login", { token });
      dispatch(setUserdata(data.user));
    } catch (err: any) {
      setError(
        err?.response?.data?.message ||
          err?.message ||
          "An unexpected error occurred during sign-in.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 text-slate-100 font-sans">
      {/* Background Gradients */}
      <div className="absolute inset-0 z-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-950 via-slate-950 to-slate-950" />
      <div className="absolute top-1/4 left-1/4 h-96 w-96 rounded-full bg-violet-600/10 blur-[120px] pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 h-96 w-96 rounded-full bg-blue-600/10 blur-[120px] pointer-events-none" />

      {/* Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-35" />

      {/* Card Content */}
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="rounded-2xl border border-slate-800 bg-slate-900/60 backdrop-blur-xl p-8 shadow-2xl transition-all duration-300">
          
          {/* Header */}
          <div className="mb-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/20">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-6 w-6 text-white"
              >
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
              </svg>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-slate-400 bg-clip-text text-transparent">
              Nexus AI
            </h1>
            <p className="mt-2 text-sm text-slate-400">
              Orchestrate your multi-agent workflows
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <div className="mb-6 flex items-start gap-3 rounded-lg border border-red-500/30 bg-red-500/10 p-4 text-sm text-red-200">
              <AlertCircle className="h-5 w-5 shrink-0 text-red-400" />
              <div>{error}</div>
            </div>
          )}

          {/* Actions */}
          <div className="space-y-4">
            <Button
              onClick={handleLogin}
              disabled={loading}
              className="w-full flex items-center justify-center gap-3 bg-white text-slate-950 hover:bg-slate-200 active:scale-[0.98] transition-all py-6 rounded-xl font-semibold shadow-md shadow-white/5 cursor-pointer"
            >
              {loading ? (
                <svg
                  className="animate-spin h-5 w-5 text-slate-950"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="4"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
              ) : (
                <svg
                  className="h-5 w-5"
                  viewBox="0 0 24 24"
                  width="24"
                  height="24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <g transform="matrix(1, 0, 0, 1, 0, 0)">
                    <path
                      d="M21.35,11.1H12v2.7h5.38c-0.24,1.28 -0.96,2.37 -2.05,3.1v2.58h3.31c1.94,-1.78 3.06,-4.41 3.06,-7.48c0,-0.6 -0.05,-1.18 -0.15,-1.72Z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12,20.5c2.3,0 4.22,-0.76 5.64,-2.07l-3.31,-2.58c-0.92,0.62 -2.1,0.99 -3.53,0.99c-2.72,0 -5.02,-1.84 -5.84,-4.3H1.54v2.66c1.44,2.86 4.38,4.73 7.78,4.73Z"
                      fill="#34A853"
                    />
                    <path
                      d="M6.16,12.54c-0.21,-0.62 -0.33,-1.28 -0.33,-1.96s0.12,-1.34 0.33,-1.96V5.96H1.54C0.84,7.36 0.44,8.93 0.44,10.58s0.4,3.22 1.1,4.62l4.62,-2.66Z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12,5.16c1.25,0 2.37,0.43 3.25,1.27l2.44,-2.44C16.22,2.65 14.3,2 12,2C8.6,2 5.66,3.87 4.22,6.73l4.62,2.66c0.82,-2.46 3.12,-4.3 5.84,-4.3Z"
                      fill="#EA4335"
                    />
                  </g>
                </svg>
              )}
              Continue with Google
            </Button>
          </div>

          <div className="mt-8 text-center text-xs text-slate-500">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </div>
        </div>
      </div>
    </div>
  );
};
export default Login;
