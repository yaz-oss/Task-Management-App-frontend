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
};

function Organizer() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [message, setMessage] = useState("");

  const fetchTasks = useCallback(async () => {
    if (!token) return;
    try {
      const response = await API.get<TaskType[]>("/api/tasks", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setTasks(Array.isArray(response.data) ? response.data : []);
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      if (apiMessage?.toLowerCase().includes("blocked")) {
        localStorage.clear();
        navigate("/", {
          replace: true,
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
      navigate("/", { replace: true });
      return;
    }

    void fetchTasks();
  }, [fetchTasks, navigate, token]);

  const grouped = useMemo(() => {
    return {
      todo: tasks.filter((t) => !(t.status || (t.completed ? "completed" : "todo")) || (t.status === "todo")),
      inProgress: tasks.filter((t) => (t.status || (t.completed ? "completed" : "todo")) === "in-progress"),
      pending: tasks.filter((t) => (t.status || (t.completed ? "completed" : "todo")) === "pending"),
      completed: tasks.filter((t) => (t.status || (t.completed ? "completed" : "todo")) === "completed"),
    };
  }, [tasks]);

  const changeStatus = async (taskId: number, status: TaskStatus) => {
    if (!token) return;
    try {
      await API.put(
        `/api/tasks/${taskId}`,
        { status, completed: status === "completed" },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      void fetchTasks();
    } catch {
      setMessage("Could not update task");
    }
  };

  return (
    <DashboardLayout title="Task organizer" subtitle="Plan and move tasks through stages">
      <main className="grid items-start gap-4 lg:grid-cols-2 2xl:grid-cols-4">
        <Column title="Todo" tasks={grouped.todo} onChangeStatus={changeStatus} />
        <Column title="In progress" tasks={grouped.inProgress} onChangeStatus={changeStatus} />
        <Column title="Pending" tasks={grouped.pending} onChangeStatus={changeStatus} />
        <Column title="Done" tasks={grouped.completed} onChangeStatus={changeStatus} />
      </main>
      {message && <p className="mt-4 text-sm text-rose-600">{message}</p>}
    </DashboardLayout>
  );
}

const taskStatusTone: Record<TaskStatus, string> = {
  todo: "bg-sky-100 text-sky-700",
  "in-progress": "bg-violet-100 text-violet-700",
  pending: "bg-amber-100 text-amber-700",
  completed: "bg-emerald-100 text-emerald-700",
};

function Column({
  title,
  tasks,
  onChangeStatus,
}: {
  title: string;
  tasks: TaskType[];
  onChangeStatus: (id: number, status: TaskStatus) => void;
}) {
  const statusKey =
    title === "Done"
      ? "completed"
      : (title.toLowerCase().replace(" ", "-") as TaskStatus);

  return (
    <section className="flex max-h-[72vh] min-w-0 flex-col rounded-3xl border border-slate-200 bg-white/90 p-4 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h3 className="text-sm font-semibold text-slate-900">{title}</h3>
          <p className="mt-1 text-xs text-slate-500">{tasks.length} task{tasks.length === 1 ? "" : "s"}</p>
        </div>
        <span className={`rounded-full px-3 py-1 text-[11px] font-semibold ${taskStatusTone[statusKey]}`}>
          {title}
        </span>
      </div>

      <div className="min-h-0 flex-1 space-y-4 overflow-y-auto pr-1 [scrollbar-width:thin]">
        {tasks.length > 0 ? (
          tasks.map((t) => {
            const currentStatus = t.status || (t.completed ? "completed" : "todo");

            return (
              <div key={t.id} className="min-w-0 rounded-2xl border border-slate-200 bg-slate-50 p-4 shadow-sm">
                <div className="min-w-0 w-full space-y-3 px-1">
                  <p className="w-full break-words font-semibold text-slate-900">{t.title}</p>
                  <p className="w-full max-h-[5.5rem] overflow-hidden break-words text-sm leading-6 text-slate-600">
                    {t.description || "No description added yet."}
                  </p>
                </div>
                <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                  <label className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Update status
                  </label>
                  <select
                    value={currentStatus}
                    onChange={(e) => onChangeStatus(t.id, e.target.value as TaskStatus)}
                    className="w-full rounded-2xl border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm sm:w-auto"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Done</option>
                  </select>
                </div>
              </div>
            );
          })
        ) : (
          <div className="rounded-3xl border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500">
            No tasks in this stage yet.
          </div>
        )}
      </div>
    </section>
  );
}

export default Organizer;
