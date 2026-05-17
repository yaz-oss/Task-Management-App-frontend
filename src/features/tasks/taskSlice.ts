import {
  createSlice,
  createAsyncThunk,
} from "@reduxjs/toolkit";

import API from "../../api/axios";

const TASKS_API =
  "/api/tasks";

type Task = {
  id: number;
  title: string;
  description: string;
  completed: boolean;
};

type TaskState = {
  tasks: Task[];
};

const initialState: TaskState = {
  tasks: [],
};

export const fetchTasks =
  createAsyncThunk(
    "tasks/fetchTasks",

    async () => {

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await API.get(
          TASKS_API,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      return res.data;
    }
  );

export const addTask =
  createAsyncThunk(
    "tasks/addTask",

    async (taskData: {
      title: string;
      description: string;
    }) => {

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await API.post(
          TASKS_API,
          taskData,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      return res.data;
    }
  );

export const deleteTask =
  createAsyncThunk(
    "tasks/deleteTask",

    async (id: number) => {

      const token =
        localStorage.getItem(
          "token"
        );

      await API.delete(
        `${TASKS_API}/${id}`,
        {
          headers: {
            Authorization:
              `Bearer ${token}`,
          },
        }
      );

      return id;
    }
  );

export const updateTask =
  createAsyncThunk(
    "tasks/updateTask",

    async (task: Task) => {

      const token =
        localStorage.getItem(
          "token"
        );

      const res =
        await API.put(
          `${TASKS_API}/${task.id}`,
          task,
          {
            headers: {
              Authorization:
                `Bearer ${token}`,
            },
          }
        );

      return res.data;
    }
  );

const taskSlice =
  createSlice({

    name: "tasks",

    initialState,

    reducers: {},

    extraReducers: (
      builder
    ) => {

      builder.addCase(
        fetchTasks.fulfilled,

        (
          state,
          action
        ) => {

          state.tasks =
            action.payload;
        }
      );

      builder.addCase(
        addTask.fulfilled,

        (
          state,
          action
        ) => {

          state.tasks.push(
            action.payload
          );
        }
      );

      builder.addCase(
        deleteTask.fulfilled,

        (
          state,
          action
        ) => {

          state.tasks =
            state.tasks.filter(
              (task) =>
                task.id !==
                action.payload
            );
        }
      );

      builder.addCase(
        updateTask.fulfilled,

        (
          state,
          action
        ) => {

          state.tasks =
            state.tasks.map(
              (task) =>

                task.id ===
                action.payload.id

                  ? action.payload
                  : task
            );
        }
      );
    },
  });

export default
  taskSlice.reducer;
