import { useCallback, useEffect, useMemo, useState } from "react";
import type { FormEvent } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Activity,
  Check,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Moon,
  Pencil,
  Plus,
  Search,
  ShieldCheck,
  Sun,
  Trash2,
  X,
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

const TASKS_PER_PAGE = 9;

function Dashboard() {
  const navigate = useNavigate();
  const username = localStorage.getItem("username") || "there";
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | TaskStatus>("all");
  const [page, setPage] = useState(1);
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

  const filteredTasks = useMemo(() => {
    const search = query.trim().toLowerCase();

    return tasks.filter((task) => {
      const matchesSearch =
        !search ||
        task.title.toLowerCase().includes(search) ||
        task.description.toLowerCase().includes(search);
      const matchesStatus =
        statusFilter === "all" || taskStatus(task) === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [query, statusFilter, tasks]);

  const pageCount = Math.max(1, Math.ceil(filteredTasks.length / TASKS_PER_PAGE));
  const safePage = Math.min(page, pageCount);
  const visibleTasks = filteredTasks.slice(
    (safePage - 1) * TASKS_PER_PAGE,
    safePage * TASKS_PER_PAGE
  );
  const recentTask = filteredTasks[0];

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
  };

  const saveTask = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!title.trim() || !description.trim()) return;

    try {
      if (editingId) {
        await API.put(
          `/api/tasks/${editingId}`,
          {
            title: title.trim(),
            description: description.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessage("Task updated");
      } else {
        await API.post(
          "/api/tasks",
          {
            title: title.trim(),
            description: description.trim(),
          },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        setMessage("Task created");
      }

      resetForm();
      setPage(1);
      void fetchTasks();
    } catch {
      setMessage("Could not save task");
    }
  };

  const changeStatus = async (task: TaskType, status: TaskStatus) => {
    try {
      await API.put(
        `/api/tasks/${task.id}`,
        {
          status,
          completed: status === "completed",
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      void fetchTasks();
    } catch {
      setMessage("Could not update task status");
    }
  };

  const deleteTask = async (id: number) => {
    try {
      await API.delete(`/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("Task deleted");
      void fetchTasks();
    } catch {
      setMessage("Could not delete task");
    }
  };

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
          <div className="flex items-center gap-3 rounded-xl bg-gradient-to-r from-sky-50 to-emerald-50 px-4 py-3 text-sm font-semibold text-sky-950 ring-1 ring-sky-100">
            <ClipboardList size={18} />
            Dashboard
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

          <section className="mt-6 grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
            <form
              onSubmit={saveTask}
              className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:self-start"
            >
              <div className="mb-5 flex items-start justify-between gap-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    {editingId ? "Edit task" : "Create task"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Keep the task clear and easy to act on.
                  </p>
                </div>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex h-9 w-9 items-center justify-center rounded-xl border border-slate-200 text-slate-500 transition hover:bg-slate-100"
                  >
                    <X size={17} />
                  </button>
                )}
              </div>

              <input
                value={title}
                onChange={(event) => setTitle(event.target.value)}
                placeholder="Task title"
                className="h-12 w-full rounded-xl border border-slate-300 bg-white px-4 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500"
              />
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Task description"
                rows={5}
                className="mt-4 w-full resize-none rounded-xl border border-slate-300 bg-white px-4 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-sky-500"
              />
              <button
                type="submit"
                className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:opacity-90"
              >
                {editingId ? <Check size={18} /> : <Plus size={18} />}
                {editingId ? "Update task" : "Create task"}
              </button>
            </form>

            <section className="min-w-0 rounded-3xl border border-slate-200 bg-white shadow-sm">
              <div className="grid gap-4 border-b border-slate-200 p-5 lg:grid-cols-[1fr_220px_190px] lg:items-end">
                <div>
                  <h2 className="text-lg font-semibold">Tasks</h2>
                  <p className="mt-1 text-sm text-slate-500">
                    Organized and paginated for large lists.
                  </p>
                </div>
                <div className="flex h-11 items-center rounded-xl border border-slate-300 px-3 focus-within:border-sky-500">
                  <Search size={16} className="text-slate-400" />
                  <input
                    value={query}
                    onChange={(event) => {
                      setQuery(event.target.value);
                      setPage(1);
                    }}
                    placeholder="Search"
                    className="ml-2 w-full bg-transparent text-sm outline-none"
                  />
                </div>
                <select
                  value={statusFilter}
                  onChange={(event) => {
                    setStatusFilter(event.target.value as "all" | TaskStatus);
                    setPage(1);
                  }}
                  className="h-11 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500"
                >
                  <option value="all">All statuses</option>
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Done</option>
                </select>
              </div>

              <div className="divide-y divide-slate-100">
                {visibleTasks.map((task) => (
                  <article
                    key={task.id}
                    className="grid gap-4 p-5 transition hover:bg-slate-50 lg:grid-cols-[minmax(0,1fr)_170px_190px] lg:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="break-words font-semibold">{task.title}</h3>
                        {task.assignedByAdmin && (
                          <span className="inline-flex items-center gap-1.5 rounded-xl bg-amber-50 px-2 py-1 text-xs font-semibold text-amber-700 ring-1 ring-amber-200">
                            <ShieldCheck size={13} />
                            Admin
                          </span>
                        )}
                      </div>
                      <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                        {task.description}
                      </p>
                    </div>

                    <div className="flex flex-col gap-2">
                      <StatusBadge status={taskStatus(task)} />
                      <select
                        value={taskStatus(task)}
                        onChange={(event) =>
                          changeStatus(task, event.target.value as TaskStatus)
                        }
                        className="h-10 rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-sky-500"
                      >
                        <option value="todo">Todo</option>
                        <option value="in-progress">In progress</option>
                        <option value="pending">Pending</option>
                        <option value="completed">Done</option>
                      </select>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => changeStatus(task, "completed")}
                        className="flex h-10 items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 transition hover:bg-emerald-100"
                      >
                        <Check size={16} />
                        Done
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setEditingId(task.id);
                          setTitle(task.title);
                          setDescription(task.description);
                        }}
                        className="flex h-10 items-center gap-2 rounded-xl border border-sky-200 bg-sky-50 px-3 text-sm font-semibold text-sky-700 transition hover:bg-sky-100"
                      >
                        <Pencil size={16} />
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteTask(task.id)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>

              {filteredTasks.length === 0 && (
                <div className="p-10 text-center text-sm text-slate-500">
                  No tasks found.
                </div>
              )}

              {filteredTasks.length > TASKS_PER_PAGE && (
                <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                  <p className="text-sm text-slate-500">
                    Page {safePage} of {pageCount} · {filteredTasks.length} tasks
                  </p>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setPage((value) => Math.max(1, value - 1))}
                      disabled={safePage === 1}
                      className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      Previous
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setPage((value) => Math.min(pageCount, value + 1))
                      }
                      disabled={safePage === pageCount}
                      className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                    >
                      Next
                    </button>
                  </div>
                </div>
              )}
            </section>
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

function StatusBadge({ status }: { status: TaskStatus }) {
  const styles: Record<TaskStatus, string> = {
    todo: "bg-sky-50 text-sky-700 ring-sky-200",
    "in-progress": "bg-violet-50 text-violet-700 ring-violet-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  const labels: Record<TaskStatus, string> = {
    todo: "Todo",
    "in-progress": "Progress",
    pending: "Pending",
    completed: "Done",
  };

  return (
    <span
      className={`flex w-fit items-center gap-1.5 rounded-xl px-2.5 py-1 text-xs font-semibold ring-1 ${styles[status]}`}
    >
      {status === "in-progress" && <Activity size={12} />}
      {status === "completed" && <Check size={12} />}
      {labels[status]}
    </span>
  );
}

export default Dashboard;
