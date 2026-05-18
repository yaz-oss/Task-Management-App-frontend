import { useEffect, useState, type ReactNode } from "react";
import { NavLink, useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";

type DashboardLayoutProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

const navItems = [
  {
    path: "/dashboard",
    label: "Dashboard",
    icon: <ClipboardList size={18} />,
  },
  {
    path: "/dashboard/tasks",
    label: "Tasks",
    icon: <Activity size={18} />,
  },
  {
    path: "/dashboard/organizer",
    label: "Organizer",
    icon: <LayoutDashboard size={18} />,
  },
];

function DashboardLayout({ title, subtitle, children }: DashboardLayoutProps) {
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") !== "light"
  );
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      className={`theme-app min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#ecfeff_34%,#f0fdf4_68%,#fff7ed_100%)] text-slate-950 ${
        darkMode ? "dark" : ""
      }`}
    >
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white/[0.92] px-5 py-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-sky-500 to-teal-400 text-white shadow-lg shadow-sky-500/25">
            <LayoutDashboard size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">TaskFlow</h1>
            <p className="text-sm text-slate-500">Personal workspace</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {navItems.map((item) => {
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.path === "/dashboard"}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                    isActive
                      ? "bg-gradient-to-r from-sky-50 to-emerald-50 text-sky-950 ring-1 ring-sky-100"
                      : "text-slate-700 hover:bg-slate-50"
                  }`
                }
              >
                {item.icon}
                {item.label}
              </NavLink>
            );
          })}
        </nav>

        <div className="mt-auto space-y-3">
          <button
            type="button"
            onClick={() => setDarkMode((value) => !value)}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
          >
            {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            {darkMode ? "Light mode" : "Dark mode"}
          </button>
          <button
            type="button"
            onClick={logout}
            className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:opacity-90"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </aside>

      <div className="lg:pl-72">
        <header className="sticky top-0 z-20 border-b border-slate-200 bg-white/[0.82] backdrop-blur-xl">
          <div className="flex min-h-16 items-center justify-between gap-4 px-4 py-3 sm:px-6 lg:px-8">
            <div>
              <p className="text-sm text-slate-500">Welcome back, {username}</p>
              <h2 className="text-xl font-semibold">{title}</h2>
              {subtitle && <p className="text-sm text-slate-500">{subtitle}</p>}
            </div>
            <div className="flex gap-2">
              <button
                type="button"
                aria-label="Toggle theme"
                onClick={() => setDarkMode((value) => !value)}
                className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
              >
                {darkMode ? <Sun size={18} /> : <Moon size={18} />}
              </button>
              <button
                type="button"
                onClick={logout}
                className="hidden h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:flex"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </header>
        <main className="px-4 py-6 sm:px-6 lg:px-8">{children}</main>
      </div>
    </div>
  );
}

export default DashboardLayout;
