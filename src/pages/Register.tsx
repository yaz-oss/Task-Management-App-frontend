import { useState, useEffect } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";
import {Eye,EyeOff,LockKeyhole,Mail,Moon,ShieldCheck,Sparkles,Sun,User,UserPlus,} from "lucide-react";
import API from "../api/axios";

function Register() {
  const navigate = useNavigate();

  const [darkMode, setDarkMode] = useState(() =>
    localStorage.getItem("theme") === "dark"
  );
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    localStorage.removeItem("username");
  }, []);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      await API.post("/api/auth/register", {
        username,
        email,
        password,
      });

      alert("Registration successful");
      navigate("/");
    } catch (error: unknown) {
      const message = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      alert(message || "Registration failed");
    }
  };

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  return (
    <main
      className={`theme-app min-h-screen overflow-hidden ${
        darkMode
          ? "dark bg-[#030712] text-white"
          : "bg-gradient-to-br from-emerald-50 via-sky-50 to-fuchsia-50 text-slate-950"
      }`}
    >
      <div className="relative flex min-h-screen items-center justify-center px-4 py-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_15%_18%,rgba(16,185,129,0.25),transparent_30%),radial-gradient(circle_at_82%_22%,rgba(14,165,233,0.22),transparent_28%),radial-gradient(circle_at_55%_88%,rgba(217,70,239,0.18),transparent_32%)]" />
        <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08)_25%,transparent_25%,transparent_50%,rgba(255,255,255,0.08)_50%,rgba(255,255,255,0.08)_75%,transparent_75%,transparent)] bg-[length:28px_28px] opacity-20" />

        <section className="relative grid w-full max-w-5xl overflow-hidden rounded-[28px] border border-white/20 bg-white/[0.12] shadow-2xl shadow-slate-950/30 backdrop-blur-2xl lg:grid-cols-[0.95fr_1.05fr]">
          <div
            className={`p-6 sm:p-10 ${
              darkMode ? "bg-slate-950/[0.72]" : "bg-white/[0.82]"
            }`}
          >
            <div className="mb-8 flex items-center justify-between">
              <div>
                <p className="text-sm font-semibold uppercase text-emerald-500">
                  New workspace
                </p>
                <h2 className="mt-2 text-3xl font-semibold tracking-normal">
                  Register
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

            <form onSubmit={handleRegister} className="space-y-5">
              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Username</span>
                <span
                  className={`flex h-12 items-center rounded-2xl border px-4 transition focus-within:border-emerald-400 ${
                    darkMode
                      ? "border-white/[0.12] bg-white/[0.08]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <User size={18} className="text-emerald-500" />
                  <input
                    type="text"
                    placeholder="Username"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    required
                    className="ml-3 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
                  />
                </span>
              </label>

              <label className="block">
                <span className="mb-2 block text-sm font-semibold">Email</span>
                <span
                  className={`flex h-12 items-center rounded-2xl border px-4 transition focus-within:border-emerald-400 ${
                    darkMode
                      ? "border-white/[0.12] bg-white/[0.08]"
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
                  className={`flex h-12 items-center rounded-2xl border px-4 transition focus-within:border-emerald-400 ${
                    darkMode
                      ? "border-white/[0.12] bg-white/[0.08]"
                      : "border-slate-200 bg-white"
                  }`}
                >
                  <LockKeyhole size={18} className="text-fuchsia-500" />
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
                    className="ml-2 rounded-xl p-1.5 text-slate-400 transition hover:bg-slate-500/10 hover:text-emerald-500"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </span>
              </label>

              <button
                type="submit"
                className="flex h-12 w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-emerald-500 via-sky-500 to-fuchsia-500 text-sm font-bold text-white shadow-lg shadow-emerald-500/25 transition hover:scale-[1.01]"
              >
                <UserPlus size={18} />
                Register
              </button>

              <button
                type="button"
                onClick={() => {
                  window.location.href = `${API.defaults.baseURL}/api/auth/google`;
                }}
                className={`flex h-12 w-full items-center justify-center gap-3 rounded-2xl border text-sm font-bold transition ${
                  darkMode
                    ? "border-emerald-400/25 bg-slate-950 text-slate-100 shadow-lg shadow-emerald-500/10 hover:bg-slate-900"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <img
                  src="https://developers.google.com/identity/images/g-logo.png"
                  alt="Google"
                  className="h-5 w-5"
                />
                Register with Google
              </button>
            </form>

            <p
              className={`mt-7 text-center text-sm ${
                darkMode ? "text-slate-300" : "text-slate-500"
              }`}
            >
              Already have an account?
              <Link to="/" className="ml-2 font-semibold text-emerald-500">
                Login
              </Link>
            </p>
          </div>

          <div className="hidden min-h-[620px] flex-col justify-between bg-gradient-to-br from-emerald-500 via-sky-600 to-fuchsia-500 p-10 text-white lg:flex">
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/[0.18] ring-1 ring-white/25">
                <ShieldCheck size={25} />
              </div>
              <div>
                <h1 className="text-2xl font-semibold">TaskFlow</h1>
                <p className="text-sm text-white/75">Build your workspace</p>
              </div>
            </div>

            <div>
              <p className="inline-flex items-center gap-2 rounded-full bg-white/[0.14] px-3 py-1 text-sm font-semibold ring-1 ring-white/20">
                <Sparkles size={15} />
                Start fresh
              </p>
              <h2 className="mt-5 max-w-md text-5xl font-semibold leading-tight tracking-normal">
                Create an account that feels ready for real work.
              </h2>
              <p className="mt-5 max-w-md text-base leading-7 text-white/[0.78]">
                Join the task manager with a cleaner, brighter registration
                flow and the same backend inputs already in use.
              </p>
            </div>

            <div className="grid grid-cols-3 gap-3 text-sm">
              {["Simple", "Bright", "Ready"].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl bg-white/[0.12] px-4 py-3 font-semibold ring-1 ring-white/15"
                >
                  {item}
                </div>
              ))}
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}

export default Register;
