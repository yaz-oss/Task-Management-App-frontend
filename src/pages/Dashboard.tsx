import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import API from "../api/axios";
import DashboardLayout from "../components/DashboardLayout";

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
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [focusTaskId, setFocusTaskId] = useState<number | null>(() => {
    const savedId = localStorage.getItem("focusTaskId");
    return savedId ? Number(savedId) : null;
  });
  const [message, setMessage] = useState("");

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

  const focusTask = useMemo(() => {
    const savedTask = tasks.find(
      (task) => task.id === focusTaskId && taskStatus(task) !== "completed"
    );

    if (savedTask) return savedTask;

    return tasks.find((task) => taskStatus(task) === "todo") || null;
  }, [focusTaskId, tasks]);

  useEffect(() => {
    if (!focusTask) {
      localStorage.removeItem("focusTaskId");
      setFocusTaskId(null);
      return;
    }

    if (focusTask.id !== focusTaskId) {
      localStorage.setItem("focusTaskId", String(focusTask.id));
      setFocusTaskId(focusTask.id);
    }
  }, [focusTask, focusTaskId]);

  const recentTasks = tasks.slice(0, 12);


  return (
    <DashboardLayout
      title="User dashboard"
      subtitle="Your task workspace, simplified"
    >
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
                  {focusTask ? focusTask.title : "No todo task"}
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

          <section className="mt-6">
            <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_380px]">
              <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold">Dashboard summary</h2>
                <p className="mt-2 text-sm text-slate-500">
                  Your main dashboard keeps things focused. Use the dedicated Tasks and Organizer pages for full task control.
                </p>
              </div>

              <div className="rounded-3xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="mb-4 flex items-center justify-between gap-3">
                  <div>
                    <h2 className="text-lg font-semibold">Recent tasks</h2>
                    <p className="mt-1 text-sm text-slate-500">
                      {tasks.length} task{tasks.length === 1 ? "" : "s"}
                    </p>
                  </div>
                </div>

                <div className="max-h-[42vh] space-y-3 overflow-y-auto pr-2">
                  {recentTasks.length > 0 ? (
                    recentTasks.map((task) => {
                      const status = taskStatus(task);

                      return (
                        <article
                          key={task.id}
                          className="rounded-2xl border border-slate-200 bg-slate-50 p-3"
                        >
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="break-words text-sm font-semibold">
                                {task.title}
                              </h3>
                              <p className="mt-1 line-clamp-2 break-words text-sm text-slate-500">
                                {task.description}
                              </p>
                            </div>
                            <span className="shrink-0 rounded-full bg-white px-2.5 py-1 text-[11px] font-semibold capitalize text-slate-600 ring-1 ring-slate-200">
                              {status.replace("-", " ")}
                            </span>
                          </div>
                        </article>
                      );
                    })
                  ) : (
                    <p className="rounded-2xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
                      No tasks yet.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </section>
        </main>
    </DashboardLayout>
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
