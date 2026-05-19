import { useEffect, useState } from "react";
import axios from "axios";
import { Link, useLocation, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
  Moon,
  ShieldCheck,
  Sparkles,
  Sun,
} from "lucide-react";
import API from "../api/axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const blockedMessage =
    (location.state as { message?: string } | null)?.message || "";
  const rememberedEmail = localStorage.getItem("rememberedEmail") || "";

  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );
  const [email, setEmail] = useState(rememberedEmail);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(Boolean(rememberedEmail));
  const [message, setMessage] = useState(blockedMessage);

  useEffect(() => {
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    if (blockedMessage) {
      window.history.replaceState({}, document.title);
      return;
    }

    if (!token) return;

    navigate(role === "admin" ? "/admin" : "/dashboard", { replace: true });
  }, [blockedMessage, navigate]);

  useEffect(() => {
    // persist theme choice so dashboard and other pages honor it
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await API.post("/api/auth/login", {
        email,
        password,
      });

      setMessage("");
      localStorage.setItem("token", response.data.token);
      localStorage.setItem("role", response.data.role);

      if (response.data.username) {
        localStorage.setItem("username", response.data.username);
      }

      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }

      navigate(response.data.role === "admin" ? "/admin" : "/dashboard");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      setMessage(message || "Login failed");
    }
  };

  return (
    <main
      className={`theme-app min-h-screen overflow-hidden ${
        darkMode
          ? "dark bg-[#111b38] text-slate-100"
          : "bg-gradient-to-br from-rose-50 via-sky-50 to-emerald-50 text-slate-950"
      }`}
    >
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(14,165,233,0.25),transparent_30%),radial-gradient(circle_at_84%_18%,rgba(244,114,182,0.22),transparent_28%),radial-gradient(circle_at_55%_85%,rgba(16,185,129,0.2),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] bg-[length:28px_28px] opacity-20" />

        <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-white/[0.12] shadow-2xl shadow-slate-950/30 backdrop-blur-2xl lg:grid-cols-[1.05fr_0.95fr]">
          <div className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-sky-500 via-indigo-600 to-emerald-500 p-10 text-white lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.18] ring-1 ring-white/25">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">TaskFlow</h1>
                <p className="text-sm text-white/75">Secure workspace login</p>
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.14] px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
                <Sparkles size={15} />
                Welcome back
              </p>
              <h2 className="mt-5 max-w-md text-5xl font-semibold leading-tight tracking-normal">
                Sign in and keep your work moving beautifully.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/[0.78]">
                A cleaner entrance for your task manager, with quick access for
                users and admins.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Fast", "Protected", "Focused"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/[0.12] px-4 py-3 font-semibold ring-1 ring-white/15"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>

          <div
            className={`p-6 sm:p-10 ${
              darkMode
                ? "bg-slate-900/75 border border-slate-800/50"
                : "bg-white/[0.82]"
            } rounded-[24px] shadow-2xl shadow-slate-950/10`}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-sky-500">
                  Account access
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                  Login
                </h2>
              </div>
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => setDarkMode((value) => !value)}
                className={`flex h-11 w-11 items-center justify-center rounded-2xl border transition ${
                  darkMode
                    ? "border-white/15 bg-white/10 text-amber-200 hover:bg-white/15"
                    : "border-slate-200 bg-white text-slate-700 hover:bg-slate-100"
                }`}
              >
                {darkMode ? <Sun size={19} /> : <Moon size={19} />}
              </button>
            </div>

            <form onSubmit={handleLogin} className="space-y-5">
              {message && (
                <div
                  className={`rounded-2xl border px-4 py-3 text-sm font-semibold ${
                    message.toLowerCase().includes("blocked")
                      ? "border-red-300 bg-red-50 text-red-700"
                      : darkMode
                        ? "border-amber-400/30 bg-amber-400/10 text-amber-100"
                        : "border-amber-200 bg-amber-50 text-amber-700"
                  }`}
                >
                  {message}
                </div>
              )}

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <span
                  className={`flex h-12 items-center rounded-2xl border px-4 transition focus-within:border-sky-400 ${
                    darkMode
                      ? "border-slate-700/60 bg-slate-900/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <Mail size={18} className="text-sky-500" />
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Password</span>
                <span
                  className={`flex h-12 items-center rounded-2xl border px-4 transition focus-within:border-sky-400 ${
                    darkMode
                      ? "border-slate-700/60 bg-slate-900/40"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <LockKeyhole size={18} className="text-emerald-500" />
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                    onClick={() => setShowPassword((value) => !value)}
                    className="ml-2 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-500/10 hover:text-sky-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
                <label className="flex cursor-pointer items-center gap-2 font-semibold">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="h-4 w-4 rounded border-slate-300 accent-sky-500"
                  />
                  Remember me
                </label>
                <Link to="/register" className="font-semibold text-sky-500">
                  Create account
                </Link>
              </div>

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center rounded-2xl bg-gradient-to-r from-sky-500 via-indigo-500 to-emerald-500 text-sm font-bold text-white shadow-lg shadow-sky-500/25 transition hover:scale-[1.01]"
              >
                Login
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${API.defaults.baseURL}/api/auth/google`;
                }}
                className={`flex h-12 w-full items-center justify-center gap-3 rounded-2xl border text-sm font-bold transition ${
                  darkMode
                    ? "border-sky-400/20 bg-slate-900/70 text-slate-100 shadow-lg shadow-sky-500/10 hover:bg-slate-800"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="h-5 w-5"
                />
                Login with Google
              </button>
            </form>

            <p
              className={`mt-7 text-center text-sm ${
                darkMode ? "text-slate-300" : "text-slate-500"
              }`}
            >
              Don't have an account?
              <Link to="/register" className="ml-2 font-semibold text-sky-500">
                Register
              </Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Login;
