import { useCallback, useEffect, useMemo, useState } from "react";
import axios from "axios";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
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
  assignedByAdmin?: boolean;
};

const TITLE_MAX_LENGTH = 20;
const DESCRIPTION_MAX_LENGTH = 150;

function Tasks() {
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const [tasks, setTasks] = useState<TaskType[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [taskSearch, setTaskSearch] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
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

  const resetForm = () => {
    setEditingId(null);
    setTitle("");
    setDescription("");
  };

  const filteredTasks = useMemo(() => {
    const value = taskSearch.trim().toLowerCase();

    if (!value) return tasks;

    return tasks.filter((task) => {
      const status = task.status || (task.completed ? "completed" : "todo");

      return (
        task.title.toLowerCase().includes(value) ||
        task.description.toLowerCase().includes(value) ||
        status.toLowerCase().includes(value) ||
        (task.assignedByAdmin && "admin".includes(value))
      );
    });
  }, [taskSearch, tasks]);

  const saveTask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) return;

    const trimmedTitle = title.trim();
    const trimmedDescription = description.trim();

    if (!trimmedTitle || !trimmedDescription) {
      setMessage("Title and description are required");
      return;
    }

    if (trimmedTitle.length > TITLE_MAX_LENGTH) {
      setMessage(`Task name must be ${TITLE_MAX_LENGTH} characters or less`);
      return;
    }

    if (trimmedDescription.length > DESCRIPTION_MAX_LENGTH) {
      setMessage(
        `Task description must be ${DESCRIPTION_MAX_LENGTH} characters or less`
      );
      return;
    }

    try {
      if (editingId) {
        await API.put(
          `/api/tasks/${editingId}`,
          { title: trimmedTitle, description: trimmedDescription },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Task updated");
      } else {
        await API.post(
          "/api/tasks",
          { title: trimmedTitle, description: trimmedDescription },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setMessage("Task created");
      }
      resetForm();
      void fetchTasks();
    } catch (error: unknown) {
      const apiMessage = axios.isAxiosError(error)
        ? (error.response?.data as { message?: string } | undefined)?.message
        : undefined;

      setMessage(apiMessage || "Could not save task");
    }
  };

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
      setMessage("Could not update status");
    }
  };

  const deleteTask = async (id: number) => {
    if (!token) return;
    try {
      await API.delete(`/api/tasks/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setMessage("Task deleted");
      void fetchTasks();
    } catch {
      setMessage("Could not delete task");
    }
  };

  return (
    <DashboardLayout title="Tasks" subtitle="Create, edit, and manage your tasks">
      <main className="grid gap-6 lg:grid-cols-[360px_minmax(0,1fr)]">
        <form onSubmit={saveTask} className="self-start rounded-xl border p-4">
          <h2 className="font-semibold">{editingId ? "Edit" : "Create"} task</h2>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Title"
            maxLength={TITLE_MAX_LENGTH}
            className="mt-3 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-2 text-xs text-slate-500">
            {title.length}/{TITLE_MAX_LENGTH} characters
          </p>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Description"
            rows={4}
            maxLength={DESCRIPTION_MAX_LENGTH}
            className="mt-3 w-full rounded-md border px-3 py-2"
          />
          <p className="mt-2 text-xs text-slate-500">
            {description.length}/{DESCRIPTION_MAX_LENGTH} characters
          </p>
          <div className="mt-3 flex gap-2">
            <button className="rounded-xl bg-slate-900 px-3 py-2 text-white flex items-center gap-2">
              <Plus size={14} /> {editingId ? "Save" : "Create"}
            </button>
            {editingId && (
              <button type="button" onClick={resetForm} className="rounded-xl border px-3 py-2">
                Cancel
              </button>
            )}
          </div>
          {message && <p className="mt-3 text-sm text-emerald-700">{message}</p>}
        </form>

        <section className="rounded-xl border p-4">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="font-semibold">All tasks</h2>
              <p className="mt-1 text-sm text-slate-500">
                Showing {filteredTasks.length} of {tasks.length}
              </p>
            </div>
            <div className="flex h-10 w-full items-center rounded-md border px-3 sm:w-72">
              <Search size={16} className="text-slate-400" />
              <input
                value={taskSearch}
                onChange={(e) => setTaskSearch(e.target.value)}
                placeholder="Search tasks"
                className="ml-2 w-full bg-transparent text-sm outline-none placeholder:text-slate-400"
              />
            </div>
          </div>
          <div className="mt-3 flex snap-x gap-3 overflow-x-auto pb-3 [scrollbar-width:thin]">
            {filteredTasks.map((task) => (
              <div key={task.id} className="flex min-w-[280px] max-w-[340px] snap-start flex-col justify-between gap-4 rounded-md border p-3 sm:min-w-[320px]">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="break-words font-semibold">{task.title}</h3>
                    {task.assignedByAdmin && <span className="text-xs text-amber-700">Admin</span>}
                  </div>
                  <p className="mt-1 line-clamp-3 break-words text-sm text-slate-500">{task.description}</p>
                </div>
                <div className="flex flex-wrap gap-2">
                  <select
                    value={task.status || (task.completed ? "completed" : "todo")}
                    onChange={(e) => changeStatus(task.id, e.target.value as TaskStatus)}
                    className="rounded-md border px-2 py-1"
                  >
                    <option value="todo">Todo</option>
                    <option value="in-progress">In progress</option>
                    <option value="pending">Pending</option>
                    <option value="completed">Done</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      setEditingId(task.id);
                      setTitle(task.title);
                      setDescription(task.description);
                    }}
                    className="rounded-md border px-2 py-1"
                  >
                    <Pencil size={14} />
                  </button>
                  <button onClick={() => deleteTask(task.id)} className="rounded-md border px-2 py-1 text-red-600">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
            {tasks.length === 0 && <p className="text-sm text-slate-500">No tasks yet.</p>}
            {tasks.length > 0 && filteredTasks.length === 0 && (
              <p className="text-sm text-slate-500">No tasks match your search.</p>
            )}
          </div>
        </section>
      </main>
    </DashboardLayout>
  );
}

export default Tasks;
