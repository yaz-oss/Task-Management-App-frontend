import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import {
  Ban,
  CheckCircle2,
  ClipboardList,
  LayoutDashboard,
  LogOut,
  Mail,
  Moon,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sun,
  Trash2,
  UserCheck,
  Users,
} from "lucide-react";
import API from "../api/axios";

interface Task {
  id: number;
  title: string;
  description: string;
  completed: boolean;
  status?: "todo" | "in-progress" | "pending" | "completed";
  createdAt: string;
  assignedByAdmin?: boolean;
}

interface User {
  id: number;
  username: string;
  email: string;
  role: string;
  blocked: boolean;
  Tasks: Task[];
}

type TaskWithUser = Task & {
  username: string;
  userEmail: string;
};

const TASKS_PER_PAGE = 8;

function AdminDashboard() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [users, setUsers] = useState<User[]>([]);
  const [search, setSearch] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [taskPage, setTaskPage] = useState(1);
  const [activePage, setActivePage] = useState("dashboard");
  const [assignedUserId, setAssignedUserId] = useState("");
  const [assignTitle, setAssignTitle] = useState("");
  const [assignDescription, setAssignDescription] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [darkMode, setDarkMode] = useState(
    () => localStorage.getItem("theme") !== "light"
  );

  useEffect(() => {
    localStorage.setItem("theme", darkMode ? "dark" : "light");
  }, [darkMode]);

  const fetchUsers = useCallback(async () => {
    if (!token) return;

    setLoading(true);

    try {
      const response = await API.get<User[]>(
        "/api/admin/users",
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setUsers(response.data);
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

      setMessage(apiMessage || "Could not load users");
    } finally {
      setLoading(false);
    }
  }, [navigate, token]);

  useEffect(() => {
    if (!token) {
      navigate("/");
      return;
    }

    const timeout = window.setTimeout(() => {
      void fetchUsers();
    }, 0);

    return () => window.clearTimeout(timeout);
  }, [fetchUsers, navigate, token]);

  const normalUsers = useMemo(
    () => users.filter((user) => user.role !== "admin"),
    [users]
  );

  const filteredUsers = useMemo(() => {
    const value = search.trim().toLowerCase();

    if (!value) return normalUsers;

    return normalUsers.filter(
      (user) =>
        user.username.toLowerCase().includes(value) ||
        user.email.toLowerCase().includes(value)
    );
  }, [normalUsers, search]);

  const allTasks = useMemo<TaskWithUser[]>(
    () =>
      normalUsers.flatMap((user) =>
        user.Tasks.map((task) => ({
          ...task,
          username: user.username,
          userEmail: user.email,
        }))
      ),
    [normalUsers]
  );

  const stats = useMemo(() => {
    const completed = allTasks.filter(
      (task) => (task.status || (task.completed ? "completed" : "todo")) === "completed"
    ).length;

    return {
      users: normalUsers.length,
      blocked: normalUsers.filter((user) => user.blocked).length,
      tasks: allTasks.length,
      assigned: allTasks.filter((task) => task.assignedByAdmin).length,
      completed,
      rate: allTasks.length ? Math.round((completed / allTasks.length) * 100) : 0,
    };
  }, [allTasks, normalUsers]);

  const filteredTasks = useMemo(() => {
    const value = taskSearch.trim().toLowerCase();

    if (!value) return allTasks;

    return allTasks.filter(
      (task) =>
        task.title.toLowerCase().includes(value) ||
        task.description.toLowerCase().includes(value) ||
        task.username.toLowerCase().includes(value) ||
        task.userEmail.toLowerCase().includes(value)
    );
  }, [allTasks, taskSearch]);

  const taskPageCount = Math.max(
    1,
    Math.ceil(filteredTasks.length / TASKS_PER_PAGE)
  );
  const safeTaskPage = Math.min(taskPage, taskPageCount);
  const visibleTasks = filteredTasks.slice(
    (safeTaskPage - 1) * TASKS_PER_PAGE,
    safeTaskPage * TASKS_PER_PAGE
  );

  const deleteUser = async (id: number) => {
    try {
      await API.delete(`/api/admin/user/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      setMessage("User deleted");
      void fetchUsers();
    } catch {
      setMessage("Could not delete user");
    }
  };

  const blockUser = async (id: number) => {
    try {
      const response = await API.put<{ message: string }>(
        `/api/admin/user/${id}/block`,
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setMessage(response.data.message);
      void fetchUsers();
    } catch {
      setMessage("Could not update user");
    }
  };

  const assignTask = async () => {
    if (!assignedUserId || !assignTitle.trim() || !assignDescription.trim()) {
      setMessage("Select a user and enter task details");
      return;
    }

    try {
      await API.post(
        "/api/admin/task/assign",
        {
          userId: Number(assignedUserId),
          title: assignTitle.trim(),
          description: assignDescription.trim(),
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      setAssignedUserId("");
      setAssignTitle("");
      setAssignDescription("");
      setTaskPage(1);
      setMessage("Task assigned");
      void fetchUsers();
    } catch {
      setMessage("Could not assign task");
    }
  };

  const logout = () => {
    localStorage.clear();
    navigate("/");
  };

  return (
    <div
      className={`theme-app min-h-screen bg-[linear-gradient(135deg,#f8fafc_0%,#eef2ff_32%,#ecfeff_66%,#fff1f2_100%)] text-slate-950 ${
        darkMode ? "dark" : ""
      }`}
    >
      <aside className="fixed inset-y-0 left-0 hidden w-72 border-r border-slate-200 bg-white/[0.92] px-5 py-6 shadow-xl shadow-slate-200/40 backdrop-blur-xl lg:flex lg:flex-col">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-sky-500 text-white shadow-lg shadow-indigo-500/25">
            <Shield size={24} />
          </div>
          <div>
            <h1 className="text-xl font-semibold">Admin Panel</h1>
            <p className="text-sm text-slate-500">Manage users and tasks</p>
          </div>
        </div>

        <nav className="mt-8 space-y-2">
          {[
            { key: "dashboard", label: "Dashboard", icon: LayoutDashboard },
            { key: "users", label: "Users", icon: Users },
            { key: "tasks", label: "Tasks", icon: ClipboardList },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <button
                key={item.key}
                type="button"
                onClick={() => setActivePage(item.key)}
                className={
                  activePage === item.key
                    ? "flex h-11 w-full items-center gap-3 rounded-xl bg-gradient-to-r from-indigo-500 to-sky-500 px-4 text-sm font-semibold text-white shadow-lg shadow-indigo-500/20"
                    : "flex h-11 w-full items-center gap-3 rounded-xl px-4 text-sm font-semibold text-slate-600 transition hover:bg-indigo-50 hover:text-indigo-700"
                }
              >
                <Icon size={18} />
                {item.label}
              </button>
            );
          })}
        </nav>

        <div className="mt-8 rounded-2xl border border-indigo-100 bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-4 dark-panel">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-500">Completion</span>
            <span className="font-semibold">{stats.rate}%</span>
          </div>
          <div className="mt-3 h-2 overflow-hidden rounded-full bg-slate-100">
            <div
              className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-emerald-400"
              style={{ width: `${stats.rate}%` }}
            />
          </div>
          <p className="mt-3 text-xs text-slate-500">
            {stats.completed} of {stats.tasks} tasks completed.
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
              <p className="text-sm text-slate-500">TaskFlow administration</p>
              <h2 className="text-xl font-semibold capitalize">{activePage}</h2>
            </div>
            <button
              type="button"
              aria-label="Toggle theme"
              onClick={() => setDarkMode((value) => !value)}
              className="flex h-10 w-10 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-100"
            >
              {darkMode ? <Sun size={18} /> : <Moon size={18} />}
            </button>
          </div>
        </header>

        <main className="px-4 py-6 sm:px-6 lg:px-8">
          <section className="mb-6 overflow-hidden rounded-3xl border border-indigo-100 bg-gradient-to-br from-white via-indigo-50 to-cyan-50 shadow-sm dark-panel">
            <div className="p-6">
              <div>
                <p className="text-sm font-semibold uppercase text-indigo-600">
                  Admin workspace
                </p>
                <h1 className="mt-2 text-3xl font-semibold tracking-normal">
                  Organized control for people and work.
                </h1>
                <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-500">
                  Assign tasks, monitor progress, and manage access from one
                  clean dashboard.
                </p>
              </div>
            </div>
          </section>

          {message && (
            <div className="mb-5 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-sm font-semibold text-blue-700">
              {message}
            </div>
          )}

          {activePage === "dashboard" && (
            <section className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
                <StatCard icon={Users} label="Users" value={stats.users} />
                <StatCard icon={Ban} label="Blocked" value={stats.blocked} />
                <StatCard icon={ClipboardList} label="Tasks" value={stats.tasks} />
                <StatCard icon={CheckCircle2} label="Done" value={stats.completed} />
              </div>

              <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_360px]">
                <TaskList tasks={allTasks.slice(0, 6)} loading={loading} />
                <AssignPanel
                  users={normalUsers}
                  assignedUserId={assignedUserId}
                  assignTitle={assignTitle}
                  assignDescription={assignDescription}
                  setAssignedUserId={setAssignedUserId}
                  setAssignTitle={setAssignTitle}
                  setAssignDescription={setAssignDescription}
                  assignTask={assignTask}
                />
              </div>
            </section>
          )}

          {activePage === "users" && (
            <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
              <PanelHeader
                title="Users"
                subtitle="Search, block, unblock, or remove user accounts."
                value={search}
                onChange={setSearch}
                placeholder="Search users"
              />

              <div className="divide-y divide-slate-100">
                {filteredUsers.map((user) => (
                  <article
                    key={user.id}
                    className="grid gap-4 p-5 lg:grid-cols-[1fr_auto] lg:items-center"
                  >
                    <div className="flex min-w-0 items-center gap-4">
                      <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-slate-950 text-lg font-semibold text-white">
                        {user.username.charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <h3 className="break-words font-semibold">
                            {user.username}
                          </h3>
                          <span
                            className={
                              user.blocked
                                ? "rounded-xl bg-red-50 px-2.5 py-1 text-xs font-semibold text-red-700 ring-1 ring-red-200"
                                : "rounded-xl bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700 ring-1 ring-emerald-200"
                            }
                          >
                            {user.blocked ? "Blocked" : "Active"}
                          </span>
                        </div>
                        <p className="mt-1 flex items-center gap-2 break-all text-sm text-slate-500">
                          <Mail size={15} />
                          {user.email}
                        </p>
                        <p className="mt-1 text-sm text-slate-500">
                          {user.Tasks.length} tasks
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-wrap gap-2 lg:justify-end">
                      <button
                        type="button"
                        onClick={() => blockUser(user.id)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-slate-200 bg-white px-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
                      >
                        {user.blocked ? <UserCheck size={16} /> : <Ban size={16} />}
                        {user.blocked ? "Unblock" : "Block"}
                      </button>
                      <button
                        type="button"
                        onClick={() => deleteUser(user.id)}
                        className="flex h-10 items-center gap-2 rounded-xl border border-red-200 bg-white px-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
                      >
                        <Trash2 size={16} />
                        Delete
                      </button>
                    </div>
                  </article>
                ))}
              </div>
            </section>
          )}

          {activePage === "tasks" && (
            <section className="grid gap-6 xl:grid-cols-[360px_minmax(0,1fr)]">
              <AssignPanel
                users={normalUsers}
                assignedUserId={assignedUserId}
                assignTitle={assignTitle}
                assignDescription={assignDescription}
                setAssignedUserId={setAssignedUserId}
                setAssignTitle={setAssignTitle}
                setAssignDescription={setAssignDescription}
                assignTask={assignTask}
              />

              <section className="rounded-3xl border border-slate-200 bg-white shadow-sm">
                <PanelHeader
                  title="All tasks"
                  subtitle="Paginated for large workloads."
                  value={taskSearch}
                  onChange={(value) => {
                    setTaskSearch(value);
                    setTaskPage(1);
                  }}
                  placeholder="Search tasks"
                />
                <TaskList tasks={visibleTasks} loading={loading} />

                {filteredTasks.length > TASKS_PER_PAGE && (
                  <div className="flex flex-col gap-3 border-t border-slate-200 p-5 sm:flex-row sm:items-center sm:justify-between">
                    <p className="text-sm text-slate-500">
                      Page {safeTaskPage} of {taskPageCount} ·{" "}
                      {filteredTasks.length} tasks
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setTaskPage((value) => Math.max(1, value - 1))
                        }
                        disabled={safeTaskPage === 1}
                        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        Previous
                      </button>
                      <button
                        type="button"
                        onClick={() =>
                          setTaskPage((value) =>
                            Math.min(taskPageCount, value + 1)
                          )
                        }
                        disabled={safeTaskPage === taskPageCount}
                        className="h-10 rounded-xl border border-slate-200 px-4 text-sm font-semibold text-slate-700 transition hover:bg-slate-100 disabled:opacity-40"
                      >
                        Next
                      </button>
                    </div>
                  </div>
                )}
              </section>
            </section>
          )}
        </main>
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
}: {
  icon: typeof Users;
  label: string;
  value: number;
}) {
  const accents: Record<string, { card: string; icon: string }> = {
    Users: {
      card: "from-indigo-50 to-white border-indigo-100",
      icon: "text-indigo-600 bg-indigo-100",
    },
    Blocked: {
      card: "from-rose-50 to-white border-rose-100",
      icon: "text-rose-600 bg-rose-100",
    },
    Tasks: {
      card: "from-cyan-50 to-white border-cyan-100",
      icon: "text-cyan-600 bg-cyan-100",
    },
    Done: {
      card: "from-emerald-50 to-white border-emerald-100",
      icon: "text-emerald-600 bg-emerald-100",
    },
  };
  const accent = accents[label] || accents.Users;

  return (
    <div
      className={`rounded-2xl border bg-gradient-to-br p-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-lg ${accent.card}`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium text-slate-500">{label}</span>
        <span
          className={`flex h-10 w-10 items-center justify-center rounded-2xl ${accent.icon}`}
        >
          <Icon size={20} />
        </span>
      </div>
      <p className="mt-3 text-3xl font-semibold">{value}</p>
    </div>
  );
}

function PanelHeader({
  title,
  subtitle,
  value,
  onChange,
  placeholder,
}: {
  title: string;
  subtitle: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  return (
    <div className="flex flex-col gap-4 border-b border-slate-200 p-5 lg:flex-row lg:items-end lg:justify-between">
      <div>
        <h2 className="text-lg font-semibold">{title}</h2>
        <p className="mt-1 text-sm text-slate-500">{subtitle}</p>
      </div>
      <div className="flex h-11 w-full items-center rounded-xl border border-slate-300 px-3 focus-within:border-indigo-500 lg:w-80">
        <Search size={16} className="text-slate-400" />
        <input
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={placeholder}
          className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
        />
      </div>
    </div>
  );
}

function AssignPanel({
  users,
  assignedUserId,
  assignTitle,
  assignDescription,
  setAssignedUserId,
  setAssignTitle,
  setAssignDescription,
  assignTask,
}: {
  users: User[];
  assignedUserId: string;
  assignTitle: string;
  assignDescription: string;
  setAssignedUserId: (value: string) => void;
  setAssignTitle: (value: string) => void;
  setAssignDescription: (value: string) => void;
  assignTask: () => void;
}) {
  return (
    <section className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm xl:sticky xl:top-24 xl:self-start">
      <h2 className="text-lg font-semibold">Assign task</h2>
      <p className="mt-1 text-sm text-slate-500">
        Send a clear task directly to a user dashboard.
      </p>

      <select
        value={assignedUserId}
        onChange={(event) => setAssignedUserId(event.target.value)}
        className="mt-5 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none focus:border-indigo-500"
      >
        <option value="">Select user</option>
        {users.map((user) => (
          <option key={user.id} value={user.id} disabled={user.blocked}>
            {user.username}
            {user.blocked ? " (blocked)" : ""}
          </option>
        ))}
      </select>

      <input
        value={assignTitle}
        onChange={(event) => setAssignTitle(event.target.value)}
        placeholder="Task title"
        className="mt-4 h-11 w-full rounded-xl border border-slate-300 bg-white px-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500"
      />

      <textarea
        value={assignDescription}
        onChange={(event) => setAssignDescription(event.target.value)}
        placeholder="Task instructions"
        rows={5}
        className="mt-4 w-full resize-none rounded-xl border border-slate-300 bg-white px-3 py-3 text-sm outline-none placeholder:text-slate-400 focus:border-indigo-500"
      />

      <button
        type="button"
        onClick={assignTask}
        className="mt-5 flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 text-sm font-semibold text-white transition hover:opacity-90"
      >
        <Send size={17} />
        Assign task
      </button>
    </section>
  );
}

function TaskList({
  tasks,
  loading,
}: {
  tasks: TaskWithUser[];
  loading: boolean;
}) {
  if (loading) {
    return <p className="p-5 text-sm text-slate-500">Loading...</p>;
  }

  if (tasks.length === 0) {
    return <p className="p-5 text-sm text-slate-500">No tasks found.</p>;
  }

  return (
    <div className="divide-y divide-slate-100">
      {tasks.map((task) => {
        const status = task.status || (task.completed ? "completed" : "todo");

        return (
          <article
            key={task.id}
            className="grid gap-4 p-5 lg:grid-cols-[minmax(0,1fr)_180px_130px] lg:items-center"
          >
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-2">
                <h3 className="break-words font-semibold">{task.title}</h3>
                {task.assignedByAdmin && (
                  <span className="inline-flex items-center gap-1.5 rounded-xl bg-blue-50 px-2 py-1 text-xs font-semibold text-blue-700 ring-1 ring-blue-200">
                    <ShieldCheck size={13} />
                    Admin
                  </span>
                )}
              </div>
              <p className="mt-1 break-words text-sm leading-6 text-slate-500">
                {task.description}
              </p>
            </div>

            <div>
              <p className="text-sm font-semibold">{task.username}</p>
              <p className="mt-1 break-all text-xs text-slate-500">
                {task.userEmail}
              </p>
            </div>

            <StatusBadge status={status} />
          </article>
        );
      })}
    </div>
  );
}

function StatusBadge({ status }: { status: NonNullable<Task["status"]> }) {
  const styles = {
    todo: "bg-slate-100 text-slate-700 ring-slate-200",
    "in-progress": "bg-blue-50 text-blue-700 ring-blue-200",
    pending: "bg-amber-50 text-amber-700 ring-amber-200",
    completed: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  };

  const labels = {
    todo: "Todo",
    "in-progress": "Progress",
    pending: "Pending",
    completed: "Done",
  };

  return (
    <span
      className={`w-fit rounded-xl px-2.5 py-1 text-xs font-semibold ring-1 ${
        styles[status]
      }`}
    >
      {labels[status]}
    </span>
  );
}

export default AdminDashboard;
