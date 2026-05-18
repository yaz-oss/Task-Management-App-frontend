import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Sun,
} from "lucide-react";
import API from "../api/axios";

type TaskStatus = "todo" | "in-progress" | "pending" | "completed";

type TaskType = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  status?: TaskStatus;
  createdAt?: string;
  assignedByAdmin?: boolean;
};

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [message, setMessage] = useState("");
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") !== "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchTasks = useCallback(async () => {
    if (!token) return;

    try {
      const response = await API.get<TaskType[]>(
        "/api/tasks",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      if (apiMessage?.toLowerCase().includes("blocked")) {
        localStorage.clear();
        navigate("/", {
          state: {
            message: "You are blocked by admin",
          },
        });
        return;
      }

      setMessage(apiMessage || "Could not load tasks");
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchTasks();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchTasks, navigate, token]);

  const taskStatus = (task: TaskType): TaskStatus => {
    if (task.status) return task.status;
    return task.completed ? "completed" : "todo";
  };

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((task) => taskStatus(task) === "completed").length;

    return {
      total,
      todo: tasks.filter((task) => taskStatus(task) === "todo").length,
      progress: tasks.filter((task) => taskStatus(task) === "in-progress").length,
      pending: tasks.filter((task) => taskStatus(task) === "pending").length,
      completed,
      assigned: tasks.filter((task) => task.assignedByAdmin).length,
      rate: total ? Math.round((completed / total) * 100) : 0,
    };
  }, [tasks]);

  const recentTask = tasks[0];


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
          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3 text-sm font-semibold text-sky-950 ring-1 ring-sky-100"
            onClick={() => navigate("/dashboard")}
          >
            <ClipboardList size={18} />
            Dashboard
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/tasks")}
          >
            <Activity size={18} />
            Tasks (CRUD)
          </div>

          <div
            className="flex cursor-pointer items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-slate-700 hover:bg-slate-50"
            onClick={() => navigate("/organizer")}
          >
            <LayoutDashboard size={18} />
            Task Organizer
          </div>
        </nav>

        <div className="mt-8 rounded-2xl border border-sky-100 bg-gradient-to-br from-sky-50 via-white to-emerald-50 p-4 dark-panel">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Completion</span>
            <span className="font-semibold">{stats.rate}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-sky-500 to-emerald-400"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {stats.completed} of {stats.total} tasks completed.
          </p>
        </div>

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
              <h2 className="text-xl font-semibold">User dashboard</h2>
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
                className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 lg:hidden"
              >
                <LogOut size={17} />
                Logout
              </button>
            </div>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-6 overflow-hidden rounded-3xl border border-sky-100 bg-gradient-to-br from-white via-sky-50 to-emerald-50 shadow-sm dark-panel">
            <div className="grid gap-5 p-6 lg:grid-cols-[minmax(0,1fr)_260px] lg:items-center">
              <div>
                <p className="text-sm font-semibold uppercase text-emerald-600">
                  Smart task control
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                  Clear work, calm progress.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Create, update, and finish your own tasks while keeping admin
                  assignments easy to spot.
                </p>
              </div>
              <div className="rounded-2xl border border-emerald-200 bg-white/80 p-4 shadow-lg shadow-emerald-200/30 dark-panel-soft">
                <p className="text-sm font-medium text-emerald-700">Next focus</p>
                <p className="mt-2 line-clamp-2 text-lg font-semibold text-sky-950">
                  {recentTask ? recentTask.title : "No task yet"}
                </p>
              </div>
            </div>
          </section>

          {message && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {message}
            </div>
          )}

          <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
            <Stat tone="sky" label="Todo" value={stats.todo} />
            <Stat tone="violet" label="In progress" value={stats.progress} />
            <Stat tone="emerald" label="Done" value={stats.completed} />
            <Stat tone="amber" label="Admin assigned" value={stats.assigned} />
          </section>

          <section className="mt-6 space-y-6">
            <div className="grid gap-4 xl:grid-cols-2">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase text-emerald-600">Task manager</p>
                <h2 className="mt-3 text-xl font-semibold">Create, update, and remove tasks</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Use the task manager page when you need full CRUD controls and a simple task list.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/tasks")}
                  className="mt-6 inline-flex items-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to Task CRUD
                </button>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <p className="text-sm font-semibold uppercase text-sky-600">Task organizer</p>
                <h2 className="mt-3 text-xl font-semibold">Plan with status columns</h2>
                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Open the organizer to see tasks grouped by progress and move them between stages.
                </p>
                <button
                  type="button"
                  onClick={() => navigate("/organizer")}
                  className="mt-6 inline-flex items-center rounded-xl bg-slate-950 px-4 py-3 text-sm font-semibold text-white transition hover:bg-slate-800"
                >
                  Go to Task Organizer
                </button>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
              <h2 className="text-lg font-semibold">Dashboard summary</h2>
              <p className="mt-2 text-sm text-slate-500">
                Your main dashboard now keeps things light: use the dedicated pages above for full task control.
              </p>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

function Stat({
  label,
  value,
  tone,
}: {
  label: string;
  value: number;
  tone: "sky" | "violet" | "emerald" | "amber";
}) {
  const accents = {
    sky: {
      bar: "from-sky-500 to-cyan-400",
      text: "text-sky-700",
    },
    violet: {
      bar: "from-violet-500 to-fuchsia-400",
      text: "text-violet-700",
    },
    emerald: {
      bar: "from-emerald-500 to-teal-400",
      text: "text-emerald-700",
    },
    amber: {
      bar: "from-amber-500 to-orange-400",
      text: "text-amber-700",
    },
  };

  return (
    <div className="rounded-2xl border border-white/70 bg-white/[0.86] p-4 shadow-sm backdrop-blur transition hover:-translate-y-0.5 hover:shadow-lg">
      <div
        className={`mb-4 h-1.5 w-16 rounded-full bg-gradient-to-r ${accents[tone].bar}`}
      />
      <p className={`text-sm font-semibold ${accents[tone].text}`}>
        {label}
      </p>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

export default Dashboard;
