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
      <main className="grid gap-4 md:grid-cols-4">
        <Column title="Todo" tasks={grouped.todo} onChangeStatus={changeStatus} />
        <Column title="In progress" tasks={grouped.inProgress} onChangeStatus={changeStatus} />
        <Column title="Pending" tasks={grouped.pending} onChangeStatus={changeStatus} />
        <Column title="Done" tasks={grouped.completed} onChangeStatus={changeStatus} />
      </main>
      {message && <p className="mt-4 text-sm text-rose-600">{message}</p>}
    </DashboardLayout>
  );
}

function Column({
  title,
  tasks,
  onChangeStatus,
}: {
  title: string;
  tasks: TaskType[];
  onChangeStatus: (id: number, status: TaskStatus) => void;
}) {
  return (
    <section className="rounded-xl border p-4">
      <h3 className="font-semibold">{title}</h3>
      <div className="mt-3 space-y-3">
        {tasks.map((t) => {
          const currentStatus = t.status || (t.completed ? "completed" : "todo");

          return (
            <div key={t.id} className="rounded-md border p-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold">{t.title}</p>
                  <p className="text-sm text-slate-500">{t.description}</p>
                </div>
                <select
                  value={currentStatus}
                  onChange={(e) => onChangeStatus(t.id, e.target.value as TaskStatus)}
                  className="rounded-md border px-2 py-1"
                >
                  <option value="todo">Todo</option>
                  <option value="in-progress">In progress</option>
                  <option value="pending">Pending</option>
                  <option value="completed">Done</option>
                </select>
              </div>
            </div>
          );
        })}
        {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks</p>}
      </div>
    </section>
  );
}

export default Organizer;
